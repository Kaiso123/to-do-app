import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { DataResquest, HttpService } from "./http.service";

export interface UserApiResponse {
    id: number;
    name: string;
    username: string;
    email: string;
    address: {
        street: string;
        suite: string;
        city: string;
        zipcode: string;
        geo: {
        lat: string;
        lng: string;
        };
    };
    phone: string;
    website: string;
    company: {
        name: string;
        catchPhrase: string;
        bs: string;
    };
}

export interface UserApiRequest {
  id?: number; 
  name?: string;
  username?: string;
  email?: string;
  address?: {
    street?: string;
    suite?: string;
    city?: string;
    zipcode?: string;
    geo?: {
      lat?: string;
      lng?: string;
    };
  };
  phone?: string;
  website?: string;
  company?: {
    name?: string;
    catchPhrase?: string;
    bs?: string;
  };
}


@Injectable({
    providedIn: "root",
})
export class UserSerivce {
    functionPath: string = "users"
    constructor(
        private readonly http: HttpClient,
        private readonly httpService: HttpService
    ) {}

   post(name: string, username: string, email: string): Observable<UserApiResponse> {
        const body: UserApiRequest = {
            name: name,
            username: username,
            email: email,
        };
        return this.httpService.post(
            new DataResquest({
                function: this.functionPath,
                body: body,
            })
        )
    }

    getAll(): Observable<UserApiResponse[]> {
        return this.httpService.get(
            new DataResquest({
                function: this.functionPath,
                body: null,
            })
        )
    }

    getById(id: number): Observable<UserApiResponse> {
        return this.httpService.get(
            new DataResquest({
                function: `${this.functionPath}/${id}`,
                body: null,
            })
        )
    }

    put(userId: number, body: UserApiRequest): Observable<UserApiResponse> {
        const functionPath = `${this.functionPath}/${userId}`;


        return this.httpService.put(
            new DataResquest({
                function: functionPath,
                body: body, 
            })
        );
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