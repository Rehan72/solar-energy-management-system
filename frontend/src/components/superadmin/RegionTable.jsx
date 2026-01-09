import { useState, useEffect } from 'react'
import { getRequest } from '../../lib/apiService'

export default function RegionTable() {
  const [regions, setRegions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRegions = async () => {
      try {
        setLoading(true)
        const response = await getRequest('/superadmin/regions')
        const regionsData = response.data || response || []
        setRegions(regionsData)
      } catch (error) {
        console.error('Failed to fetch regions:', error)
        // Fallback to demo data
        setRegions([
          { name: "Delhi", state: "Delhi", expected_plants: 5, capacity_mw: 500 },
          { name: "Patna", state: "Bihar", expected_plants: 3, capacity_mw: 300 },
          { name: "Mumbai", state: "Maharashtra", expected_plants: 8, capacity_mw: 800 },
        ])
      } finally {
        setLoading(false)
      }
    }
    fetchRegions()
  }, [])

  // Calculate totals
  const totalPlants = regions.reduce((sum, r) => sum + (r.expected_plants || 0), 0)
  const totalCapacity = regions.reduce((sum, r) => sum + (r.capacity_mw || 0), 0)
  const totalAdmins = regions.length // Assume 1 admin per region for now

  return (
    <div className="bg-white dark:bg-solar-bgActive border border-solar-borderLight dark:border-solar-bgActive rounded-xl p-5">
      <h3 className="font-semibold mb-4 text-solar-textPrimaryLight dark:text-solar-textPrimaryDark">Regions Overview</h3>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-solar-yellow border-t-transparent"></div>
        </div>
      ) : (
        <>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-solar-textSecondaryLight dark:text-solar-textSecondaryDark border-b border-solar-gold">
                <th className="text-left py-2">Region</th>
                <th>Plants</th>
                <th>Capacity (MW)</th>
                <th>Admins</th>
              </tr>
            </thead>

            <tbody>
              {regions.map((r, index) => (
                <tr key={r.id || index} className="border-b border-solar-gold last:border-none">
                  <td className="py-3 text-solar-textPrimaryLight dark:text-solar-textPrimaryDark">
                    {r.name} - {r.state}
                  </td>
                  <td className="text-center text-solar-textPrimaryLight dark:text-solar-textPrimaryDark">
                    {r.expected_plants || 0}
                  </td>
                  <td className="text-center text-solar-textPrimaryLight dark:text-solar-textPrimaryDark">
                    {r.capacity_mw || 0}
                  </td>
                  <td className="text-center text-solar-textPrimaryLight dark:text-solar-textPrimaryDark">
                    1
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Summary Row */}
          <div className="mt-4 pt-4 border-t border-solar-gold">
            <div className="flex justify-between font-semibold">
              <span className="text-solar-textPrimaryLight dark:text-solar-textPrimaryDark">Total</span>
              <span className="text-solar-textPrimaryLight dark:text-solar-textPrimaryDark">{totalPlants}</span>
              <span className="text-solar-textPrimaryLight dark:text-solar-textPrimaryDark">{totalCapacity} MW</span>
              <span className="text-solar-textPrimaryLight dark:text-solar-textPrimaryDark">{totalAdmins}</span>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
