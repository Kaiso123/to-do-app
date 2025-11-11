import { enviroment } from "../environments/environment";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import { Injectable } from "@angular/core";
import { RequestHttp } from "../common/models/resquest-http.model";
import { Observable } from "rxjs";
import { HTTP_METHOD } from "../config/constants";
import { Data } from "@angular/router";
import { ObjectEncodingOptions } from "fs";
import { METHODS, request } from "http";

export class DataResquest {
    function: string;
    body: FormData | any;
    options?: any;

    constructor(data: Partial<DataResquest>) {
        this.function = data.function!;
        this.body = data.body!;
        this.options = data.options;
    }
}

@Injectable({
    providedIn: 'root'
})
export class HttpService {
    private readonly API_URL = enviroment.apiUrl;

    constructor(private http: HttpClient) {}

    private callAPI(request: RequestHttp): Observable<any> {
        if (!request.method) {
            throw new Error('Method is not specified in the request')
        }
        const url = `${this.API_URL}/${request.function}`
        const { method, body, options} = request
        const methodMap: { [key: string]: (url: string, body?: any, options?: any) => Observable<any> } = {
            [HTTP_METHOD.POST]: (url, body, options) => this.http.post<any>(url, body, options),
            [HTTP_METHOD.PUT]: (url, body, options) => this.http.put<any>(url, body, options),
            [HTTP_METHOD.DELETE]: (url, body, options) => this.http.delete<any>(url, options),
            [HTTP_METHOD.GET]: (url, body, options) => this.http.get<any>(url, options),
        }
        const apiCall = methodMap[method]
        if (apiCall) {
            return apiCall(url, body, options)
        }
        else {
            throw new Error(`Unsupported Http Method: ${method}`)
        }
    }

    public get(data: DataResquest): Observable<any>{
        const request = this.creatRequest(HTTP_METHOD.GET, data)
        return this.callAPI(request)
    }

    public post(data: DataResquest): Observable<any>{
        const request = this.creatRequest(HTTP_METHOD.POST, data)
        return this.callAPI(request)
    }

    public put(data: DataResquest): Observable<any>{
        const request = this.creatRequest(HTTP_METHOD.PUT, data)
        return this.callAPI(request)
    }

    public delete(data: DataResquest): Observable<any>{
        const request = this.creatRequest(HTTP_METHOD.DELETE, data)
        return this.callAPI(request)
    }

    private creatRequest(method: string, data: DataResquest): RequestHttp {
        data.options = this.setHeaders(data.options);
        return {
            function: data.function,
            method: method,
            body: data.body,
            options: data.options,
        }
    }

    private setHeaders(options?: any): any {
        if (!options) {
            options = {};
        }
        options.headers = options.headers ? options.headers : new HttpHeaders();
        return options
    }
}

