import {ApplicationConfig, provideZoneChangeDetection, importProvidersFrom} from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import {provideHttpClient, withFetch, HttpClient} from '@angular/common/http';
import {DialogService} from 'primeng/dynamicdialog';
import {TranslateModule, TranslateLoader} from '@ngx-translate/core';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';
import {ConfirmationService, MessageService} from 'primeng/api';
import {provideAnimations} from '@angular/platform-browser/animations';

export function HttpLoaderFactory(http: HttpClient) {
    return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideAnimations(),
    provideRouter(routes), 
    provideHttpClient(
      withFetch()
    ),
    provideZoneChangeDetection({eventCoalescing: true}),
        ConfirmationService,
        MessageService,    
        DialogService,
        importProvidersFrom(
            TranslateModule.forRoot({
                loader: {
                    provide: TranslateLoader,
                    useFactory: HttpLoaderFactory,
                    deps: [HttpClient]
                },
                defaultLanguage: 'vi'
            })
        )
  ]
};
