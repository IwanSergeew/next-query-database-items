import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { QueryDatabaseItemsConfig, QueryDatabaseItemsProps } from './types';
import { parseSearchParams } from './util';

type UpdateQueryProps = {
  router: AppRouterInstance;
  pathname: string;
  tableConfig: QueryDatabaseItemsConfig;
  queryProps: QueryDatabaseItemsProps;
};
export default ({ router, pathname, tableConfig, queryProps }: UpdateQueryProps) => {
  const params: [string, string][] = [];

  params.push(['page', `${queryProps.page + 1}`]);

  if (queryProps.perPage !== tableConfig.perPage) params.push(['perPage', queryProps.perPage.toString()]);
  if (queryProps.search.length) params.push(['search', queryProps.search]);

  const filterKeys = Object.keys(queryProps.filters);
  for (const filter of filterKeys) {
    params.push(
      ...parseSearchParams(queryProps.filters[filter]).map((fData): [string, string] => [`filter-${filter}`, fData]),
    );
  }
  router.push(`${pathname}?${new URLSearchParams(params)}`);
};
