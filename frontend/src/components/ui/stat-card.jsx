import React from 'react'

export default function StatCard({
  title,
  value,
  icon: Icon,
  color = 'text-solar-yellow',
  gradient = 'from-solar-yellow/20 to-solar-orange/10',
  className = ''
}) {
  return (
    <div className={`bg-gradient-to-br from-solar-card to-solar-night/50 rounded-xl p-6 energy-card border border-solar-border/50 shadow-lg hover:shadow-xl transition-all duration-300 group relative overflow-hidden ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm text-solar-muted font-medium">{title}</p>
          <p className="text-3xl font-bold text-solar-primary mt-2 group-hover:text-solar-yellow transition-colors duration-300">{value}</p>
        </div>
        <div className={`w-14 h-14 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:scale-110`}>
          {Icon && <Icon className={`w-7 h-7 ${color} drop-shadow-sm`} />}
        </div>
      </div>
      {/* Subtle shine effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 rounded-xl"></div>
    </div>
  )
}