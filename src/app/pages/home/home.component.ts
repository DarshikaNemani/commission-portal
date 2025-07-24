import { Component, OnInit } from '@angular/core';
import { FooterComponent } from "../../components/footer/footer.component";
import { NavbarComponent } from "../../components/navbar/navbar.component";
import { NgbDatepickerModule, NgbDateStruct, NgbCalendar } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { EntryService } from '../../services/entry.service';
import { PartyService } from '../../services/party.service';
import { AdminService } from '../../services/admin.service';
import { PostEntryModel, PartyModel } from '../../services/models';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  imports: [CommonModule, FooterComponent, NavbarComponent, NgbDatepickerModule, FormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  model: NgbDateStruct;
  amount: string = '';
  commissionType: string = 'Wholesale';
  partyName: string = '';
  selectedParty: string = '';
  addParty: boolean = false;
  parties: PartyModel[] = [];
  isAdminLoggedIn: boolean = false;

  constructor(
    readonly calendar: NgbCalendar,
    private readonly entryService: EntryService,
    private readonly partyService: PartyService,
    private readonly adminService: AdminService
  ) {
    this.model = this.calendar.getToday();
  }

  ngOnInit() {
    this.loadParties();
    this.adminService.isLoggedIn$.subscribe(isLoggedIn => {
      this.isAdminLoggedIn = isLoggedIn;
    });
  }

isDropdownOpen: boolean = false;

toggleDropdown() {
  this.isDropdownOpen = !this.isDropdownOpen;
}

selectPartyFromDropdown(partyName: string, event: Event) {
  event.preventDefault();
  this.selectedParty = partyName;
  this.addParty = false;
  this.isDropdownOpen = false;
}

showAddPartyInput(event: Event) {
  event.preventDefault();
  this.addParty = true;
  this.selectedParty = '';
  this.isDropdownOpen = false;
  this.partyName = '';
}

confirmAddParty() {
  if (this.partyName.trim()) {
    this.selectedParty = this.partyName.trim();
    this.addParty = false;
  }
}

cancelAddParty() {
  this.addParty = false;
  this.partyName = '';
}

deleteParty(partyId: string, event: Event) {
  event.preventDefault();
  event.stopPropagation();
  if (confirm('Are you sure you want to delete this party?')) {
    this.partyService.deleteParty(partyId).subscribe({
      next: (response) => {
        this.loadParties();
        if (this.selectedParty === this.parties.find(p => p._id === partyId)?.name) {
          this.selectedParty = '';
        }
      },
      error: (error) => {
        console.error('Error deleting party:', error);
      }
    });
  }
}

resetForm() {
  this.amount = '';
  this.model = this.calendar.getToday();
  this.commissionType = 'Wholesale';
  this.partyName = '';
  this.selectedParty = '';
  this.addParty = false;
  this.isDropdownOpen = false;
}


  loadParties() {
    this.partyService.getParties().subscribe({
      next: (parties) => {
        this.parties = parties.filter(party => party.name.trim() !== '');
      },
      error: (error) => {
        console.error('Error loading parties:', error);
      }
    });
  }


  addEntry() {
    const dateString = `${this.model.year}-${this.model.month.toString().padStart(2, '0')}-${this.model.day.toString().padStart(2, '0')}`;

    if (this.amount.includes(',')) {
      this.addBulkEntry(dateString);
    } else {
      this.addSingleEntry(dateString);
    }
  }

  addSingleEntry(dateString: string) {
    const finalPartyName = this.commissionType === 'Cash' ? 'Cash' : 
                          (this.addParty ? this.partyName : this.selectedParty);

    const entryData: PostEntryModel = {
      amount: parseFloat(this.amount),
      date: `${dateString}T00:00:00.000Z`,
      type: this.commissionType as 'Cash' | 'Wholesale',
      partyName: finalPartyName,
    };

    this.entryService.postEntry(entryData).subscribe({
      next: (response) => {
        this.resetForm();
        if (this.addParty) {
          this.loadParties();
        }
      },
      error: (error) => {
        console.error('Error adding entry:', error);
      }
    });
  }

  addBulkEntry(dateString: string) {
    const bulkData = {
      date: dateString,
      cash: this.commissionType === 'Cash' ? this.amount : '',
      wholesale: this.commissionType === 'Wholesale' ? this.amount : ''
    };

    this.entryService.bulkEntry(bulkData).subscribe({
      next: (response) => {
        this.resetForm();
      },
      error: (error) => {
        console.error('Error adding bulk entries:', error);
      }
    });
  }

}
