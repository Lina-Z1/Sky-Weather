const API_KEY = import.meta.env.VITE_API_KEY;
const BASE_URL = import.meta.env.VITE_WEATHER_URL;


export async function fetchWeather(city) {
    const res = await fetch(
        `${BASE_URL}/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`
    );
    if (!res.ok) throw new Error("City not found");
    return res.json();
}

export async function fetchForecast(city) {
    const res = await fetch(
        `${BASE_URL}/forecast?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`
    );
    if (!res.ok) throw new Error("Forecast unavailable");
    return res.json();
}

/**/
export async function fetchWeatherByCoords(lat, lon) {
    const res = await fetch(
        `${BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
    );
    if (!res.ok) throw new Error("Location unavailable");
    return res.json();
}

export async function fetchForecastByCoords(lat, lon) {
    const res = await fetch(
        `${BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
    );
    if (!res.ok) throw new Error("Forecast unavailable");
    return res.json();
}