import { useState, useEffect } from 'react';
import LocationManager from './LocationManager';
import RunRecommendations from './RunRecommendations';
import { fetchWeatherData, type CombinedWeatherData, type CurrentWeather } from '../services/weatherService';
import { calculateRunningScore, type ScoringResult } from '../utils/scoringAlgorithm';

interface Location {
  latitude: number;
  longitude: number;
  timezone: string;
  name: string;
  country?: string;
}

export default function App() {
  const [location, setLocation] = useState<Location | null>(null);
  const [weatherData, setWeatherData] = useState<CombinedWeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<ScoringResult | null>(null);

  const handleLocationChange = async (newLocation: Location) => {
    setLocation(newLocation);
    setLoading(true);
    setError(null);

    try {
      const data = await fetchWeatherData(
        newLocation.latitude,
        newLocation.longitude,
        newLocation.timezone
      );
      setWeatherData(data);

      const scoring = calculateRunningScore(data.weather, data.airQuality);
      setRecommendations(scoring);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al obtener datos');
    }
    setLoading(false);
  };

  const currentWeather = weatherData?.weather.current || null;

  return (
    <div className="space-y-8">
      <LocationManager onLocationChange={handleLocationChange} />

      {loading && (
        <div className="border-2 border-brutalist-yellow p-4 text-center">
          <p className="text-brutalist-yellow animate-pulse">CARGANDO DATOS...</p>
        </div>
      )}

      {error && (
        <div className="border-2 border-red-500 p-4">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {!loading && !error && (
        <RunRecommendations
          dayRecommendations={recommendations?.dayRecommendations || []}
          currentWeather={currentWeather}
        />
      )}
    </div>
  );
}