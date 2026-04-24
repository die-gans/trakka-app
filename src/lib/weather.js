/**
 * Weather Service — TRAKKA
 * Primary: OpenWeatherMap (global, works with provided key format)
 * Fallback: Bureau of Meteorology (AU-specific)
 * Backup: Seeded data from trip
 */

const OPENWEATHER_API_KEY = import.meta.env.VITE_BOM_API_KEY
const OPENWEATHER_BASE = 'https://api.openweathermap.org/data/2.5'

/**
 * Map OpenWeather icon codes to TRAKKA icon keys
 */
function mapIconCode(iconCode) {
  // OpenWeather icons: 01d (clear), 02d (few clouds), 03d (scattered), 04d (broken),
  // 09d (shower), 10d (rain), 11d (thunder), 13d (snow), 50d (mist)
  const mapping = {
    '01d': 'sun', '01n': 'sun',
    '02d': 'partly', '02n': 'partly',
    '03d': 'cloud', '03n': 'cloud',
    '04d': 'cloud', '04n': 'cloud',
    '09d': 'rain', '09n': 'rain',
    '10d': 'rain', '10n': 'rain',
    '11d': 'storm', '11n': 'storm',
    '13d': 'snow', '13n': 'snow',
    '50d': 'fog', '50n': 'fog',
  }
  return mapping[iconCode] || 'cloud'
}

/**
 * Format weather data into TRAKKA standard format
 */
function formatWeatherData(data) {
  return {
    location: data.name,
    temperature: Math.round(data.main.temp),
    temperatureMin: Math.round(data.main.temp_min),
    temperatureMax: Math.round(data.main.temp_max),
    feelsLike: Math.round(data.main.feels_like),
    humidity: data.main.humidity,
    windSpeed: Math.round(data.wind.speed * 3.6), // m/s to km/h
    condition: data.weather[0].description,
    iconKey: mapIconCode(data.weather[0].icon),
    iconUrl: `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`,
    timestamp: new Date(data.dt * 1000).toISOString(),
  }
}

/**
 * Fetch current weather for a location
 */
export async function fetchWeather({ lat, lng, locationName }) {
  // If no API key, return null and let caller use fallback
  if (!OPENWEATHER_API_KEY) {
    console.warn('TRAKKA: No weather API key configured')
    return null
  }

  try {
    const url = `${OPENWEATHER_BASE}/weather?lat=${lat}&lon=${lng}&appid=${OPENWEATHER_API_KEY}&units=metric`
    const response = await fetch(url)

    if (!response.ok) {
      if (response.status === 401) {
        console.warn('TRAKKA: Weather API key invalid')
        return null
      }
      throw new Error(`Weather API error: ${response.status}`)
    }

    const data = await response.json()
    return formatWeatherData(data)
  } catch (error) {
    console.error('TRAKKA: Failed to fetch weather:', error)
    return null
  }
}

/**
 * Fetch 5-day forecast for a location
 */
export async function fetchForecast({ lat, lng }) {
  if (!OPENWEATHER_API_KEY) return null

  try {
    const url = `${OPENWEATHER_BASE}/forecast?lat=${lat}&lon=${lng}&appid=${OPENWEATHER_API_KEY}&units=metric`
    const response = await fetch(url)

    if (!response.ok) {
      console.warn('TRAKKA: Forecast fetch failed:', response.status)
      return null
    }

    const data = await response.json()

    // Group by day (API returns 3-hour intervals)
    const daily = {}
    data.list.forEach((item) => {
      const date = item.dt_txt.split(' ')[0]
      if (!daily[date]) {
        daily[date] = {
          temps: [],
          icons: [],
          conditions: [],
          main: item,
        }
      }
      daily[date].temps.push(item.main.temp)
      daily[date].icons.push(item.weather[0].icon)
      daily[date].conditions.push(item.weather[0].description)
    })

    // Get daily summaries (noon readings preferred)
    return Object.entries(daily).map(([date, info]) => {
      const noonItem = data.list.find((i) => i.dt_txt.includes(date) && i.dt_txt.includes('12:00'))
      const rep = noonItem || info.main

      return {
        date,
        temperature: Math.round(rep.main.temp),
        temperatureMin: Math.round(Math.min(...info.temps)),
        temperatureMax: Math.round(Math.max(...info.temps)),
        condition: rep.weather[0].description,
        iconKey: mapIconCode(rep.weather[0].icon),
        iconUrl: `https://openweathermap.org/img/wn/${rep.weather[0].icon}@2x.png`,
      }
    })
  } catch (error) {
    console.error('TRAKKA: Failed to fetch forecast:', error)
    return null
  }
}

/**
 * Get weather for a trip day
 */
export function getTripDayWeather(forecast, dateStr) {
  if (!forecast) return null
  return forecast.find((d) => d.date === dateStr) || null
}

/**
 * AU-specific: Fire danger rating (would need BOM integration)
 * For now, returns estimated based on temp/wind/humidity
 */
export function estimateFireDanger(weather) {
  if (!weather) return null

  // McArthur Forest Fire Danger Index estimation
  // Simplified: high temp + low humidity + high wind = high danger
  let score = 0
  if (weather.temperature > 35) score += 3
  else if (weather.temperature > 30) score += 2
  else if (weather.temperature > 25) score += 1

  if (weather.humidity < 20) score += 3
  else if (weather.humidity < 35) score += 2
  else if (weather.humidity < 50) score += 1

  if (weather.windSpeed > 40) score += 3
  else if (weather.windSpeed > 25) score += 2
  else if (weather.windSpeed > 15) score += 1

  const ratings = [
    { max: 2, level: 'Low-Moderate', color: 'success' },
    { max: 4, level: 'High', color: 'warning' },
    { max: 6, level: 'Very High', color: 'warning' },
    { max: 8, level: 'Severe', color: 'critical' },
    { max: 10, level: 'Extreme', color: 'critical' },
    { max: 20, level: 'Catastrophic', color: 'critical' },
  ]

  return ratings.find((r) => score <= r.max) || ratings[ratings.length - 1]
}
