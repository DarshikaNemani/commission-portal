import { Injectable } from '@angular/core';
import { HttpService } from './http.service';
import { Observable } from 'rxjs';
import { PostEntryModel } from './models';

@Injectable({
  providedIn: 'root'
})
export class EntryService {

  constructor(private readonly httpService: HttpService) { }

  postEntry(entryData: PostEntryModel): Observable<any> {
    return this.httpService.postApi('/api/entries/', entryData);
  }
}
