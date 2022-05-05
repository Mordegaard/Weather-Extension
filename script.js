const googleApiKey = config.GoogleApiKey,
      openweatherApiKey = config.OpenWeatherApiKey;
      bingApiKey = config.BingApiKey;

var lat = 50.4501, lon = 30.5234;
var city = "Київ";

navigator.geolocation.getCurrentPosition(position=>{
  console.log(position);
  lat = position.coords.latitude;
  lon = position.coords.longitude;
  locationWeather();
}, err=>{
  locationWeather();
});

function locationWeather() {
  Promise.all([
    fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&lang=ua&units=metric&appid=${openweatherApiKey}`),
    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`)
  ]).then(responses=>Promise.all(responses.map(response => response.json()))).then(data=>{
    console.log("Місто за координатами", data[1]);
    document.body.classList.add("loaded");
    city = data[1].address?.city || data[1].address?.state;
    changeWeather(data[0]);
  }).catch(err=>console.log(err));
}

function getIcons(code) {
  let icon, smallIcon, background;
  switch (code) {
    case 200:
    case 201:
    case 202:
    case 212:
    case 230:
    case 231:
    case 232: // thunderstorm
      icon = "materials/weather icons/thunderstorm.svg";
      smallIcon = "⛈\uFE0F";
      background = 'url("materials/weather images/thunder-landscape.jpg") 50% 50% / cover';
      break;

    case 210:
    case 211:
    case 221: // thunder
      icon = "materials/weather icons/storm.svg";
      smallIcon = "⚡\uFE0F";
      background = 'url("materials/weather images/thunder-landscape.jpg") 50% 50% / cover';
      break;

    case 300:
    case 301: // rainy
      icon = "materials/weather icons/rainy.svg";
      smallIcon = "☔\uFE0F";
      background = 'url("materials/weather images/rainy-landscape.jpg") 50% 50% / cover';
      break;

    case 302:
    case 310:
    case 311:
    case 312:
    case 313:
    case 314:
    case 321:
    case 500:
    case 501:
    case 502:
    case 503:
    case 504:
    case 520:
    case 521:
    case 522:
    case 531: // rain
      icon = "materials/weather icons/rain.svg";
      smallIcon = "🌧\uFE0F";
      background = 'url("materials/weather images/rainy-landscape.jpg") 50% 50% / cover';
      break;

    case 511:
    case 600:
    case 601: // snowfall
      icon = "materials/weather icons/snow.svg";
      smallIcon = "🌨\uFE0F";
      background = 'url("materials/weather images/snowfall-landscape.jpg") 50% 50% / cover';
      break;

    case 602:
    case 611:
    case 612:
    case 613:
    case 615:
    case 616:
    case 620:
    case 621:
    case 622: // blizzard
      icon = "materials/weather icons/snow.svg";
      smallIcon = "🌨\uFE0F";
      background = 'url("materials/weather images/snowfall-landscape.jpg") 50% 50% / cover';
      break;

    case 701:
    case 711:
    case 721:
    case 731:
    case 741:
    case 751:
    case 761:
    case 762:
    case 771:
    case 781: // fog
      icon = "materials/weather icons/foggy.svg";
      smallIcon = "🌫\uFE0F";
      background = 'url("materials/weather images/fog-landscape.jpg") 50% 50% / cover';
      break;

    case 800: // clear
      icon = "materials/weather icons/sun.svg";
      smallIcon = "☀\uFE0F";
      background = 'url("materials/weather images/sunny-landscape.jpg") 50% 50% / cover';
      break;

    case 801:
    case 802:// cloudy
      icon = "materials/weather icons/cloudy.svg";
      smallIcon = "🌥\uFE0F";
      background = 'url("materials/weather images/half-cloudy-landscape.jpg") 50% 50% / cover';
      break;

    case 803:
    case 804: // clouds
      icon = "materials/weather icons/cloudy.svg";
      smallIcon = "☁\uFE0F";
      background = 'url("materials/weather images/cloudy-landscape.jpg") 50% 50% / cover';
      break;
  }
  return [smallIcon, icon, background];
}

function changeWeather(res) {
  // Current weather changing
  let description = id("weatherDescription").children;
  id("weatherDegrees").innerText = Math.round(res.hourly[0].temp+2) + '°C';
  id("weatherFeelsLike").innerText = 'Відчувається як ' + Math.round(res.current['feels_like']+2) + '°C';
  let weatherId = parseInt(res.hourly[0].weather[0].id);
  let icons = getIcons(weatherId);
  document.body.style.background = icons[2];
  id("weatherIcon").tag("img")[0].src = icons[1];
  description[0].innerText = icons[0] + res.current.weather[0].description;
  description[1].innerText = '💧' + res.current.humidity + '%';
  description[2].innerText = '🚩\uFE0F' + res.current['wind_speed'] + 'м/с';
  let sunrise = new Date(res.current.sunrise * 1000), sunset = new Date(res.current.sunset * 1000);
  id("sunriseTime").innerText = ("0" + sunrise.getHours()).substr(-2) + ":" + ("0" + sunrise.getMinutes()).substr(-2);
  id("sunsetTime").innerText = ("0" + sunset.getHours()).substr(-2) + ":" + ("0" + sunset.getMinutes()).substr(-2);
  id("cityName").innerText = city;
  //Weekly weather changing
  id("week").innerHTML = "";
  let dts = ["Нд", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];
  for (let i=0; i<8; i++) {
    let date = new Date();
    date.setDate(date.getDate()+i);
    let day = date.getDay();
    date = ("0" + date.getDate()).substr(-2) + "." + ("0" + (date.getMonth()+1)).substr(-2);
    let icons = getIcons(res.daily[i].weather[0].id);
    let block = document.createElement('div');
    block.classList.add("day", "flexed");
    block.innerHTML = `
      <span class="day-name">${dts[day]}</span>
      <img class="day-icon" src="${icons[1]}"/>
      <span class="day-weather-degrees">${Math.round(res.daily[i].temp.min+1)}-${Math.round(res.daily[i].temp.max+2)}°C</span>
      <span class="day-date">${date}</span>
    `;
    id("week").append(block);
  }
  //Hourly weather changing
  id("hourly").innerHTML = "";
  for (let i=0; i<24; i++) {
    let date = new Date();
    date.setTime(date.getTime() + (i * 60 * 60 * 1000));
    date = ("0" + date.getHours()).substr(-2) + ":00";
    let icons = getIcons(res.hourly[i].weather[0].id);
    let block = document.createElement('div');
    block.classList.add("hour", "flexed");
    block.innerHTML = `
      <img src="${icons[1]}"/>
      <span>
        <span title="Температура">🌡\uFE0F${Math.round(res.hourly[i].temp+2)}°C</span>
        <br/>
        <span title="Вірогідність опадів">☔${Math.round(res.hourly[i].pop*100)}%</span>
      </span>
      <span class="hour-time">${date}</span>
    `;
    id("hourly").append(block);
  }
  console.log("Погода", res);
}

id("searchInput").onchange = changeCity;
id("searchButton").onclick = changeCity;

function changeCity() {
  let input = id("searchInput");
  let cityInput = input.value;
  if (cityInput) fetch(`https://nominatim.openstreetmap.org/search?format=json&city=${cityInput}`).then(res=>{return res.json()}).then(res=>{
    console.log("Координати за назвою міста", res);
    if (res?.[0]) {
      ({lat, lon} = res[0]);
      city = res[0].display_name.split(',')[0];
      fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&lang=ua&units=metric&appid=${openweatherApiKey}`)
        .then(res=>{return res.json()}).then(res=>changeWeather(res));
    } else {
      input.value = "";
      input.parentElement.style.animation = "shake 0.333s linear";
      setTimeout(()=>input.parentElement.style.animation = "", 334);
    }
  });
}

id("detailsArrow").onclick = function() {
  id("today").changeVisible();
}

id("hourly").onmousewheel = function(e) {
  //this.scrollLeft += e.deltaY * 0.2;
  animateScroll(this, e.deltaY * 0.33, 150);
};

function animateScroll(block, pos, time) {
  setTimeout(()=>{
    if (pos > 1) {
      block.scrollLeft += 1;
      animateScroll(block, --pos, time);
    } else if (pos < -1) {
      block.scrollLeft -= 1;
      pos++;
      animateScroll(block, ++pos, time);
    }
  }, time/pos);
}

id("currentLocation").onclick = function() {
  navigator.geolocation.getCurrentPosition(position=>{
    console.log(position);
    lat = position.coords.latitude;
    lon = position.coords.longitude;
    locationWeather();
  }, err=>{
    locationWeather();
  });
}
