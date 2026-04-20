export interface WeatherData {
  current: CurrentWeather;
  hourly: HourlyWeather;
  timezone: string;
}

export interface CurrentWeather {
  time: string;
  temperature_2m: number;
  relative_humidity_2m: number;
  apparent_temperature: number;
  is_day: number;
  precipitation: number;
  rain: number;
  showers: number;
  snowfall: number;
  weather_code: number;
  cloud_cover: number;
  pressure_msl: number;
  surface_pressure: number;
  wind_speed_10m: number;
  wind_direction_10m: number;
  wind_gusts_10m: number;
}

export interface HourlyWeather {
  time: string[];
  temperature_2m: number[];
  relative_humidity_2m: number[];
  dew_point_2m: number[];
  apparent_temperature: number[];
  precipitation_probability: number[];
  precipitation: number[];
  rain: number[];
  showers: number[];
  snowfall: number[];
  snow_depth: number[];
  weather_code: number[];
  pressure_msl: number[];
  surface_pressure: number[];
  cloud_cover: number[];
  visibility: number[];
  wind_speed_10m: number[];
  wind_direction_10m: number[];
  wind_gusts_10m: number[];
  uv_index: number[];
}

export interface AirQualityData {
  hourly?: AirQualityHourly;
  timezone?: string;
}

export interface AirQualityHourly {
  time: string[];
  pm2_5: number[];
  pm10: number[];
  european_aqi: number[];
}

export interface CombinedWeatherData {
  weather: WeatherData;
  airQuality: AirQualityData;
}

function createEmptyAirQuality(): AirQualityData {
  return {
    hourly: {
      time: [],
      pm2_5: [],
      pm10: [],
      european_aqi: [],
    },
    timezone: 'UTC',
  };
}

export async function fetchWeatherData(
  lat: number,
  lon: number,
  timezone: string
): Promise<CombinedWeatherData> {
  const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&timezone=${timezone}&forecast_days=7&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,showers,snowfall,weather_code,cloud_cover,pressure_msl,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m&hourly=temperature_2m,relative_humidity_2m,dew_point_2m,apparent_temperature,precipitation_probability,precipitation,rain,showers,snowfall,snow_depth,weather_code,pressure_msl,surface_pressure,cloud_cover,visibility,wind_speed_10m,wind_direction_10m,wind_gusts_10m,uv_index`;

  const airQualityUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&timezone=${timezone}&hourly=pm2_5,pm10,european_aqi`;

  let weatherData: WeatherData;
  let airQualityData: AirQualityData = createEmptyAirQuality();

  try {
    const weatherRes = await fetch(weatherUrl);
    
    if (!weatherRes.ok) {
      throw new Error(`Weather API error: ${weatherRes.status}`);
    }

    weatherData = await weatherRes.json() as WeatherData;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Error fetching weather: ${error.message}`);
    }
    throw new Error('Unknown error fetching weather data');
  }

  try {
    const airQualityRes = await fetch(airQualityUrl);
    
    if (airQualityRes.ok) {
      const aqData = await airQualityRes.json() as AirQualityData;
      
      if (aqData?.hourly) {
        airQualityData = aqData;
      }
    }
  } catch {
    // Air Quality no disponible, usar valores vacíos
  }

  return {
    weather: weatherData,
    airQuality: airQualityData,
  };
}