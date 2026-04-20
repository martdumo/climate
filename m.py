import requests
from datetime import datetime
# requiere un pip install requests en el conda enviorment
# Coordenadas precisas de Martínez, San Isidro, Buenos Aires, Argentina
LATITUDE = -34.4948079
LONGITUDE = -58.5164546
TIMEZONE = "America/Argentina/Buenos_Aires"

def obtener_clima_detallado():
    url = "https://api.open-meteo.com/v1/forecast"
    
    # Parámetros exhaustivos para obtener el máximo de datos disponibles
    params = {
        "latitude": LATITUDE,
        "longitude": LONGITUDE,
        "current": "temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,showers,snowfall,weather_code,cloud_cover,pressure_msl,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m",
        "hourly": "temperature_2m,relative_humidity_2m,dew_point_2m,apparent_temperature,precipitation_probability,precipitation,rain,showers,snowfall,snow_depth,weather_code,pressure_msl,surface_pressure,cloud_cover,visibility,wind_speed_10m,wind_direction_10m,wind_gusts_10m,uv_index",
        "daily": "weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,sunrise,sunset,daylight_duration,uv_index_max,precipitation_sum,precipitation_probability_max,wind_speed_10m_max,wind_gusts_10m_max,wind_direction_10m_dominant",
        "timezone": TIMEZONE,
        "forecast_days": 7
    }
    
    response = requests.get(url, params=params)
    
    if response.status_code != 200:
        print(f"Error al obtener datos del clima. Código de estado: {response.status_code}")
        return
    
    data = response.json()
    
    print("=== DATOS METEOROLÓGICOS DETALLADOS - MARTÍNEZ, SAN ISIDRO, BUENOS AIRES ===")
    print(f"Latitud: {LATITUDE} | Longitud: {LONGITUDE} | Zona horaria: {TIMEZONE}\n")
    
    # 1. Clima actual
    if "current" in data:
        current = data["current"]
        units = data.get("current_units", {})
        print("CLIMA ACTUAL")
        print("-" * 50)
        for key, value in current.items():
            unit = units.get(key, "")
            print(f"{key.replace('_', ' ').title()}: {value} {unit}")
        print()
    
    # 2. Pronóstico horario (primeras 48 horas para mayor legibilidad en consola)
    if "hourly" in data:
        hourly = data["hourly"]
        units_hourly = data.get("hourly_units", {})
        print("PRONÓSTICO HORARIO (primeras 48 horas)")
        print("-" * 50)
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
        print("-" * 50)
        times = daily.get("time", [])
        for i in range(len(times)):
            print(f"Día: {times[i]}")
            for key in daily:
                if key != "time" and i < len(daily[key]):
                    val = daily[key][i]
                    unit = units_daily.get(key, "")
                    print(f"  • {key.replace('_', ' ').title()}: {val} {unit}")
            print("---")
    
    # 4. ANÁLISIS DE MEJORES HORAS PARA SALIR A CORRER (próximas 36 horas)
    print("\n=== RECOMENDACIONES PARA SALIR A CORRER ===")
    print("Criterios utilizados (priorizando alergias/rinitis y riesgos climáticos):")
    print("• Temperatura ideal: 14-23 °C (evitar frío extremo <12 °C o calor >25 °C)")
    print("• Humedad relativa: 40-75 % (evitar >85 % para reducir congestión nasal y riesgo de moho)")
    print("• Probabilidad de precipitación: <25 % (evitar lluvia que puede agravar síntomas)")
    print("• Índice UV: <5 (bajo-moderado para evitar daño solar)")
    print("• Viento: 5-18 km/h (evitar ráfagas >30 km/h o calma total)")
    print("• Código meteorológico: preferir 0-3 (claro/nublado); penalizar ≥80 (lluvia)")
    print("• Otros riesgos: baja visibilidad o nubosidad extrema\n")
    
    if "hourly" in data and "current" in data:
        hourly = data["hourly"]
        current_time_str = data["current"]["time"]
        
        # Parsear tiempo actual (formato Open-Meteo: YYYY-MM-DDTHH:MM)
        try:
            current_dt = datetime.strptime(current_time_str, "%Y-%m-%dT%H:%M")
        except ValueError:
            current_dt = datetime.now()  # fallback seguro
        
        times = hourly.get("time", [])
        recommendations = []
        
        for i in range(len(times)):
            time_str = times[i]
            try:
                hour_dt = datetime.strptime(time_str, "%Y-%m-%dT%H:%M")
                if hour_dt <= current_dt:
                    continue  # omitir horas pasadas
            except ValueError:
                continue
            
            # Extraer variables relevantes
            temp = hourly.get("temperature_2m", [0])[i]
            hum = hourly.get("relative_humidity_2m", [0])[i]
            precip_prob = hourly.get("precipitation_probability", [0])[i]
            uv = hourly.get("uv_index", [0])[i]
            wind = hourly.get("wind_speed_10m", [0])[i]
            gust = hourly.get("wind_gusts_10m", [0])[i]
            weather_code = hourly.get("weather_code", [0])[i]
            vis = hourly.get("visibility", [24140])[i]
            
            # Cálculo de puntuación (máximo teórico ~145)
            score = 0
            # Temperatura
            if 14 <= temp <= 23:
                score += 40
            elif 10 <= temp < 14 or 23 < temp <= 26:
                score += 20
            # Humedad (crítica para rinitis)
            if 40 <= hum <= 75:
                score += 25
            elif hum < 40:
                score += 10
            else:
                score -= 15
            # Precipitación
            if precip_prob < 20:
                score += 30
            elif precip_prob < 40:
                score += 10
            else:
                score -= 30
            # UV
            if uv < 3:
                score += 15
            elif uv < 5:
                score += 5
            else:
                score -= 20
            # Viento y ráfagas
            if 5 <= wind <= 18:
                score += 15
            elif wind < 5:
                score += 5
            else:
                score -= 10
            if gust > 30:
                score -= 15
            # Código meteorológico
            if weather_code in [0, 1, 2, 3]:
                score += 15
            elif weather_code >= 80:
                score -= 40
            # Visibilidad
            if vis < 10000:
                score -= 10
            
            recommendations.append({
                "hora": time_str,
                "temp": temp,
                "hum": hum,
                "precip_prob": precip_prob,
                "uv": uv,
                "viento": wind,
                "gusts": gust,
                "weather_code": weather_code,
                "score": score
            })
        
        # Ordenar por puntuación descendente y mostrar las 12 mejores
        recommendations.sort(key=lambda x: x["score"], reverse=True)
        
        print("{:<19} | {:<7} | {:<8} | {:<9} | {:<6} | {:<12} | {:<8} | {:<10} | {:<12}".format(
            "Hora (local)", "Temp °C", "Hum %", "Lluvia %", "UV", "Viento km/h", "Ráfagas", "Cód. WMO", "Puntuación"
        ))
        print("-" * 110)
        
        shown = 0
        for rec in recommendations:
            if shown >= 12 or rec["score"] < 50:  # solo horas con puntuación aceptable
                break
            print("{:<19} | {:<7.1f} | {:<8} | {:<9} | {:<6.1f} | {:<12.1f} | {:<8.1f} | {:<8} | {:<12}".format(
                rec["hora"], rec["temp"], rec["hum"], rec["precip_prob"], rec["uv"],
                rec["viento"], rec["gusts"], rec["weather_code"], rec["score"]
            ))
            shown += 1
        
        if shown == 0:
            print("No se encontraron horas con condiciones adecuadas en las próximas 36 horas.")
        else:
            print("\nNota: La puntuación es un indicador objetivo basado exclusivamente en los datos meteorológicos disponibles.")
            print("Las horas con puntuación > 90 se consideran óptimas. Siempre confirme el estado actual antes de salir.")
    
    print("\nFin de los datos meteorológicos. Ejecute el script nuevamente para actualizar.")

if __name__ == "__main__":
    obtener_clima_detallado()