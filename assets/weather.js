var isCity1Valid = "";
var isCity2Valid = "";
var apiKey = "";    //need to generate an API key from https://openweathermap.org/api 
var City1Name = "";
var City1Code = "";
var City2Name = "";
var City2Code = "";
var City1Weather = [];
var City2Weather = [];
var AllWeather = [City1Weather, City2Weather];
var preferences = [];

$(document).ready(function () {
    //when document fully loaded, display the date, load/show 
    displayDate();
    loadPreferences();
    City1Name = document.getElementById("city1Name").value;
    City1Code = document.getElementById("city1Code").value;
    City2Name = document.getElementById("city2Name").value;
    City2Code = document.getElementById("city2Code").value;
    getWeather(1);
    getWeather(2);

    
});

function displayDate()
{

    var today = new Date();
    var daysOfWeek = ["Sun", "Mon", "Tues", "Wed", "Thur", "Fri", "Sat"]; 
    var monthsOfYear = ["January", "February", "March", "April", "May", "June", 
                        "July", "August", "September", "October", "November", "December"];
    var dateString = daysOfWeek[today.getDay()] + " " + monthsOfYear[today.getMonth()] + " " + today.getDate() + ", " + today.getFullYear(); 
  
    document.getElementById('dateField').value = dateString;
} 

function loadPreferences()
{
    var userPreferences = localStorage.getItem('userPreferences');

    if (userPreferences) { //is not null
        preferences = JSON.parse(userPreferences);
        //set temperature unit value
        if (preferences[0] == true) {
            document.getElementById("CelsiusRadio").checked = true;
        }
        else {
            document.getElementById("FahrenheitRadio").checked = true;
        }
        //set city name/country code values
        document.getElementById("city1Name").value = preferences[1];
        document.getElementById("city1Code").value = preferences[2];
        document.getElementById("city2Name").value = preferences[3];
        document.getElementById("city2Code").value = preferences[4];
  
    }
}

function processForm() { //called when temperature radio button changes
    displayDate();
    //updates current global variables based on what's in the input boxes, then tries to get weather based on results
    City1Name = document.getElementById("city1Name").value;
    City1Code = document.getElementById("city1Code").value;
    City2Name = document.getElementById("city2Name").value;
    City2Code = document.getElementById("city2Code").value;
    getWeather(1);
    getWeather(2);
}

function processCity1() { //called when city 1 values change
    displayDate() 
    //updates current global variables based on what's in the input boxes, then tries to get weather based on results
     City1Name = document.getElementById("city1Name").value;
     City1Code = document.getElementById("city1Code").value;
     getWeather(1);
}

function processCity2() { //called when city 2 values change
    displayDate();
    City2Name = document.getElementById("city2Name").value;
    City2Code = document.getElementById("city2Code").value;
    getWeather(2);
}

function savePreferences() {
  
    preferences[0] =  document.getElementById("CelsiusRadio").checked;
    
    //in getWeather method, if city didn't return API results, it's marked not valid on global variable
    if (isCity1Valid) {
        preferences[1] = document.getElementById("city1Name").value; //only updates global preferences if city is valid
        preferences[2] = document.getElementById("city1Code").value;      
    }

    if (isCity2Valid) {
        preferences[3] = document.getElementById("city2Name").value;
        preferences[4] = document.getElementById("city2Code").value;
    }

    localStorage.setItem('userPreferences', JSON.stringify(preferences));
        
}

//gets the city, latitude, and longitude of user-specified city name to use in second API call
function getLocation(cityObject)
{
    var location = {};
    location['city_name'] = cityObject["name"];
    location.latitude = cityObject["coord"]["lat"];
    location.longitude = cityObject["coord"]["lon"];

    return location;
}

//formats epoch datetime returned from API into time-only that users can read https://www.epochconverter.com/programming/#javascript
function formatAPI_Time(epoch){
    var x = new Date(epoch*1000); //JS stores dates in milliseconds but epoch dt's are in seconds - need to multiply by 1000 to get ms
    x = x.toLocaleTimeString();   //https://www.w3schools.com/jsref/jsref_tolocaletimestring.asp
    return x;
}

//function to pull needed information from API object and add to strings that will be displayed https://openweathermap.org/api/one-call-api#example
//property names are tied to related IDs in html
function getCurrentWeather(cityObject, cityNum)
{
    var x = ""; //placeholder for some string building
    var currentWeather = {};

    currentWeather.city_name = cityObject["name"];
    currentWeather.CurrentTime = "Last updated at " +formatAPI_Time(cityObject["dt"]);
    currentWeather.CurrentIcon = cityObject["weather"][0]["icon"];
    currentWeather.CurrentDesc = cityObject["weather"][0]["description"];
    currentWeather.CurrentPressure = "Pressure: "+cityObject["main"]["pressure"]+" hPa";
    currentWeather.CurrentWind = "Wind: "+getWindDirection(cityObject["wind"]["deg"]) 
                + " " + ((cityObject["wind"]["speed"])*3.6).toFixed(2) +" km/hr";
    currentWeather.Sunrise = "Sunrise: " +formatAPI_Time(cityObject["sys"]["sunrise"]);
    currentWeather.Sunset = "Sunset: " +formatAPI_Time(cityObject["sys"]["sunset"]);
    currentWeather.Latitude = "Latitude: " + cityObject["coord"]["lat"];
    currentWeather.Longitude = "Longitude: " + cityObject["coord"]["lon"];
    if (document.getElementById("CelsiusRadio").checked){
        var a = (cityObject["main"]["temp"] - 273.15).toFixed(2);
        x = "Temperature: " +a +" " +String.fromCharCode(176) +"C"; //degree symbol inserted
    }
    else if (!document.getElementById("CelsiusRadio").checked){
        var a = ((9/5)*(cityObject["main"]["temp"] - 273.15)+32).toFixed(2);
        x = "Temperature: " +a + " F";
    }
    currentWeather.CurrentTemp = x;
    
    if (cityNum == 1){
        City1Weather[0] = currentWeather;
    }
    else {
        City2Weather[0] = currentWeather;
    }
}

//function to pull needed information from API object and add to strings that will be displayed https://openweathermap.org/api/one-call-api#example
//property names are tied to related IDs in html
function getForecastWeather(obj, cityNum)
{
    var x = ""; //temporary string building variable
    //information for each hour goes into an object
    var Hour1 = {};
    Hour1.Time = formatAPI_Time(obj["hourly"][1]["dt"]);
    Hour1.POP = "POP: " + ((obj["hourly"][1]["pop"])*100).toFixed(0) + "%";
    Hour1.Pic = obj["hourly"][1]["weather"][0]["icon"];
    Hour1.Description = obj["hourly"][1]["weather"][0]["description"];
    Hour1.Pressure = "Pressure: "+obj["hourly"][1]["pressure"]+" hPa";
    Hour1.Wind = "Wind: "+getWindDirection(obj["hourly"][1]["wind_deg"]) 
                + " " + ((obj["hourly"][1]["wind_speed"])*3.6).toFixed(2) +" km/hr";
    if (document.getElementById("CelsiusRadio").checked){ //checks whether data should be stored in C or F units
        var a = (obj["hourly"][1]["temp"] - 273.15).toFixed(2);
        x = "Temperature: " +a +" " +String.fromCharCode(176)+ "C";
    }
    else if (!document.getElementById("CelsiusRadio").checked){
        var a = ((9/5)*(obj["hourly"][1]["temp"] - 273.15)+32).toFixed(2);
        x = "Temperature: " +a + " F";
    }
    Hour1.Temp = x;
   
    var Hour2 = {};
    Hour2.Time = formatAPI_Time(obj["hourly"][2]["dt"]);
    Hour2.POP = "POP: " + ((obj["hourly"][2]["pop"])*100).toFixed(0) + "%";
    Hour2.Pic = obj["hourly"][2]["weather"][0]["icon"];
    Hour2.Description = obj["hourly"][2]["weather"][0]["description"];
    Hour2.Pressure = "Pressure: "+obj["hourly"][2]["pressure"]+" hPa";
    Hour2.Wind = "Wind: "+getWindDirection(obj["hourly"][2]["wind_deg"]) 
                + " " + ((obj["hourly"][2]["wind_speed"])*3.6).toFixed(2) +" km/hr";
    if (document.getElementById("CelsiusRadio").checked){
        var a = (obj["hourly"][2]["temp"] - 273.15).toFixed(2);
        x = "Temperature: " +a +" " +String.fromCharCode(176)+ "C";
    }
    else if (!document.getElementById("CelsiusRadio").checked){
        var a = ((9/5)*(obj["hourly"][2]["temp"] - 273.15)+32).toFixed(2);
        x = "Temperature: " +a + " F";
    }
    Hour2.Temp = x;

    var Hour3 = {};
    Hour3.Time = formatAPI_Time(obj["hourly"][3]["dt"]);
    Hour3.POP = "POP: " + ((obj["hourly"][3]["pop"])*100).toFixed(0) + "%";
    Hour3.Pic = obj["hourly"][3]["weather"][0]["icon"];
    Hour3.Description = obj["hourly"][3]["weather"][0]["description"];
    Hour3.Pressure = "Pressure: "+obj["hourly"][3]["pressure"]+" hPa";
    Hour3.Wind = "Wind: "+getWindDirection(obj["hourly"][3]["wind_deg"]) 
                + " " + ((obj["hourly"][3]["wind_speed"])*3.6).toFixed(2) +" km/hr";
    if (document.getElementById("CelsiusRadio").checked){
        var a = (obj["hourly"][3]["temp"] - 273.15).toFixed(2);
        x = "Temperature: " +a+" " +String.fromCharCode(176) + "C";
    }
    else if (!document.getElementById("CelsiusRadio").checked){
        var a = ((9/5)*(obj["hourly"][3]["temp"] - 273.15)+32).toFixed(2);
        x = "Temperature: " +a + " F";
    }
    Hour3.Temp = x;

    //assign objects to proper city; each city has an array of objects representing current[0] and forecasted weather
    if (cityNum == 1){
        City1Weather[1] = Hour1;
        City1Weather[2] = Hour2;
        City1Weather[3] = Hour3;
    }
    else {
        City2Weather[1] = Hour1;
        City2Weather[2] = Hour2;
        City2Weather[3] = Hour3; 
    }
}

//convert azimuth (degree) direction to cardinal direction to show user useful information
function getWindDirection(deg)
{
    //information from http://snowfence.umn.edu/Components/winddirectionanddegrees.htm
    var cardinalDir = "";
    if (deg > 348.75 || deg < 11.25){
        cardinalDir = "N";
    }
    else if (11.25 <= deg < 33.75) {
        cardinalDir = "NNE";
    }
    else if (33.75 <= deg < 56.25) {
        cardinalDir = "NE";
    }
    else if (56.25 <= deg < 78.75) {
        cardinalDir = "ENE";
    }
    else if (78.75 <= deg < 101.25) {
        cardinalDir = "E";
    }
    else if (101.25 <= deg < 123.75) {
        cardinalDir = "ESE";
    }
    else if (123.75 <= deg < 146.25) {
        cardinalDir = "SE";
    }
    else if (146.25 <= deg < 168.75) {
        cardinalDir = "SSE";
    }
    else if (168.75 <= deg < 191.25) {
        cardinalDir = "S";
    }
    else if (191.25 <= deg < 213.75) {
        cardinalDir = "SSW";
    }
    else if (213.75 <= deg < 236.25) {
        cardinalDir = "SW";
    }
    else if (236.25 <= deg < 258.75) {
        cardinalDir = "WSW";
    }
    else if (258.75 < deg < 281.25) {
        cardinalDir = "W";
    }
    else if (281.25 <= deg < 303.75) {
        cardinalDir = "WNW";
    }
    else if (303.75 <= deg < 326.25) {
        cardinalDir = "NW";
    }
    else if (326.25 <= deg < 348.75) {
        cardinalDir = "NNW";
    }

    return cardinalDir;
}

//uses city number requested to perform AJAX update to information from page using OpenWeather API calls
function getWeather(cityNum)
{
    if (cityNum == 1)
    {
        cityName = City1Name;
        cityCode = City1Code;
    }
    else {
        cityName = City2Name;
        cityCode = City2Code;
    }

    var xhttp1 = new XMLHttpRequest();
    xhttp1.onreadystatechange = function() {
        
        if (this.readyState == 4 && this.status == 200) {
            var cityResponse = this.responseText; //capture API response
            var cityCurrentObj = JSON.parse(cityResponse); //parse from JSON
            cityLocation = getLocation(cityCurrentObj); //use information to get city coordinates for inner request
            getCurrentWeather(cityCurrentObj, cityNum); //use other current weather info to create weather data object
            displayCurrentWeather(cityNum); //display current weather for appropriate city

            var xhttp2 = new XMLHttpRequest(); //inner request for forecast data

            xhttp2.onreadystatechange = function() { //when state changes (request completed and info returned successfully)
                if (this.readyState == 4 && this.status == 200) {
                    var coordResponse = this.responseText
                    var cityForecastObj = JSON.parse(coordResponse);
                    
                    getForecastWeather(cityForecastObj, cityNum); //use returned/parsed object to create forecast sections of weather data object
                    displayForecastWeather(cityNum); //display forecast data for appropriate city
                }

                if (this.readyState == 4 && this.status != 200) {
                    window.alert("Forecast data could not be retrieved at this time.");
                }
                
            }
            
            //use city's lat and long to create search string for inner request
            /* SearchString2 = "https://api.openweathermap.org/data/2.5/onecall?" +
                        "lat=" + cityLocation.latitude + "&lon=" + cityLocation.longitude + 
                        "&exclude=minutely,daily,alerts&appid=" + apiKey ; */
            SearchString2 = "https://api.openweathermap.org/data/2.5/weather?" +
                        "lat=" + cityLocation.latitude + "&lon=" + cityLocation.longitude + 
                        "&appid=" + apiKey ;
                    
            xhttp2.open("GET", SearchString2, true); //open request using search string and asynchronous request
        
            xhttp2.send(); //send the request
        }

        if (this.readyState == 4 && this.status !=200 ) { //if request was not successful
                       
            if (cityNum == 1 && (City1Name != "" || City1Code != "")){ //city 1 and neither field is blank
                isCity1Valid = false; //mark offending city as not valid (used in saving preferences)
                window.alert("City 1 name not found.");
                document.getElementById("city1Name").blur(); //https://www.w3schools.com/jsref/met_html_blur.asp
                document.getElementById("city1Code").blur(); //if focus not removed from offending field, enters infinite loop of alerts
                clearTable(1); //clear weather information for that city
            }
            else if (cityNum == 2 && (City2Name != "" || City2Code != "")){ //city 2 and neither field is blank
                isCity2Valid = false;
                window.alert("City 2 name not found.");
                document.getElementById("city2Name").blur();
                document.getElementById("city2Code").blur();
                clearTable(2);
            }
           
        }
        if (this.readyState == 4) { //save only when response is complete and has checked above if cities are invalid
            savePreferences();
            isCity2Valid = true;
            isCity1Valid = true;
        }
        
    }

    //make search string for first API request using desired city name and country code
    SearchString1 = "http://api.openweathermap.org/data/2.5/weather" +
                        "?q=" + cityName + "," + cityCode +
                        "&APPID=" + apiKey;
    
    
    xhttp1.open("GET", SearchString1, true); //open request using search string and asynchronous request

    xhttp1.send(); //send request

}

//displays current weather data
function displayCurrentWeather(cityNum) {
    
    //using for-in loops: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for...in
    for (var propertyName in AllWeather[cityNum-1][0]){ 
        //each property name of an object is used in finding the field it goes to and assigning its value
        if (propertyName == "CurrentIcon"){ //pictures handled differently
            var imageSource = "http://openweathermap.org/img/wn/" + AllWeather[cityNum-1][0][propertyName] + "@2x.png";       
            $('#city'+cityNum+propertyName).attr('src', imageSource);
        }
        else {
            var value = AllWeather[cityNum-1][0][propertyName].toString(); //create string of information stored to property name
            $('#city'+cityNum+propertyName).text(value); //assign to appropriate id in HTML code
        }
    }
    
}

//displays forecast data for 3 hours
function displayForecastWeather(cityNum) {
    
    for (var i = 1; i < 4; i++){ //iterated over hours 1, 2, 3
        for (var propertyName in AllWeather[cityNum-1][i]){ //for-in loop: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for...in
            if (propertyName == "Pic"){
                var imageSource = "http://openweathermap.org/img/wn/" + AllWeather[cityNum-1][i][propertyName] + "@2x.png";       
                $('#city'+cityNum+"Hour"+i+propertyName).attr('src', imageSource);
            }
            else {
                var value = AllWeather[cityNum-1][i][propertyName].toString();
                $('#city'+cityNum+"Hour"+i+propertyName).text(value);
            }
        } 
    }
}

//clear innerHTML from (almost) all elements of a table
function clearTable(cityNum) {
    var table = document.getElementById("table"+cityNum).querySelectorAll("*");  //https://www.w3schools.com/jsref/met_element_queryselectorall.asp
    for (var i = 0; i < table.length; i++) {
        var child = table[i];
        //looks for "title" class so that HTML is preserved
        if (child.className.toLowerCase() != "title" && child.tagName.toLowerCase() == "td"){
            var grandbabies = child.children;  //https://www.w3schools.com/jsref/prop_element_children.asp
            //looks for image tags so they aren't cleared away
            if (grandbabies.length > 0 && grandbabies[0] != null && grandbabies[0].tagName.toLowerCase() == "img"){
                grandbabies[0].src = "";
            }
            else {
                child.innerHTML = "";
            }
        }
    }
}

