import { Cloud, CloudFog, CloudLightning, CloudRain, CloudSun, Sun, Thermometer, Wind, Droplets } from 'lucide-react'

const WeatherIcon = ({ condition, className = "w-6 h-6" }) => {
    switch (condition?.toLowerCase()) {
        case 'clear':
            return <Sun className={`${className} text-solar-yellow`} />
        case 'clouds':
            return <CloudSun className={`${className} text-solar-muted`} />
        case 'rain':
        case 'drizzle':
            return <CloudRain className={`${className} text-solar-info`} />
        case 'thunderstorm':
            return <CloudLightning className={`${className} text-solar-danger`} />
        case 'snow':
            return <CloudFog className={`${className} text-solar-primary`} />
        default:
            return <Cloud className={`${className} text-solar-muted`} />
    }
}

export default function WeatherWidget({ weather, loading }) {
    if (loading) {
        return (
            <div className="bg-solar-card/50 backdrop-blur-md rounded-xl p-6 border border-solar-border animate-pulse">
                <div className="h-6 w-32 bg-solar-panel/50 rounded mb-4"></div>
                <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-solar-panel/50 rounded-full"></div>
                    <div className="space-y-2">
                        <div className="h-8 w-20 bg-solar-panel/50 rounded"></div>
                        <div className="h-4 w-24 bg-solar-panel/50 rounded"></div>
                    </div>
                </div>
            </div>
        )
    }

    if (!weather || !weather.current) return null

    const { current, forecast } = weather

    // Filter forecast to get one per day for the next few days
    const dailyForecast = forecast?.filter((item, index) => index % 8 === 0).slice(0, 4) || []

    return (
        <div className="bg-solar-card/50 backdrop-blur-md rounded-xl p-6 border border-solar-border energy-card relative overflow-hidden group">
            {/* Background Glow */}
            <div className="absolute top-0 right-0 -tr-12 w-32 h-32 bg-solar-yellow/5 rounded-full blur-3xl group-hover:bg-solar-yellow/10 transition-all"></div>

            <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h3 className="text-solar-primary font-semibold flex items-center">
                            <Thermometer className="w-4 h-4 mr-2 text-solar-yellow" />
                            Local Weather
                        </h3>
                        <p className="text-xs text-solar-muted">{current.location || 'Current Location'}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-2xl font-bold text-solar-primary">{Math.round(current.temperature)}°C</p>
                        <p className="text-xs text-solar-yellow capitalize">{current.description}</p>
                    </div>
                </div>

                <div className="flex items-center justify-between mb-8">
                    <div className="flex flex-col items-center">
                        <div className="p-3 bg-solar-panel/30 rounded-full mb-2">
                            <WeatherIcon condition={current.condition} className="w-8 h-8" />
                        </div>
                        <span className="text-xs text-solar-muted font-medium capitalize">{current.condition}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                        <div className="flex items-center space-x-2">
                            <Droplets className="w-4 h-4 text-solar-info" />
                            <div className="text-left">
                                <p className="text-[10px] text-solar-muted leading-none">Humidity</p>
                                <p className="text-xs font-semibold text-solar-primary">{current.humidity}%</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Wind className="w-4 h-4 text-solar-success" />
                            <div className="text-left">
                                <p className="text-[10px] text-solar-muted leading-none">Wind</p>
                                <p className="text-xs font-semibold text-solar-primary">{current.wind_speed} km/h</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Cloud className="w-4 h-4 text-solar-orange" />
                            <div className="text-left">
                                <p className="text-[10px] text-solar-muted leading-none">Clouds</p>
                                <p className="text-xs font-semibold text-solar-primary">{current.cloud_cover}%</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Thermometer className="w-4 h-4 text-solar-yellow" />
                            <div className="text-left">
                                <p className="text-[10px] text-solar-muted leading-none">Feels Like</p>
                                <p className="text-xs font-semibold text-solar-primary">{Math.round(current.feels_like)}°C</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Forecast */}
                {dailyForecast.length > 0 && (
                    <div className="pt-4 border-t border-solar-border/50">
                        <p className="text-[10px] uppercase tracking-wider text-solar-muted font-bold mb-3">4-Day Forecast</p>
                        <div className="grid grid-cols-4 gap-2">
                            {dailyForecast.map((item, idx) => (
                                <div key={idx} className="flex flex-col items-center p-2 rounded-lg bg-solar-panel/20 hover:bg-solar-panel/40 transition-colors">
                                    <span className="text-[10px] text-solar-muted mb-1">
                                        {new Date(item.timestamp).toLocaleDateString('en-US', { weekday: 'short' })}
                                    </span>
                                    <WeatherIcon condition={item.condition} className="w-5 h-5 mb-1" />
                                    <span className="text-xs font-bold text-solar-primary">{Math.round(item.temperature)}°</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
