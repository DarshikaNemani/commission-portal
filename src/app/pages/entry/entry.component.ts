import { Component } from '@angular/core';
import {
  NgbDatepickerModule,
  NgbDateStruct,
  NgbCalendar,
} from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { FooterComponent } from '../../components/footer/footer.component';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { CommonModule } from '@angular/common';
import { EntryService } from '../../services/entry.service';
import { AdminService } from '../../services/admin.service';
import {
  DayEntriesResponse,
  MonthEntriesResponse,
  OverallEntriesResponse,
} from '../../services/models';

@Component({
  selector: 'app-entry',
  imports: [
    NgbDatepickerModule,
    FormsModule,
    FooterComponent,
    NavbarComponent,
    CommonModule,
  ],
  templateUrl: './entry.component.html',
  standalone: true,
  styleUrl: './entry.component.css',
})
export class EntryComponent {
  model: NgbDateStruct;
  activeSection: string = 'daily';
  selectedMonth: number = 1;
  isAdminLoggedIn: boolean = false;

  dailyEntries: DayEntriesResponse | null = null;
  monthlyEntries: MonthEntriesResponse | null = null;
  overallEntries: OverallEntriesResponse | null = null;

  isLoadingDaily: boolean = false;
  isLoadingMonthly: boolean = false;
  isLoadingOverall: boolean = false;

  dailyError: string | null = null;
  monthlyError: string | null = null;
  overallError: string | null = null;

  editingEntry: any = null;
  isEditing: boolean = false;

  numbers: number[] = Array(12)
    .fill(0)
    .map((x, i) => i + 1);

  constructor(
    readonly calendar: NgbCalendar,
    private readonly entryService: EntryService,
    private readonly adminService: AdminService
  ) {
    this.model = this.calendar.getToday();
    this.selectedMonth = this.model.month;
    this.loadDailyEntries();

    this.adminService.isLoggedIn$.subscribe(isLoggedIn => {
      this.isAdminLoggedIn = isLoggedIn;
    });
  }

  showSection(section: string) {
    this.activeSection = section;

    if (section === 'daily') {
      this.loadDailyEntries();
    } else if (section === 'monthly') {
      this.loadMonthlyEntries();
    } else if (section === 'overall') {
      this.loadOverallEntries();
    }
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

  onDateChange() {
    if (this.activeSection === 'daily') {
      this.loadDailyEntries();
    }
  }

  getDateWiseSummary(entries: any[]): any[] {
    const dateMap = new Map();

    entries.forEach((entry) => {
      const date = entry.date.split('T')[0];

      if (!dateMap.has(date)) {
        dateMap.set(date, {
          date: date,
          totalCash: 0,
          totalWholesale: 0,
        });
      }

      const summary = dateMap.get(date);
      if (entry.type === 'Cash') {
        summary.totalCash += entry.amount;
      } else if (entry.type === 'Wholesale') {
        summary.totalWholesale += entry.amount;
      }
    });

    return Array.from(dateMap.values()).sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }

  getMonthWiseSummary(entries: any[]): any[] {
    const monthMap = new Map();

    entries.forEach((entry) => {
      const date = new Date(entry.date);
      const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;

      if (!monthMap.has(monthKey)) {
        monthMap.set(monthKey, {
          month: date.getMonth() + 1,
          year: date.getFullYear(),
          totalCash: 0,
          totalWholesale: 0,
        });
      }

      const summary = monthMap.get(monthKey);
      if (entry.type === 'Cash') {
        summary.totalCash += entry.amount;
      } else if (entry.type === 'Wholesale') {
        summary.totalWholesale += entry.amount;
      }
    });

    return Array.from(monthMap.values()).sort(
      (a, b) =>
        new Date(a.year, a.month - 1).getTime() -
        new Date(b.year, b.month - 1).getTime()
    );
  }

  onMonthChange(event: any) {
    this.selectedMonth = parseInt(event.target.value);
    if (this.activeSection === 'monthly') {
      this.loadMonthlyEntries();
    }
  }

  onYearChange() {
    if (this.activeSection === 'monthly') {
      this.loadMonthlyEntries();
    }
  }

  retryLoadDaily() {
    this.loadDailyEntries();
  }

  retryLoadMonthly() {
    this.loadMonthlyEntries();
  }

  retryLoadOverall() {
    this.loadOverallEntries();
  }

  editEntry(entry: any) {
    this.editingEntry = { ...entry };
    this.isEditing = true;
  }

  updateEntry() {
    if (!this.editingEntry) return;

    const updateData = {
      amount: this.editingEntry.amount,
      date: this.editingEntry.date,
      type: this.editingEntry.type,
      partyName: this.editingEntry.partyName
    };

    this.entryService.updateEntry(this.editingEntry._id, updateData).subscribe({
      next: (response) => {
        this.cancelEdit();
        this.loadDailyEntries();
      },
      error: (error) => {
        console.error('Error updating entry:', error);
      }
    });
  }

  deleteEntry(entryId: string) {
    if (confirm('Are you sure you want to delete this entry?')) {
      this.entryService.deleteEntry(entryId).subscribe({
        next: (response) => {
          this.loadDailyEntries();
        },
        error: (error) => {
          console.error('Error deleting entry:', error);
        }
      });
    }
  }

  cancelEdit() {
    this.editingEntry = null;
    this.isEditing = false;
  }
}
