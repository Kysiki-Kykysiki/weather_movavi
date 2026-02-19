from flask import Flask, render_template, request, jsonify
import requests
import os
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

API_KEY = os.getenv('OPENWEATHER_API_KEY')

BASE_URL = "http://api.openweathermap.org/data/2.5/weather"

def get_weather_data(city_name):
    """
    получение данных о погоде для указанного города
    """
    try:
        params = {
            'q': city_name,
            'appid': API_KEY,
            'units': 'metric',
            'lang': 'ru'
        }
        
        response = requests.get(BASE_URL, params=params)
        response.raise_for_status()
        
        data = response.json()
        
        processed_data = process_weather_data(data)
        
        return processed_data
        
    except requests.exceptions.RequestException as e:
        print(f"Ошибка при запросе погоды: {e}")
        return None

def get_weather_by_coords(lat, lon):
    """
    получение погоды по координатам
    """
    try:
        params = {
            'lat': lat,
            'lon': lon,
            'appid': API_KEY,
            'units': 'metric',
            'lang': 'ru'
        }
        
        response = requests.get(BASE_URL, params=params)
        response.raise_for_status()
        
        data = response.json()
        return process_weather_data(data)
        
    except requests.exceptions.RequestException as e:
        print(f"Ошибка при запросе по координатам: {e}")
        return None

def process_weather_data(raw_data):
    """
    обработка сырых данных от API
    """
    try:
        processed = {
            'city': raw_data['name'],
            'country': raw_data['sys']['country'],
            'temperature': round(raw_data['main']['temp'], 1),
            'feels_like': round(raw_data['main']['feels_like'], 1),
            'temp_min': round(raw_data['main']['temp_min'], 1),
            'temp_max': round(raw_data['main']['temp_max'], 1),
            'humidity': raw_data['main']['humidity'],
            'pressure': raw_data['main']['pressure'],
            'wind_speed': raw_data['wind']['speed'],
            'wind_deg': raw_data['wind']['deg'],
            'weather_main': raw_data['weather'][0]['main'],
            'weather_description': raw_data['weather'][0]['description'],
            'sunrise': datetime.fromtimestamp(raw_data['sys']['sunrise']).strftime('%H:%M'),
            'sunset': datetime.fromtimestamp(raw_data['sys']['sunset']).strftime('%H:%M'),
        }
        
        # направление ветра
        wind_deg = raw_data['wind'].get('deg', 0)
        processed['wind_direction'] = get_wind_direction(wind_deg)
        
        return processed
        
    except KeyError as e:
        print(f"Ошибка обработки данных: {e}")
        return None

def get_wind_direction(degrees):
    """
    определение направления ветра по градусам
    """
    directions = ['С', 'СВ', 'В', 'ЮВ', 'Ю', 'ЮЗ', 'З', 'СЗ']
    index = round(degrees / 45) % 8
    return directions[index]

# маршруты flask
@app.route('/')
def index():
    """Главная страница"""
    return render_template('index.html')

@app.route('/api/weather', methods=['GET'])
def api_weather():
    """API endpoint для получения погоды"""
    city = request.args.get('city', 'Новосибирск')
    
    # получаем данные через вашу функцию
    weather_data = get_weather_data(city)
    
    if weather_data:
        return jsonify({
            'success': True,
            'data': weather_data
        })
    else:
        return jsonify({
            'success': False,
            'error': 'Город не найден или ошибка API'
        }), 404

@app.route('/api/weather/coords', methods=['GET'])
def api_weather_coords():
    """эндпоинт для получения погоды по координатам"""
    lat = request.args.get('lat')
    lon = request.args.get('lon')
    
    if not lat or not lon:
        return jsonify({
            'success': False,
            'error': 'Не указаны координаты'
        }), 400
    
    weather_data = get_weather_by_coords(float(lat), float(lon))
    
    if weather_data:
        return jsonify({
            'success': True,
            'data': weather_data
        })
    else:
        return jsonify({
            'success': False,
            'error': 'Ошибка получения данных'
        }), 500

if __name__ == '__main__':
    app.run(
        host='0.0.0.0',
        port=5050,
        debug=True
    )