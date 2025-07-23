import { Injectable } from '@angular/core';
import { HttpService } from './http.service';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  
  private isLoggedInSubject = new BehaviorSubject<boolean>(false);
  public isLoggedIn$ = this.isLoggedInSubject.asObservable();

  constructor(private readonly httpService: HttpService) { 
    this.checkLoginStatus();
  }

  checkLoginStatus() {
    const loginData = sessionStorage.getItem('adminLogin');
    if (loginData) {
      const { timestamp } = JSON.parse(loginData);
      const now = new Date().getTime();
      const twentyFourHours = 24 * 60 * 60 * 1000;
      
      if (now - timestamp < twentyFourHours) {
        this.isLoggedInSubject.next(true);
      } else {
        sessionStorage.removeItem('adminLogin');
      }
    }
  }

  adminLogin(password: string): Observable<any> {
    return this.httpService.postApi('/api/admin/login', { password }).pipe(
      tap((response) => {
        
        // Save to session storage with timestamp
        const loginData = {
          isLoggedIn: true,
          timestamp: new Date().getTime()
        };
        sessionStorage.setItem('adminLogin', JSON.stringify(loginData));
        
        this.isLoggedInSubject.next(true);
      })
    );
  }

  logout() {
    sessionStorage.removeItem('adminLogin');
    this.isLoggedInSubject.next(false);
  }

  get isLoggedIn(): boolean {
    return this.isLoggedInSubject.value;
  }
}
