import { Component, OnInit, AfterViewInit } from '@angular/core';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { NgbDateStruct, NgbCalendar } from '@ng-bootstrap/ng-bootstrap';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import {
  DayEntriesResponse,
  MonthEntriesResponse,
  OverallEntriesResponse,
} from '../../services/models';
import { EntryService } from '../../services/entry.service';
import { AbsentService } from '../../services/absent.service';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-landing',
  imports: [NavbarComponent, FooterComponent, RouterLink, CommonModule],
  standalone: true,
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.css',
})
export class LandingComponent implements OnInit, AfterViewInit {
  model: NgbDateStruct;
  dailyEntries: DayEntriesResponse | null = null;
  monthlyEntries: MonthEntriesResponse | null = null;
  overallEntries: OverallEntriesResponse | null = null;
  employees = ['Arjun', 'Brijesh', 'Chirag'];
  absents: any[] = [];
  chart: any;

  constructor(
    readonly calendar: NgbCalendar,
    private absentService: AbsentService,
    private entryService: EntryService
  ) {
    this.model = this.calendar.getToday();
  }

  ngOnInit(): void {
    this.loadData();
    this.loadAbsents();
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.createChart(), 200);
  }

  getDayName(): string {
    const date = new Date(this.model.year, this.model.month - 1, this.model.day);
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[date.getDay()];
  }

  loadData() {
    const dateString = `${this.model.year}-${this.model.month.toString().padStart(2, '0')}-${this.model.day.toString().padStart(2, '0')}`;

    // Load daily entries
    this.entryService.getDayEntries(dateString).subscribe({
      next: (data) => this.dailyEntries = data,
      error: () => this.dailyEntries = null
    });

    // Load monthly entries
    this.entryService.getMonthEntries(this.model.month, this.model.year).subscribe({
      next: (data) => this.monthlyEntries = data,
      error: () => this.monthlyEntries = null
    });

    // Load overall entries
    this.entryService.getOverallEntries().subscribe({
      next: (data) => this.overallEntries = data,
      error: () => this.overallEntries = null
    });
  }

  loadAbsents() {
    this.absentService.getAbsents().subscribe({
      next: (data) => {
        this.absents = data.filter((absent: any) => absent.date);
        this.updateChart();
      },
      error: () => this.updateChart()
    });
  }

  createChart() {
    if (this.chart) this.chart.destroy();

    const ctx = document.getElementById('myChart') as HTMLCanvasElement;
    if (!ctx) return;

    this.chart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: ['Present', 'Absent'],
        datasets: [{
          data: [3, 0],
          backgroundColor: ['#10b981', '#ef4444'],
          borderColor: ['#FFFFFF', '#FFFFFF'],
          borderWidth: 2,
          hoverOffset: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: { boxWidth: 12, padding: 15, font: { size: 12 } }
          },
          title: { display: false },
          tooltip: {
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            titleColor: '#1f2937',
            bodyColor: '#6b7280',
            borderColor: '#e5e7eb',
            borderWidth: 1,
            cornerRadius: 8,
            callbacks: {
              label: (context) => {
                const today = new Date().toISOString().split('T')[0];
                const absentToday = this.absents
                  .filter(absent => absent.date.split('T')[0] === today)
                  .map(absent => absent.name);
                const presentToday = this.employees.filter(emp => !absentToday.includes(emp));
                
                const label = context.label;
                const count = context.parsed;
                
                if (label === 'Present' && presentToday.length > 0) {
                  return `${label} (${count}): ${presentToday.join(', ')}`;
                } else if (label === 'Absent' && absentToday.length > 0) {
                  return `${label} (${count}): ${absentToday.join(', ')}`;
                }
                return `${label}: ${count}`;
              }
            }
          }
        }
      }
    });

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
    this.chart.update('none');
  }
}
