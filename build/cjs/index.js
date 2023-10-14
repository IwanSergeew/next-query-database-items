'use strict';

var navigation = require('next/navigation');
var nodeMysql = require('@IwanSergeew/node-mysql');
var cache = require('memory-cache');

const parseSearchParams = (param) => {
    if (!param?.length)
        return [];
    return Array.isArray(param) ? param : [param];
};
const parseSearchParam = (param) => {
    if (!param?.length)
        return '';
    return Array.isArray(param) ? param.at(0) : param;
};
const getSearchQryProps = (columns, search) => {
    if (!columns.length || !search.length)
        return { where: [], items: [] };
    return {
        where: columns.map((column) => `${column} LIKE ?`),
        items: Array(columns.length).fill(`%${search}%`),
    };
};
const getFilterQryProps = (filters) => {
    const where = [];
    const items = [];
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
const getMaxPages = async (db, table, perPage, searchQryProps, filterQryProps) => {
    const qry = nodeMysql.QryBuilder.select('COUNT(*) AS number_of_rows')
        .from(table)
        .where(...(searchQryProps.where.length ? [`(${searchQryProps.where.join(` OR `)})`] : []), ...filterQryProps.where)
        .setItemValues(...searchQryProps.items, ...filterQryProps.items)
        .export();
    const cachedData = cache.get(qry);
    if (cachedData !== null)
        return cachedData;
    const { rows } = await db.select(qry);
    const row = rows.shift();
    const itemsCount = (row && row['number_of_rows']) ?? 0;
    if (!itemsCount)
        return cache.put(qry, 0);
    const pages = Math.floor(itemsCount / perPage);
    return cache.put(qry, !pages || itemsCount % (pages * perPage) > 0 ? pages + 1 : pages);
};
const getItems = async (db, table, columns, page, perPage, searchQryProps, filterQryProps) => {
    const qry = nodeMysql.QryBuilder.select(...(columns.length > 0 ? columns : ['*']))
        .from(table)
        .limit(perPage)
        .startItem(page * perPage)
        .where(...(searchQryProps.where.length ? [`(${searchQryProps.where.join(` OR `)})`] : []), ...filterQryProps.where)
        .setItemValues(...searchQryProps.items, ...filterQryProps.items)
        .export();
    const { rows, fields } = await db.select(qry);
    return { rows: rows, fields: fields.map((field) => field.name) };
};
const getConfig = (config) => ({
    enableSearch: config?.enableSearch ?? true,
    perPage: config?.perPage ?? 5,
    perPageOptions: config?.perPageOptions ?? [2, 5, 10, 15, 20, 25],
});
const parseFilters = (columns, searchParams) => {
    const filters = {};
    for (const column of columns) {
        if (searchParams[`filter-${column}`]) {
            filters[column] = parseSearchParams(searchParams[`filter-${column}`]);
        }
    }
    return filters;
};

var QueryDatabaseItems = async ({ db, url, table, columns, searchParams, config }) => {
    const tableConfig = getConfig(config ?? {});
    const queryProps = {
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
        const params = { page: `${queryProps.page + 1}` };
        if (queryProps.perPage !== tableConfig.perPage)
            params.perPage = queryProps.perPage.toString();
        if (queryProps.search.length)
            params.search = queryProps.search;
        navigation.redirect(`${url}?${new URLSearchParams(params)}`);
    }
    const { rows, fields } = await getItems(db, table, columns, queryProps.page, queryProps.perPage, searchQryProps, filterQryProps);
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

module.exports = QueryDatabaseItems;
