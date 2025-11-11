import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router'; // Nếu có routing; nếu không, bỏ và dùng khác
import { UserSerivce, UserApiResponse } from '../../service/user.service';

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  loading = false;
  loggedInUser: UserApiResponse | null = null;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private userService: UserSerivce,
    private router: Router, 
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.loginForm = this.fb.group({
      credential: ['', [Validators.required]] 
    });
  }


  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      const savedUser = localStorage.getItem('loggedInUser');
      if (savedUser) {
        this.loggedInUser = JSON.parse(savedUser);
      }
    }
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      return;
    }

    const credential = this.loginForm.value.credential;
    this.loading = true;
    this.errorMessage = '';

    if (!isNaN(Number(credential))) {
      const id = Number(credential);
      this.userService.getById(id).subscribe({
        next: (user) => {
          this.handleLoginSuccess(user);
        },
        error: () => {
          this.handleLoginError('User not found with this ID.');
        }
      });
    } else {
      this.userService.getAll().subscribe({
        next: (users) => {
          const user = users.find(u => u.username === credential || u.email === credential);
          if (user) {
            this.handleLoginSuccess(user);
          } else {
            this.handleLoginError('User not found with this username or email.');
          }
        },
        error: () => {
          this.handleLoginError('Error fetching users.');
        }
      });
    }
  }

  private handleLoginSuccess(user: UserApiResponse): void {
    this.loggedInUser = user;
    localStorage.setItem('loggedInUser', JSON.stringify(user));
    this.loading = false;
    this.router.navigate(['/todo']);
  }

  private handleLoginError(message: string): void {
    this.errorMessage = message;
    this.loading = false;
    this.loggedInUser = null;
    localStorage.removeItem('loggedInUser');
  }

  goToTodo(): void {
    this.router.navigate(['/todo']);
  }

  logout(): void {
    this.loggedInUser = null;
    localStorage.removeItem('loggedInUser');
    this.loginForm.reset();
  }
}