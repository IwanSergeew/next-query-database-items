import { MySQL } from '@IwanSergeew/node-mysql';

interface DataTableConfig {
    enableSearch: boolean;
    perPage: number;
    perPageOptions: number[];
}

interface QueryDatabaseItemsConfig {
    enableSearch: boolean;
    perPage: number;
    perPageOptions: number[];
}
interface QueryDatabaseItemsProps {
    page: number;
    perPage: number;
    search: string;
    filters: Record<string, string[]>;
}
interface QryProps {
    where: string[];
    items: any[];
}

type Props = {
    db: MySQL;
    url: string;
    table: string;
    columns: string[];
    searchParams: Record<string, string | string[]>;
    config?: Partial<QueryDatabaseItemsConfig>;
};
declare const _default: ({ db, url, table, columns, searchParams, config }: Props) => Promise<{
    rows: any[];
    columns: string[];
    queryProps: QueryDatabaseItemsProps;
    tableConfig: DataTableConfig;
    maxPages: any;
}>;

export { QryProps, QueryDatabaseItemsConfig, QueryDatabaseItemsProps, _default as default };
