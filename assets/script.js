var searchHistoryList = $('#search-history-list');
var searchCityInput = $("#search-city");
var searchCityButton = $("#search-city-button");
var clearHistoryButton = $("#clear-history");

var currentCity = $("#current-city");
var currentTemp = $("#current-temp");
var currentHumidity = $("#current-humidity");
var currentWindSpeed = $("#current-wind-speed");
var UVindex = $("#uv-index");

var weatherContent = $("#weather-content");


var APIkey = "a17e1499228be1f9c294ac18b234c7d7";


var cityList = [];


var currentDate = moment().format('L');
$("#current-date").text("(" + currentDate + ")");


initalizeHistory();
showClear();


$(document).on("submit", function(){
    event.preventDefault();

  
    var searchValue = searchCityInput.val().trim();

    currentConditionsRequest(searchValue)
    searchHistory(searchValue);
    searchCityInput.val(""); 
});


searchCityButton.on("click", function(event){
    event.preventDefault();

  
    var searchValue = searchCityInput.val().trim();

    currentConditionsRequest(searchValue)
    searchHistory(searchValue);    
    searchCityInput.val(""); 
});


clearHistoryButton.on("click", function(){
    
    cityList = [];
    listArray();
    
    $(this).addClass("hide");
});


searchHistoryList.on("click","li.city-btn", function(event) {
    var value = $(this).data("value");
    currentConditionsRequest(value);
    searchHistory(value); 

});



function currentConditionsRequest(searchValue) {
    
  
    var queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + searchValue + "&units=imperial&appid=" + APIkey;
    

    
    $.ajax({
        url: queryURL,
        method: "GET"
    }).then(function(response){
        console.log(response);
        currentCity.text(response.name);
        currentCity.append("<small class='text-muted' id='current-date'>");
        $("#current-date").text("(" + currentDate + ")");
        currentCity.append("<img src='https://openweathermap.org/img/w/" + response.weather[0].icon + ".png' alt='" + response.weather[0].main + "' />" )
        currentTemp.text(response.main.temp);
        currentTemp.append("&deg;F");
        currentHumidity.text(response.main.humidity + "%");
        currentWindSpeed.text(response.wind.speed + "MPH");

        var lat = response.coord.lat;
        var lon = response.coord.lon;
        

        var UVurl = "https://api.openweathermap.org/data/2.5/uvi?&lat=" + lat + "&lon=" + lon + "&appid=" + APIkey;
        
        $.ajax({
            url: UVurl,
            method: "GET"
        }).then(function(response){
            // console.log("UV call: ")
            // console.log(response);
            UVindex.text(response.value);
            if (response.value < 3) {
                UVindex.addClass('uvIndex1');
            }
            else if (3 <= response.value < 6) {
                UVindex.addClass('uvIndex2');
            }
            else if (6 <= response.value < 8) {
                UVindex.addClass('uvIndex3');
            }
            else if (9 <= response.value) {
                UVindex.addClass('uvIndex4');
            }
        });

        var countryCode = response.sys.country;
        var forecastURL = "https://api.openweathermap.org/data/2.5/forecast?&units=imperial&appid=" + APIkey + "&lat=" + lat +  "&lon=" + lon;
        
        $.ajax({
            url: forecastURL,
            method: "GET"
        }).then(function(response){
            console.log(response);
            $('#five-day-forecast').empty();
            for (var i = 1; i < response.list.length; i+=8) {

                var forecastDateString = moment(response.list[i].dt_txt).format("L");
                console.log(forecastDateString);

                var forecastCol = $("<div class='col-12 col-md-6 col-lg forecast-day mb-3'>");
                var forecastCard = $("<div class='card'>");
                var forecastCardBody = $("<div class='card-body'>");
                var forecastDate = $("<h5 class='card-title'>");
                var forecastIcon = $("<img>");
                var forecastTemp = $("<p class='card-text mb-0'>");
                var forecastHumidity = $("<p class='card-text mb-0'>");
                var forecastWind = $("<p class='card-text mb-0'>")


                $('#five-day-forecast').append(forecastCol);
                forecastCol.append(forecastCard);
                forecastCard.append(forecastCardBody);

                forecastCardBody.append(forecastDate);
                forecastCardBody.append(forecastIcon);
                forecastCardBody.append(forecastTemp);
                forecastCardBody.append(forecastHumidity);
                forecastCardBody.append(forecastWind);
                
                forecastIcon.attr("src", "https://openweathermap.org/img/w/" + response.list[i].weather[0].icon + ".png");
                forecastIcon.attr("alt", response.list[i].weather[0].main)
                forecastDate.text(forecastDateString);
                forecastTemp.text(response.list[i].main.temp);
                forecastTemp.prepend("Temp: ");
                forecastTemp.append("&deg;F");
                forecastHumidity.text(response.list[i].main.humidity);
                forecastHumidity.prepend("Humidity: ");
                forecastHumidity.append("%");
                forecastWind.text(response.list[i].wind.speed);
                forecastWind.prepend("Wind: ");
                forecastWind.append("MPH");

            }
        });

    });

    

};


function searchHistory(searchValue) {
    
    if (searchValue) {
        if (cityList.indexOf(searchValue) === -1) {
            cityList.push(searchValue);
            listArray();
            clearHistoryButton.removeClass("hide");
            weatherContent.removeClass("hide");
        } else {
            var removeIndex = cityList.indexOf(searchValue);
            cityList.splice(removeIndex, 1);
            cityList.push(searchValue);
            listArray();
            clearHistoryButton.removeClass("hide");
            weatherContent.removeClass("hide");
        }
    }
}

function listArray() {
    searchHistoryList.empty();
    cityList.forEach(function(city){
        var searchHistoryItem = $('<li class="list-group-item city-btn">');
        searchHistoryItem.attr("data-value", city);
        searchHistoryItem.text(city);
        searchHistoryList.prepend(searchHistoryItem);
    });
    localStorage.setItem("cities", JSON.stringify(cityList));
    
}
function initalizeHistory() {
    if (localStorage.getItem("cities")) {
        cityList = JSON.parse(localStorage.getItem("cities"));
        var lastIndex = cityList.length - 1;
        listArray();
        if (cityList.length !== 0) {
            currentConditionsRequest(cityList[lastIndex]);
            weatherContent.removeClass("hide");
        }
    }
}

function showClear() {
    if (searchHistoryList.text() !== "") {
        clearHistoryButton.removeClass("hide");
    }
}