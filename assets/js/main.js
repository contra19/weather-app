// Retrieve cities from localStorage, define cityName from user input and get today's date
const cityList = JSON.parse(localStorage.getItem("cities")) || [];
const cityName = $('#citySearch').val().trim();
const today = dayjs().format('MM/DD/YYYY');

function storeCityData() {
  // Get the city name from the input field
  const cityName = $('#citySearch').val().trim();
  $('#citySearch').val(''); 
  return(cityName);
}

function getCityInfo(cityName) {
  const countryCode = 'US';
  const limit = 1;
  const apiKey = "2047a67a588b23ff5f0cbae5a78800ec";

  const url = `http://api.openweathermap.org/geo/1.0/direct?q=${cityName},${countryCode}&limit=${limit}&appid=${apiKey}`;

  fetch(url)
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}, Message: ${response.statusText}`);
      }
      return response.json();
    })
    
    .then(data => {
        if (!data || !data[0]) {
          throw new Error('Invalid U.S. city name! Please try again with a valid U.S. city name.');
      }

    console.log('Response:', data); // Log the response here
    // Store the city data in an object
    let cityObj = {
      city: data[0].name,
      state: data[0].state,
      countryCode: data[0].country,
      latitude: data[0].lat,
      longitude:data[0].lon
  };

  // Push new cityObject to cityList
  cityList.push(cityObj);
 
  // Update localStorage with the updated cityList
  localStorage.setItem("cities", JSON.stringify(cityList));
  console.log('cityObj: ', cityObj);

  // Call getCityWeather to fetch weather information
  getCityWeather(cityObj);

  displayCityButtons();
  })
  .catch(error => {
    alert('There was a problem with the fetch operation:\n' + error.message);
  });
}

function getCityWeather(cityObj) {
  const cityName = encodeURIComponent(cityObj.city);
  const lat = cityObj.latitude;
  const lon = cityObj.longitude;
  const apiKey = "2047a67a588b23ff5f0cbae5a78800ec";

  const url = `http://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=imperial`;
  
  console.log('url:', url);
  fetch(url)
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}, Message: ${response.statusText}`);
      }
      return response.json();
    })
    .then(data => {
        if (!data || !data[0]) {
          throw new Error('No weather information available for selected city.');
        }

      console.log('Response:', data); // Log the response here
  
   })
  .catch(error => {
    alert('There was a problem with the fetch operation:\n' + error.message);
  });
}


function displayCityButtons() {
  // Clear the city buttons
  $('#cityButtons').empty();

  // Loop through the cityList array
  cityList.forEach(city => {
      // Create a button for each city
      const cityButton = $('<button>').addClass('btn btn-secondary').text(city.city + ', ' + city.state).click(function() {
          getCityWeather(city);
      });

      // Append the button to the cityButtons div
      $('#cityButtons').append(cityButton);
  });

  // Create a new div for city buttons if it doesn't exist
      $('<div>').attr('id', 'cityButtonsContainer').insertAfter('#cityForm');
  }
 

$(document).ready(function () {
  // Render city buttons
  displayCityButtons();  

  // Event listener for addTaskBtn
  $('#citySearchBtn').click(function(event) {
      event.preventDefault();
      const city = storeCityData();
      getCityInfo(city);
  });
});
