function DatabaseRowHeader() {
  return (
    <tr className="bg-white">
        <th className="px-6 py-2 text-left rounded-l-lg w-2/12">Database Name</th>
        <th className="text-left w-2/12">Database Type</th>
        <th className="text-left w-2/12">Environment</th>
        <th className="text-left w-1/12 hidden md:table-cell">Status</th>
        <th className="text-left w-3/12 hidden md:table-cell">Last Backup Time</th>
        <th className="text-right w-2/12 px-6 rounded-r-lg">Actions</th>
    </tr>
  );
}

export default DatabaseRowHeader