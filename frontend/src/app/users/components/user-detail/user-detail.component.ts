import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { User } from '../../models/user.model';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-user-detail',
  templateUrl: './user-detail.component.html',
  styleUrl: './user-detail.component.css'
})
export class UserDetailComponent implements OnInit {
  user: User | null = null;
  userId = 0;
  loading = true;
  successMessage = '';
  errorMessage = '';

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly userService: UserService
  ) { }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = Number(idParam);

    if (!Number.isInteger(id) || id <= 0) {
      this.loading = false;
      this.errorMessage = 'Invalid user id';
      return;
    }

    this.userId = id;
    this.fetchUser();
  }

  fetchUser(): void {
    this.loading = true;
    this.errorMessage = '';
    console.log('[UserDetailComponent] Loading user', this.userId);

    this.userService.getUserById(this.userId).subscribe({
      next: (response) => {
        this.user = response.data;
        this.successMessage = response.message;
        this.loading = false;
        console.log('[UserDetailComponent] User loaded', this.user);
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = error?.error?.message || 'Unable to fetch user';
      }
    });
  }

  deleteUser(): void {
    if (!this.user) {
      return;
    }

    const shouldDelete = window.confirm(`Delete user "${this.user.name}"?`);
    if (!shouldDelete) {
      return;
    }

    this.userService.deleteUser(this.user.id).subscribe({
      next: (response) => {
        this.successMessage = response.message;
        console.log('[UserDetailComponent] User deleted', this.user?.id);
        this.router.navigate(['/users']);
      },
      error: (error) => {
        this.errorMessage = error?.error?.message || 'Unable to delete user';
      }
    });
  }
}
