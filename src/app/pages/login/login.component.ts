import { Component } from '@angular/core';
import { NavbarComponent } from "../../components/navbar/navbar.component";
import { FooterComponent } from "../../components/footer/footer.component";
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../services/admin.service';

@Component({
  selector: 'app-login',
  imports: [NavbarComponent, FooterComponent, FormsModule],
  standalone: true,
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  password: string = '';

  constructor(private readonly adminService: AdminService) {}

  adminLogin() {
    if (!this.password) {
      console.error('Please enter password');
      return;
    }

    this.adminService.adminLogin(this.password).subscribe({
      next: (response) => {
        console.log('Login successful:', response);
        this.password = '';
      },
      error: (error) => {
        console.error('Login failed:', error);
      }
    });
  }
}
