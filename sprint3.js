const API_KEY = "2c9da9650103977f515ae888a6f0e077";
const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBttn");
const cityName = document.getElementById("cityName");
const temperature = document.getElementById("temperature");
const condition = document.getElementById("condition");
const humidity = document.getElementById("humidity");
const feelsLike = document.getElementById("feelsLike");
const windSpeed = document.getElementById("windSpeed");
const sunrise = document.getElementById("sunrise");
const sunset = document.getElementById("sunset");
const weatherIcon = document.getElementById("weatherIcon");
const errorMessage = document.getElementById("errorMessage");

function changeTheme(weather) {
  document.body.classList.remove(
    "sunny",
    "cloudy",
    "rainy",
    "storm",
    "snowy",
    "misty",
    "default-theme",
  );

  if (weather === "Clear") {
    document.body.classList.add("sunny");
  } else if (weather === "Clouds") {
    document.body.classList.add("cloudy");
  } else if (weather === "Rain" || weather === "Drizzle") {
    document.body.classList.add("rainy");
  } else if (weather === "Thunderstorm") {
    document.body.classList.add("storm");
  } else if (weather === "Snow") {
    document.body.classList.add("snowy");
  } else if (
    weather === "Mist" ||
    weather === "Fog" ||
    weather === "Haze" ||
    weather === "Smoke"
  ) {
    document.body.classList.add("misty");
  } else {
    document.body.classList.add("default-theme");
  }
}

function displayWeather(data) {
  cityName.textContent = data.name;
  temperature.textContent = `${Math.round(data.main.temp)}°C`;
  humidity.textContent = `Humidity: ${data.main.humidity}%`;
  feelsLike.textContent = `🌡️Feels Like: ${Math.round(data.main.feels_like)}°C`;

  windSpeed.textContent = `🍃Wind Speed: ${data.wind.speed} m/s`;
  const sunriseTime = new Date(data.sys.sunrise * 1000);
  const sunsetTime = new Date(data.sys.sunset * 1000);

  sunrise.textContent = `🌅Sunrise: ${sunriseTime.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })}`;

  sunset.textContent = `🌇Sunset: ${sunsetTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  condition.textContent = data.weather[0].main;
  changeTheme(data.weather[0].main);
  weatherIcon.alt = data.weather[0].description;
  console.log(data.weather[0].icon);
  weatherIcon.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
}

async function getWeather(city) {
  try {
    const cachedData = localStorage.getItem(city.toLowerCase());
    if (cachedData) {
      const parsedData = JSON.parse(cachedData);
      const currentTime = Date.now();
      const cacheAge = currentTime - parsedData.time;

      if (cacheAge < 600000) {
        errorMessage.textContent = "";
        displayWeather(parsedData.data);
        console.log("Loaded from cache");
        return;
      }
    }
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("City not found");
    }
    console.log("Loaded from API");
    errorMessage.textContent = "";
    const data = await response.json();
    if (city.toLowerCase() !== data.name.toLowerCase()) {
      cityName.textContent = "";
      temperature.textContent = "";
      condition.textContent = "";
      humidity.textContent = "";
      weatherIcon.src = "";
      errorMessage.textContent =
        "It looks like you entered a country or an invalid location. Please enter a city name.";
      return;
    }
    displayWeather(data);
    localStorage.setItem(
      city.toLowerCase(),
      JSON.stringify({
        data: data,
        time: Date.now(),
      }),
    );
  } catch (error) {
    console.log(error.message);
    errorMessage.textContent = error.message;
  }
}
searchBtn.addEventListener("click", async function () {
  const city = cityInput.value.trim();
  if (city === "") {
    errorMessage.textContent = "Please enter a city name.";
    return;
  }
  await getWeather(city);
  cityInput.value = "";
});
cityInput.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    searchBtn.click();
  }
});
function getCurrentLocatn() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      function (position) {
        getWeatherByLocation(
          position.coords.latitude,
          position.coords.longitude,
        );
      },
      function () {
        errorMessage.textContent =
          "Location permission denied. Search for a city instead.";
      },
    );
  }
}
getCurrentLocatn();
async function getWeatherByLocation(lat, lon) {
  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Unable to fetch your location's weather.");
    }
    const data = await response.json();
    displayWeather(data);
  } catch (error) {
    errorMessage.textContent = error.message;
  }
}
