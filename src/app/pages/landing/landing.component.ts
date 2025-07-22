import { Component } from '@angular/core';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { NgbDateStruct, NgbCalendar } from '@ng-bootstrap/ng-bootstrap';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import {
  DayEntriesResponse,
  MonthEntriesResponse,
  OverallEntriesResponse,
} from '../../services/models';
import { EntryService } from '../../services/entry.service';

@Component({
  selector: 'app-landing',
  imports: [NavbarComponent, FooterComponent, RouterLink, RouterLinkActive, CommonModule],
  standalone: true,
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.css',
})
export class LandingComponent {
  model: NgbDateStruct;
  selectedMonth: number;

  dailyEntries: DayEntriesResponse | null = null;
  monthlyEntries: MonthEntriesResponse | null = null;
  overallEntries: OverallEntriesResponse | null = null;

  isLoadingDaily: boolean = false;
  isLoadingMonthly: boolean = false;
  isLoadingOverall: boolean = false;

  dailyError: string | null = null;
  monthlyError: string | null = null;
  overallError: string | null = null;

  constructor(readonly calendar: NgbCalendar, private readonly entryService: EntryService) {
    this.model = this.calendar.getToday();
    this.selectedMonth = this.model.month;
    this.loadDailyEntries();
    this.loadMonthlyEntries();
    this.loadOverallEntries();
  }
getDayName(): string {
  const date = new Date(this.model.year, this.model.month - 1, this.model.day);
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[date.getDay()];
}

  loadDailyEntries() {
    const dateString = `${this.model.year}-${this.model.month
      .toString()
      .padStart(2, '0')}-${this.model.day.toString().padStart(2, '0')}`;

    this.isLoadingDaily = true;
    this.dailyError = null;

    this.entryService.getDayEntries(dateString).subscribe({
      next: (data) => {
        this.dailyEntries = data;
        this.isLoadingDaily = false;
      },
      error: (error) => {
        console.error('Error loading daily entries:', error);
        this.dailyError = 'Failed to load daily entries. Please try again.';
        this.isLoadingDaily = false;
        this.dailyEntries = null;
      },
    });
  }

  loadMonthlyEntries() {
    this.isLoadingMonthly = true;
    this.monthlyError = null;

    this.entryService
      .getMonthEntries(this.selectedMonth, this.model.year)
      .subscribe({
        next: (data) => {
          this.monthlyEntries = data;
          this.isLoadingMonthly = false;
        },
        error: (error) => {
          console.error('Error loading monthly entries:', error);
          this.monthlyError =
            'Failed to load monthly entries. Please try again.';
          this.isLoadingMonthly = false;
          this.monthlyEntries = null;
        },
      });
  }

  loadOverallEntries() {
    this.isLoadingOverall = true;
    this.overallError = null;

    this.entryService.getOverallEntries().subscribe({
      next: (data) => {
        this.overallEntries = data;
        this.isLoadingOverall = false;
      },
      error: (error) => {
        console.error('Error loading overall entries:', error);
        this.overallError = 'Failed to load overall entries. Please try again.';
        this.isLoadingOverall = false;
        this.overallEntries = null;
      },
    });
  }
}
