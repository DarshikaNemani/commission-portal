export interface DateModel {
  year: number;
  month: number;
  day: number;
}

export interface PostEntryModel {
  amount: number;
  date: string;
  type: 'Cash' | 'Wholesale';
  partyName: string;
}

export interface EntryModel {
  _id: string;
  amount: number;
  date: string;
  type: 'Cash' | 'Wholesale';
  partyName: string;
  __v: number;
}

export interface EntrySummary {
  totalCash: number;
  totalWholesale: number;
  totalEntries: number;
  entries?: EntryModel[];
}

export interface DayEntriesResponse extends EntrySummary {
  date: string;
}

export interface MonthEntriesResponse extends EntrySummary {
  month: number;
  year: number;
}

export interface OverallEntriesResponse extends EntrySummary {
  dateRange?: {
    from: string;
    to: string;
  };
}

export interface PostAbsentModel {
  name: string;
  date: string;
}

