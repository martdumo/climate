import requests
from datetime import datetime
from collections import defaultdict

# Coordenadas precisas de Martínez, San Isidro, Buenos Aires, Argentina
LATITUDE = -34.4948079
LONGITUDE = -58.5164546
TIMEZONE = "America/Argentina/Buenos_Aires"

def obtener_clima_detallado():
    # ====================== 1. CLIMA (Forecast) ======================
    url_forecast = "https://api.open-meteo.com/v1/forecast"
    params_forecast = {
        "latitude": LATITUDE, "longitude": LONGITUDE,
        "current": "temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,showers,snowfall,weather_code,cloud_cover,pressure_msl,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m",
        "hourly": "temperature_2m,relative_humidity_2m,dew_point_2m,apparent_temperature,precipitation_probability,precipitation,rain,showers,snowfall,snow_depth,weather_code,pressure_msl,surface_pressure,cloud_cover,visibility,wind_speed_10m,wind_direction_10m,wind_gusts_10m,uv_index",
        "daily": "weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,sunrise,sunset,daylight_duration,uv_index_max,precipitation_sum,precipitation_probability_max,wind_speed_10m_max,wind_gusts_10m_max,wind_direction_10m_dominant",
        "timezone": TIMEZONE, "forecast_days": 7
    }
    data = requests.get(url_forecast, params=params_forecast).json()

    # ====================== 2. CALIDAD DEL AIRE ======================
    url_aq = "https://air-quality-api.open-meteo.com/v1/air-quality"
    params_aq = {
        "latitude": LATITUDE, "longitude": LONGITUDE,
        "hourly": "pm2_5,pm10,european_aqi",
        "timezone": TIMEZONE
    }
    response_aq = requests.get(url_aq, params=params_aq)
    data_aq = response_aq.json() if response_aq.status_code == 200 else None

    print("=== DATOS METEOROLÓGICOS DETALLADOS - MARTÍNEZ, SAN ISIDRO, BUENOS AIRES ===")
    print(f"Latitud: {LATITUDE} | Longitud: {LONGITUDE} | Zona horaria: {TIMEZONE}\n")

    # 1. Clima actual
    if "current" in data:
        current = data["current"]
        units = data.get("current_units", {})
        print("CLIMA ACTUAL")
        print("-" * 60)
        for key, value in current.items():
            unit = units.get(key, "")
            print(f"{key.replace('_', ' ').title()}: {value} {unit}")
        print()

    # 2. Pronóstico horario (primeras 48 horas)
    if "hourly" in data:
        hourly = data["hourly"]
        units_hourly = data.get("hourly_units", {})
        print("PRONÓSTICO HORARIO (primeras 48 horas)")
        print("-" * 60)
        times = hourly.get("time", [])
        for i in range(min(48, len(times))):
            print(f"Hora: {times[i]}")
            for key in hourly:
                if key != "time" and i < len(hourly[key]):
                    val = hourly[key][i]
                    unit = units_hourly.get(key, "")
                    print(f"  • {key.replace('_', ' ').title()}: {val} {unit}")
            print("---")
        print()

    # 3. Pronóstico diario
    if "daily" in data:
        daily = data["daily"]
        units_daily = data.get("daily_units", {})
        print("PRONÓSTICO DIARIO (próximos 7 días)")
        print("-" * 60)
        times = daily.get("time", [])
        for i in range(len(times)):
            print(f"Día: {times[i]}")
            for key in daily:
                if key != "time" and i < len(daily[key]):
                    val = daily[key][i]
                    unit = units_daily.get(key, "")
                    print(f"  • {key.replace('_', ' ').title()}: {val} {unit}")
            print("---")

    # ====================== 4. RECOMENDACIONES PARA CORRER (por día) ======================
    print("\n=== RECOMENDACIONES PARA SALIR A CORRER ===")
    print("Criterios (priorizando alergias/rinitis):")
    print("• Temp 14-23 °C | Humedad 40-75 % | Lluvia <25 % | UV <5")
    print("• Viento 5-18 km/h | Código WMO 0-3 | AQI <50 ideal")
    print("• Polen: solo disponible en Europa (no aplica en Argentina)\n")

    if "hourly" not in data:
        print("No se pudieron generar recomendaciones.")
        return

    hourly = data["hourly"]
    times = hourly.get("time", [])

    # Calidad del aire por hora (manejo seguro de None)
    aq_by_time = {}
    if data_aq and "hourly" in data_aq:
        aq_times = data_aq["hourly"].get("time", [])
        aqi_list = data_aq["hourly"].get("european_aqi", [])
        pm25_list = data_aq["hourly"].get("pm2_5", [])
        for idx, t in enumerate(aq_times):
            aqi_val = aqi_list[idx] if idx < len(aqi_list) else None
            pm25_val = pm25_list[idx] if idx < len(pm25_list) else None
            aq_by_time[t] = {
                "european_aqi": aqi_val if aqi_val is not None else 0,
                "pm2_5": pm25_val if pm25_val is not None else 0
            }

    recommendations = []
    current_time_str = data.get("current", {}).get("time")
    try:
        current_dt = datetime.strptime(current_time_str, "%Y-%m-%dT%H:%M")
    except:
        current_dt = datetime.now()

    for i in range(len(times)):
        time_str = times[i]
        try:
            hour_dt = datetime.strptime(time_str, "%Y-%m-%dT%H:%M")
            if hour_dt <= current_dt:
                continue
        except:
            continue

        temp = hourly.get("temperature_2m", [0])[i]
        hum = hourly.get("relative_humidity_2m", [0])[i]
        precip_prob = hourly.get("precipitation_probability", [0])[i]
        uv = hourly.get("uv_index", [0])[i]
        wind = hourly.get("wind_speed_10m", [0])[i]
        gust = hourly.get("wind_gusts_10m", [0])[i]
        weather_code = hourly.get("weather_code", [0])[i]
        vis = hourly.get("visibility", [24140])[i]

        aq = aq_by_time.get(time_str, {})
        aqi = aq.get("european_aqi", 0)
        pm25 = aq.get("pm2_5", 0)

        # Puntuación (máximo ~165)
        score = 0
        if 14 <= temp <= 23: score += 40
        elif 10 <= temp < 14 or 23 < temp <= 26: score += 20
        if 40 <= hum <= 75: score += 25
        elif hum > 85: score -= 20
        if precip_prob < 20: score += 30
        elif precip_prob < 40: score += 10
        else: score -= 30
        if uv < 3: score += 15
        elif uv < 5: score += 5
        else: score -= 20
        if 5 <= wind <= 18: score += 15
        elif wind < 5: score += 5
        else: score -= 10
        if gust > 30: score -= 15
        if weather_code in [0, 1, 2, 3]: score += 15
        elif weather_code >= 80: score -= 40
        if vis < 10000: score -= 10
        if aqi < 50: score += 20
        elif aqi < 100: score += 5
        else: score -= 25

        day_str = time_str[:10]
        recommendations.append({
            "hora": time_str, "dia": day_str, "temp": temp, "hum": hum,
            "precip_prob": precip_prob, "uv": uv, "viento": wind, "gusts": gust,
            "weather_code": weather_code, "aqi": aqi, "pm25": pm25, "score": score
        })

    # Agrupar por día
    rec_by_day = defaultdict(list)
    for rec in recommendations:
        rec_by_day[rec["dia"]].append(rec)

    for day in sorted(rec_by_day.keys()):
        print(f"\n=== {day} ===")
        print("Nota: Datos de polen no disponibles en Argentina (solo Europa)")
        
        day_recs = rec_by_day[day]
        day_recs.sort(key=lambda x: x["score"], reverse=True)
        
        print("{:<19} | {:<7} | {:<8} | {:<9} | {:<6} | {:<12} | {:<8} | {:<8} | {:<6} | {:<12}".format(
            "Hora", "Temp °C", "Hum %", "Lluvia %", "UV", "Viento km/h", "Ráfagas", "Cód.WMO", "AQI", "Puntuación"
        ))
        print("-" * 130)
        
        shown = 0
        for rec in day_recs:
            if shown >= 6 or rec["score"] < 60:
                break
            print("{:<19} | {:<7.1f} | {:<8} | {:<9} | {:<6.1f} | {:<12.1f} | {:<8.1f} | {:<8} | {:<6} | {:<12}".format(
                rec["hora"][11:], rec["temp"], rec["hum"], rec["precip_prob"], rec["uv"],
                rec["viento"], rec["gusts"], rec["weather_code"], rec["aqi"], rec["score"]
            ))
            shown += 1

    print("\nFin de los datos. Ejecute nuevamente para actualizar.")

if __name__ == "__main__":
    obtener_clima_detallado()