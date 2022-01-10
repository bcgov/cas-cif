import React from "react";

interface Column {
  title: string;
}

interface Props {
  columns: Column[];
  emptyStateContents?: React.ReactElement;
}

const Table: React.FC<Props> = ({
  columns,
  children,
  emptyStateContents = <span className="no-results">No results found.</span>,
}) => {
  const rows = React.Children.toArray(children);

  return (
    <table className="bc-table">
      {/* class name is used to increase specificity of CSS selectors and override defaults */}
      <thead>
        <tr>
          {columns.map((c) => (
            <th key={c.title}>{c.title}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.length > 0 ? (
          rows
        ) : (
          <tr>
            <td colSpan={columns.length}>{emptyStateContents}</td>
          </tr>
        )}
      </tbody>
      <style jsx>{`
        table.bc-table {
          margin-top: 1rem;
          border-collapse: separate;
          border-spacing: 0;
        }

        table.bc-table th {
          background-color: #003366;
          color: white;
          text-align: left;
          padding: 0.5rem;
          height: 4rem;
        }

        th:not(last-child) {
          border-right: 1px solid #ccc;
        }

        th:first-child {
          border-top-left-radius: 0.25rem;
          border-left: 1px solid #003366;
          border-top: 1px solid #003366;
        }

        th:last-child {
          border-top-right-radius: 0.25rem;
          border-right: 1px solid #003366;
          border-top: 1px solid #003366;
        }

        :global(tr:nth-child(even)) {
          background-color: #f5f5f5;
        }

        :global(tr:nth-child(odd)) {
          background-color: white;
        }

        :global(table.bc-table td) {
          border-right: 1px solid #939393;
          border-bottom: 1px solid #939393;
          text-align: left;
          padding: 0.5rem;
        }

        :global(td:first-child) {
          border-left: 1px solid #939393;
        }

        :global(.no-results) {
          width: 100%;
          display: inline-block;
          text-align: center;
          font-style: italic;
        }
      `}</style>
    </table>
  );
};

export default Table;
