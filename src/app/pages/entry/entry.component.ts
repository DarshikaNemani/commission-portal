import { Component } from '@angular/core';
import { NgbDatepickerModule, NgbDateStruct, NgbCalendar } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { FooterComponent } from "../../components/footer/footer.component";
import { NavbarComponent } from "../../components/navbar/navbar.component";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-entry',
  imports: [NgbDatepickerModule, FormsModule, FooterComponent, NavbarComponent, CommonModule],
  templateUrl: './entry.component.html',
  standalone: true,
  styleUrl: './entry.component.css'
})
export class EntryComponent {
  model: NgbDateStruct;
  activeSection: string = 'daily';

  constructor(readonly calendar: NgbCalendar) {
    this.model = this.calendar.getToday();
  }

  showSection(section: string) {
    this.activeSection = section;
  }
}
