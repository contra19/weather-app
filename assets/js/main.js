// Retrieve cities from localStorage and get today's date
const cityList = JSON.parse(localStorage.getItem("cities")) || [];
const today = dayjs().format('MM/DD/YYYY');

// Function to create a weather card
function createWeatherCard(city, state, weatherData) {
  // Create a card div and append the weather data
  const card = $('<div>').addClass('card border-primary')
    .append($('<div>').addClass('card-header bg-primary text-white')
      .append($('<div>').text(`${city}, ${state}`).addClass('city-name'))
      .append($('<div>').text(weatherData.date).addClass('date')))
    .append($('<div>').addClass('card-body')
      .append($('<p>').addClass('card-text').append(
        $('<img>').addClass('weather-icon').attr('src', 'https://openweathermap.org/img/w/' + weatherData.weatherIcon + '.png').attr('alt', weatherData.weatherDescription.toUpperCase()),
        $('<span>').text(weatherData.weatherDescription.toUpperCase())))
      .append($('<p>').addClass('card-text').text('High: ' + weatherData.highTemperature))
      .append($('<p>').addClass('card-text').text('Low: ' + weatherData.lowTemperature))
      .append($('<p>').addClass('card-text').text('Wind: ' + weatherData.windSpeed))
      .append($('<p>').addClass('card-text').text('Humidity: ' + weatherData.humidity))
      .append($('<p>').addClass('card-text').text('Feels Like Temperature: ' + weatherData.feelsLikeTemperature))
    );
  return card;
}

// Function to store city data
function storeCityData() {
  // Get the city name from the input field
  const cityName = $('#citySearch').val().trim();
  console.log('City Name:', cityName);

  // Check if the city name is empty
  if (!cityName) {
    alert('Please enter a city name.');
    return;
  }

  // Call getCityInfo to fetch city information
  getCityInfo(cityName);

  // Clear the input field
  $('#citySearch').val('');
  return (cityName);
}

// Function to get city information
function getCityInfo(cityName) {
  // Set the country code and limit for the fetch request
  const countryCode = 'US';
  const limit = 1;
  const apiKey = "2047a67a588b23ff5f0cbae5a78800ec";

  // Define the URL for the fetch request
  const url = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName},${countryCode}&limit=${limit}&appid=${apiKey}`;

  // Fetch the city information
  fetch(url)
  // Check if the response is ok
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}, Message: ${response.statusText}`);
      }
      return response.json();
    })

    // Check if the city name is valid
    .then(data => {
      if (!data || !data[0]) {
        throw new Error('Invalid U.S. city name! Please try again with a valid U.S. city name.');
      }

      // Map of full state names to state codes
      const stateMap = {
        "Alabama": "AL",
        "Alaska": "AK",
        "Arizona": "AZ",
        "Arkansas": "AR",
        "California": "CA",
        "Colorado": "CO",
        "Connecticut": "CT",
        "Delaware": "DE",
        "Florida": "FL",
        "Georgia": "GA",
        "Hawaii": "HI",
        "Idaho": "ID",
        "Illinois": "IL",
        "Indiana": "IN",
        "Iowa": "IA",
        "Kansas": "KS",
        "Kentucky": "KY",
        "Louisiana": "LA",
        "Maine": "ME",
        "Maryland": "MD",
        "Massachusetts": "MA",
        "Michigan": "MI",
        "Minnesota": "MN",
        "Mississippi": "MS",
        "Missouri": "MO",
        "Montana": "MT",
        "Nebraska": "NE",
        "Nevada": "NV",
        "New Hampshire": "NH",
        "New Jersey": "NJ",
        "New Mexico": "NM",
        "New York": "NY",
        "North Carolina": "NC",
        "North Dakota": "ND",
        "Ohio": "OH",
        "Oklahoma": "OK",
        "Oregon": "OR",
        "Pennsylvania": "PA",
        "Rhode Island": "RI",
        "South Carolina": "SC",
        "South Dakota": "SD",
        "Tennessee": "TN",
        "Texas": "TX",
        "Utah": "UT",
        "Vermont": "VT",
        "Virginia": "VA",
        "Washington": "WA",
        "West Virginia": "WV",
        "Wisconsin": "WI",
        "Wyoming": "WY",
        "District of Columbia": "DC"
      };

      // Check if the state is a full state name and convert it to state code
      const stateCode = stateMap[data[0].state] || data[0].state;

      // Check if the city already exists in cityList
      const existingCityIndex = cityList.findIndex(city => city.city === data[0].name);
      if (existingCityIndex !== -1) {
        // City already exists, don't add it again
        console.log(`${data[0].name} is already in the list.`);
        // Optionally, you can display a message to the user here
        alert('The selected city is already in the history list.\nPlease enter a new city or use the corresponding button to view the weather.');
        return;
      }

      // Store the city data in an object
      let cityObj = {
        city: data[0].name,
        state: stateCode,
        countryCode: data[0].country,
        latitude: data[0].lat,
        longitude: data[0].lon
      };

      // Push new cityObject to cityList
      cityList.push(cityObj);

      // Update localStorage with the updated cityList
      localStorage.setItem("cities", JSON.stringify(cityList));
      
      // Call getCityWeather to fetch weather information
      getCityWeather(cityObj);

      displayCityButtons();
    })
    // Catch any errors and display an alert
    .catch(error => {
      alert('There was a problem with the fetch operation:\n' + error.message);
    });
}

// Function to get city weather
function getCityWeather(cityObj) {
  // Get the city name, latitude, and longitude from the city object
  const cityName = encodeURIComponent(cityObj.city);
  const state = cityObj.state;
  const lat = cityObj.latitude;
  const lon = cityObj.longitude;
  const apiKey = "2047a67a588b23ff5f0cbae5a78800ec";

  // Define the URL for the fetch request
  const url = `https://api.openweathermap.org/data/2.5/forecast/daily?lat=${lat}&lon=${lon}&cnt=6&appid=${apiKey}&units=imperial`;

  // Fetch the city weather information
  fetch(url)
    .then(response => {
      // Check if the response is ok
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}, Message: ${response.statusText}`);
      }
      return response.json();
    })
    // Check if the weather information is available
    .then(data => {
      if (!data || !data.list) {
        throw new Error('No weather information available for selected city.');
      }

      // Create an array to store weather cards
      const weatherCards = [];

      // Loop through the weather data and create weather cards
      data.list.forEach((dayWeather, index) => {
        const weatherData = {
          date: dayjs.unix(dayWeather.dt).format('dddd MM/DD/YYYY'),
          highTemperature: `${Math.round(dayWeather.temp.max)} °F`,
          lowTemperature: `${Math.round(dayWeather.temp.min)} °F`,
          windSpeed: `${Math.round(dayWeather.speed)} mph`,
          humidity: `${Math.round(dayWeather.humidity)}%`,
          feelsLikeTemperature: `${Math.round(dayWeather.feels_like.day)} °F`,
          weatherDescription: dayWeather.weather[0].description,
          weatherIcon: dayWeather.weather[0].icon
        };

        // Create weather card
        const card = createWeatherCard(cityObj.city, cityObj.state, weatherData);
        

        // Append first card to currentWeatherCard container
        if (index === 0) {
          $('#currentWeatherCard').empty().append(card);
        } else {
          weatherCards.push(card);
        }
      });

      // Clear existing cards
      $('#next5DaysWeatherCards').empty();
      // Append remaining cards to next5DaysWeatherCards container
      weatherCards.forEach(card => {
        $('#next5DaysWeatherCards').append(card.addClass('next5DaysWeatherCard bg-dark text-white'));
      });
    })
    // Catch any errors and display an alert
    .catch(error => {
      alert('There was a problem with the fetch operation:\n' + error.message);
    });
}

// Function to display city buttons
function displayCityButtons() {
  // Clear the city buttons
  $('#cityButtons').empty();

  // Loop through the cityList array
  cityList.forEach(city => {
    // Create a button for each city
    const cityButton = $('<button>').addClass('btn btn-secondary citySearchBtn').text(city.city + ', ' + city.state).click(function () {
      getCityWeather(city);
    });

    // Append the button to the cityButtons div
    $('#cityButtons').append(cityButton);
  });

  // Create a new div for city buttons if it doesn't exist
  $('<div>').attr('id', 'cityButtonsContainer').insertAfter('#cityForm');
}

// Function to display city buttons and create event listeners
$(document).ready(function () {
  // Render city buttons
  displayCityButtons();

  // Event listener for addTaskBtn
  $('#citySearchBtn').click(function (event) {
    event.preventDefault();
    console.log('Button clicked'); // Log to check if button click event is firing
    storeCityData();
  });
});