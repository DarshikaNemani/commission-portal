import { Component, OnInit } from '@angular/core';
import {
  NgbDatepickerModule,
  NgbDateStruct,
  NgbCalendar,
} from '@ng-bootstrap/ng-bootstrap';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AbsentService } from '../../services/absent.service';
import { EntryService } from '../../services/entry.service';

@Component({
  selector: 'app-commission',
  imports: [
    FormsModule,
    NavbarComponent,
    FooterComponent,
    NgbDatepickerModule,
    CommonModule,
  ],
  templateUrl: './commission.component.html',
  styleUrl: './commission.component.css',
  standalone: true,
})
export class CommissionComponent implements OnInit {
  fromDate: NgbDateStruct;
  toDate: NgbDateStruct;

  absents: any[] = [];
  entries: any[] = [];
  employees = ['Arjun', 'Brijesh', 'Chirag'];
  commissions: any = {};

  constructor(
    readonly calendar: NgbCalendar,
    private readonly absentService: AbsentService,
    private readonly entryService: EntryService
  ) {
    this.fromDate = this.calendar.getToday();
    this.toDate = this.calendar.getToday();
  }

  ngOnInit() {
    this.loadAbsents();
  }

  loadAbsents() {
    this.absentService.getAbsents().subscribe({
      next: (data) => {
        this.absents = data.filter((absent: any) => absent.date);

        this.calculateCommission();
      },
      error: (error) => {
        console.error('Error loading absents:', error);
      },
    });
  }

  calculateCommission() {
    const fromDateString = `${this.fromDate.year}-${this.fromDate.month
      .toString()
      .padStart(2, '0')}-${this.fromDate.day.toString().padStart(2, '0')}`;
    const toDateString = `${this.toDate.year}-${this.toDate.month
      .toString()
      .padStart(2, '0')}-${this.toDate.day.toString().padStart(2, '0')}`;

    this.entryService.getOverallEntries().subscribe({
      next: (data) => {
        const allEntries = data.entries || [];

        const filteredEntries = allEntries.filter((entry) => {
          const entryDate = entry.date.split('T')[0];
          return entryDate >= fromDateString && entryDate <= toDateString;
        });

        this.calculateDailyCommissions(filteredEntries);
      },
      error: (error) => {
        console.error('Error loading entries:', error);
      },
    });
  }

  calculateDailyCommissions(entries: any[]) {
    const entriesByDate: { [date: string]: any[] } = {};

    entries.forEach((entry) => {
      const date = entry.date.split('T')[0];
      if (!entriesByDate[date]) {
        entriesByDate[date] = [];
      }
      entriesByDate[date].push(entry);
    });

    this.employees.forEach((emp) => {
      this.commissions[emp] = 0;
    });

    Object.keys(entriesByDate).forEach((date) => {
      const dayEntries = entriesByDate[date];
      const wholesaleTotal = dayEntries
        .filter((entry) => entry.type === 'Wholesale')
        .reduce((sum, entry) => sum + entry.amount, 0);

      const absentToday = this.absents
        .filter((absent) => {
          if (!absent?.date) return false;

          const absentDateString = absent.date.split('T')[0];
          return absentDateString === date;
        })
        .map((absent) => absent.name);

      const presentToday = this.employees.filter(
        (emp) => !absentToday.includes(emp)
      );

      if (presentToday.length > 0 && wholesaleTotal > 0) {
        const commissionPerPerson = wholesaleTotal / presentToday.length;

        presentToday.forEach((emp) => {
          this.commissions[emp] += commissionPerPerson;
        });
      }
    });
  }

  onDateChange() {
    this.calculateCommission();
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'No Date';

    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Invalid Date';
      }
      return date.toLocaleDateString();
    } catch (error) {
      return 'Invalid Date';
    }
  }
}
