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

  constructor(private readonly httpService: HttpService) { }

  adminLogin(password: string): Observable<any> {
    return this.httpService.postApi('/api/admin/login', { password }).pipe(
      tap((response) => {
        console.log('Admin login successful:', response);
        this.isLoggedInSubject.next(true);
      })
    );
  }

  logout() {
    this.isLoggedInSubject.next(false);
  }

  get isLoggedIn(): boolean {
    return this.isLoggedInSubject.value;
  }
}
