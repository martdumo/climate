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
      weekday: 'long',
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
    <div className="space-y-8">
      {currentWeather && (
        <div className="brutal-box">
          <div className="bg-brutalist-gray-mid px-4 py-2 border-b-4 border-black">
            <h3 className="text-brutalist-yellow font-bold uppercase tracking-widest text-sm">
              Clima Actual
            </h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-0 divide-x-0 divide-y-4 divide-black border-4 border-black">
            <div className="p-3">
              <p className="text-xs uppercase text-brutalist-text/50">Temperatura</p>
              <p className="text-2xl font-bold">{currentWeather.temperature_2m}°C</p>
            </div>
            <div className="p-3">
              <p className="text-xs uppercase text-brutalist-text/50">Sensación</p>
              <p className="text-2xl font-bold">{currentWeather.apparent_temperature}°C</p>
            </div>
            <div className="p-3">
              <p className="text-xs uppercase text-brutalist-text/50">Humedad</p>
              <p className="text-2xl font-bold">{currentWeather.relative_humidity_2m}%</p>
            </div>
            <div className="p-3">
              <p className="text-xs uppercase text-brutalist-text/50">Viento</p>
              <p className="text-2xl font-bold">{currentWeather.wind_speed_10m} km/h</p>
            </div>
            <div className="p-3">
              <p className="text-xs uppercase text-brutalist-text/50">Condición</p>
              <p className="font-bold">
                {WEATHER_CODES[currentWeather.weather_code] || 'N/A'}
              </p>
            </div>
            <div className="p-3">
              <p className="text-xs uppercase text-brutalist-text/50">Precipitación</p>
              <p className="font-bold">{currentWeather.precipitation} mm</p>
            </div>
            <div className="p-3">
              <p className="text-xs uppercase text-brutalist-text/50">Nubosidad</p>
              <p className="font-bold">{currentWeather.cloud_cover}%</p>
            </div>
            <div className="p-3">
              <p className="text-xs uppercase text-brutalist-text/50">Presión</p>
              <p className="font-bold">{currentWeather.pressure_msl} hPa</p>
            </div>
          </div>
        </div>
      )}

      {dayRecommendations.map((day, dayIdx) => (
        <div key={day.date} className="brutal-box">
          <div className="bg-black px-4 py-3 border-b-4 border-black">
            <h3 className="text-brutalist-yellow font-bold uppercase tracking-widest">
              {formatDate(day.date)}
            </h3>
          </div>
          <div className="border-4 border-black">
            <div className="grid grid-cols-7 gap-0 divide-x-4 divide-black border-b-4 border-black">
              <div className="p-2 bg-brutalist-gray-mid">
                <p className="text-xs uppercase font-bold">Hora</p>
              </div>
              <div className="p-2 bg-brutalist-gray-mid col-span-2">
                <p className="text-xs uppercase font-bold">Score</p>
              </div>
              <div className="p-2 bg-brutalist-gray-mid">
                <p className="text-xs uppercase font-bold">Temp</p>
              </div>
              <div className="p-2 bg-brutalist-gray-mid">
                <p className="text-xs uppercase font-bold">Hum</p>
              </div>
              <div className="p-2 bg-brutalist-gray-mid">
                <p className="text-xs uppercase font-bold">Lluvia</p>
              </div>
              <div className="p-2 bg-brutalist-gray-mid">
                <p className="text-xs uppercase font-bold">Viento</p>
              </div>
              <div className="p-2 bg-brutalist-gray-mid">
                <p className="text-xs uppercase font-bold">AQI</p>
              </div>
            </div>
            {day.hours.map((hour, hourIdx) => {
              const isBestScore = hour.score === maxScore && dayIdx === 0;
              return (
                <div
                  key={hour.time}
                  className={`grid grid-cols-7 gap-0 divide-x-4 divide-black ${
                    isBestScore ? 'bg-brutalist-yellow' : ''
                  }`}
                >
                  <div className={`p-2 ${isBestScore ? 'text-black' : ''}`}>
                    {hour.hour.toString().padStart(2, '0')}:00
                  </div>
                  <div className={`p-2 col-span-2 font-bold ${isBestScore ? 'text-black' : ''}`}>
                    {hour.score}
                  </div>
                  <div className={`p-2 ${isBestScore ? 'text-black' : ''}`}>
                    {hour.temperature}°C
                  </div>
                  <div className={`p-2 ${isBestScore ? 'text-black' : ''}`}>
                    {hour.humidity}%
                  </div>
                  <div className={`p-2 ${isBestScore ? 'text-black' : ''}`}>
                    {hour.precipProbability}%
                  </div>
                  <div className={`p-2 ${isBestScore ? 'text-black' : ''}`}>
                    {hour.windSpeed} km/h
                  </div>
                  <div className={`p-2 ${isBestScore ? 'text-black' : ''}`}>
                    {hour.aqi}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}