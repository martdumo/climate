import { useState, useEffect } from 'react';

interface Location {
  latitude: number;
  longitude: number;
  timezone: string;
  name: string;
  country?: string;
}

interface GeoResult {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  timezone: string;
  admin1?: string;
}

interface LocationManagerProps {
  onLocationChange: (location: Location) => void;
  initialLocation?: Location;
}

export default function LocationManager({ onLocationChange, initialLocation }: LocationManagerProps) {
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<GeoResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentLocation, setCurrentLocation] = useState<Location | null>(initialLocation || null);

  useEffect(() => {
    if (initialLocation) {
      setCurrentLocation(initialLocation);
    }
  }, [initialLocation]);

  const handleGeolocation = () => {
    setError(null);
    if (!navigator.geolocation) {
      setError('Geolocation no está disponible en tu navegador');
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          const res = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m&timezone=auto`
          );
          const data = await res.json();
          
          const location: Location = {
            latitude,
            longitude,
            timezone: data.timezone || 'UTC',
            name: 'Mi ubicación',
          };
          
          setCurrentLocation(location);
          onLocationChange(location);
        } catch {
          const location: Location = {
            latitude,
            longitude,
            timezone: 'UTC',
            name: 'Mi ubicación',
          };
          setCurrentLocation(location);
          onLocationChange(location);
        }
        setLoading(false);
      },
      (err) => {
        setError('No se pudo obtener tu ubicación');
        setLoading(false);
      }
    );
  };

  const handleSearch = async () => {
    if (!search.trim()) return;
    
    setError(null);
    setLoading(true);
    
    try {
      const res = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(search)}&count=5&language=es&format=json`
      );
      const data = await res.json();
      
      if (data.results) {
        setResults(data.results);
      } else {
        setResults([]);
        setError('No se encontraron resultados');
      }
    } catch {
      setError('Error al buscar');
    }
    setLoading(false);
  };

  const handleSelect = (result: GeoResult) => {
    const location: Location = {
      latitude: result.latitude,
      longitude: result.longitude,
      timezone: result.timezone,
      name: result.name,
      country: result.country,
    };
    
    setCurrentLocation(location);
    onLocationChange(location);
    setResults([]);
    setSearch('');
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="Buscar ciudad..."
          className="flex-1 px-3 py-2 border-2 border-brutalist-gray-mid bg-brutalist-gray text-brutalist-text 
            placeholder:text-brutalist-text/40 focus:outline-none focus:border-brutalist-yellow transition-colors"
        />
        <button
          onClick={handleSearch}
          disabled={loading}
          className="px-4 py-2 border-2 border-brutalist-yellow bg-brutalist-yellow text-brutalist-gray 
            font-bold uppercase text-sm hover:bg-brutalist-yellow-dark transition-colors disabled:opacity-50"
        >
          Buscar
        </button>
      </div>

      <button
        onClick={handleGeolocation}
        disabled={loading}
        className="w-full px-4 py-2 border-2 border-brutalist-gray-mid bg-brutalist-gray-mid text-brutalist-text 
          font-bold uppercase text-sm hover:border-brutalist-yellow transition-colors disabled:opacity-50"
      >
        {loading ? 'Cargando...' : 'Usar mi ubicación'}
      </button>

      {error && (
        <p className="text-red-400 text-sm">{error}</p>
      )}

      {results.length > 0 && (
        <ul className="border-2 border-brutalist-gray-mid">
          {results.map((result) => (
            <li key={result.id}>
              <button
                onClick={() => handleSelect(result)}
                className="w-full px-3 py-2 text-left hover:bg-brutalist-gray-mid transition-colors 
                  text-brutalist-text flex justify-between items-center"
              >
                <span>{result.name}{result.admin1 && `, ${result.admin1}`}</span>
                <span className="text-brutalist-text/60 text-sm">{result.country}</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {currentLocation && (
        <div className="border-2 border-brutalist-yellow p-3">
          <p className="text-brutalist-yellow text-sm font-bold uppercase">Ubicación seleccionada</p>
          <p className="text-brutalist-text">{currentLocation.name}{currentLocation.country && `, ${currentLocation.country}`}</p>
          <p className="text-brutalist-text/60 text-xs mt-1">
            {currentLocation.latitude.toFixed(4)}, {currentLocation.longitude.toFixed(4)} • {currentLocation.timezone}
          </p>
        </div>
      )}
    </div>
  );
}