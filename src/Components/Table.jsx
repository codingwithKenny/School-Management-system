const Table = ({ column, renderRow, data }) => {
  return (
    <div className="overflow-x-auto mt-10">
      <table className="min-w-[80%] mx-auto border border-gray-200 shadow-md rounded-lg">
        <thead>
          <tr className="bg-gray-100 text-gray-700 text-sm font-semibold">
            {column.map((col) => (
              <th key={col.accessor} className={`p-3 text-left border-b ${col.className || ""}`}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{data.map(renderRow)}</tbody>
      </table>
    </div>
  );
};

export default Table;
