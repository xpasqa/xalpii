import type { ReactNode } from "react";

export type DataTableColumn<TRow> = {
  key: string;
  header: string;
  cell: (row: TRow) => ReactNode;
  align?: "left" | "right";
};

type DataTableProps<TRow> = {
  columns: Array<DataTableColumn<TRow>>;
  rows: TRow[];
  getRowKey: (row: TRow) => string;
};

export function DataTable<TRow>({ columns, rows, getRowKey }: DataTableProps<TRow>) {
  return (
    <div className="max-w-full overflow-hidden rounded-lg border border-border bg-white">
      <div className="overflow-x-auto">
        <table className="min-w-[720px] divide-y divide-border text-sm">
          <thead className="bg-slate-50">
            <tr>
              {columns.map((column) => (
                <th
                  className={
                    column.align === "right"
                      ? "px-4 py-3 text-right font-semibold text-muted"
                      : "px-4 py-3 text-left font-semibold text-muted"
                  }
                  key={column.key}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((row) => (
              <tr className="hover:bg-slate-50" key={getRowKey(row)}>
                {columns.map((column) => (
                  <td
                    className={
                      column.align === "right"
                        ? "whitespace-nowrap px-4 py-4 text-right text-ink"
                        : "whitespace-nowrap px-4 py-4 text-ink"
                    }
                    key={column.key}
                  >
                    {column.cell(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
