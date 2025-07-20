import { Component } from '@angular/core';
import { FooterComponent } from "../../components/footer/footer.component";
import { NavbarComponent } from "../../components/navbar/navbar.component";
import { NgbDatepickerModule, NgbDateStruct, NgbCalendar } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { EntryService } from '../../services/entry.service';
import { PostEntryModel } from '../../services/models';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  imports: [CommonModule, FooterComponent, NavbarComponent, NgbDatepickerModule, FormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  model: NgbDateStruct;
  amount: number = 0;
  commissionType: string = 'Wholesale';
  partyName: string = '';

  constructor(
    readonly calendar: NgbCalendar,
    private readonly entryService: EntryService
  ) {
    this.model = this.calendar.getToday();
  }

  addEntry() {
    const entryData: PostEntryModel = {
      amount: this.amount,
      date: `${this.model.year}-${this.model.month
        .toString()
        .padStart(2, '0')}-${this.model.day
        .toString()
        .padStart(2, '0')}T00:00:00.000Z`,
      type: this.commissionType as 'Cash' | 'Wholesale',
      partyName: this.commissionType === 'Cash' ? 'Cash' : this.partyName,
    };

    this.entryService.postEntry(entryData).subscribe({
      next: (response) => {
        console.log('Entry added successfully:', response);
        this.amount = 0;
        this.model = this.calendar.getToday();
        this.commissionType = 'Wholesale';
        this.partyName = '';
      },
      error: (error) => {
        console.error('Error adding entry:', error);
      }
    });
  }
}
