import { useState, useEffect } from "react";
import { fetchWeather, fetchForecast, fetchWeatherByCoords, fetchForecastByCoords } from "./services/API";
import "./App.css";

const weatherEmojis = {
  Thunderstorm: "/thunderstorm.gif",
  Drizzle: "/drizzle.gif",
  Rain: "/rain.gif",
  Snow: "/snow.gif",
  Mist: "/mist.gif",
  Fog: "/clouds.gif",
  Haze: "/mist.gif",
  Clear: "/clear.gif",
  Clouds: "/clouds.gif",
};

const windDirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
const windArrows = ["↑", "↗", "→", "↘", "↓", "↙", "←", "↖"];

function getWindDir(deg) {
  const i = Math.round(deg / 45) % 8;
  return { dir: windDirs[i], arrow: windArrows[i] };
}

function parseDailyForecast(list) {
  const days = {};
  list.forEach((item) => {
    const date = item.dt_txt.split(" ")[0];
    const hour = item.dt_txt.split(" ")[1];
    if (!days[date]) days[date] = item;
    if (hour === "12:00:00") days[date] = item;
  });
  const all = Object.values(days);
  return all.slice(0, 6);
}

export default function App() {
  const [city, setCity] = useState("Amman");
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [time, setTime] = useState(new Date());


  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    function fitToScreen() {
      const content = document.querySelector('.content');
      if (!content || window.innerWidth < 768) return;
      const scale = Math.min(
        window.innerWidth / content.scrollWidth,
        window.innerHeight / content.scrollHeight
      );
      document.documentElement.style.setProperty('--content-scale', Math.min(scale, 1));
    }

    fitToScreen();
    window.addEventListener('resize', fitToScreen);
    return () => window.removeEventListener('resize', fitToScreen);
  }, [weather, forecast]);


  useEffect(() => {
    loadWeather(city);
  }, []);

  async function loadWeather(cityName) {
    if (!cityName.trim()) return;
    setLoading(true);
    setError("");
    try {
      const [weatherData, forecastData] = await Promise.all([
        fetchWeather(cityName),
        fetchForecast(cityName),
      ]);
      setWeather(weatherData);
      setForecast(parseDailyForecast(forecastData.list));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleSearch() {
    window.scrollTo({ top: 0, behavior: "smooth" });
    loadWeather(city);
  }

  async function handleGeolocate() {
    if (!navigator.geolocation) {
      setError("Geolocation not supported by your browser");
      return;
    }
    setLoading(true);
    setError("");
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const [weatherData, forecastData] = await Promise.all([
            fetchWeatherByCoords(coords.latitude, coords.longitude),
            fetchForecastByCoords(coords.latitude, coords.longitude),
          ]);
          setWeather(weatherData);
          setCity(weatherData.name);
          setForecast(parseDailyForecast(forecastData.list));
          window.scrollTo({ top: 0, behavior: "smooth" });
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      },
      () => {
        setError("Permission denied — please allow location access");
        setLoading(false);
      }
    );
  }

  const w = weather;
  const main = w?.weather[0]?.main;
  const temp = w ? Math.round(w.main.temp) : null;
  const feels = w ? Math.round(w.main.feels_like) : null;
  const windSpeed = w ? Math.round(w.wind.speed * 3.6) : null;
  const windInfo = w ? getWindDir(w.wind.deg || 0) : {};
  const visibility = w?.visibility ? (w.visibility / 1000).toFixed(1) : "—";

  return (
    <div className="weather-app">
      <div className="overlay" />
      <div className="content container-fluid py-3 px-3 px-md-4">

        <div className="row g-3 mb-3">


          <div className="col-12 col-md-5 col-lg-6">
            <div className="bento-item bento-tall glass h-100">


              <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start mb-2 gap-1">
                <div className="city-name">
                  {w ? `${w.name}, ${w.sys.country}` : "Search a city"}
                </div>
                <div className="text-sm-end">
                  <div className="stat-label text-light">
                    {time.toLocaleDateString("en-GB", {
                      weekday: "short", day: "numeric", month: "short",
                    })}
                  </div>
                  <div className="stat-label text-light">
                    {time.toLocaleTimeString("en-GB", {
                      hour: "2-digit", minute: "2-digit", second: "2-digit",
                    })}
                  </div>
                </div>
              </div>


              <div className="d-flex flex-wrap align-items-center gap-3 my-2" style={{ overflow: "hidden" }}>
                <img
                  src={weatherEmojis[main] || "/clear.gif"}
                  alt={main || "weather"}
                  style={{ width: "100px", height: "100px", objectFit: "contain", flexShrink: 0 }}
                />
                <div style={{ minWidth: 0 }}>
                  <div className="weather-desc">
                    {w?.weather[0]?.description || "—"}
                  </div>
                  <div className="feels-like">
                    Feels like {feels !== null ? `${feels}°C` : "—"}
                  </div>
                </div>
                <div className="d-flex flex-column flex-sm-row align-items-center align-items-sm-baseline gap-2 gap-sm-4 mt-2 mt-sm-0">
                  <div className="temp-display">
                    {temp !== null ? `${temp}°` : "—°"}
                  </div>
                  <div className="d-flex flex-row align-items-baseline gap-1">
                    <span className="minmax-badge minmax-low">
                      <span className="minmax-val">{w ? Math.round(w.main.temp_min) : "—"}°</span>
                    </span>
                    <span style={{ color: "rgba(255,255,255,0.35)", fontSize: "22px" }}>/</span>
                    <span className="minmax-badge minmax-high">
                      <span className="minmax-val">{w ? Math.round(w.main.temp_max) : "—"}°</span>
                    </span>
                  </div>
                </div>
              </div>


              {w && (
                <div className="d-flex gap-3 mt-2">
                  <div className="sunrise-sunset">
                    <span>sunrise :</span>
                    <span>{new Date(w.sys.sunrise * 1000).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}</span>
                  </div>
                  <div className="sunrise-sunset">
                    <span>sunset :</span>
                    <span>{new Date(w.sys.sunset * 1000).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}</span>
                  </div>
                </div>
              )}

            </div>
          </div>


          <div className="col-12 col-md-7 col-lg-6">
            <div className="row g-3 h-100">

              <div className="col-12">
                <div className="glass p-3">
                  <div className="d-flex gap-2">
                    <input
                      className="search-input flex-grow-1"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                      placeholder="Search city..."
                      aria-label="City search"
                    />
                    <button
                      className="search-btn"
                      onClick={handleSearch}
                      disabled={loading}
                      aria-label="Search"
                    >
                      {loading ? "..." : <i className="bi bi-search" />}
                    </button>
                    <button
                      className="search-btn"
                      onClick={handleGeolocate}
                      disabled={loading}
                      title="Use my location"
                      aria-label="Use my location"
                    >
                      <i className="bi bi-geo-alt-fill" />
                    </button>
                  </div>
                  {error && <div className="error-msg mt-2">⚠️ {error}</div>}
                </div>
              </div>


              <div className="col-6">
                <div className="bento-item glass h-100">
                  <div className="stat-label">Wind</div>
                  <div className="stat-value" style={{ fontSize: "20px" }}>
                    {windInfo.arrow} {windSpeed ?? "—"}
                    <span className="stat-unit"> km/h</span>
                  </div>
                  <div className="feels-like">{windInfo.dir ?? "—"} wind</div>
                </div>
              </div>


              <div className="col-6">
                <div className="bento-item glass h-100">
                  <div className="stat-label">Pressure</div>
                  <div className="stat-value" style={{ fontSize: "20px" }}>
                    {w?.main.pressure ?? "—"}
                    <span className="stat-unit"> hPa</span>
                  </div>
                </div>
              </div>


              <div className="col-6">
                <div className="bento-item glass h-100">
                  <div className="stat-label">Visibility</div>
                  <div className="stat-value" style={{ fontSize: "20px" }}>
                    {visibility}
                    <span className="stat-unit"> km</span>
                  </div>
                </div>
              </div>


              <div className="col-6">
                <div className="bento-item glass h-100">
                  <div className="stat-label">Humidity</div>
                  <div className="stat-value" style={{ fontSize: "20px" }}>
                    {w?.main.humidity ?? "—"}
                    <span className="stat-unit">%</span>
                  </div>
                  <div className="humidity-bar mt-2">
                    <div style={{ width: `${w?.main.humidity ?? 0}%` }} />
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>


        {forecast.length > 0 && (
          <div className="row g-3 mb-3">
            {forecast.map((day) => {
              const dayMain = day.weather[0].main;
              const dayTemp = Math.round(day.main.temp);
              const dayMin = Math.round(day.main.temp_min);
              const dayMax = Math.round(day.main.temp_max);
              const dayName = new Date(day.dt_txt).toLocaleDateString("en-GB", {
                weekday: "short",
              });
              return (
                <div className="col-6 col-sm-4 col-md" key={day.dt}>
                  <div className="bento-item glass text-center h-100">
                    <div className="forecast-day mb-1">{dayName}</div>
                    <img
                      src={weatherEmojis[dayMain] || "/clear.gif"}
                      alt={dayMain}
                      style={{ width: "48px", height: "48px", objectFit: "contain" }}
                    />
                    <div className="forecast-temp mt-1">{dayTemp}°</div>
                    <div className="forecast-range">{dayMin}° / {dayMax}°</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}