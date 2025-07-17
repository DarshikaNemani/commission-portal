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
