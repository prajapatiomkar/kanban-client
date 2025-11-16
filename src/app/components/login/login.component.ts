import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <h1>Login to Kanban</h1>
        <form (ngSubmit)="onSubmit()" #loginForm="ngForm">
          <div class="form-group">
            <label for="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              [(ngModel)]="email"
              required
              email
              #emailField="ngModel"
            />
            @if (emailField.invalid && emailField.touched) {
            <span class="error">Valid email is required</span>
            }
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              [(ngModel)]="password"
              required
              minlength="6"
              #passwordField="ngModel"
            />
            @if (passwordField.invalid && passwordField.touched) {
            <span class="error">Password must be at least 6 characters</span>
            }
          </div>

          @if (errorMessage) {
          <div class="alert alert-error">{{ errorMessage }}</div>
          }

          <button type="submit" [disabled]="loginForm.invalid || loading">
            {{ loading ? 'Logging in...' : 'Login' }}
          </button>
        </form>

        <p class="auth-footer">
          Don't have an account? <a routerLink="/register">Register here</a>
        </p>
      </div>
    </div>
  `,
  styles: [
    `
      .auth-container {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 100vh;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        padding: 20px;
      }

      .auth-card {
        background: white;
        padding: 40px;
        border-radius: 10px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        width: 100%;
        max-width: 400px;
      }

      h1 {
        margin: 0 0 30px 0;
        text-align: center;
        color: #333;
      }

      .form-group {
        margin-bottom: 20px;
      }

      label {
        display: block;
        margin-bottom: 5px;
        color: #555;
        font-weight: 500;
      }

      input {
        width: 100%;
        padding: 12px;
        border: 1px solid #ddd;
        border-radius: 5px;
        font-size: 14px;
        box-sizing: border-box;
      }

      input:focus {
        outline: none;
        border-color: #667eea;
      }

      .error {
        color: #e74c3c;
        font-size: 12px;
        margin-top: 5px;
        display: block;
      }

      .alert {
        padding: 12px;
        border-radius: 5px;
        margin-bottom: 20px;
      }

      .alert-error {
        background: #ffe6e6;
        color: #e74c3c;
        border: 1px solid #e74c3c;
      }

      button {
        width: 100%;
        padding: 12px;
        background: #667eea;
        color: white;
        border: none;
        border-radius: 5px;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        transition: background 0.3s;
      }

      button:hover:not(:disabled) {
        background: #5568d3;
      }

      button:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }

      .auth-footer {
        text-align: center;
        margin-top: 20px;
        color: #666;
      }

      .auth-footer a {
        color: #667eea;
        text-decoration: none;
        font-weight: 600;
      }

      .auth-footer a:hover {
        text-decoration: underline;
      }
    `,
  ],
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  email = '';
  password = '';
  loading = false;
  errorMessage = '';

  onSubmit(): void {
    this.loading = true;
    this.errorMessage = '';

    this.authService.login(this.email, this.password).subscribe({
      next: () => {
        this.router.navigate(['/boards']);
      },
      error: (error) => {
        this.errorMessage = error.error.message || 'Login failed. Please try again.';
        this.loading = false;
      },
    });
  }
}
