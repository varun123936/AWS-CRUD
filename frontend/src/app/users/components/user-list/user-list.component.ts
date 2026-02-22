import { Component, OnInit } from '@angular/core';

import { User } from '../../models/user.model';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.css'
})
export class UserListComponent implements OnInit {
  users: User[] = [];
  loading = false;
  successMessage = '';
  errorMessage = '';

  constructor(private readonly userService: UserService) { }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.errorMessage = '';
    console.log('[UserListComponent] Loading users');

    this.userService.getUsers().subscribe({
      next: (response) => {
        this.users = response.data ?? [];
        this.successMessage = response.message;
        this.loading = false;
        console.log('[UserListComponent] Users loaded', this.users);
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = error?.error?.message || 'Unable to load users';
      }
    });
  }

  deleteUser(user: User): void {
    const shouldDelete = window.confirm(`Delete user "${user.name}"?`);
    if (!shouldDelete) {
      return;
    }

    this.errorMessage = '';
    this.successMessage = '';

    this.userService.deleteUser(user.id).subscribe({
      next: (response) => {
        this.successMessage = response.message;
        console.log('[UserListComponent] User deleted', user.id);
        this.loadUsers();
      },
      error: (error) => {
        this.errorMessage = error?.error?.message || 'Unable to delete user';
      }
    });
  }
}
