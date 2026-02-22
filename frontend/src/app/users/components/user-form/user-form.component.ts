import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { UserPayload } from '../../models/user.model';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-user-form',
  templateUrl: './user-form.component.html',
  styleUrl: './user-form.component.css'
})
export class UserFormComponent implements OnInit {
  userId?: number;
  isEditMode = false;
  loading = false;
  saving = false;
  successMessage = '';
  errorMessage = '';
  readonly roles = ['Admin', 'Editor', 'Viewer'];
  readonly userForm;

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly userService: UserService
  ) {
    this.userForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(150)]],
      role: ['', [Validators.required, Validators.maxLength(50)]]
    });
  }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = Number(idParam);

    if (idParam && Number.isInteger(id) && id > 0) {
      this.isEditMode = true;
      this.userId = id;
      this.loadUserForEdit(id);
      return;
    }

    if (idParam) {
      this.errorMessage = 'Invalid user id provided for update';
    }
  }

  onSubmit(): void {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    this.saving = true;
    this.successMessage = '';
    this.errorMessage = '';

    const payload: UserPayload = {
      name: this.userForm.value.name?.trim() ?? '',
      email: this.userForm.value.email?.trim() ?? '',
      role: this.userForm.value.role?.trim() ?? ''
    };

    if (this.isEditMode && this.userId) {
      console.log('[UserFormComponent] Updating user', this.userId);
      this.userService.updateUser(this.userId, payload).subscribe({
        next: (response) => {
          this.saving = false;
          this.successMessage = response.message;
          console.log('[UserFormComponent] User updated', response.data);
          this.router.navigate(['/users', this.userId]);
        },
        error: (error) => {
          this.saving = false;
          this.errorMessage = error?.error?.message || 'Unable to update user';
        }
      });
      return;
    }

    console.log('[UserFormComponent] Creating user');
    this.userService.createUser(payload).subscribe({
      next: (response) => {
        this.saving = false;
        this.successMessage = response.message;
        console.log('[UserFormComponent] User created', response.data);
        this.router.navigate(['/users']);
      },
      error: (error) => {
        this.saving = false;
        this.errorMessage = error?.error?.message || 'Unable to create user';
      }
    });
  }

  private loadUserForEdit(id: number): void {
    this.loading = true;
    this.errorMessage = '';
    console.log('[UserFormComponent] Loading user for edit', id);

    this.userService.getUserById(id).subscribe({
      next: (response) => {
        this.loading = false;
        this.userForm.patchValue({
          name: response.data.name,
          email: response.data.email,
          role: response.data.role
        });
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = error?.error?.message || 'Unable to load user';
      }
    });
  }

  hasError(controlName: 'name' | 'email' | 'role', errorName: string): boolean {
    const control = this.userForm.get(controlName);
    return Boolean(control?.touched && control.hasError(errorName));
  }
}
