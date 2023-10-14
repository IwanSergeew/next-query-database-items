import { MySQL } from '@IwanSergeew/node-mysql';

interface DataTableConfig {
    enableSearch: boolean;
    perPage: number;
    perPageOptions: number[];
}
interface DataBaseTableQueryProps {
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
    config?: Partial<DataTableConfig>;
};
declare const _default: ({ db, url, table, columns, searchParams, config }: Props) => Promise<{
    rows: any[];
    columns: string[];
    queryProps: DataBaseTableQueryProps;
    tableConfig: DataTableConfig;
    maxPages: any;
}>;

export { DataBaseTableQueryProps, DataTableConfig, QryProps, _default as default };
