export default function RegionTable() {
  const regions = [
    { name: "Delhi", plants: 12, energy: "8.2 MWh", admins: 2 },
    { name: "Patna", plants: 7, energy: "4.9 MWh", admins: 1 },
    { name: "Mumbai", plants: 15, energy: "11.3 MWh", admins: 3 },
  ];

  return (
    <div className="bg-white dark:bg-solar-bgActive border border-solar-borderLight dark:border-solar-bgActive rounded-xl p-5">
      <h3 className="font-semibold mb-4 text-solar-textPrimaryLight dark:text-solar-textPrimaryDark">Regions Overview</h3>

      <table className="w-full text-sm">
        <thead>
          <tr className="text-solar-textSecondaryLight dark:text-solar-textSecondaryDark border-b border-solar-gold">
            <th className="text-left py-2">Region</th>
            <th>Plants</th>
            <th>Energy</th>
            <th>Admins</th>
          </tr>
        </thead>

        <tbody>
          {regions.map(r => (
            <tr key={r.name} className="border-b border-solar-gold last:border-none">
              <td className="py-3 text-solar-textPrimaryLight dark:text-solar-textPrimaryDark">{r.name}</td>
              <td className="text-center text-solar-textPrimaryLight dark:text-solar-textPrimaryDark">{r.plants}</td>
              <td className="text-center text-solar-textPrimaryLight dark:text-solar-textPrimaryDark">{r.energy}</td>
              <td className="text-center text-solar-textPrimaryLight dark:text-solar-textPrimaryDark">{r.admins}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}