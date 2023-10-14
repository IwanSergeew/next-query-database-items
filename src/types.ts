export interface DataTableConfig {
  enableSearch: boolean;
  perPage: number;
  perPageOptions: number[];
}

export interface DataBaseTableQueryProps {
  page: number;
  perPage: number;
  search: string;
  filters: Record<string, string[]>;
}

export interface QryProps {
  where: string[];
  items: any[];
}
