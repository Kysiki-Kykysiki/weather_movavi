const API_BASE = window.location.origin;

const elements = {
    cityName: document.getElementById('cityName'),
    currentDate: document.getElementById('currentDate'),
    temperature: document.getElementById('temperature'),
    feelsLike: document.getElementById('feelsLike'),
    tempRange: document.getElementById('tempRange'),
    weatherImage: document.getElementById('weatherImage'),
    weatherDescription: document.getElementById('weatherDescription'),
    weatherMain: document.getElementById('weatherMain'),
    humidityValue: document.getElementById('humidityValue'),
    windValue: document.getElementById('windValue'),
    windDirection: document.getElementById('windDirection'),
    pressureValue: document.getElementById('pressureValue'),
    sunriseTime: document.getElementById('sunriseTime'),
    sunsetTime: document.getElementById('sunsetTime'),
    lastUpdated: document.getElementById('lastUpdated'),
    cityInput: document.getElementById('cityInput'),
    searchBtn: document.getElementById('searchBtn'),
    locationBtn: document.getElementById('locationBtn'),
    weatherCard: document.getElementById('weatherCard'),
    loading: document.getElementById('loading'),
    errorToast: document.getElementById('errorToast'),
    errorMessage: document.getElementById('errorMessage')
};

document.addEventListener('DOMContentLoaded', () => {
    updateDateTime();
    loadWeather('Новосибирск');
    setupEventListeners();
    setInterval(updateDateTime, 1000);
});

function updateDateTime() {
    const now = new Date();
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    };
    elements.currentDate.textContent = now.toLocaleDateString('ru-RU', options);
}

// обработчик событий
function setupEventListeners() {
    elements.searchBtn.addEventListener('click', () => {
        const city = elements.cityInput.value.trim();
        if (city) loadWeather(city);
    });
    
    elements.cityInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const city = elements.cityInput.value.trim();
            if (city) loadWeather(city);
        }
    });
    
    elements.locationBtn.addEventListener('click', getLocationWeather);
    
    document.querySelectorAll('.city-chip').forEach(button => {
        button.addEventListener('click', () => {
            const city = button.dataset.city;
            elements.cityInput.value = city;
            loadWeather(city);
        });
    });
}

// загрузка погоды
async function loadWeather(city) {
    showLoading(true);
    
    try {
        const response = await fetch(`${API_BASE}/api/weather?city=${encodeURIComponent(city)}`);
        const data = await response.json();
        
        if (data.success) {
            updateWeatherUI(data.data);
            showError('');
        } else {
            showError(data.error || 'Город не найден');
        }
    } catch (error) {
        console.error('Ошибка:', error);
        showError('Ошибка соединения с сервером');
    } finally {
        showLoading(false);
        updateLastUpdated();
    }
}

// погода по гео(криво работает, можно выпилить)
function getLocationWeather() {
    if (!navigator.geolocation) {
        showError('Геолокация не поддерживается вашим браузером');
        return;
    }
    
    showLoading(true);
    
    navigator.geolocation.getCurrentPosition(
        async (position) => {
            const { latitude, longitude } = position.coords;
            
            try {
                const response = await fetch(
                    `${API_BASE}/api/weather/coords?lat=${latitude}&lon=${longitude}`
                );
                const data = await response.json();
                
                if (data.success) {
                    updateWeatherUI(data.data);
                    elements.cityInput.value = data.data.city;
                    showError('');
                } else {
                    showError(data.error);
                }
            } catch (error) {
                showError('Ошибка получения данных');
            } finally {
                showLoading(false);
                updateLastUpdated();
            }
        },
        (error) => {
            showLoading(false);
            showError('Не удалось получить местоположение. Проверьте настройки браузера.');
        }
    );
}

function getWeatherImage(weatherMain) {
    const imageMap = {
        'Clear': 'clear.png',           
        'Clouds': 'clouds.png',          
        'Rain': 'rain.png',              
        'Drizzle': 'rain.png',           
        'Snow': 'snow.png',              
        'Thunderstorm': 'thunderstorm.png',
        'Mist': 'mist.png',              
        'Fog': 'mist.png',               
        'Haze': 'mist.png'                
    };
    
    const imageFile = imageMap[weatherMain];
    
    // путь к картинке
    return `/static/images/${imageFile}`;
}

function updateWeatherUI(data) {
    // основная инфа
    elements.cityName.textContent = `${data.city}, ${data.country}`;
    elements.temperature.textContent = data.temperature;
    elements.feelsLike.textContent = `${data.feels_like}°C`;
    elements.tempRange.textContent = `${data.temp_min}° / ${data.temp_max}°`;
    
    // погодные условия
    elements.weatherDescription.textContent = data.weather_description;
    elements.weatherMain.textContent = data.weather_main;
    
    // установка изображения
    elements.weatherImage.src = getWeatherImage(data.weather_main);
    elements.weatherImage.alt = data.weather_description;
    
    // детали
    elements.humidityValue.textContent = `${data.humidity}%`;
    elements.windValue.textContent = `${data.wind_speed} м/с`;
    elements.windDirection.textContent = data.wind_direction || '';
    elements.pressureValue.textContent = `${data.pressure} гПа`;
    elements.sunriseTime.textContent = data.sunrise;
    elements.sunsetTime.textContent = data.sunset;
    
    // меняем фон в зависимости от погоды
    updateBackground(data.weather_main);
}

function updateBackground(weatherCondition) {
    const body = document.body;
    let gradient = '';
    
    const backgrounds = {
        'Clear': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'Clouds': 'linear-gradient(135deg, #757F9A 0%, #D7DDE8 100%)',
        'Rain': 'linear-gradient(135deg, #3a7bd5 0%, #00d2ff 100%)',
        'Drizzle': 'linear-gradient(135deg, #3a7bd5 0%, #00d2ff 100%)',
        'Thunderstorm': 'linear-gradient(135deg, #232526 0%, #414345 100%)',
        'Snow': 'linear-gradient(135deg, #E6DADA 0%, #274046 100%)',
        'Mist': 'linear-gradient(135deg, #606c88 0%, #3f4c6b 100%)',
        'Fog': 'linear-gradient(135deg, #606c88 0%, #3f4c6b 100%)'
    };
    
    gradient = backgrounds[weatherCondition] || backgrounds['Clear'];
    body.style.background = gradient;
}

function showLoading(show) {
    elements.loading.style.display = show ? 'flex' : 'none';
    elements.weatherCard.style.opacity = show ? '0.5' : '1';
}

function showError(message) {
    if (!message) {
        elements.errorToast.style.display = 'none';
        return;
    }
    
    elements.errorMessage.textContent = message;
    elements.errorToast.style.display = 'flex';
    
    setTimeout(() => {
        elements.errorToast.style.display = 'none';
    }, 5000);
}

function hideError() {
    elements.errorToast.style.display = 'none';
}

function updateLastUpdated() {
    const now = new Date();
    elements.lastUpdated.textContent = now.toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
}