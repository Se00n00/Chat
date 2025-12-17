import { Component } from '@angular/core';
import { signal, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { inject } from '@angular/core';

@Component({
  selector: 'app-main',
  imports: [CommonModule, FormsModule],
  templateUrl: './main.html',
  styleUrl: './main.css'
})

export class Main {
  private router = inject(Router);

  text: WritableSignal<string> = signal('');
  onUserNameChange(newText: string) {
    this.text.set(newText);
  }

  ask(){
    const value = this.text().trim();
    if (!value) {
      return;
    }

    this.router.navigate(['/chat'], {
      queryParams: { q: this.text() }
    });

  }
}
