import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms'; 
import { CommonModule } from '@angular/common';
import { TodoSerivce, TodoApiResponse } from '../../service/todo.service';
import { DropdownModule } from "primeng/dropdown";;
import { InputTextModule } from "primeng/inputtext";
import { TranslateModule, TranslateService } from "@ngx-translate/core";
import { KEY_STORE } from '../../config/constants';
import { PaginatorModule } from 'primeng/paginator';

@Component({
  selector: 'app-todo',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    TranslateModule,
    DropdownModule,
    InputTextModule,
    FormsModule,
    PaginatorModule
  ],
  templateUrl: './todo.component.html',
  styleUrls: ['./todo.component.css']
})
export class TodoComponent implements OnInit {
  todos: TodoApiResponse[] = [];
  todoForm: FormGroup;
  editingTodo: TodoApiResponse | null = null;
  loading = false;
  // userId = 1; // Default user ID for demo
  userId = localStorage.getItem('loggedInUser') ? JSON.parse(localStorage.getItem('loggedInUser')!).id : null

  currentPage = 1;
  itemsPerPage = 9;
  totalPages = 0;
  selectedLanguage = localStorage.getItem(KEY_STORE.LOCALIZATION) || 'en';
  languages = [
        { label: "ພາສາລາວ", value: "lo", flag: "lo-flag-icon.svg" },
        { label: "Tiếng Việt", value: "vi", flag: "vi-flag-icon.svg" },
        { label: "English", value: "en", flag: "us-flag-icon.svg" },
    ];

  constructor(
    private todoService: TodoSerivce,
    private fb: FormBuilder,
    private translate: TranslateService,
  ) {
    this.todoForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      completed: [false]
    });
  }

  ngOnInit(): void {
    this.loadTodos();
  }

  loadTodos(): void {
    this.loading = true;
    this.todoService.getByUserId(this.userId).subscribe({
      next: (todos) => {
        this.todos = todos;
        this.updatePagination();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading todos:', err);
        this.loading = false;
      }
    });
  }

  switchLang(lang: string): void {
    this.translate.use(lang);
    localStorage.setItem(KEY_STORE.LOCALIZATION, lang);
    
  }

  get paginatedTodos(): TodoApiResponse[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.todos.slice(startIndex, endIndex);
  }

  private updatePagination(): void {
    this.totalPages = Math.ceil(this.todos.length / this.itemsPerPage);
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages || 1;
    }
  }

  onPageChange(event: any): void {
    this.currentPage = Math.floor(event.first / event.rows) + 1;
    this.itemsPerPage = event.rows;
    this.updatePagination();
  }


  onSubmit(): void {
    if (this.todoForm.invalid) {
      return;
    }

    const { title, completed } = this.todoForm.value;
    this.loading = true;

    if (this.editingTodo) {
      // Update existing todo
      this.todoService.put(this.editingTodo.id, title, completed).subscribe({
        next: (updatedTodo) => {
          const index = this.todos.findIndex(t => t.id === updatedTodo.id);
          if (index !== -1) {
            this.todos[index] = updatedTodo;
          }
          this.updatePagination();
          this.resetForm();
          this.loading = false;
        },
        error: (err) => {
          console.error('Error updating todo:', err);
          this.loading = false;
        }
      });
    } else {
      // Add new todo
      this.todoService.post(this.userId, title).subscribe({
        next: (newTodo) => {
          this.todos.push(newTodo);
          this.updatePagination();
          this.resetForm();
          this.loading = false;
        },
        error: (err) => {
          console.error('Error creating todo:', err);
          this.loading = false;
        }
      });
    }
  }

  editTodo(todo: TodoApiResponse): void {
    this.editingTodo = { ...todo };
    this.todoForm.patchValue({
      title: todo.title,
      completed: todo.completed
    });
  }

  deleteTodo(id: number): void {
    if (confirm('Are you sure you want to delete this todo?')) {
      this.loading = true;
      this.todoService.delete(id).subscribe({
        next: () => {
          this.todos = this.todos.filter(t => t.id !== id);
          this.updatePagination();
          this.loading = false;
        },
        error: (err) => {
          console.error('Error deleting todo:', err);
          this.loading = false;
        }
      });
    }
  }

  toggleCompleted(todo: TodoApiResponse): void {
    this.todoService.put(todo.id, todo.title, !todo.completed).subscribe({
      next: (updatedTodo) => {
        const index = this.todos.findIndex(t => t.id === updatedTodo.id);
        if (index !== -1) {
          this.todos[index] = updatedTodo;
        }
      },
      error: (err) => {
        console.error('Error updating todo completion:', err);
      }
    });
  }

  resetForm(): void { 
    this.todoForm.reset({ completed: false });
    this.editingTodo = null;
  }
}
