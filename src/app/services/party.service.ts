import { Injectable } from '@angular/core';
import { HttpService } from './http.service';
import { Observable } from 'rxjs';
import { PartyModel } from './models';

@Injectable({
  providedIn: 'root'
})
export class PartyService {

  constructor(private readonly httpService: HttpService) { }

  getParties(): Observable<PartyModel[]> {
    return this.httpService.getApi('/api/entries/parties');
  }

  deleteParty(partyId: string): Observable<any> {
    return this.httpService.deleteApi(`/api/entries/parties/${partyId}`);
  }
}
