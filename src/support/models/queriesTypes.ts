import { IRecordSet } from "mssql";

export type DBQuery = { rows: IRecordSet<unknown>; rowsAffected: number[] };

export type FilterValue =
  | string
  | number
  | null
  | {
      operator: "=" | "LIKE" | ">" | "<" | "<=" | ">=" | "!=" | "NOT IN" | "IN";
      value: string | number | null;
    };

export type SelectQuery = {
  table: string;
  getField: string;
  top?: number;
  filterField?: string;
  filterValue?: FilterValue;
  additionalFilters?: { [key: string]: FilterValue };
  orderBy?: { column: string; direction: "ASC" | "DESC" }[];
};

export type InsertQuery = {
  table: string;
  values: { [key: string]: string | number | { raw: string } | null | Buffer };
};

export type UpdateQuery = {
  table: string;
  setValues: { [key: string]: string | number | { raw: string } | null };
  filterField?: string;
  filterValue?: FilterValue;
  additionalFilters?: { [key: string]: FilterValue };
};

export type DeleteQuery = {
  table: string;
  filterField: string;
  filterValue: FilterValue;
  additionalFilters?: { [key: string]: FilterValue };
};
