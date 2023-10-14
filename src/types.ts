export interface QueryDatabaseItemsConfig {
  enableSearch: boolean;
  perPage: number;
  perPageOptions: number[];
}

export interface QueryDatabaseItemsProps {
  page: number;
  perPage: number;
  search: string;
  filters: Record<string, string[]>;
}

export interface QryProps {
  where: string[];
  items: any[];
}
