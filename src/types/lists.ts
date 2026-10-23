/** One page of a server-paginated list. */
export interface PageInfo {
  /** From 1 (`?page=`). */
  number: number;
  size: number;
  totalEntries: number;
}

/** How a server-sorted list is ordered; the page links each column to the URL that re-sorts it. */
export interface SortState {
  key: string;
  direction: "asc" | "desc";
}
