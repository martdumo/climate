# A TROTAR 🏃‍♂️

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Astro](https://img.shields.io/badge/Astro-BC52EE?style=for-the-badge&logo=astro&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Netlify](https://img.shields.io/badge/Netlify-00C7C7?style=for-the-badge&logo=netlify&logoColor=white)

---

## Descripción

**A TROTAR** es una aplicación web que te ayuda a encontrar los mejores momentos para salir a trotar/correr al aire libre, basándose en las condiciones climáticas actuales y forecasted junto con la calidad del aire.

La aplicación prioriza a personas con alergias/rinitis, evaluando múltiples factores como temperatura, humedad, probabilidad de lluvia, UV, viento, y calidad del aire (AQI, PM2.5) para recomendar las horas óptimas de entrenamiento.

---

## Características

- 🎯 **Motor de recomendaciones personalizado** - Algoritmo de scoring que evalúa cada hora futura
- 🎨 **Estética brutalista** - Diseño minimalista inspirado en paneles de control industriales
- 🌤️ **Clima actual y forecast de 7 días** - Datos de Open-Meteo API
- 🌬️ **Calidad del aire** - AQI y PM2.5 cuando está disponible
- 📍 **Geolocalización automática** - Usa tu ubicación actual o busca ciudades
- 📱 **Diseño responsive** - Funciona en móvil y desktop
- 🎨 **Estética brutalista** - Diseño minimalista inspirado en paneles de control industriales

---

## Tecnologías Utilizadas

- **Astro** - Framework web moderno
- **React** - Componentes interactivos
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Estilos utility-first
- **Open-Meteo API** - Datos climáticos gratuitos
- **Netlify** - Despliegue

---

## Instalación

```bash
# Clonar el repositorio
git clone <repo-url>

# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev

# Construir para produccion
npm run build
```

---

## Estructura del Proyecto

```
web-app/
├── src/
│   ├── components/
│   │   ├── App.tsx              # Componente principal (orchestrator)
│   │   ├── LocationManager.tsx  # Gestion de ubicacion
│   │   └── RunRecommendations.tsx # Visualizacion de datos
│   ├── layouts/
│   │   └── Layout.astro       # Layout base
│   ├── pages/
│   │   └── index.astro       # Pagina principal
│   ├── services/
│   │   └── weatherService.ts  # Fetching de APIs
│   ├── styles/
│   │   └── global.css       # Estilos globales
│   └── utils/
│       └── scoringAlgorithm.ts # Lógica de recommendations
├── astro.config.mjs
├── package.json
└── tailwind.config.mjs
```

---

## API Reference

### Open-Meteo Weather API

```http
GET https://api.open-meteo.com/v1/forecast
  ?latitude={lat}
  &longitude={lon}
  &timezone={timezone}
  &forecast_days=7
  &current=temperature_2m,relative_humidity_2m,...
  &hourly=temperature_2m,relative_humidity_2m,...
```

### Open-Meteo Air Quality API

```http
GET https://air-quality-api.open-meteo.com/v1/air-quality
  ?latitude={lat}
  &longitude={lon}
  &timezone={timezone}
  &hourly=pm2_5,pm10,european_aqi
```

### Open-Meteo Geocoding API

```http
GET https://geocoding-api.open-meteo.com/v1/search
  ?name={ciudad}
  &count=5
  &language=es
  &format=json
```

---

## Algoritmo de Scoring

El algoritmo evalúa cada hora futura con los siguientes criterios:

| Factor | Condicion | Puntos |
|--------|----------|-------|
| Temperatura | 14-23°C | +40 |
| Temperatura | 10-13.9°C o 23.1-26°C | +20 |
| Humedad | 40-75% | +25 |
| Humedad | >85% | -20 |
| Lluvia | <20% | +30 |
| Lluvia | <40% | +10 |
| Lluvia | >=40% | -30 |
| UV | <3 | +15 |
| UV | <5 | +5 |
| UV | >=5 | -20 |
| Viento | 5-18 km/h | +15 |
| Viento | <5 km/h | +5 |
| Viento | >18 km/h | -10 |
| Ráfagas | >30 km/h | -15 |
| Weather Code | 0,1,2,3 | +15 |
| Weather Code | >=80 | -40 |
| Visibilidad | <10000m | -10 |
| AQI | <50 | +20 |
| AQI | <100 | +5 |
| AQI | >=100 | -25 |

**Nota:** Si AQI = 0 (datos no disponibles), se otorgan +20 puntos por defecto.

---

## Limitaciones

- ⚠️ **Datos de polen** - No disponibles en la región
- ⚠️ **AQI** - Puede no estar disponible en Argentina y otras regiones LATAM
- 🌐 **Geolocalización** - Requiere permisos del navegador

---

## Despliegue

La aplicación está configurada para desplegarse en Netlify:

```bash
# Instalar Netlify CLI
npm install -g netlify-cli

# Desplegar
netlify deploy --prod
```

O conecta tu repositorio directamente en [Netlify](https://netlify.com).

---

## Creditos

**Desarrollado por:** Martín Alfredo Dumont  
**Todos los derechos reservados.**

---

## Licencia

MIT