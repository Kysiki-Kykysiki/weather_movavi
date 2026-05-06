# Weather Movavi

Небольшое веб-приложение для просмотра актуальной погоды по городу или по геолокации пользователя.

Проект написан на Flask и использует OpenWeatherMap API для получения погодных данных.

## Возможности

- поиск погоды по названию города;
- быстрый выбор популярных городов;
- получение погоды по координатам пользователя;
- отображение температуры, ощущаемой температуры, влажности, давления, ветра, восхода и заката;
- смена фона в зависимости от погодных условий;
- адаптивная верстка для разных экранов.

## Стек

- Python
- Flask
- HTML
- CSS
- JavaScript
- OpenWeatherMap API

## Структура проекта

```text
weather_movavi/
├── app.py
├── templates/
│   └── index.html
├── static/
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   └── script.js
│   └── images/
└── .gitignore
```

## Установка и запуск

1. Клонируйте репозиторий:

```bash
git clone https://github.com/Kysiki-Kykysiki/weather_movavi.git
cd weather_movavi
```

2. Создайте виртуальное окружение:

```bash
python -m venv venv
```

3. Активируйте виртуальное окружение:

Для Windows:

```bash
venv\Scripts\activate
```

Для macOS / Linux:

```bash
source venv/bin/activate
```

4. Установите зависимости:

```bash
pip install flask requests python-dotenv
```

5. Создайте файл `.env` в корне проекта и добавьте API-ключ OpenWeatherMap:

```env
OPENWEATHER_API_KEY=ваш_ключ_api
```

6. Запустите приложение:

```bash
python app.py
```

7. Откройте приложение в браузере:

```text
http://localhost:5050
```

## API

### Получить погоду по городу

```http
GET /api/weather?city=Москва
```

### Получить погоду по координатам

```http
GET /api/weather/coords?lat=55.7558&lon=37.6173
```

## Примечание

Для работы приложения нужен API-ключ OpenWeatherMap. Без него сервер не сможет получать данные о погоде.

## Автор

Kysiki-Kykysiki
