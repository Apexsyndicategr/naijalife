/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Coordinates for all Nigerian states for real-time live weather tracking
export const STATE_COORDINATES: Record<string, { lat: number; lon: number; name: string }> = {
  lagos: { lat: 6.5244, lon: 3.3792, name: 'Lagos' },
  fct: { lat: 9.0765, lon: 7.3986, name: 'Abuja FCT' },
  fct_abuja: { lat: 9.0765, lon: 7.3986, name: 'Abuja FCT' },
  abuja: { lat: 9.0765, lon: 7.3986, name: 'Abuja FCT' },
  imo: { lat: 5.485, lon: 7.035, name: 'Imo (Owerri)' },
  rivers: { lat: 4.8156, lon: 7.0498, name: 'Rivers (Port Harcourt)' },
  kano: { lat: 12.0022, lon: 8.592, name: 'Kano' },
  oyo: { lat: 7.3775, lon: 3.947, name: 'Oyo (Ibadan)' },
  enugu: { lat: 6.4584, lon: 7.5464, name: 'Enugu' },
  delta: { lat: 6.1982, lon: 6.7329, name: 'Delta (Asaba)' },
  kaduna: { lat: 10.5105, lon: 7.4165, name: 'Kaduna' },
  plateau: { lat: 9.8965, lon: 8.8583, name: 'Plateau (Jos)' },
  akwa_ibom: { lat: 5.0377, lon: 7.9128, name: 'Akwa Ibom (Uyo)' },
  anambra: { lat: 6.2209, lon: 7.0723, name: 'Anambra (Awka)' },
  ogun: { lat: 7.1557, lon: 3.3451, name: 'Ogun (Abeokuta)' },
  edo: { lat: 6.335, lon: 5.6037, name: 'Edo (Benin City)' },
  borno: { lat: 11.8333, lon: 13.15, name: 'Borno (Maiduguri)' },
  sokoto: { lat: 13.0609, lon: 5.2476, name: 'Sokoto' },
  cross_river: { lat: 4.9757, lon: 8.3417, name: 'Cross River (Calabar)' },
  benue: { lat: 7.7321, lon: 8.5391, name: 'Benue (Makurdi)' },
  kwara: { lat: 8.4966, lon: 4.5421, name: 'Kwara (Ilorin)' },
  ondo: { lat: 7.2571, lon: 5.2058, name: 'Ondo (Akure)' },
  osun: { lat: 7.7827, lon: 4.5418, name: 'Osun (Osogbo)' },
  ekiti: { lat: 7.6214, lon: 5.2215, name: 'Ekiti (Ado-Ekiti)' },
  abia: { lat: 5.526, lon: 7.4896, name: 'Abia (Umuahia)' },
  ebonyi: { lat: 6.3249, lon: 8.1137, name: 'Ebonyi (Abakaliki)' },
  kogi: { lat: 7.8023, lon: 6.7333, name: 'Kogi (Lokoja)' },
  nasarawa: { lat: 8.4932, lon: 8.5153, name: 'Nasarawa (Lafia)' },
  niger: { lat: 9.6139, lon: 6.5569, name: 'Niger (Minna)' },
  adamawa: { lat: 9.2094, lon: 12.4818, name: 'Adamawa (Yola)' },
  bauchi: { lat: 10.3158, lon: 9.8442, name: 'Bauchi' },
  gombe: { lat: 10.2897, lon: 11.1673, name: 'Gombe' },
  taraba: { lat: 8.8937, lon: 11.3614, name: 'Taraba (Jalingo)' },
  yobe: { lat: 11.747, lon: 11.9608, name: 'Yobe (Damaturu)' },
  jigawa: { lat: 11.7583, lon: 9.3389, name: 'Jigawa (Dutse)' },
  katsina: { lat: 12.9908, lon: 7.6018, name: 'Katsina' },
  kebbi: { lat: 12.4539, lon: 4.1975, name: 'Kebbi (Birnin Kebbi)' },
  zamfara: { lat: 12.1628, lon: 6.6614, name: 'Zamfara (Gusau)' },
  bayelsa: { lat: 4.9267, lon: 6.2676, name: 'Bayelsa (Yenagoa)' },
};

export interface LiveWeatherData {
  temperatureC: number;
  conditionLabel: string;
  conditionEmoji: string;
  windSpeedKmh: number;
  isDay: boolean;
  weatherCode: number;
  locationName: string;
  source: 'live_open_meteo' | 'calibrated_realtime';
}

// In-memory weather cache: stateId -> { data, timestamp }
const weatherCache: Record<string, { data: LiveWeatherData; expiresAt: number }> = {};

export async function fetchRealLifeWeather(stateId: string): Promise<LiveWeatherData> {
  const sid = stateId?.toLowerCase() || 'lagos';
  const coords = STATE_COORDINATES[sid] || STATE_COORDINATES.lagos;
  const now = Date.now();

  // Check 10-minute cache
  if (weatherCache[sid] && weatherCache[sid].expiresAt > now) {
    return weatherCache[sid].data;
  }

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&current_weather=true`;
    const res = await fetch(url, { cache: 'no-cache' });
    if (res.ok) {
      const json = await res.json();
      const current = json.current_weather;
      if (current) {
        const isDay = current.is_day === 1;
        const code = Number(current.weathercode ?? 0);
        const temp = Math.round(Number(current.temperature ?? 28));
        const wind = Math.round(Number(current.windspeed ?? 10));

        let conditionLabel = 'Clear';
        let conditionEmoji = isDay ? '☀️' : '🌙';

        if (code === 0) {
          conditionLabel = isDay ? 'Clear Skies' : 'Clear Night';
          conditionEmoji = isDay ? '☀️' : '🌙';
        } else if (code === 1 || code === 2) {
          conditionLabel = isDay ? 'Partly Cloudy' : 'Fair Night';
          conditionEmoji = isDay ? '⛅' : '✨';
        } else if (code === 3) {
          conditionLabel = 'Overcast';
          conditionEmoji = '☁️';
        } else if (code === 45 || code === 48) {
          conditionLabel = 'Harmattan Haze';
          conditionEmoji = '🌫️';
        } else if (code >= 51 && code <= 55) {
          conditionLabel = 'Light Drizzle';
          conditionEmoji = '🌦️';
        } else if (code >= 61 && code <= 65) {
          conditionLabel = 'Tropical Rain';
          conditionEmoji = '🌧️';
        } else if (code >= 80 && code <= 82) {
          conditionLabel = 'Heavy Showers';
          conditionEmoji = '⛈️';
        } else if (code >= 95) {
          conditionLabel = 'Thunderstorm';
          conditionEmoji = '⚡';
        }

        const data: LiveWeatherData = {
          temperatureC: temp,
          conditionLabel,
          conditionEmoji,
          windSpeedKmh: wind,
          isDay,
          weatherCode: code,
          locationName: coords.name,
          source: 'live_open_meteo',
        };

        // Cache for 10 minutes
        weatherCache[sid] = { data, expiresAt: now + 10 * 60 * 1000 };
        return data;
      }
    }
  } catch (err) {
    console.warn('Real-time weather API fetch error, using calibrated seasonal climate:', err);
  }

  // Realistic calibrated fallback based on current hour in Nigeria (WAT UTC+1)
  const currentHourWAT = (new Date().getUTCHours() + 1) % 24;
  const isDay = currentHourWAT >= 6 && currentHourWAT < 19;
  const isNorthern = coords.lat > 9.5;

  let baseTemp = isNorthern ? 31 : 28;
  if (!isDay) baseTemp -= 4;

  const fallback: LiveWeatherData = {
    temperatureC: baseTemp,
    conditionLabel: isDay ? (isNorthern ? 'Sunny & Warm' : 'Humid & Partly Cloudy') : 'Calm Night',
    conditionEmoji: isDay ? '⛅' : '🌙',
    windSpeedKmh: 12,
    isDay,
    weatherCode: 1,
    locationName: coords.name,
    source: 'calibrated_realtime',
  };

  weatherCache[sid] = { data: fallback, expiresAt: now + 5 * 60 * 1000 };
  return fallback;
}
