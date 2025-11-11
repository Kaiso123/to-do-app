import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { DataResquest, HttpService } from "./http.service";

export interface TodoApiResponse {
        user_id: number,
        id: number,
        title: string,
        completed: boolean,
}

export interface TodoApiRequest {
    user_id?: number,
    id?: number,
    title?: string,
    completed?: boolean
}

@Injectable({
    providedIn: "root",
})
export class TodoSerivce {
    functionPath: string = "todos"
    constructor(
        private readonly http: HttpClient,
        private readonly httpService: HttpService
    ) {}

    post(user_id: number, title: string): Observable<TodoApiResponse> {
        const body: TodoApiRequest = {
            user_id: user_id,
            title: title,
        };

        return this.httpService.post(
            new DataResquest({
                function: this.functionPath,
                body: body,
            })
        )
    }

    getAll(): Observable<TodoApiResponse[]> {
        return this.httpService.get(
            new DataResquest({
                function: this.functionPath,
                body: null,
            })
        )
    }

    getById(id: number): Observable<TodoApiResponse> {
        return this.httpService.get(
            new DataResquest({
                function: `${this.functionPath}/${id}`,
                body: null,
            })
        )
    }

    getByUserId(user_id: number): Observable<TodoApiResponse[]> {
        return this.httpService.get(
            new DataResquest({
                function: `users/${user_id}/${this.functionPath}`,
                body: null,
            })
        )
    }

    
    put(id: number, title: string, completed: boolean): Observable<TodoApiResponse> {
        const body: TodoApiRequest = {
            title: title,
            completed: completed,
        };

        return this.httpService.put(
            new DataResquest({
                function: `${this.functionPath}/${id}`,
                body: body,
            })
        )
    }

    delete(id: number): Observable<{}> {
        return this.httpService.delete(
            new DataResquest({
                function: `${this.functionPath}/${id}`,
                body: null,
            })
        )
    }
}