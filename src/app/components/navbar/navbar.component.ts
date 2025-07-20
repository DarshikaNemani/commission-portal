import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AdminService } from '../../services/admin.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit {
  isAdminLoggedIn: boolean = false;

  constructor(private readonly adminService: AdminService) {}

  ngOnInit() {
    this.adminService.isLoggedIn$.subscribe(isLoggedIn => {
      this.isAdminLoggedIn = isLoggedIn;
    });
  }

  logout() {
    this.adminService.logout();
  }
}
