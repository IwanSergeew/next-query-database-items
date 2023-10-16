import { MySQL } from '@IwanSergeew/node-mysql';
import { redirect } from 'next/navigation';
import {
  getConfig,
  getFilterQryProps,
  getItems,
  getMaxPages,
  getSearchQryProps,
  parseFilters,
  parseSearchParam,
} from './util';
import { QueryDatabaseItemsConfig, QueryDatabaseItemsProps } from './types';

type Props = {
  db: MySQL;
  url: string;
  table: string;
  columns: string[];
  searchParams: Record<string, string | string[]>;
  config?: Partial<QueryDatabaseItemsConfig>;
};
export default async ({ db, url, table, columns, searchParams, config }: Props) => {
  const tableConfig = getConfig(config ?? {});

  const queryProps: QueryDatabaseItemsProps = {
    page: searchParams.page ? Number(searchParams.page) - 1 : 0,
    perPage: Number(searchParams.perPage) || tableConfig.perPage,
    search: (tableConfig.enableSearch && parseSearchParam(searchParams.search)) || '',
    filters: parseFilters(columns, searchParams),
  };

  const searchQryProps = getSearchQryProps(columns, queryProps.search);
  const filterQryProps = getFilterQryProps(queryProps.filters);

  const maxPages = await getMaxPages(db, table, queryProps.perPage, searchQryProps, filterQryProps);
  if (queryProps.page > maxPages) {
    queryProps.page = 0;

    const params: Record<string, string> = { page: `${queryProps.page + 1}` };

    if (queryProps.perPage !== tableConfig.perPage) params.perPage = queryProps.perPage.toString();
    if (queryProps.search.length) params.search = queryProps.search;

    redirect(`${url}?${new URLSearchParams(params)}`);
  }

  const { rows, fields } = await getItems(
    db,
    table,
    columns,
    queryProps.page,
    queryProps.perPage,
    searchQryProps,
    filterQryProps,
  );
  if (!columns.length) {
    columns = fields;
  }

  return {
    rows,
    columns,
    queryProps,
    tableConfig,
    maxPages,
  };
};
