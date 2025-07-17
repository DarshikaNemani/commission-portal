import { Component } from '@angular/core';
import { FooterComponent } from "../../components/footer/footer.component";
import { NavbarComponent } from "../../components/navbar/navbar.component";
import { NgbDatepickerModule, NgbDateStruct, NgbCalendar } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-home',
  imports: [FooterComponent, NavbarComponent, NgbDatepickerModule, FormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})

export class HomeComponent {
  model: NgbDateStruct;
  amount: number = 0;
  commissionType: string = 'wholesale';

  constructor(readonly calendar: NgbCalendar) {
    this.model = this.calendar.getToday();
  }

  addEntry() {
    console.log('Entry added:', {
      amount: this.amount,
      date: this.model,
      type: this.commissionType
    });
  }
}
