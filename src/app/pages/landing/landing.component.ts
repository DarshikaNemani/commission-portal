import { Component, OnInit, AfterViewInit } from '@angular/core';
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
import { AbsentService } from '../../services/absent.service';
import { Chart, registerables, ChartConfiguration } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-landing',
  imports: [NavbarComponent, FooterComponent, RouterLink, RouterLinkActive, CommonModule],
  standalone: true,
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.css',
})
export class LandingComponent implements OnInit, AfterViewInit {
  model: NgbDateStruct;
  selectedMonth: number;

  dailyEntries: DayEntriesResponse | null = null;
  monthlyEntries: MonthEntriesResponse | null = null;
  overallEntries: OverallEntriesResponse | null = null;

  employees = ['Arjun', 'Brijesh', 'Chirag'];
  absents: any[] = [];
  chart: any;

  constructor(
    readonly calendar: NgbCalendar, 
    private absentService: AbsentService, 
    private readonly entryService: EntryService
  ) {
    this.model = this.calendar.getToday();
    this.selectedMonth = this.model.month;
  }

  ngOnInit(): void {
    this.loadAllData();
    this.loadAbsents();
  }

  ngAfterViewInit(): void {
    // Ensure DOM is ready before creating chart
    setTimeout(() => {
      this.createChart();
    }, 100);
  }

  loadAllData() {
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

    this.entryService.getDayEntries(dateString).subscribe({
      next: (data) => {
        this.dailyEntries = data;
      },
      error: (error) => {
        console.error('Error loading daily entries:', error);
        this.dailyEntries = null;
      },
    });
  }

  loadMonthlyEntries() {
    this.entryService.getMonthEntries(this.selectedMonth, this.model.year).subscribe({
      next: (data) => {
        this.monthlyEntries = data;
      },
      error: (error) => {
        console.error('Error loading monthly entries:', error);
        this.monthlyEntries = null;
      },
    });
  }

  loadOverallEntries() {
    this.entryService.getOverallEntries().subscribe({
      next: (data) => {
        this.overallEntries = data;
      },
      error: (error) => {
        console.error('Error loading overall entries:', error);
        this.overallEntries = null;
      },
    });
  }

  loadAbsents() {
    this.absentService.getAbsents().subscribe({
      next: (data) => {
        this.absents = data.filter((absent: any) => absent.date);
        this.updateChart();
      },
      error: (error) => {
        console.error('Error loading absents:', error);
        this.updateChart();
      }
    });
  }

  createChart() {
    if (this.chart) {
      this.chart.destroy();
    }

    const ctx = document.getElementById('myChart') as HTMLCanvasElement;
    if (!ctx) return;

    const config: ChartConfiguration<'pie'> = {
      type: 'pie',
      data: {
        labels: ['Present', 'Absent'],
        datasets: [{
          label: 'Employee Attendance Today',
          data: [3, 0], // Default values
          backgroundColor: ['#4CAF50', '#DC2626'],
          borderColor: ['#FFFFFF', '#FFFFFF'],
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              boxWidth: 12,
              padding: 20
            }
          },
          title: {
            display: false  ,
            text: 'Employee Attendance Today'
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const label = context.label;
                const count = context.parsed;
                return `${label}: ${count}`;
              }
            }
          }
        }
      }
    };

    this.chart = new Chart(ctx, config);
    this.updateChart();
  }

  updateChart() {
    if (!this.chart) return;

    const today = new Date().toISOString().split('T')[0];
    
    const absentToday = this.absents
      .filter(absent => absent.date.split('T')[0] === today)
      .map(absent => absent.name);
    
    const presentToday = this.employees.filter(emp => !absentToday.includes(emp));
    
    this.chart.data.datasets[0].data = [presentToday.length, absentToday.length];
    this.chart.update();
  }
}
