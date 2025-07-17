import { Component, OnInit } from '@angular/core';
import { NgbDatepickerModule, NgbDateStruct, NgbCalendar } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from "../../components/navbar/navbar.component";
import { FooterComponent } from "../../components/footer/footer.component";
import { CommonModule } from '@angular/common';
import { AbsentService } from '../../services/absent.service';
import { PostAbsentModel } from '../../services/models';

@Component({
  selector: 'app-absent',
  imports: [NgbDatepickerModule, FormsModule, NavbarComponent, FooterComponent, CommonModule],
  templateUrl: './absent.component.html',
  styleUrl: './absent.component.css',
  standalone: true
})
export class AbsentComponent implements OnInit {
  model: NgbDateStruct;
  selectedEmployee: string = 'Select Employee';
  absentRecords: any[] = [];

  constructor(
    readonly calendar: NgbCalendar,
    private readonly absentService: AbsentService
  ) {
    this.model = this.calendar.getToday();
  }

  ngOnInit() {
    this.loadAbsentRecords();
  }

  selectEmployee(employee: string) {
    this.selectedEmployee = employee;
  }

  submitAbsent() {
    if (this.selectedEmployee === 'Select Employee') {
      console.error('Please select an employee');
      return;
    }

    const absentData: PostAbsentModel = {
      name: this.selectedEmployee,
      date: new Date(this.model.year, this.model.month - 1, this.model.day).toISOString()
    };

    this.absentService.postAbsent(absentData).subscribe({
      next: (response) => {
        console.log('Absent added successfully:', response);
        // Reset form
        this.selectedEmployee = 'Select Employee';
        this.model = this.calendar.getToday();
        // Reload absent records
        this.loadAbsentRecords();
      },
      error: (error) => {
        console.error('Error adding absent:', error);
      }
    });
  }

  loadAbsentRecords() {
    this.absentService.getAbsents().subscribe({
      next: (data) => {
        this.absentRecords = data;
        console.log('Absent records loaded:', data);
      },
      error: (error) => {
        console.error('Error loading absent records:', error);
      }
    });
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  }
}
