interface Column {
  title: string;
}

interface Props {
  columns: Column[];
}

const Table: React.FC<Props> = ({ columns, children }) => {
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
      <tbody>{children}</tbody>
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

        :global(table.bc-table td) {
          border-right: 1px solid #939393;
          border-bottom: 1px solid #939393;
          text-align: left;
          padding: 0.5rem;
        }

        :global(td:first-child) {
          border-left: 1px solid #939393;
        }
      `}</style>
    </table>
  );
};

export default Table;
