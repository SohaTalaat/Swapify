// src/main.ts
import { enableProdMode } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { App } from './app/app';
import { appConfig } from './app/app.config';


const environment = { production: false };
if (environment.production) enableProdMode();

bootstrapApplication(App, appConfig).catch((err) => console.error('Bootstrap failed:', err));
