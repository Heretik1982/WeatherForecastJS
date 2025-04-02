// API configuration
const apiKey = '3f2869114448fe61ddd406b46e7b14fa'; // Replace with your OpenWeatherMap API key
const weatherBaseUrl = 'https://api.openweathermap.org/data/2.5/weather';
const forecastBaseUrl = 'https://api.openweathermap.org/data/2.5/forecast';

// DOM Elements for tabs and views
const dashboardTab = document.getElementById('dashboardTab');
const forecastTab = document.getElementById('forecastTab');
const dashboardView = document.getElementById('dashboardView');
const forecastView = document.getElementById('forecastView');

// DOM Elements for Dashboard
const townInput = document.getElementById('townInput');
const addTownBtn = document.getElementById('addTownBtn');
const townsContainer = document.getElementById('townsContainer');

// DOM Elements for Forecast & Map
const forecastTownInput = document.getElementById('forecastTownInput');
const getForecastBtn = document.getElementById('getForecastBtn');
const forecastContainer = document.getElementById('forecastContainer');

let map; // Leaflet map instance

// Tab switching functionality
dashboardTab.addEventListener('click', () => {
  dashboardTab.classList.add('active');
  forecastTab.classList.remove('active');
  dashboardView.classList.remove('hidden');
  forecastView.classList.add('hidden');
});

forecastTab.addEventListener('click', () => {
  forecastTab.classList.add('active');
  dashboardTab.classList.remove('active');
  forecastView.classList.remove('hidden');
  dashboardView.classList.add('hidden');
});

// Add a town to the dashboard (limit to 4)
addTownBtn.addEventListener('click', () => {
  const town = townInput.value.trim();
  if (town === '') {
    alert('Please enter a town name.');
    return;
  }
  if (document.querySelectorAll('.town-card').length >= 8) {
    alert('You can only add up to 8 towns.');
    return;
  }
  getWeatherData(town)
    .then(data => {
      displayTownWeather(data);
      townInput.value = '';
    })
    .catch(err => {
      alert('Could not retrieve data for the specified town.');
      console.error(err);
    });
});

// Get forecast and update map for a town in the forecast tab
getForecastBtn.addEventListener('click', () => {
  const town = forecastTownInput.value.trim();
  if (town === '') {
    alert('Please enter a town name.');
    return;
  }
  getForecastData(town)
    .then(data => {
      displayForecast(data);
      // Center map on town coordinates
      updateMap(data.city.coord.lat, data.city.coord.lon);
      forecastTownInput.value = '';
    })
    .catch(err => {
      alert('Could not retrieve forecast data for the specified town.');
      console.error(err);
    });
});

// Fetch current weather data for a town
function getWeatherData(town) {
  const url = `${weatherBaseUrl}?q=${encodeURIComponent(town)}&appid=${apiKey}&units=metric`;
  return fetch(url)
    .then(response => {
      if (!response.ok) throw new Error('Network response not ok');
      return response.json();
    });
}

// Determine the CSS class for background animation based on weather conditions
function getWeatherAnimationClass(condition) {
  const cond = condition.toLowerCase();
  if (cond.includes('clear')) return 'weather-sunny';
  if (cond.includes('cloud')) return 'weather-cloudy';
  if (cond.includes('rain') || cond.includes('drizzle')) return 'weather-rainy';
  if (cond.includes('snow')) return 'weather-snow';
  if (cond.includes('thunder')) return 'weather-thunderstorm';
  return 'weather-default';
}

// Display current weather data on the dashboard
function displayTownWeather(data) {
  const card = document.createElement('div');
  card.className = 'town-card';

  // Get the appropriate background animation class
  const weatherCondition = data.weather[0].main;
  const bgClass = getWeatherAnimationClass(weatherCondition);
  card.classList.add(bgClass);

  card.innerHTML = `
    <h3>${data.name}</h3>
    <p>Temperature: ${data.main.temp}°C</p>
    <p>${data.weather[0].description}</p>
  `;
  
  // Create and append a remove button to the card
  const removeBtn = document.createElement('button');
  removeBtn.textContent = 'Remove';
  removeBtn.classList.add('remove-btn');
  removeBtn.addEventListener('click', () => {
    card.remove();
  });
  card.appendChild(removeBtn);
  
  townsContainer.appendChild(card);
}

// Fetch forecast data for a town
function getForecastData(town) {
  const url = `${forecastBaseUrl}?q=${encodeURIComponent(town)}&appid=${apiKey}&units=metric`;
  return fetch(url)
    .then(response => {
      if (!response.ok) throw new Error('Network response not ok');
      return response.json();
    });
}

// Display forecast data (showing the next 5 forecast entries)
function displayForecast(data) {
  forecastContainer.innerHTML = `<h3>Forecast for ${data.city.name}</h3>`;
  data.list.slice(0, 5).forEach(item => {
    const date = new Date(item.dt * 1000);
    forecastContainer.innerHTML += `
      <div class="forecast-item">
        <p>${date.toLocaleString()}</p>
        <p>Temp: ${item.main.temp}°C</p>
        <p>${item.weather[0].description}</p>
      </div>
      <hr>
    `;
  });
}

// Initialize Leaflet map
function initMap() {
  map = L.map('map').setView([20, 0], 2); // Default global view
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);
}

// Update the map view to center on the given latitude and longitude
function updateMap(lat, lon) {
  map.setView([lat, lon], 10);
  // Optionally add a marker for the location
  L.marker([lat, lon]).addTo(map);
}

// Initialize the map once the document is loaded
document.addEventListener('DOMContentLoaded', initMap);
