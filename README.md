## Weather App 🌦️

This project is a fully responsive weather application built using Vue.js and Vite, which utilizes the **OpenWeatherMap API** to provide accurate and up-to-date weather information. The app does not rely on any CSS frameworks or UI libraries to ensure a lightweight experience.
![image](https://github.com/user-attachments/assets/709385e3-24f7-4cb0-8ce1-3561a3c7cb01)

---

## Features 🚀

1. **City Autocomplete Search**:

   - An input field with autocomplete functionality to search cities.
   - Fetches data using `axios`.

2. **Weather Cards for Current Day**:

   - Displays weather information in a card format for the current day.
   - Users can see the weather details such as temperature, humidity, wind speed, etc.

3. **Hourly Temperature Chart**:

   - Uses a JavaScript plugin like **Chart.js** (without relying on `vue-chartjs`) to render hourly temperature data.
   - Provides an easy-to-understand visual representation of temperature changes throughout the day.

4. **Multiple Weather Blocks**:

   - Allows users to create up to **5 separate weather blocks** with information for different cities.
   - By default, one weather block is always present.
   - Users can add new blocks using a "+" button and delete them when needed.
   - Deleting a block triggers a modal window for confirmation.

5. **Favorites Tab**:

   - Users can mark cities as favorites and highlight them with an icon or border on the weather card.
   - A separate "Favorites" tab displays all the favorite cities with limited functionality (only "day/week" toggling).
   - Favorite cities are stored in `localStorage`, with a maximum limit of **5 cities**.
   - If the limit is exceeded, a modal prompts the user to remove a city before adding a new one.

6. **Adaptive Design**:

   - The application is fully responsive with a main container width ranging between **1200px** (max) and **360px** (min).
   - Works seamlessly on both desktop and mobile devices.

7. **Day/5-Day Forecast Toggle**:

   - Users can switch between viewing the current day's weather or a 5-day forecast.
   - The 5-day view shows average temperatures calculated from hourly data, leveraging the **OpenWeatherMap 5-day forecast API**.

8. **Auto-detect User Location**:

   - On initial load, the app detects the user's city based on their IP address using an open-source geolocation API.
   - Displays the weather for the user's current location by default.

9. **Preloaders**:

   - Loading spinners are displayed while data is being fetched from the API to improve user experience.

10. **Multilingual Interface**:

    - Supports both English (`en`) and Ukrainian (`uk`) languages.
    - Weather data and interface labels change based on the selected language.

11. **Day/Night weather switch**:
    - Users have the option to switch the weather display to either day or night mode.

---

## Additional Functionality ✨

- **Error Handling**: Displays user-friendly messages in case of API errors or network issues.
- **LocalStorage Management**: Ensures data persistence for user preferences (e.g., favorite cities, theme settings).
- **Accessibility**: Focus on keyboard navigation and screen reader compatibility.

---

## Technologies Used 🛠️

- **Vue.js** (JavaScript framework)
- **Vite** (Build tool for fast development)
- **JavaScript (ES6+)**
- **Chart.js** (for data visualization)
- **LocalStorage API** (for data persistence)
- **OpenWeatherMap API** (for weather data)

---
