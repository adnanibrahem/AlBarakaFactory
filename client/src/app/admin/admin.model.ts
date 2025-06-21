/* eslint-disable @typescript-eslint/no-explicit-any */

export interface PaginationData<T> {
  count: number;
  totalQuantity: number;
  next: string;
  previous: string;
  results: T[];
}

export class CommercialYear {
  id!: number;
  title!: string;
}
