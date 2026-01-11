import React from 'react'
import { motion } from 'framer-motion'

export default function StatCard({
  title,
  value,
  icon: Icon,
  color = 'text-solar-yellow',
  gradient = 'from-solar-yellow/20 to-solar-orange/10',
  className = '',
  index = 0
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -5, scale: 1.02 }}
      className={`bg-glass-light rounded-xl p-6 energy-card border border-solar-border/50 shadow-lg hover:shadow-xl transition-all duration-300 group relative overflow-hidden ${className}`}
    >
      <div className="flex items-center justify-between relative z-10">
        <div className="flex-1">
          <p className="text-sm text-solar-muted font-semibold uppercase tracking-wider">{title}</p>
          <p className="text-3xl font-bold text-solar-primary mt-2 group-hover:text-solar-yellow transition-colors duration-300">{value}</p>
        </div>
        <div className={`w-14 h-14 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center shadow-inner group-hover:shadow-lg transition-all duration-300 group-hover:scale-110`}>
          {Icon && <Icon className={`w-7 h-7 ${color} drop-shadow-sm`} />}
        </div>
      </div>

      {/* Background glow on hover */}
      <div className={`absolute -right-10 -bottom-10 w-32 h-32 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500 rounded-full blur-3xl`}></div>

      {/* Subtle shine effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 translate-x-[-150%] group-hover:translate-x-[150%] transition-transform duration-1000"></div>
    </motion.div>
  )
}