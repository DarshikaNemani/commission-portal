import { Component } from '@angular/core';
import { NgbDatepickerModule, NgbDateStruct, NgbCalendar } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from "../../components/navbar/navbar.component";
import { FooterComponent } from "../../components/footer/footer.component";

@Component({
  selector: 'app-absent',
  imports: [NgbDatepickerModule, FormsModule, NavbarComponent, FooterComponent],
  templateUrl: './absent.component.html',
  styleUrl: './absent.component.css',
  standalone: true
})
export class AbsentComponent {
  model: NgbDateStruct;

  constructor(readonly calendar: NgbCalendar) {
    this.model = this.calendar.getToday();
  }

}
