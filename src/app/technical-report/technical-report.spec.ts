import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TechnicalReport } from './technical-report';

describe('TechnicalReport', () => {
  let component: TechnicalReport;
  let fixture: ComponentFixture<TechnicalReport>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TechnicalReport]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TechnicalReport);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
