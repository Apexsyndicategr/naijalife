/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type WeatherCategory =
  | 'sunny'
  | 'cloudy'
  | 'rain'
  | 'heavy_rain'
  | 'thunderstorm'
  | 'fog'
  | 'windy'
  | 'snow';

// Coordinates & timezone for all Nigerian states + Canada for real-time live weather tracking
export const STATE_COORDINATES: Record<
  string,
  { lat: number; lon: number; name: string; tz: string }
> = {
  lagos: { lat: 6.5244, lon: 3.3792, name: 'Lagos', tz: 'Africa/Lagos' },
  fct: { lat: 9.0765, lon: 7.3986, name: 'Abuja FCT', tz: 'Africa/Lagos' },
  fct_abuja: { lat: 9.0765, lon: 7.3986, name: 'Abuja FCT', tz: 'Africa/Lagos' },
  abuja: { lat: 9.0765, lon: 7.3986, name: 'Abuja FCT', tz: 'Africa/Lagos' },
  canada: { lat: 43.6532, lon: -79.3832, name: 'Toronto, Canada', tz: 'America/Toronto' },
  imo: { lat: 5.485, lon: 7.035, name: 'Imo (Owerri)', tz: 'Africa/Lagos' },
  rivers: { lat: 4.8156, lon: 7.0498, name: 'Rivers (Port Harcourt)', tz: 'Africa/Lagos' },
  kano: { lat: 12.0022, lon: 8.592, name: 'Kano', tz: 'Africa/Lagos' },
  oyo: { lat: 7.3775, lon: 3.947, name: 'Oyo (Ibadan)', tz: 'Africa/Lagos' },
  enugu: { lat: 6.4584, lon: 7.5464, name: 'Enugu', tz: 'Africa/Lagos' },
  delta: { lat: 6.1982, lon: 6.7329, name: 'Delta (Asaba)', tz: 'Africa/Lagos' },
  kaduna: { lat: 10.5105, lon: 7.4165, name: 'Kaduna', tz: 'Africa/Lagos' },
  plateau: { lat: 9.8965, lon: 8.8583, name: 'Plateau (Jos)', tz: 'Africa/Lagos' },
  akwa_ibom: { lat: 5.0377, lon: 7.9128, name: 'Akwa Ibom (Uyo)', tz: 'Africa/Lagos' },
  anambra: { lat: 6.2209, lon: 7.0723, name: 'Anambra (Awka)', tz: 'Africa/Lagos' },
  ogun: { lat: 7.1557, lon: 3.3451, name: 'Ogun (Abeokuta)', tz: 'Africa/Lagos' },
  edo: { lat: 6.335, lon: 5.6037, name: 'Edo (Benin City)', tz: 'Africa/Lagos' },
  borno: { lat: 11.8333, lon: 13.15, name: 'Borno (Maiduguri)', tz: 'Africa/Lagos' },
  sokoto: { lat: 13.0609, lon: 5.2476, name: 'Sokoto', tz: 'Africa/Lagos' },
  cross_river: { lat: 4.9757, lon: 8.3417, name: 'Cross River (Calabar)', tz: 'Africa/Lagos' },
  benue: { lat: 7.7321, lon: 8.5391, name: 'Benue (Makurdi)', tz: 'Africa/Lagos' },
  kwara: { lat: 8.4966, lon: 4.5421, name: 'Kwara (Ilorin)', tz: 'Africa/Lagos' },
  ondo: { lat: 7.2571, lon: 5.2058, name: 'Ondo (Akure)', tz: 'Africa/Lagos' },
  osun: { lat: 7.7827, lon: 4.5418, name: 'Osun (Osogbo)', tz: 'Africa/Lagos' },
  ekiti: { lat: 7.6214, lon: 5.2215, name: 'Ekiti (Ado-Ekiti)', tz: 'Africa/Lagos' },
  abia: { lat: 5.526, lon: 7.4896, name: 'Abia (Umuahia)', tz: 'Africa/Lagos' },
  ebonyi: { lat: 6.3249, lon: 8.1137, name: 'Ebonyi (Abakaliki)', tz: 'Africa/Lagos' },
  kogi: { lat: 7.8023, lon: 6.7333, name: 'Kogi (Lokoja)', tz: 'Africa/Lagos' },
  nasarawa: { lat: 8.4932, lon: 8.5153, name: 'Nasarawa (Lafia)', tz: 'Africa/Lagos' },
  niger: { lat: 9.6139, lon: 6.5569, name: 'Niger (Minna)', tz: 'Africa/Lagos' },
  adamawa: { lat: 9.2094, lon: 12.4818, name: 'Adamawa (Yola)', tz: 'Africa/Lagos' },
  bauchi: { lat: 10.3158, lon: 9.8442, name: 'Bauchi', tz: 'Africa/Lagos' },
  gombe: { lat: 10.2897, lon: 11.1673, name: 'Gombe', tz: 'Africa/Lagos' },
  taraba: { lat: 8.8937, lon: 11.3614, name: 'Taraba (Jalingo)', tz: 'Africa/Lagos' },
  yobe: { lat: 11.747, lon: 11.9608, name: 'Yobe (Damaturu)', tz: 'Africa/Lagos' },
  jigawa: { lat: 11.7583, lon: 9.3389, name: 'Jigawa (Dutse)', tz: 'Africa/Lagos' },
  katsina: { lat: 12.9908, lon: 7.6018, name: 'Katsina', tz: 'Africa/Lagos' },
  kebbi: { lat: 12.4539, lon: 4.1975, name: 'Kebbi (Birnin Kebbi)', tz: 'Africa/Lagos' },
  zamfara: { lat: 12.1628, lon: 6.6614, name: 'Zamfara (Gusau)', tz: 'Africa/Lagos' },
  bayelsa: { lat: 4.9267, lon: 6.2676, name: 'Bayelsa (Yenagoa)', tz: 'Africa/Lagos' },
};

export interface LiveWeatherData {
  temperatureC: number;
  conditionLabel: string;
  conditionEmoji: string;
  weatherType: WeatherCategory;
  windSpeedKmh: number;
  cloudCoverPct: number;
  humidityPct: number;
  precipitationMm: number;
  isDay: boolean;
  weatherCode: number;
  locationName: string;
  timezone: string;
  source: 'live_open_meteo' | 'calibrated_realtime';
}

const weatherCache: Record<string, { data: LiveWeatherData; expiresAt: number }> = {};

export function interpretWmoWeather(params: {
  code: number;
  isDay: boolean;
  windSpeedKmh: number;
  cloudCoverPct?: number;
  precipitationMm?: number;
  temperatureC?: number;
  isCanada?: boolean;
}): {
  weatherType: WeatherCategory;
  conditionLabel: string;
  conditionEmoji: string;
} {
  const {
    code,
    isDay,
    windSpeedKmh,
    cloudCoverPct = 25,
    precipitationMm = 0,
    temperatureC = 28,
    isCanada = false,
  } = params;

  // Snow codes (WMO 71-77, 85-86) or sub-zero precip
  if (
    (code >= 71 && code <= 77) ||
    code === 85 ||
    code === 86 ||
    (isCanada && temperatureC <= 1 && precipitationMm > 0)
  ) {
    return {
      weatherType: 'snow',
      conditionLabel: code === 75 || code === 86 ? 'Heavy Snow' : 'Snowfall',
      conditionEmoji: '❄️',
    };
  }

  // Thunderstorms (WMO 95-99)
  if (code >= 95) {
    return {
      weatherType: 'thunderstorm',
      conditionLabel: 'Thunderstorm',
      conditionEmoji: '⛈️',
    };
  }

  // Heavy rain / heavy showers (WMO 65, 82 or high precip)
  if (code === 65 || code === 82 || precipitationMm >= 5) {
    return {
      weatherType: 'heavy_rain',
      conditionLabel: 'Heavy Rain',
      conditionEmoji: '🌧️',
    };
  }

  // Light/moderate rain, drizzle, showers (WMO 51-64, 80-81)
  if ((code >= 51 && code <= 64) || code === 80 || code === 81 || precipitationMm > 0.1) {
    return {
      weatherType: 'rain',
      conditionLabel: code <= 55 ? 'Light Rain' : 'Rain Showers',
      conditionEmoji: '🌦️',
    };
  }

  // Fog / Harmattan Haze (WMO 45, 48)
  if (code === 45 || code === 48) {
    return {
      weatherType: 'fog',
      conditionLabel: isCanada ? 'Dense Fog' : 'Fog / Harmattan Haze',
      conditionEmoji: '🌫️',
    };
  }

  // High winds without storm
  if (windSpeedKmh >= 28) {
    return {
      weatherType: 'windy',
      conditionLabel: 'Windy',
      conditionEmoji: '💨',
    };
  }

  // Overcast / cloudy (WMO 2, 3 or >55% clouds)
  if (code === 3 || code === 2 || cloudCoverPct >= 60) {
    return {
      weatherType: 'cloudy',
      conditionLabel: code === 3 || cloudCoverPct >= 80 ? 'Cloudy Overcast' : 'Partly Cloudy',
      conditionEmoji: code === 3 || cloudCoverPct >= 80 ? '☁️' : isDay ? '⛅' : '☁️',
    };
  }

  // Clear / Mostly clear (WMO 0, 1)
  if (code === 1) {
    return {
      weatherType: 'sunny',
      conditionLabel: isDay ? 'Mostly Sunny' : 'Clear Night',
      conditionEmoji: isDay ? '🌤️' : '🌙',
    };
  }

  return {
    weatherType: 'sunny',
    conditionLabel: isDay ? 'Sunny' : 'Clear Night',
    conditionEmoji: isDay ? '☀️' : '🌙',
  };
}

export function getLocationLocalHourDecimal(timezone: string): number {
  try {
    const now = new Date();
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      hour: 'numeric',
      minute: 'numeric',
      hour12: false,
    }).formatToParts(now);
    const h = Number(parts.find((p) => p.type === 'hour')?.value ?? '12') % 24;
    const m = Number(parts.find((p) => p.type === 'minute')?.value ?? '0');
    return h + m / 60;
  } catch {
    const utcH = new Date().getUTCHours();
    return (utcH + (timezone === 'America/Toronto' ? 19 : 1)) % 24;
  }
}

export async function fetchRealLifeWeather(stateId: string): Promise<LiveWeatherData> {
  const sid = stateId?.toLowerCase() || 'lagos';
  const coords = STATE_COORDINATES[sid] || STATE_COORDINATES.lagos;
  const now = Date.now();
  const isCanada = sid === 'canada';

  if (weatherCache[sid] && weatherCache[sid].expiresAt > now) {
    return weatherCache[sid].data;
  }

  // 1. Try local Express backend proxy /api/weather first (avoids client CORS/blocking)
  try {
    const proxyRes = await fetch(`/api/weather?stateId=${encodeURIComponent(sid)}`, {
      cache: 'no-cache',
    });
    if (proxyRes.ok) {
      const json = await proxyRes.json();
      if (json && json.ok) {
        const temp = Math.round(Number(json.temperatureC ?? 27));
        const wind = Math.round(Number(json.windSpeedKmh ?? 10));
        const cloud = Math.round(Number(json.cloudCoverPct ?? 25));
        const precip = Number(json.precipitationMm ?? 0);
        const code = Number(json.weatherCode ?? 0);
        const isDay = Boolean(json.isDay);
        const interpreted = interpretWmoWeather({
          code,
          isDay,
          windSpeedKmh: wind,
          cloudCoverPct: cloud,
          precipitationMm: precip,
          temperatureC: temp,
          isCanada,
        });
        const data: LiveWeatherData = {
          temperatureC: temp,
          conditionLabel: interpreted.conditionLabel,
          conditionEmoji: interpreted.conditionEmoji,
          weatherType: interpreted.weatherType,
          windSpeedKmh: wind,
          cloudCoverPct: cloud,
          humidityPct: Math.round(Number(json.humidityPct ?? 72)),
          precipitationMm: precip,
          isDay,
          weatherCode: code,
          locationName: coords.name,
          timezone: coords.tz,
          source: 'live_open_meteo',
        };
        weatherCache[sid] = { data, expiresAt: now + 10 * 60 * 1000 };
        return data;
      }
    }
  } catch {
    // Fall through to direct Open-Meteo request
  }

  // 2. Direct Open-Meteo client request fallback
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&current=temperature_2m,relative_humidity_2m,is_day,precipitation,weather_code,cloud_cover,wind_speed_10m&timezone=${encodeURIComponent(coords.tz)}`;
    const res = await fetch(url, { cache: 'no-cache' });
    if (res.ok) {
      const json = await res.json();
      const cur = json.current;
      if (cur) {
        const temp = Math.round(Number(cur.temperature_2m ?? 27));
        const wind = Math.round(Number(cur.wind_speed_10m ?? 10));
        const cloud = Math.round(Number(cur.cloud_cover ?? 25));
        const precip = Number(cur.precipitation ?? 0);
        const code = Number(cur.weather_code ?? 0);
        const isDay = Number(cur.is_day ?? 1) === 1;
        const interpreted = interpretWmoWeather({
          code,
          isDay,
          windSpeedKmh: wind,
          cloudCoverPct: cloud,
          precipitationMm: precip,
          temperatureC: temp,
          isCanada,
        });
        const data: LiveWeatherData = {
          temperatureC: temp,
          conditionLabel: interpreted.conditionLabel,
          conditionEmoji: interpreted.conditionEmoji,
          weatherType: interpreted.weatherType,
          windSpeedKmh: wind,
          cloudCoverPct: cloud,
          humidityPct: Math.round(Number(cur.relative_humidity_2m ?? 72)),
          precipitationMm: precip,
          isDay,
          weatherCode: code,
          locationName: coords.name,
          timezone: coords.tz,
          source: 'live_open_meteo',
        };
        weatherCache[sid] = { data, expiresAt: now + 10 * 60 * 1000 };
        return data;
      }
    }
  } catch (err) {
    console.warn('Real-time weather API fetch error, using calibrated seasonal climate:', err);
  }

  // 3. Deterministic seasonal climate calibration (never random) based on location latitude, month & real local hour
  const localHour = getLocationLocalHourDecimal(coords.tz);
  const isDay = localHour >= 6.2 && localHour < 18.8;
  const month = new Date().getUTCMonth(); // 0..11
  const isNorthernNigeria = !isCanada && coords.lat > 9.5;
  const isCanadaWinter = isCanada && (month <= 2 || month === 11);

  let baseTemp = isCanada ? (isCanadaWinter ? -2 : 16) : isNorthernNigeria ? 32 : 28;
  if (!isDay) baseTemp -= 5;

  const fallbackCode = isCanadaWinter ? 3 : isNorthernNigeria ? 0 : 2;
  const interpreted = interpretWmoWeather({
    code: fallbackCode,
    isDay,
    windSpeedKmh: isCanada ? 16 : 11,
    cloudCoverPct: isCanadaWinter ? 75 : isNorthernNigeria ? 15 : 48,
    precipitationMm: 0,
    temperatureC: baseTemp,
    isCanada,
  });

  const fallback: LiveWeatherData = {
    temperatureC: baseTemp,
    conditionLabel: interpreted.conditionLabel,
    conditionEmoji: interpreted.conditionEmoji,
    weatherType: interpreted.weatherType,
    windSpeedKmh: isCanada ? 16 : 11,
    cloudCoverPct: isCanadaWinter ? 75 : isNorthernNigeria ? 15 : 48,
    humidityPct: isCanada ? 65 : isNorthernNigeria ? 32 : 76,
    precipitationMm: 0,
    isDay,
    weatherCode: fallbackCode,
    locationName: coords.name,
    timezone: coords.tz,
    source: 'calibrated_realtime',
  };

  weatherCache[sid] = { data: fallback, expiresAt: now + 5 * 60 * 1000 };
  return fallback;
}
