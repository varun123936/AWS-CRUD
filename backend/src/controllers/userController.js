const { pool } = require('../config/db');

function createHttpError(status, message, publicMessage = message) {
  const error = new Error(message);
  error.status = status;
  error.publicMessage = publicMessage;
  return error;
}

function parseUserId(idValue) {
  const id = Number(idValue);

  if (!Number.isInteger(id) || id <= 0) {
    throw createHttpError(400, 'User id must be a positive integer');
  }

  return id;
}

function validateUserPayload(body) {
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const email = typeof body.email === 'string' ? body.email.trim() : '';
  const role = typeof body.role === 'string' ? body.role.trim() : '';

  if (!name || !email || !role) {
    throw createHttpError(400, 'name, email, and role are required fields');
  }

  return { name, email, role };
}

function isRoleColumnError(error) {
  return (
    error?.code === 'ER_BAD_FIELD_ERROR' &&
    (error?.message || '').toLowerCase().includes('role')
  );
}

function withDefaultRole(users) {
  return users.map((user) => ({
    ...user,
    role: user.role ?? ''
  }));
}

async function queryUsers({ id } = {}) {
  const whereClause = id ? ' WHERE id = ?' : '';
  const orderClause = id ? '' : ' ORDER BY id ASC';
  const params = id ? [id] : [];

  try {
    const [users] = await pool.query(
      `SELECT id, name, email, role FROM users${whereClause}${orderClause}`,
      params
    );
    return withDefaultRole(users);
  } catch (error) {
    if (!isRoleColumnError(error)) {
      throw error;
    }

    const [users] = await pool.query(
      `SELECT id, name, email FROM users${whereClause}${orderClause}`,
      params
    );
    return withDefaultRole(users);
  }
}

async function insertUser(name, email, role) {
  try {
    const [result] = await pool.query(
      'INSERT INTO users (name, email, role) VALUES (?, ?, ?)',
      [name, email, role]
    );
    return result;
  } catch (error) {
    if (!isRoleColumnError(error)) {
      throw error;
    }

    const [result] = await pool.query(
      'INSERT INTO users (name, email) VALUES (?, ?)',
      [name, email]
    );
    return result;
  }
}

async function updateExistingUser(id, name, email, role) {
  try {
    const [result] = await pool.query(
      'UPDATE users SET name = ?, email = ?, role = ? WHERE id = ?',
      [name, email, role, id]
    );
    return result;
  } catch (error) {
    if (!isRoleColumnError(error)) {
      throw error;
    }

    const [result] = await pool.query(
      'UPDATE users SET name = ?, email = ? WHERE id = ?',
      [name, email, id]
    );
    return result;
  }
}

async function getAllUsers(req, res, next) {
  try {
    const users = await queryUsers();

    return res.json({
      message: 'Users fetched successfully',
      data: users
    });
  } catch (error) {
    return next(error);
  }
}

async function getUserById(req, res, next) {
  try {
    const id = parseUserId(req.params.id);
    const users = await queryUsers({ id });

    if (users.length === 0) {
      throw createHttpError(404, `User with id ${id} not found`);
    }

    return res.json({
      message: 'User fetched successfully',
      data: users[0]
    });
  } catch (error) {
    return next(error);
  }
}

async function createUser(req, res, next) {
  try {
    const { name, email, role } = validateUserPayload(req.body);
    const result = await insertUser(name, email, role);
    const users = await queryUsers({ id: result.insertId });

    return res.status(201).json({
      message: 'User created successfully',
      data: users[0]
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return next(createHttpError(409, 'Email already exists'));
    }

    return next(error);
  }
}

async function updateUser(req, res, next) {
  try {
    const id = parseUserId(req.params.id);
    const { name, email, role } = validateUserPayload(req.body);
    const result = await updateExistingUser(id, name, email, role);

    if (result.affectedRows === 0) {
      throw createHttpError(404, `User with id ${id} not found`);
    }

    const users = await queryUsers({ id });

    return res.json({
      message: 'User updated successfully',
      data: users[0]
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return next(createHttpError(409, 'Email already exists'));
    }

    return next(error);
  }
}

async function deleteUser(req, res, next) {
  try {
    const id = parseUserId(req.params.id);
    const [result] = await pool.query('DELETE FROM users WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      throw createHttpError(404, `User with id ${id} not found`);
    }

    return res.json({
      message: 'User deleted successfully'
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
};
