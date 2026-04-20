import { useMemo } from 'react';
import type { DayRecommendation } from '../utils/scoringAlgorithm';
import type { CurrentWeather } from '../services/weatherService';

interface RunRecommendationsProps {
  dayRecommendations: DayRecommendation[];
  currentWeather: CurrentWeather | null;
}

const WEATHER_CODES: Record<number, string> = {
  0: 'Despejado',
  1: 'Mayormente despejado',
  2: 'Parcialmente nublado',
  3: 'Nublado',
  45: 'Niebla',
  48: 'Niebla',
  51: 'Llovizna',
  53: 'Llovizna',
  55: 'Llovizna',
  61: 'Lluvia',
  63: 'Lluvia',
  65: 'Lluvia intensa',
  71: 'Nieve',
  73: 'Nieve',
  75: 'Nieve intensa',
  80: 'Chubascos',
  81: 'Chubascos',
  82: 'Chubascos fuertes',
  95: 'Tormenta',
  96: 'Tormenta',
  99: 'Tormenta fuerte',
};

function formatDate(dateStr: string) {
  const date = new Date(dateStr + 'T12:00:00');
  return date
    .toLocaleDateString('es-ES', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    })
    .toUpperCase();
}

export default function RunRecommendations({
  dayRecommendations,
  currentWeather,
}: RunRecommendationsProps) {
  const maxScore = useMemo(() => {
    let max = 0;
    for (const day of dayRecommendations) {
      for (const hour of day.hours) {
        if (hour.score > max) max = hour.score;
      }
    }
    return max;
  }, [dayRecommendations]);

  if (dayRecommendations.length === 0 && !currentWeather) {
    return (
      <div className="brutal-box p-8 text-center">
        <p className="text-brutalist-text/60 uppercase text-sm tracking-wide">
          Selecciona una ubicación para ver las recomendaciones
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {currentWeather && (
        <div className="brutal-box overflow-hidden">
          <div className="bg-brutalist-gray-mid px-3 py-2 border-b-2 border-black">
            <h3 className="text-brutalist-yellow font-bold uppercase text-xs md:text-sm tracking-widest">
              Clima Actual
            </h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-black">
            <div className="p-2 md:p-3 bg-brutalist-gray">
              <p className="text-[10px] md:text-xs uppercase text-brutalist-text/50">Temp</p>
              <p className="text-lg md:text-2xl font-bold">{currentWeather.temperature_2m}°</p>
            </div>
            <div className="p-2 md:p-3 bg-brutalist-gray">
              <p className="text-[10px] md:text-xs uppercase text-brutalist-text/50">Sensación</p>
              <p className="text-lg md:text-2xl font-bold">{currentWeather.apparent_temperature}°</p>
            </div>
            <div className="p-2 md:p-3 bg-brutalist-gray">
              <p className="text-[10px] md:text-xs uppercase text-brutalist-text/50">Humedad</p>
              <p className="text-lg md:text-2xl font-bold">{currentWeather.relative_humidity_2m}%</p>
            </div>
            <div className="p-2 md:p-3 bg-brutalist-gray">
              <p className="text-[10px] md:text-xs uppercase text-brutalist-text/50">Viento</p>
              <p className="text-lg md:text-2xl font-bold">{currentWeather.wind_speed_10m}</p>
            </div>
            <div className="p-2 md:p-3 bg-brutalist-gray">
              <p className="text-[10px] md:text-xs uppercase text-brutalist-text/50">Condición</p>
              <p className="text-xs md:text-sm font-bold truncate">
                {WEATHER_CODES[currentWeather.weather_code] || 'N/A'}
              </p>
            </div>
            <div className="p-2 md:p-3 bg-brutalist-gray">
              <p className="text-[10px] md:text-xs uppercase text-brutalist-text/50">Precip</p>
              <p className="text-lg md:text-2xl font-bold">{currentWeather.precipitation}</p>
            </div>
            <div className="p-2 md:p-3 bg-brutalist-gray">
              <p className="text-[10px] md:text-xs uppercase text-brutalist-text/50">Nubes</p>
              <p className="text-lg md:text-2xl font-bold">{currentWeather.cloud_cover}%</p>
            </div>
            <div className="p-2 md:p-3 bg-brutalist-gray">
              <p className="text-[10px] md:text-xs uppercase text-brutalist-text/50">Presión</p>
              <p className="text-lg md:text-2xl font-bold">{currentWeather.pressure_msl}</p>
            </div>
          </div>
        </div>
      )}

      {dayRecommendations.map((day, dayIdx) => (
        <div key={day.date} className="brutal-box overflow-hidden">
          <div className="bg-black px-3 py-2 border-b-2 border-black">
            <h3 className="text-brutalist-yellow font-bold uppercase text-xs md:text-sm tracking-widest truncate">
              {formatDate(day.date)}
            </h3>
          </div>
          <div className="overflow-x-auto">
            <div className="min-w-[600px]">
              <div className="grid grid-cols-7 bg-brutalist-gray-mid text-xs font-bold border-b-2 border-black">
                <div className="p-2 text-center">HORA</div>
                <div className="p-2 text-center">SCORE</div>
                <div className="p-2 text-center">TEMP</div>
                <div className="p-2 text-center">HUM</div>
                <div className="p-2 text-center">LLUVIA</div>
                <div className="p-2 text-center">VIENTO</div>
                <div className="p-2 text-center">AQI</div>
              </div>
              {day.hours.map((hour) => {
                const isBestScore = hour.score === maxScore && dayIdx === 0;
                return (
                  <div
                    key={hour.time}
                    className={`grid grid-cols-7 text-xs md:text-sm border-b border-black/30 ${
                      isBestScore ? 'bg-brutalist-yellow' : 'bg-brutalist-gray'
                    }`}
                  >
                    <div className={`p-2 text-center font-mono ${isBestScore ? 'text-black' : ''}`}>
                      {hour.hour.toString().padStart(2, '0')}:00
                    </div>
                    <div className={`p-2 text-center font-bold ${isBestScore ? 'text-black' : 'text-brutalist-yellow'}`}>
                      {hour.score}
                    </div>
                    <div className={`p-2 text-center ${isBestScore ? 'text-black' : ''}`}>
                      {hour.temperature}°
                    </div>
                    <div className={`p-2 text-center ${isBestScore ? 'text-black' : ''}`}>
                      {hour.humidity}%
                    </div>
                    <div className={`p-2 text-center ${isBestScore ? 'text-black' : ''}`}>
                      {hour.precipProbability}%
                    </div>
                    <div className={`p-2 text-center ${isBestScore ? 'text-black' : ''}`}>
                      {hour.windSpeed}
                    </div>
                    <div className={`p-2 text-center ${isBestScore ? 'text-black' : ''}`}>
                      {hour.aqi}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="bg-brutalist-gray-mid px-2 py-1 text-[10px] text-brutalist-text/60 text-center">
            Desliza para ver todas las columnas →
          </div>
        </div>
      ))}
    </div>
  );
}