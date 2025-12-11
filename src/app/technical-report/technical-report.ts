import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import reportData from '../../../public/Data/technical_report.json';

interface ContentBlock {
  type: 'text' | 'image';
  value?: string;
  src?: string;
  alt?: string;
}

interface SectionItem {
  title?: string;
  subtitle?: string;
  description?: string;
  date?: string;
  location?: string;
  index?: number;
  tags?: string[];
  content?: ContentBlock[];
}

interface Section {
  type: string;
  title: string;
  style: 'linear' | 'horizontal' | 'cards';
  items: SectionItem[];
}

@Component({
  selector: 'app-technical-report',
  imports: [CommonModule],
  templateUrl: './technical-report.html',
  styleUrl: './technical-report.css'
})
export class TechnicalReport implements OnInit {
  data = reportData;

  constructor(private http: HttpClient) {
    console.log(this.data)
  }

  ngOnInit(): void {
  }

}
