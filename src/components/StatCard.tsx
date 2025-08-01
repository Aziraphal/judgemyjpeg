interface StatCardProps {
  title: string
  value: string | number
  icon: string
  subtitle?: string
  color?: 'primary' | 'secondary' | 'success' | 'warning'
  trend?: {
    value: number
    label: string
  }
}

export default function StatCard({ 
  title, 
  value, 
  icon, 
  subtitle, 
  color = 'primary',
  trend 
}: StatCardProps) {
  const colorClasses = {
    primary: 'from-neon-pink to-neon-cyan',
    secondary: 'from-purple-500 to-blue-500',
    success: 'from-emerald-500 to-teal-500',
    warning: 'from-amber-500 to-orange-500',
  }

  const bgColorClasses = {
    primary: 'bg-neon-pink/10',
    secondary: 'bg-purple-500/10',
    success: 'bg-emerald-500/10',
    warning: 'bg-amber-500/10',
  }

  return (
    <div className="glass-card p-6 hover-glow group relative overflow-hidden">
      {/* Background gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${bgColorClasses[color]} opacity-20 group-hover:opacity-30 transition-opacity duration-300`}></div>
      
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${colorClasses[color]} flex items-center justify-center text-2xl shadow-lg`}>
            {icon}
          </div>
          
          {trend && (
            <div className={`text-sm px-2 py-1 rounded-full ${
              trend.value > 0 
                ? 'bg-emerald-500/20 text-emerald-400' 
                : trend.value < 0 
                  ? 'bg-red-500/20 text-red-400'
                  : 'bg-cosmic-glass text-text-muted'
            }`}>
              {trend.value > 0 ? '↗' : trend.value < 0 ? '↘' : '→'} {trend.label}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="space-y-2">
          <div className="text-3xl font-bold text-text-white group-hover:text-glow transition-all duration-300">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </div>
          
          <div className="text-text-white font-medium">
            {title}
          </div>
          
          {subtitle && (
            <div className="text-text-muted text-sm">
              {subtitle}
            </div>
          )}
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute -top-2 -right-2 w-8 h-8 bg-glow-cyan rounded-full blur-lg opacity-20 group-hover:opacity-40 transition-opacity duration-300"></div>
      <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-glow-pink rounded-full blur-md opacity-15 group-hover:opacity-30 transition-opacity duration-300"></div>
    </div>
  )
}