# ⚽ SaaS Betting Value Finder

Plataforma SaaS para detectar apuestas con valor ("value bets") en fútbol, basada en análisis estadístico y comparación con cuotas reales de bookmakers.

---

## 🚀 OBJETIVO DEL PROYECTO

Construir una aplicación SaaS que:

- Analiza partidos de fútbol
- Calcula probabilidades reales
- Compara con cuotas de casas de apuestas
- Detecta oportunidades de valor
- Muestra las mejores apuestas en un dashboard

---

## 🧱 ARQUITECTURA

### Backend

- Python + FastAPI
- SQLAlchemy (ORM)
- SQLite (desarrollo)

### Frontend

- Next.js
- TypeScript
- TailwindCSS

---

## 📊 DATA PIPELINE

### Fuentes de datos

- API-Football
- football-data.co.uk (futuro)

---

### Ligas actuales

- La Liga EA Sports (ID: 140)
- La Liga Hypermotion (ID: 141)

---

### Temporadas cargadas

- 2023
- 2024
- 2025 (actual)

---

## 🧠 FUNCIONAMIENTO

### 1. Recolección de datos

Fixtures:
/fixtures?league=140&season=2025

Odds:
/fixtures?league=140&season=2025

👉 Se almacenan en base de datos

---

### 2. Modelo de datos

#### Fixtures

- Equipos
- Fecha
- Resultado
- Liga
- Temporada

#### Odds

- Fixture ID
- Bookmaker
- Mercado (1X2, etc.)
- Outcome (home/draw/away)
- Cuota

---

### 3. Cálculo de estadísticas

Por equipo:

- Goles anotados promedio
- Goles concedidos promedio
- % Over 2.5
- % BTTS

---

### 4. Probabilidades

Modelo actual:
strength = goles marcados - goles encajados

Distribución:

- Home
- Draw (fijo 25%)
- Away

---

### 5. Cuotas teóricas

odds = 1 / probability

---

### 6. Best Bookmaker

Para cada partido:

- Se recogen todas las cuotas
- Se selecciona la mejor por mercado

Ejemplo:
Bet365 → 1.66
Betfair → 1.64

→ BEST: Bet365

---

### 7. Value Bet

Fórmula:
value = (probability \* bookmaker_odds) - 1

Interpretación:

- > 0 → apuesta con valor
- < 0 → evitar

---

## 🔌 ENDPOINTS

### Guardar fixtures

/fixtures/save/{league_id}/{season}

---

### Guardar odds

/odds/save/{league_id}/{season}

---

### Obtener value bets

/value-bets

---

## 🎨 FRONTEND

Dashboard que muestra:

- Partidos próximos
- Liga y fecha
- Mejores cuotas
- Bookmaker óptimo
- Value por mercado
- Probabilidades

---

## 🔐 MODELO FREEMIUM

### FREE

- Todos los partidos
- Solo mercado 1X2

### PREMIUM (futuro)

- Más mercados:
  - Over/Under
  - BTTS
  - Corners
  - Cards
- Estadísticas avanzadas

---

## ⚠️ LIMITACIONES ACTUALES

- Modelo probabilístico simple
- No se usan lesiones
- No se usan xG
- Odds no siempre disponibles para todos los partidos

---

## 🚀 ROADMAP

### Próximos pasos

- [ ] Mejorar modelo (home/away split)
- [ ] Añadir Over/Under 2.5
- [ ] Añadir BTTS
- [ ] Sistema de usuarios
- [ ] Suscripciones (Stripe)
- [ ] Alertas de value bets

---

## 🧠 FILOSOFÍA

El sistema no predice resultados.

👉 Detecta **errores en el mercado**

---

## 💰 VISIÓN

Convertirse en una herramienta de referencia para:

- apostadores profesionales
- tipsters
- traders deportivos

---

## ⚙️ DESARROLLO

### Backend

uvicorn app.main:app --reload

---

### Frontend

npm run dev

---

## 👨‍💻 AUTOR

Proyecto desarrollado como SaaS desde cero con enfoque en monetización real.
