import { HttpContext, HttpHeaders, HttpParams } from "@angular/common/http";

export class RequestHttp {
    function!: string;
    method!: string;
    body?: any | null;
    options?:{
        headers?: HttpHeaders | {
            [header: string]: string | string[];
        };
        context?: HttpContext;
        observe?: 'body';
        params?: HttpParams | {
            [param: string]: string | number | boolean | ReadonlyArray<string | number | boolean>;
        };
        reportProgress?: boolean;
        responseType?: 'json';
        withCredentials?: boolean;
    };
}