import { MySQL, QryBuilder } from '@IwanSergeew/node-mysql';
import { QryProps, DataTableConfig } from './types';
import cache from 'memory-cache';

export const parseSearchParams = (param: string | string[]) => {
  if (!param?.length) return [];
  return Array.isArray(param) ? param : [param];
};

export const parseSearchParam = (param: string | string[]) => {
  if (!param?.length) return '';
  return Array.isArray(param) ? param.at(0) : param;
};

export const getSearchQryProps = (columns: string[], search: string) => {
  if (!columns.length || !search.length) return { where: [], items: [] };
  return {
    where: columns.map((column) => `${column} LIKE ?`),
    items: Array(columns.length).fill(`%${search}%`),
  };
};

export const getFilterQryProps = (filters: Record<string, string[]>) => {
  const where: string[] = [];
  const items: any[] = [];
  const filterKeys = Object.keys(filters);

  for (const filter of filterKeys) {
    where.push(`(${Array(filters[filter].length).fill(`${filter} = ?`).join(` OR `)})`);
    items.push(...filters[filter]);
  }

  return {
    where: where,
    items: items,
  };
};

export const getMaxPages = async (
  db: MySQL,
  table: string,
  perPage: number,
  searchQryProps: QryProps,
  filterQryProps: QryProps,
) => {
  const qry = QryBuilder.select('COUNT(*) AS number_of_rows')
    .from(table)
    .where(...(searchQryProps.where.length ? [`(${searchQryProps.where.join(` OR `)})`] : []), ...filterQryProps.where)
    .setItemValues(...searchQryProps.items, ...filterQryProps.items)
    .export();

  const cachedData = cache.get(qry);
  if (cachedData !== null) return cachedData;

  const { rows } = await db.select(qry);

  const row = rows.shift();
  const itemsCount = (row && row['number_of_rows']) ?? 0;
  if (!itemsCount) return cache.put(qry, 0);

  const pages = Math.floor(itemsCount / perPage);
  return cache.put(qry, !pages || itemsCount % (pages * perPage) > 0 ? pages + 1 : pages);
};

export const getItems = async (
  db: MySQL,
  table: string,
  columns: string[],
  page: number,
  perPage: number,
  searchQryProps: QryProps,
  filterQryProps: QryProps,
): Promise<{
  rows: any[];
  fields: any;
}> => {
  const qry = QryBuilder.select(...(columns.length > 0 ? columns : ['*']))
    .from(table)
    .limit(perPage)
    .startItem(page * perPage)
    .where(...(searchQryProps.where.length ? [`(${searchQryProps.where.join(` OR `)})`] : []), ...filterQryProps.where)
    .setItemValues(...searchQryProps.items, ...filterQryProps.items)
    .export();

  const { rows, fields } = await db.select(qry);

  return { rows: rows, fields: fields.map((field: any) => field.name) };
};

export const getConfig = (config: Partial<DataTableConfig>): DataTableConfig => ({
  enableSearch: config?.enableSearch ?? true,
  perPage: config?.perPage ?? 5,
  perPageOptions: config?.perPageOptions ?? [2, 5, 10, 15, 20, 25],
});

export const parseFilters = (columns: string[], searchParams: Record<string, string | string[]>) => {
  const filters: Record<string, string[]> = {};
  for (const column of columns) {
    if (searchParams[`filter-${column}`]) {
      filters[column] = parseSearchParams(searchParams[`filter-${column}`]);
    }
  }
  return filters;
};
