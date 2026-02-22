export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

export interface UserPayload {
  name: string;
  email: string;
  role: string;
}

export interface ApiResponse<T> {
  message: string;
  data: T;
}
