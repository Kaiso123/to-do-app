import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ToastModule } from "primeng/toast";
import { NgxSpinnerModule, NgxSpinnerService } from "ngx-spinner";
import { DialogService, DynamicDialogModule } from "primeng/dynamicdialog";
import { ConfirmDialogModule } from "primeng/confirmdialog";
import { KEY_STORE } from './config/constants';
import { CommonModule } from "@angular/common";


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    ToastModule,
    ConfirmDialogModule,
    DynamicDialogModule,
    NgxSpinnerModule,
    CommonModule
  ],
  templateUrl: "./app.component.html",
  styleUrl: "./app.component.scss",
  providers: [DialogService],
})
export class AppComponent implements OnInit {
    isAppReady = false;

    constructor(
        private translateService: TranslateService,
        private spinner: NgxSpinnerService
    ) {}

    private readonly classes: Record<string, string> = {
        "en": "lang-en",
        "vi": "lang-vi",
        "lo": "lang-lo",
    };

    ngOnInit() {
        // Show spinner immediately
        this.spinner
            .show("appLoader", {
                type: "ball-scale-ripple-multiple",
                size: "large",
                bdColor: "rgba(255, 107, 53, 0.9)", 
                color: "#ffffff",
                fullScreen: true,
                template: `
                <div style="text-align: center; color: white;">
                    <div style="margin-bottom: 30px;">
                        <i class="fas fa-robot" style="font-size: 48px; margin-bottom: 15px; display: block;"></i>
                        <h2 style="font-size: 32px; font-weight: 700; margin: 0; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">UnitelBot</h2>
                    </div>
                    <div>{{spinner}}</div>
                    <p style="font-size: 18px; font-weight: 500; margin-top: 20px; opacity: 0.9;">...</p>
                </div>
            `,
            })
            .then((r) => {});

        // Initialize translations with language priority: URL param -> localStorage -> default Vi
        let selectedLang = "vi"; // Default to Vi

        // Priority 1: Check URL parameter
        const urlParams = new URLSearchParams(window.location.search);
        const langParam = urlParams.get("lang");
        if (langParam && ["vi", "en", "lo"].includes(langParam)) {
            selectedLang = langParam;
        } else {
            // Priority 2: Check localStorage (using new simple key)
            const savedLang = localStorage.getItem(KEY_STORE.LOCALIZATION);
            if (savedLang && ["vi", "en", "lo"].includes(savedLang)) {
                selectedLang = savedLang;
            }
        }
        
        // Save the selected language to localStorage
        localStorage.setItem(KEY_STORE.LOCALIZATION, selectedLang);

        this.translateService.setDefaultLang(selectedLang);
        this.translateService.use(selectedLang).subscribe(
            () => {
                this.finishLoading();
            },
            () => {
                this.finishLoading(); // Still show app even if translation fails
            }
        );
        this.setFontForLanguage(selectedLang);

        // Fallback: mark as ready after timeout to prevent infinite loading
        setTimeout(() => {
            if (!this.isAppReady) {
                this.finishLoading();
            }
        }, 5000);
    }

    private finishLoading() {
        if (!this.isAppReady) {
            this.isAppReady = true;
            this.spinner.hide("appLoader").then(() => {});
        }
    }

    private setFontForLanguage(lang: string) {
        const root = document.documentElement; // <html>
        // bỏ các class cũ
        Object.values(this.classes).forEach((c) => root.classList.remove(c));
        // thêm class mới
        root.classList.add(this.classes[lang]);
        // set thuộc tính lang (tốt cho a11y & SEO)
        root.setAttribute("lang", lang);
        // lưu lại nếu muốn
        localStorage.setItem("app-lang", lang);
    }
}