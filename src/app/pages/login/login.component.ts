import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router'; 
import { UserSerivce, UserApiResponse } from '../../service/user.service';
import { Button, ButtonModule } from "primeng/button";
import { DropdownModule } from "primeng/dropdown";;
import { InputTextModule } from "primeng/inputtext";
import { TranslateModule, TranslateService } from "@ngx-translate/core";
import { KEY_STORE } from '../../config/constants';

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [
    ReactiveFormsModule, 
    CommonModule,
    ButtonModule,
    InputTextModule,
    TranslateModule,
    DropdownModule,
    FormsModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  loading = false;
  loggedInUser: UserApiResponse | null = null;
  errorMessage = '';
  submitLabel = 'Login';
  selectedLanguage = localStorage.getItem(KEY_STORE.LOCALIZATION) || 'en';
  
  languages = [
        { label: "ພາສາລາວ", value: "lo", flag: "lo-flag-icon.svg" },
        { label: "Tiếng Việt", value: "vi", flag: "vi-flag-icon.svg" },
        { label: "English", value: "en", flag: "us-flag-icon.svg" },
    ];

  constructor(
    private fb: FormBuilder,
    private userService: UserSerivce,
    private translate: TranslateService,
    private router: Router, 
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.loginForm = this.fb.group({
      credential: ['', [Validators.required]] 
    });
    this.updateLabels();
  }


  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      const savedUser = localStorage.getItem('loggedInUser');
      if (savedUser) {
        this.loggedInUser = JSON.parse(savedUser);
      }
    }
    this.translate.onLangChange.subscribe(() => {
      this.updateLabels();
    });
  }

  private updateLabels(): void {
    this.submitLabel = this.translate.instant('USER.LOGIN.SUBMIT');
  }

  switchLang(lang: string): void {
    this.translate.use(lang);
    localStorage.setItem(KEY_STORE.LOCALIZATION, lang);
    
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
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('loggedInUser', JSON.stringify(user));
    }
    this.loading = false;
    this.updateLabels();  
    // this.router.navigate(['/todo']);
  }

  private handleLoginError(key: string): void {  
    this.errorMessage = this.translate.instant(key);  
    this.loading = false;
    this.updateLabels(); 
    this.loggedInUser = null;
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('loggedInUser');
    }
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