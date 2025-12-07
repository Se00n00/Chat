import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
@Component({
  selector: 'app-error',
  imports: [
    RouterLinkActive,
    RouterLink
  ],
  templateUrl: './error.html',
  styleUrl: './error.css'
})
export class Error {

}
