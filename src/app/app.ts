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
  imports: [CommonModule, FormsModule, MarkdownComponent, Chat, Error, TechnicalReport, RouterLink, RouterOutlet, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {

  
  
}