import { Injectable } from '@angular/core';
import { HttpService } from './http.service';
import { Observable, throwError } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import {
  PostEntryModel,
  EntryModel,
  DayEntriesResponse,
  MonthEntriesResponse,
  OverallEntriesResponse,
  EntrySummary,
} from './models';

@Injectable({
  providedIn: 'root',
})
export class EntryService {
  constructor(private readonly httpService: HttpService) {}

  // Helper method to calculate totals from entry array
  private calculateTotals(entries: EntryModel[]): EntrySummary {
    const totalCash = entries
      .filter((entry) => entry.type === 'Cash')
      .reduce((sum, entry) => sum + entry.amount, 0);

    const totalWholesale = entries
      .filter((entry) => entry.type === 'Wholesale')
      .reduce((sum, entry) => sum + entry.amount, 0);

    return {
      totalCash,
      totalWholesale,
      totalEntries: entries.length,
      entries,
    };
  }

  // Helper method to get date range from entries
  private getDateRange(
    entries: EntryModel[]
  ): { from: string; to: string } | undefined {
    if (entries.length === 0) return undefined;

    const dates = entries
      .map((entry) => new Date(entry.date))
      .sort((a, b) => a.getTime() - b.getTime());
    return {
      from: dates[0].toISOString().split('T')[0],
      to: dates[dates.length - 1].toISOString().split('T')[0],
    };
  }

  // POST method (existing)
  postEntry(entryData: PostEntryModel): Observable<any> {
    return this.httpService.postApi('/api/entries/', entryData).pipe(
      tap((response) => console.log('Entry posted successfully:', response)),
      catchError((error) => {
        console.error('Error posting entry:', error);
        return throwError(() => error);
      })
    );
  }

  // GET methods with calculation
  getDayEntries(date: string): Observable<DayEntriesResponse> {
    return this.httpService.getApi(`/api/entries/day?date=${date}`).pipe(
      map((entries: EntryModel[]) => {
        const totals = this.calculateTotals(entries);
        return {
          ...totals,
          date,
        };
      }),
      tap((response) => console.log('Day entries calculated:', response)),
      catchError((error) => {
        console.error('Error fetching day entries:', error);
        return throwError(() => error);
      })
    );
  }

  getMonthEntries(
    month: number,
    year: number
  ): Observable<MonthEntriesResponse> {
    return this.httpService
      .getApi(`/api/entries/month?month=${month}&year=${year}`)
      .pipe(
        map((entries: EntryModel[]) => {
          const totals = this.calculateTotals(entries);
          return {
            ...totals,
            month,
            year,
          };
        }),
        tap((response) => console.log('Month entries calculated:', response)),
        catchError((error) => {
          console.error('Error fetching month entries:', error);
          return throwError(() => error);
        })
      );
  }

  getOverallEntries(): Observable<OverallEntriesResponse> {
    return this.httpService.getApi('/api/entries/overall').pipe(
      map((entries: EntryModel[]) => {
        const totals = this.calculateTotals(entries);
        const dateRange = this.getDateRange(entries);
        return {
          ...totals,
          dateRange,
        };
      }),
      tap((response) => console.log('Overall entries calculated:', response)),
      catchError((error) => {
        console.error('Error fetching overall entries:', error);
        return throwError(() => error);
      })
    );
  }

  // Additional methods for other API endpoints
  getPartyNames(): Observable<string[]> {
    return this.httpService.getApi('/api/entries/parties').pipe(
      tap((response) => console.log('Party names response:', response)),
      catchError((error) => {
        console.error('Error fetching party names:', error);
        return throwError(() => error);
      })
    );
  }

  bulkEntry(entryData: {
    date: string;
    cash: string;
    wholesale: string;
  }): Observable<any> {
    return this.httpService.postApi('/api/entries/bulk-simple', entryData).pipe(
      tap((response) => console.log('Bulk entry response:', response)),
      catchError((error) => {
        console.error('Error posting bulk entry:', error);
        return throwError(() => error);
      })
    );
  }
  
  // PUT method - Update entry
updateEntry(entryId: string, entryData: PostEntryModel): Observable<any> {
  return this.httpService.putApi(`/api/entries/${entryId}`, entryData).pipe(
    tap((response) => console.log('Entry updated successfully:', response)),
    catchError((error) => {
      console.error('Error updating entry:', error);
      return throwError(() => error);
    })
  );
}

// DELETE method - Delete entry
deleteEntry(entryId: string): Observable<any> {
  return this.httpService.deleteApi(`/api/entries/${entryId}`).pipe(
    tap((response) => console.log('Entry deleted successfully:', response)),
    catchError((error) => {
      console.error('Error deleting entry:', error);
      return throwError(() => error);
    })
  );
}


}
