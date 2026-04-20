import type { WeatherData, AirQualityData } from '../services/weatherService';

export interface HourScore {
  time: string;
  date: string;
  hour: number;
  score: number;
  temperature: number;
  humidity: number;
  precipProbability: number;
  uv: number;
  windSpeed: number;
  windGusts: number;
  weatherCode: number;
  visibility: number;
  aqi: number;
  pm25: number;
}

export interface DayRecommendation {
  date: string;
  hours: HourScore[];
}

export interface ScoringResult {
  dayRecommendations: DayRecommendation[];
}

export function calculateRunningScore(
  weather: WeatherData,
  airQuality: AirQualityData
): ScoringResult {
  const now = new Date();
  const hourlyWeather = weather.hourly;
  const hourlyAir = airQuality?.hourly;
  const scores: HourScore[] = [];

  for (let i = 0; i < hourlyWeather.time.length; i++) {
    const timeStr = hourlyWeather.time[i];
    const hourDate = new Date(timeStr);

    if (hourDate <= now) continue;

    let score = 0;

    const temp = hourlyWeather.temperature_2m[i];
    const humidity = hourlyWeather.relative_humidity_2m[i];
    const precipProbability = hourlyWeather.precipitation_probability[i];
    const uv = hourlyWeather.uv_index[i] ?? 0;
    const windSpeed = hourlyWeather.wind_speed_10m[i];
    const windGusts = hourlyWeather.wind_gusts_10m[i];
    const weatherCode = hourlyWeather.weather_code[i];
    const visibility = hourlyWeather.visibility[i];
    const aqi = hourlyAir?.hourly?.european_aqi?.[i] ?? 0;
    const pm25 = hourlyAir?.hourly?.pm2_5?.[i] ?? 0;

    if (temp >= 14 && temp <= 23) {
      score += 40;
    } else if ((temp >= 10 && temp < 13.9) || (temp > 23 && temp <= 26)) {
      score += 20;
    }

    if (humidity >= 40 && humidity <= 75) {
      score += 25;
    } else if (humidity > 85) {
      score -= 20;
    }

    if (precipProbability < 20) {
      score += 30;
    } else if (precipProbability < 40) {
      score += 10;
    } else if (precipProbability >= 40) {
      score -= 30;
    }

    if (uv < 3) {
      score += 15;
    } else if (uv < 5) {
      score += 5;
    } else if (uv >= 5) {
      score -= 20;
    }

    if (windSpeed >= 5 && windSpeed <= 18) {
      score += 15;
    } else if (windSpeed < 5) {
      score += 5;
    } else if (windSpeed > 18) {
      score -= 10;
    }

    if (windGusts > 30) {
      score -= 15;
    }

    if ([0, 1, 2, 3].includes(weatherCode)) {
      score += 15;
    } else if (weatherCode >= 80) {
      score -= 40;
    }

    if (visibility < 10000) {
      score -= 10;
    }

    if (aqi === 0) {
      score += 20;
    } else if (aqi < 50) {
      score += 20;
    } else if (aqi < 100) {
      score += 5;
    } else if (aqi >= 100) {
      score -= 25;
    }

    const dateStr = timeStr.split('T')[0];
    const hourNum = hourDate.getHours();

    scores.push({
      time: timeStr,
      date: dateStr,
      hour: hourNum,
      score,
      temperature: temp,
      humidity,
      precipProbability,
      uv,
      windSpeed,
      windGusts,
      weatherCode,
      visibility,
      aqi,
      pm25,
    });
  }

  const filtered = scores.filter((s) => s.score >= 20);

  const sorted = filtered.sort((a, b) => b.score - a.score);

  const byDate = new Map<string, HourScore[]>();
  for (const item of sorted) {
    const existing = byDate.get(item.date) || [];
    if (existing.length < 6) {
      existing.push(item);
      byDate.set(item.date, existing);
    }
  }

  const dayRecommendations: DayRecommendation[] = [];
  for (const [date, hours] of byDate) {
    dayRecommendations.push({
      date,
      hours: hours.sort((a, b) => b.score - a.score),
    });
  }

  dayRecommendations.sort((a, b) => a.date.localeCompare(b.date));

  return { dayRecommendations };
}