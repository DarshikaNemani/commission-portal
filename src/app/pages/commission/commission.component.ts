import { Component, OnInit } from '@angular/core';
import { NgbDatepickerModule, NgbDateStruct, NgbCalendar } from '@ng-bootstrap/ng-bootstrap';
import { NavbarComponent } from "../../components/navbar/navbar.component";
import { FooterComponent } from "../../components/footer/footer.component";
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AbsentService } from '../../services/absent.service';
import { EntryService } from '../../services/entry.service';

@Component({
  selector: 'app-commission',
  imports: [FormsModule, NavbarComponent, FooterComponent, NgbDatepickerModule, CommonModule],
  templateUrl: './commission.component.html',
  styleUrl: './commission.component.css',
  standalone: true
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
    this.calculateCommission();
  }

  loadAbsents() {
    this.absentService.getAbsents().subscribe({
      next: (data) => {
        this.absents = data;
        console.log('Absents loaded:', data);
      },
      error: (error) => {
        console.error('Error loading absents:', error);
      }
    });
  }

  calculateCommission() {
    const fromDateString = `${this.fromDate.year}-${this.fromDate.month.toString().padStart(2, '0')}-${this.fromDate.day.toString().padStart(2, '0')}`;
    const toDateString = `${this.toDate.year}-${this.toDate.month.toString().padStart(2, '0')}-${this.toDate.day.toString().padStart(2, '0')}`;
    
    // Get all entries in date range
    this.entryService.getOverallEntries().subscribe({
      next: (data) => {
        const allEntries = data.entries || [];
        
        // Filter entries in date range
        const filteredEntries = allEntries.filter(entry => {
          const entryDate = entry.date.split('T')[0];
          return entryDate >= fromDateString && entryDate <= toDateString;
        });
        
        this.calculateDailyCommissions(filteredEntries);
      },
      error: (error) => {
        console.error('Error loading entries:', error);
      }
    });
  }

  calculateDailyCommissions(entries: any[]) {
    // Group entries by date
    const entriesByDate: { [date: string]: any[] } = {};
    
    entries.forEach(entry => {
      const date = entry.date.split('T')[0];
      if (!entriesByDate[date]) {
        entriesByDate[date] = [];
      }
      entriesByDate[date].push(entry);
    });

    // Initialize commissions
    this.employees.forEach(emp => {
      this.commissions[emp] = 0;
    });

    // Calculate commission for each date
    Object.keys(entriesByDate).forEach(date => {
      const dayEntries = entriesByDate[date];
      const dayTotal = dayEntries.reduce((sum, entry) => sum + entry.amount, 0);
      
      // Find who was absent on this date
      const absentToday = this.absents.filter(absent => {
        const absentDate = new Date(absent.date).toISOString().split('T')[0];
        return absentDate === date;
      }).map(absent => absent.name);
      
      // Find who was present
      const presentToday = this.employees.filter(emp => !absentToday.includes(emp));
      
      // Divide commission among present employees
      if (presentToday.length > 0) {
        const commissionPerPerson = dayTotal / presentToday.length;
        presentToday.forEach(emp => {
          this.commissions[emp] += commissionPerPerson;
        });
      }
    });
  }

  onDateChange() {
    this.calculateCommission();
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }
}
