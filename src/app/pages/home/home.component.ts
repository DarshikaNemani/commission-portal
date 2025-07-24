import { Component, OnInit } from '@angular/core';
import { FooterComponent } from '../../components/footer/footer.component';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { NgbDatepickerModule, NgbDateStruct, NgbCalendar } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { EntryService } from '../../services/entry.service';
import { PartyService } from '../../services/party.service';
import { AdminService } from '../../services/admin.service';
import { PostEntryModel, PartyModel } from '../../services/models';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FooterComponent, NavbarComponent, NgbDatepickerModule, FormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  model: NgbDateStruct;
  amount = '';
  commissionType: 'Cash' | 'Wholesale' = 'Wholesale';
  partyName = '';
  selectedParty = '';
  addParty = false;
  parties: PartyModel[] = [];
  isAdminLoggedIn = false;
  isDropdownOpen = false;

  constructor(
    readonly calendar: NgbCalendar,
    private readonly entryService: EntryService,
    private readonly partyService: PartyService,
    private readonly adminService: AdminService
  ) {
    this.model = this.calendar.getToday();
  }

  ngOnInit(): void {
    this.loadParties();
    this.adminService.isLoggedIn$.subscribe(v => (this.isAdminLoggedIn = v));
  }

  getDayName(): string {
    const d = new Date(this.model.year, this.model.month - 1, this.model.day);
    return ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][d.getDay()];
  }

  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  selectPartyFromDropdown(name: string, e: Event): void {
    e.preventDefault();
    this.selectedParty = name;
    this.addParty = false;
    this.isDropdownOpen = false;
  }

  showAddPartyInput(e: Event): void {
    e.preventDefault();
    this.addParty = true;
    this.selectedParty = '';
    this.isDropdownOpen = false;
    this.partyName = '';
  }

  confirmAddParty(): void {
    if (this.partyName.trim()) {
      this.selectedParty = this.partyName.trim();
      this.addParty = false;
    }
  }

  cancelAddParty(): void {
    this.addParty = false;
    this.partyName = '';
  }

  loadParties(): void {
    this.partyService.getParties().subscribe({
      next: parties => (this.parties = parties.filter(p => p.name.trim())),
      error: err  => console.error('Error loading parties:', err)
    });
  }

  deleteParty(id: string, e: Event): void {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm('Delete this party?')) return;

    this.partyService.deleteParty(id).subscribe({
      next: () => {
        this.loadParties();
        if (this.selectedParty === this.parties.find(p => p._id === id)?.name) {
          this.selectedParty = '';
        }
      },
      error: err => console.error('Error deleting party:', err)
    });
  }

  addEntry(): void {
    const dateStr = `${this.model.year}-${String(this.model.month).padStart(2,'0')}-${String(this.model.day).padStart(2,'0')}`;
    this.amount.includes(',') ? this.addBulkEntry(dateStr) : this.addSingleEntry(dateStr);
  }

  private addSingleEntry(dateStr: string): void {
    const party = this.commissionType === 'Cash' ? 'Cash' : (this.addParty ? this.partyName : this.selectedParty);
    const data: PostEntryModel = {
      amount: parseFloat(this.amount),
      date: `${dateStr}T00:00:00.000Z`,
      type: this.commissionType,
      partyName: party
    };

    this.entryService.postEntry(data).subscribe({
      next: () => { this.resetForm(); if (this.addParty) this.loadParties(); },
      error: err => console.error('Error adding entry:', err)
    });
  }

  private addBulkEntry(dateStr: string): void {
    const bulk = {
      date: dateStr,
      cash: this.commissionType === 'Cash' ? this.amount : '',
      wholesale: this.commissionType === 'Wholesale' ? this.amount : ''
    };

    this.entryService.bulkEntry(bulk).subscribe({
      next: () => this.resetForm(),
      error: err => console.error('Error adding bulk entries:', err)
    });
  }

  resetForm(): void {
    this.amount = '';
    this.model  = this.calendar.getToday();
    this.commissionType = 'Wholesale';
    this.partyName = '';
    this.selectedParty = '';
    this.addParty = false;
    this.isDropdownOpen = false;
  }
}
