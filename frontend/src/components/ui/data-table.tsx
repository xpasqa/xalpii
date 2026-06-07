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
    <div className="w-full overflow-hidden rounded-travel-lg border border-[#2B2B2B]/15 bg-white">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[920px] divide-y divide-[#2B2B2B]/10 text-sm">
          <thead className="bg-[#F8F9FB]">
            <tr>
              {columns.map((column) => (
                <th
                  className={
                    column.align === "right"
                      ? "px-4 py-3 text-right font-interface font-semibold text-muted"
                      : "px-4 py-3 text-left font-interface font-semibold text-muted"
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
              <tr className="hover:bg-[#F8F9FB]" key={getRowKey(row)}>
                {columns.map((column) => (
                  <td
                    className={
                      column.align === "right"
                        ? "whitespace-nowrap px-4 py-4 text-right font-interface text-ink"
                        : "whitespace-nowrap px-4 py-4 font-interface text-ink"
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
