import { Injectable } from '@angular/core';
import { HttpService } from './http.service';
import { Observable } from 'rxjs';
import { PostAbsentModel } from './models';

@Injectable({
  providedIn: 'root'
})
export class AbsentService {

  constructor(private readonly httpService: HttpService) { }

  postAbsent(absentData: PostAbsentModel): Observable<any> {
    return this.httpService.postApi('/api/entries/absents', absentData);
  }

  getAbsents(): Observable<any> {
    return this.httpService.getApi('/api/entries/absents');
  }
}
