import { Component, signal, WritableSignal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MarkdownComponent} from 'ngx-markdown'
import { RouterLink, RouterLinkActive } from '@angular/router';
import { RouterOutlet } from '@angular/router';
import { ActivatedRoute } from '@angular/router';

import { Chat } from './chat/chat';
import { Error } from './error/error';
import { TechnicalReport } from './technical-report/technical-report';

@Component({
  selector: 'app-root',
  imports: [
    CommonModule,
    Chat,
    Error,
    TechnicalReport,
    RouterLink,
    RouterOutlet,
    RouterLinkActive
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  totalSegments = 10;       
  filledSegments = 7;       

  segments = Array(this.totalSegments).fill(0);

  isDarkMode = signal(false);

  constructor() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      this.isDarkMode.set(true);
    }
  }

  toggleTheme() {
    const newThemeState = !this.isDarkMode();
    this.isDarkMode.set(newThemeState);

    if (newThemeState) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }
}
