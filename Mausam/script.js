document.addEventListener("DOMContentLoaded", () => {
  // Get DOM elements
  const searchInput = document.querySelector(".search-input");
  const searchBtn = document.querySelector(".search-btn");
  const weatherSection = document.querySelector(".weather-section");
  const forecastSection = document.querySelector(".forecast-section");
  const errorSection = document.querySelector(".error-section");
  const loadingSection = document.querySelector(".loading-section");
  const quirkMessage = document.querySelector(".quirky-message");
  const forecastItems = document.querySelector(".forecast-items");

  // API Key
  const apiKey = "dee5679756e7c095be27e94f209c4622";

  // Event listeners
  searchBtn.addEventListener("click", () => {
    const city = searchInput.value.trim();
    if (city) {
      fetchWeatherData(city);
    }
  });

  searchInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      const city = searchInput.value.trim();
      if (city) {
        fetchWeatherData(city);
      }
    }
  });

  // Quirky messages based on weather conditions and temperature
  function getQuirkyMessage(temp, weatherId) {
    // Temperature takes priority for extreme conditions
    if (temp > 40) {
      return "Aaj log jalenge! 🔥 Pani peete rehna!";
    } else if (temp > 35) {
      return "Ye toh bas trailer hai! 🥵";
    } else if (temp < -10) {
      return "Aaj Kisi ne fridge khula chhod diya hai ❄️";
    } else if (temp < 0) {
      return "Pani khate rehna 🧊 Double jacket pehno!";
    } else if (temp < 5) {
      return "Rajai me ghus jao! 🥶";
    } else if (temp < 10) {
      return "Vicks ki goli ready rakhna 🧣 Jacket ya sweater pehen lo!";
    }

    // After extreme temperatures, consider weather conditions
    if (weatherId >= 600 && weatherId < 700) {
      if (temp < 0) {
        return "Barf gir rahi hai aur jamne wali thand hai! ❄️ Ghar pe hi raho!";
      } else {
        return "Lagta hai aaj barf girne wali hai! ❄️ Garme kapde nikalo!";
      }
    } else if (weatherId >= 500 && weatherId < 600) {
      if (temp < 15) {
        return "Thand ke saath barish bhi! ☔ Chai aur pakode perfect rahenge!";
      } else {
        return "Chai aur pakode banao! ☔ Barish ho rahi hai!";
      }
    } else if (weatherId >= 300 && weatherId < 400) {
      return "Halki baarish hai, chhata le lena! 🌧️";
    } else if (weatherId >= 200 && weatherId < 300) {
      return "Aaj bijli kadakne wali hai! ⚡ Ghar pe raho!";
    } else if (weatherId >= 700 && weatherId < 800) {
      if (temp < 10) {
        return "Ye dhuan dhuan sa rahega 🌫️ Dhyan se chalein!";
      } else {
        return "Bahar kuchh dikh raha? Mujhe bhi nahi 🌫️";
      }
    } else if (weatherId === 800) {
      if (temp > 25 && temp <= 35) {
        return "Mausam theek hai, kuchh kaam kar lo! 😌";
      } else if (temp > 15 && temp <= 25) {
        return "Mausam suhana hai, ghoomne jao! 🌞";
      } else if (temp > 10 && temp <= 15) {
        return "Aaj photo acchi aayegi! 🌥️";
      } else {
        return "Dhoop hai par thand bhi! Jacket pehen lo! 🧥";
      }
    } else if (weatherId > 800) {
      if (temp < 15) {
        return "Aaj toh chhutti honi chahiye ☁️";
      } else {
        return "Mehdi Hassan wala mausam! ☁️";
      }
    } else {
      if (temp < 10) {
        return "Thand to hai hi! 🥶 Aur kya surprises hain?";
      } else {
        return "Ajeeb mausam hai aaj! 🤔";
      }
    }
  }

  // Format day from timestamp
  function formatDay(timestamp) {
    const date = new Date(timestamp * 1000);
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return days[date.getDay()];
  }

  // Show loading state
  function showLoading() {
    loadingSection.style.display = "block";
    weatherSection.style.display = "none";
    forecastSection.style.display = "none";
    errorSection.style.display = "none";
  }

  // Show error state
  function showError(message) {
    loadingSection.style.display = "none";
    weatherSection.style.display = "none";
    forecastSection.style.display = "none";
    errorSection.style.display = "block";

    const errorMessage = document.querySelector(".error-message");
    const errorHint = document.querySelector(".error-hint");

    errorMessage.textContent = message || "Oops! Something went wrong.";

    if (message.includes("API key")) {
      errorHint.textContent = "Please check your API key configuration.";
    } else if (message.includes("city")) {
      errorHint.textContent = "Please check the city name and try again.";
    } else {
      errorHint.textContent = "Please try again later.";
    }
  }

  // Update UI with weather data
  function updateUI(data) {
    loadingSection.style.display = "none";
    weatherSection.style.display = "block";
    forecastSection.style.display = "block";
    errorSection.style.display = "none";

    // Current weather
    const currentTemp = Math.round(data.current.temp);
    const weatherId = data.current.weather[0].id;
    const weatherDesc = data.current.weather[0].description;
    const iconCode = data.current.weather[0].icon;
    const feelsLike = Math.round(data.current.feels_like);
    const humidity = data.current.humidity;
    const windSpeed = Math.round(data.current.wind_speed * 3.6); // Convert m/s to km/h
    const pressure = data.current.pressure;

    // Get the daily high and low for today
    const todayHigh = Math.round(data.daily[0].temp.max);
    const todayLow = Math.round(data.daily[0].temp.min);

    // Set quirky message
    quirkMessage.textContent = getQuirkyMessage(currentTemp, weatherId);

    // Update current weather UI
    document.querySelector(".temperature").textContent = `${currentTemp}°C`;
    document.querySelector(".weather-description").textContent = weatherDesc;
    document.querySelector(
      ".weather-icon"
    ).src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
    document.getElementById("feels-like").textContent = `${feelsLike}°C`;
    document.getElementById("humidity").textContent = `${humidity}%`;
    document.getElementById("wind-speed").textContent = `${windSpeed} km/h`;
    document.getElementById("pressure").textContent = `${pressure} hPa`;

    // Update high/low temperatures
    document.getElementById("temp-high").textContent = `${todayHigh}°`;
    document.getElementById("temp-low").textContent = `${todayLow}°`;

    // Update 5-day forecast
    forecastItems.innerHTML = "";

    // Get one data point per day (noon time)
    const dailyData = data.daily.slice(1, 6); // Next 5 days, skip today

    dailyData.forEach((day) => {
      const dayName = formatDay(day.dt);
      const dayTemp = Math.round(day.temp.day);
      const dayIcon = day.weather[0].icon;
      const dayHigh = Math.round(day.temp.max);
      const dayLow = Math.round(day.temp.min);

      const forecastItem = document.createElement("div");
      forecastItem.className = "forecast-item";
      forecastItem.innerHTML = `
                <div class="forecast-day">${dayName}</div>
                <img src="https://openweathermap.org/img/wn/${dayIcon}.png" alt="Weather" class="forecast-icon">
                <div class="forecast-temp">${dayTemp}°C</div>
                <div class="forecast-high-low">
                    <span class="forecast-high">${dayHigh}°</span>/<span class="forecast-low">${dayLow}°</span>
                </div>
            `;

      forecastItems.appendChild(forecastItem);
    });

    // Add animation classes
    weatherSection.classList.add("fade-in");
    forecastSection.classList.add("fade-in");
  }

  // Fetch weather data from OpenWeatherMap API
  async function fetchWeatherData(city) {
    try {
      showLoading();

      // First get coordinates from city name
      const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${apiKey}`;
      const geoResponse = await fetch(geoUrl);
      const geoData = await geoResponse.json();

      if (!geoData.length) {
        showError("City not found. Please check the city name.");
        return;
      }

      const { lat, lon } = geoData[0];

      // Then get weather data using One Call API
      const weatherUrl = `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly&units=metric&appid=${apiKey}`;
      const weatherResponse = await fetch(weatherUrl);

      if (!weatherResponse.ok) {
        if (weatherResponse.status === 401) {
          showError("Invalid API key. Please check your configuration.");
        } else if (weatherResponse.status === 404) {
          showError("Weather data not found for this location.");
        } else {
          showError("Error fetching weather data. Please try again.");
        }
        return;
      }

      const weatherData = await weatherResponse.json();
      updateUI(weatherData);
    } catch (error) {
      console.error("Error:", error);
      showError("An unexpected error occurred. Please try again.");
    }
  }

  // Get user's current location
  function getUserLocation() {
    if (navigator.geolocation) {
      showLoading();
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;

            // Get city name from coordinates
            const reverseGeoUrl = `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${apiKey}`;
            const response = await fetch(reverseGeoUrl);
            const data = await response.json();

            if (data.length) {
              const city = data[0].name;
              searchInput.value = city;

              // Get weather data with One Call API
              const weatherUrl = `https://api.openweathermap.org/data/3.0/onecall?lat=${latitude}&lon=${longitude}&exclude=minutely,hourly&units=metric&appid=${apiKey}`;
              const weatherResponse = await fetch(weatherUrl);

              if (!weatherResponse.ok) {
                showError("Error fetching weather data. Please try again.");
                return;
              }

              const weatherData = await weatherResponse.json();
              updateUI(weatherData);
            } else {
              showError("Could not determine your location.");
            }
          } catch (error) {
            console.error("Error:", error);
            showError("Error getting your location. Please search manually.");
          }
        },
        (error) => {
          console.error("Geolocation error:", error);
          loadingSection.style.display = "none";
        }
      );
    }
  }

  // Initialize app - Get user location
  getUserLocation();
});
