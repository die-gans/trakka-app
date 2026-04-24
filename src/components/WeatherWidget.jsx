import { useState, useEffect } from 'react'
import { Cloud, Sun, CloudRain, CloudLightning, CloudSnow, Wind, Droplets, Flame } from 'lucide-react'
import { fetchWeather, fetchForecast, estimateFireDanger } from '../lib/weather'

const ICONS = {
  sun: Sun,
  partly: Cloud,
  cloud: Cloud,
  rain: CloudRain,
  storm: CloudLightning,
  snow: CloudSnow,
  wind: Wind,
  fog: Cloud,
}

export function WeatherWidget({ lat, lng, locationName }) {
  const [current, setCurrent] = useState(null)
  const [forecast, setForecast] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadWeather = async () => {
      setLoading(true)
      const [currentData, forecastData] = await Promise.all([
        fetchWeather({ lat, lng, locationName }),
        fetchForecast({ lat, lng }),
      ])
      setCurrent(currentData)
      setForecast(forecastData)
      setLoading(false)
    }

    loadWeather()
    // Refresh every 15 minutes
    const interval = setInterval(loadWeather, 15 * 60 * 1000)
    return () => clearInterval(interval)
  }, [lat, lng, locationName])

  if (loading) {
    return (
      <div className="border border-border-default bg-bg-surface p-4">
        <div className="text-[10px] font-black uppercase tracking-wider text-text-secondary">
          Weather
        </div>
        <div className="mt-2 text-[11px] text-text-muted">Loading...</div>
      </div>
    )
  }

  if (!current) {
    return (
      <div className="border border-border-default bg-bg-surface p-4">
        <div className="text-[10px] font-black uppercase tracking-wider text-text-secondary">
          Weather
        </div>
        <div className="mt-2 text-[11px] text-text-muted">Weather data unavailable</div>
      </div>
    )
  }

  const WeatherIcon = ICONS[current.iconKey] || Cloud
  const fireDanger = estimateFireDanger(current)

  return (
    <div className="border border-border-default bg-bg-surface">
      <div className="border-b border-border-default bg-bg-panel px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="text-[10px] font-black uppercase tracking-wider text-info">
            Live Weather
          </div>
          <div className="text-[9px] text-text-secondary">{current.location}</div>
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center border border-border-default bg-bg-panel">
            <WeatherIcon size={24} className="text-info" />
          </div>
          <div>
            <div className="text-[24px] font-black leading-none text-text-primary">
              {current.temperature}°
            </div>
            <div className="text-[10px] capitalize text-text-secondary">
              {current.condition}
            </div>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-3 gap-2">
          <div className="border border-border-default bg-bg-panel p-2 text-center">
            <div className="text-[9px] font-black uppercase tracking-wider text-text-secondary">
              Wind
            </div>
            <div className="mt-1 text-[12px] font-bold text-text-primary">
              {current.windSpeed} km/h
            </div>
          </div>
          <div className="border border-border-default bg-bg-panel p-2 text-center">
            <div className="text-[9px] font-black uppercase tracking-wider text-text-secondary">
              Humidity
            </div>
            <div className="mt-1 text-[12px] font-bold text-text-primary">
              {current.humidity}%
            </div>
          </div>
          <div className="border border-border-default bg-bg-panel p-2 text-center">
            <div className="text-[9px] font-black uppercase tracking-wider text-text-secondary">
              Feels Like
            </div>
            <div className="mt-1 text-[12px] font-bold text-text-primary">
              {current.feelsLike}°
            </div>
          </div>
        </div>

        {fireDanger && (
          <div className={`mt-3 border p-2 text-center ${
            fireDanger.color === 'critical'
              ? 'border-critical bg-critical-soft'
              : fireDanger.color === 'warning'
              ? 'border-warning bg-warning-soft'
              : 'border-success bg-success-soft'
          }`}>
            <div className="flex items-center justify-center gap-2">
              <Flame size={12} className={fireDanger.color === 'critical' ? 'text-critical' : fireDanger.color === 'warning' ? 'text-warning' : 'text-success'} />
              <span className={`text-[10px] font-black uppercase tracking-wider ${
                fireDanger.color === 'critical' ? 'text-critical' : fireDanger.color === 'warning' ? 'text-warning' : 'text-success'
              }`}>
                Fire Danger: {fireDanger.level}
              </span>
            </div>
          </div>
        )}

        {forecast && forecast.length > 0 && (
          <div className="mt-4 border-t border-border-default pt-3">
            <div className="text-[9px] font-black uppercase tracking-wider text-text-secondary mb-2">
              5-Day Forecast
            </div>
            <div className="grid grid-cols-5 gap-1">
              {forecast.slice(0, 5).map((day) => {
                const DayIcon = ICONS[day.iconKey] || Cloud
                return (
                  <div key={day.date} className="text-center">
                    <div className="text-[9px] text-text-secondary">
                      {new Date(day.date).toLocaleDateString('en-AU', { weekday: 'short' })}
                    </div>
                    <DayIcon size={14} className="mx-auto my-1 text-info" />
                    <div className="text-[10px] font-bold text-text-primary">
                      {day.temperature}°
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
