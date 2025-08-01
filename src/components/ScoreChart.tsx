interface ScoreChartProps {
  distribution: {
    excellent: number
    good: number
    average: number
    poor: number
  }
  totalPhotos: number
}

export default function ScoreChart({ distribution, totalPhotos }: ScoreChartProps) {
  const data = [
    { label: 'Excellent', value: distribution.excellent, color: '#00F5FF', emoji: '🏆' },
    { label: 'Bon', value: distribution.good, color: '#10B981', emoji: '⭐' },
    { label: 'Moyen', value: distribution.average, color: '#F59E0B', emoji: '📈' },
    { label: 'Faible', value: distribution.poor, color: '#EF4444', emoji: '💪' },
  ]

  if (totalPhotos === 0) {
    return (
      <div className="glass-card p-6 text-center">
        <div className="text-4xl mb-4">📊</div>
        <h3 className="text-lg font-semibold text-text-white mb-2">
          Distribution des scores
        </h3>
        <p className="text-text-muted text-sm">
          Analysez des photos pour voir vos statistiques
        </p>
      </div>
    )
  }

  return (
    <div className="glass-card p-6 hover-glow">
      <h3 className="text-lg font-semibold text-text-white mb-6 flex items-center">
        <span className="text-2xl mr-2">📊</span>
        Distribution des scores
      </h3>

      <div className="space-y-4">
        {data.map((item) => {
          const percentage = totalPhotos > 0 ? (item.value / totalPhotos) * 100 : 0
          
          return (
            <div key={item.label} className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{item.emoji}</span>
                  <span className="text-text-white font-medium">{item.label}</span>
                  <span className="text-text-muted text-sm">
                    ({item.label === 'Excellent' ? '85-100' : 
                      item.label === 'Bon' ? '70-84' :
                      item.label === 'Moyen' ? '50-69' : '0-49'})
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-text-white font-semibold">{item.value}</div>
                  <div className="text-text-muted text-xs">{percentage.toFixed(1)}%</div>
                </div>
              </div>
              
              <div className="w-full bg-cosmic-glass rounded-full h-2 overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all duration-1000 ease-out"
                  style={{ 
                    width: `${percentage}%`,
                    backgroundColor: item.color,
                    boxShadow: `0 0 8px ${item.color}40`
                  }}
                />
              </div>
            </div>
          )
        })}
      </div>

      {/* Résumé */}
      <div className="mt-6 pt-4 border-t border-cosmic-glassborder">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <div className="text-neon-cyan text-xl font-bold">
              {((distribution.excellent + distribution.good) / totalPhotos * 100).toFixed(1)}%
            </div>
            <div className="text-text-muted text-xs">Photos réussies</div>
          </div>
          <div>
            <div className="text-neon-pink text-xl font-bold">
              {distribution.excellent}
            </div>
            <div className="text-text-muted text-xs">Chefs-d'œuvre</div>
          </div>
        </div>
      </div>
    </div>
  )
}