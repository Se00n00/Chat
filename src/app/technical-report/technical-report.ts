import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
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
  data: { sections: Section[] } = { sections: [] };

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadPortfolioData();
  }

  loadPortfolioData(): void {
    this.http.get<{ sections: Section[] }>('Data/technical_report.json')
      .subscribe({
        next: (res) => {
          this.data = res;
          console.log(this.data)
        },
        error: (err) => {
          console.error("Error loading Data", err);
        }
      });
  }
}
