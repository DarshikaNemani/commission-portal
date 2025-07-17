import { Component } from '@angular/core';
import { NgbDatepickerModule, NgbDateStruct, NgbCalendar } from '@ng-bootstrap/ng-bootstrap';
import { NavbarComponent } from "../../components/navbar/navbar.component";
import { FooterComponent } from "../../components/footer/footer.component";
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-commission',
  imports: [FormsModule, NavbarComponent, FooterComponent, NgbDatepickerModule],
  templateUrl: './commission.component.html',
  styleUrl: './commission.component.css',
  standalone: true
})
export class CommissionComponent {
  fromDate: NgbDateStruct;
  toDate: NgbDateStruct;
  
  constructor(readonly calendar: NgbCalendar) {
    this.fromDate = this.calendar.getToday();
    this.toDate = this.calendar.getToday();
  }
}
