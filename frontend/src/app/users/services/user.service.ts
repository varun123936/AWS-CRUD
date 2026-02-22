import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, tap, throwError } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ApiResponse, User, UserPayload } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly usersUrl = `${environment.apiBaseUrl}/users`;

  constructor(private readonly http: HttpClient) { }

  getUsers(): Observable<ApiResponse<User[]>> {
    console.log('[UserService] GET /users');
    return this.http.get<ApiResponse<User[]>>(this.usersUrl).pipe(
      tap((response) => console.log('[UserService] GET /users success', response)),
      catchError(this.handleError('GET /users'))
    );
  }

  getUserById(id: number): Observable<ApiResponse<User>> {
    console.log('[UserService] GET /users/:id', id);
    return this.http.get<ApiResponse<User>>(`${this.usersUrl}/${id}`).pipe(
      tap((response) => console.log('[UserService] GET /users/:id success', response)),
      catchError(this.handleError('GET /users/:id'))
    );
  }

  createUser(payload: UserPayload): Observable<ApiResponse<User>> {
    console.log('[UserService] POST /users', payload);
    return this.http.post<ApiResponse<User>>(this.usersUrl, payload).pipe(
      tap((response) => console.log('[UserService] POST /users success', response)),
      catchError(this.handleError('POST /users'))
    );
  }

  updateUser(id: number, payload: UserPayload): Observable<ApiResponse<User>> {
    console.log('[UserService] PUT /users/:id', { id, payload });
    return this.http.put<ApiResponse<User>>(`${this.usersUrl}/${id}`, payload).pipe(
      tap((response) => console.log('[UserService] PUT /users/:id success', response)),
      catchError(this.handleError('PUT /users/:id'))
    );
  }

  deleteUser(id: number): Observable<{ message: string }> {
    console.log('[UserService] DELETE /users/:id', id);
    return this.http.delete<{ message: string }>(`${this.usersUrl}/${id}`).pipe(
      tap((response) => console.log('[UserService] DELETE /users/:id success', response)),
      catchError(this.handleError('DELETE /users/:id'))
    );
  }

  private handleError(operation: string) {
    return (error: HttpErrorResponse): Observable<never> => {
      console.error(`[UserService] ${operation} failed`, error);
      return throwError(() => error);
    };
  }
}
