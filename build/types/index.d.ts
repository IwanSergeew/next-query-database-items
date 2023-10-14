import { MySQL } from '@IwanSergeew/node-mysql';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';

interface QueryDatabaseItemsConfig$1 {
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
declare const _default$1: ({ db, url, table, columns, searchParams, config }: Props) => Promise<{
    rows: any[];
    columns: string[];
    queryProps: QueryDatabaseItemsProps;
    tableConfig: QueryDatabaseItemsConfig$1;
    maxPages: any;
}>;

type UpdateQueryProps = {
    router: AppRouterInstance;
    pathname: string;
    tableConfig: QueryDatabaseItemsConfig;
    queryProps: QueryDatabaseItemsProps;
};
declare const _default: ({ router, pathname, tableConfig, queryProps }: UpdateQueryProps) => void;

export { QryProps, QueryDatabaseItemsConfig, QueryDatabaseItemsProps, _default as clientUpdateQuery, _default$1 as default };
