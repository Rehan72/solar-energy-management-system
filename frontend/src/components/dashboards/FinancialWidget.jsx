import { motion } from 'framer-motion'
import { IndianRupee, TrendingUp, PiggyBank, Calendar } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

function FinancialWidget({ data }) {
    if (!data) return null;

    const { total_savings, roi_percentage, project_cost, payback_progress } = data;

    // Format currency
    const formatCurrency = (value) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(value);
    };

    // Sample historical data for the mini chart
    const mockChartData = [
        { month: 'Jan', savings: total_savings * 0.1 },
        { month: 'Feb', savings: total_savings * 0.25 },
        { month: 'Mar', savings: total_savings * 0.45 },
        { month: 'Apr', savings: total_savings * 0.65 },
        { month: 'May', savings: total_savings * 0.85 },
        { month: 'Jun', savings: total_savings },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-solar-card/80 backdrop-blur-md rounded-2xl shadow-lg border border-solar-border p-6 relative overflow-hidden group"
        >
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-solar-success/10 rounded-full blur-3xl -mr-16 -mt-16 transition-all duration-500 group-hover:bg-solar-success/20"></div>

            <div className="flex justify-between items-start mb-6 relative z-10">
                <div>
                    <h3 className="text-solar-muted font-medium flex items-center gap-2">
                        <PiggyBank className="w-5 h-5 text-solar-success" />
                        Financial Savings
                    </h3>
                    <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-solar-primary dark:text-white">
                            {formatCurrency(total_savings)}
                        </span>
                        <span className="text-sm font-medium text-solar-success bg-solar-success/10 px-2 py-0.5 rounded-full">
                            +12% vs last month
                        </span>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-sm text-solar-muted">Project ROI</p>
                    <p className="text-2xl font-bold text-solar-yellow">{roi_percentage.toFixed(1)}%</p>
                </div>
            </div>

            {/* Progress Bar for Payback */}
            <div className="mb-6 relative z-10">
                <div className="flex justify-between text-sm mb-2">
                    <span className="text-solar-muted">Payback Progress</span>
                    <span className="text-solar-primary font-medium">{payback_progress.toFixed(1)}%</span>
                </div>
                <div className="h-3 bg-solar-dark/50 rounded-full overflow-hidden border border-solar-border/30">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${payback_progress}%` }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className="h-full bg-gradient-to-r from-solar-yellow via-solar-orange to-solar-success rounded-full"
                    />
                </div>
                <div className="flex justify-between text-xs mt-1 text-solar-muted">
                    <span>Inv: {formatCurrency(project_cost)}</span>
                    <span>Target: {formatCurrency(project_cost)}</span>
                </div>
            </div>

            {/* Mini Chart Area */}
            <div className="h-24 w-full relative z-10">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={mockChartData}>
                        <defs>
                            <linearGradient id="colorSavings" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <Tooltip
                            contentStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.8)', border: 'none', borderRadius: '8px', color: '#fff' }}
                            itemStyle={{ color: '#10B981' }}
                        />
                        <Area
                            type="monotone"
                            dataKey="savings"
                            stroke="#10B981"
                            strokeWidth={2}
                            fill="url(#colorSavings)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            <div className="mt-4 pt-4 border-t border-solar-border/50 flex justify-between items-center text-sm text-solar-muted relative z-10">
                <div className="flex items-center gap-1">
                    <IndianRupee className="w-4 h-4" />
                    <span>Tariff: ₹8.0/unit</span>
                </div>
                <div className="flex items-center gap-1 text-solar-primary cursor-pointer hover:text-solar-yellow transition-colors">
                    <Calendar className="w-4 h-4" />
                    <span>View Report</span>
                </div>
            </div>
        </motion.div>
    )
}

export default FinancialWidget
