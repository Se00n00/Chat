import { Component, signal, WritableSignal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [
    CommonModule,
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

  isDarkMode = signal(true);

  constructor() {
    this.enableDarkMode();
  }

  private enableDarkMode() {
    this.isDarkMode.set(true);
    document.documentElement.classList.add('dark');
    localStorage.setItem('theme', 'dark');
  }
  toggleTheme(){}

}
