function DatabaseRowHeader() {
  return (
    <tr className="bg-white">
        <th className="px-6 py-2 text-left rounded-l-lg">Database Name</th>
        <th className="text-left">Database Type</th>
        <th className="text-left">Environment</th>
        <th className="text-left">Status</th>
        <th className="text-left">Last Backup Time</th>
        <th className="text-right px-6 rounded-r-lg">Actions</th>
    </tr>
  );
}

export default DatabaseRowHeader