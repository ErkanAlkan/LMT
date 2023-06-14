const express = require("express");
const mongoose = require("mongoose");
const _ = require("lodash");
const app = express();
const https = require("https");

app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: true }))
app.use(express.static("public"));

mongoose.connect('mongodb://127.0.0.1:27017/todolistDB');

const listSchema = new mongoose.Schema({
  name: String,
  items: [],
  checkboxStatus: []
});

const List = mongoose.model("List", listSchema);


const initialList = "Quick List"
var selectedListName = initialList;
var selectedListItems = [];
var selectedListCheckboxes = [];
var cityQuery = "Ravenna";



app.get("/", function (req, res) {
  res.render("home");
});

//TO DO List section//
app.get("/Todolists", function (req, res) {
  List.find({}).select("_id").then(function (exist) {
    if (exist.length === 0) {
      const list = new List({
        name: initialList,
        items: [],
        checkboxStatus: []
      });
      list.save();
      selectedListName = initialList;
      selectedListItems = [];
      selectedListCheckboxes = [];
    }
  });
  List.find({}).select("name").then(function (allLists) {
    res.render("list", { allLists: allLists, selectedListName: selectedListName, selectedListItems: selectedListItems, selectedListCheckboxes: selectedListCheckboxes });
  });
});

app.post("/additems", function (req, res) {
  const newItem = _.capitalize(req.body.newItem);
  var sameItem = "false";

  if (selectedListName === "Please Choose or Create a List") {
    console.log("Cannot add Items , please choose or Create a List");
    res.redirect("/Todolists");
  } else {
    List.findOne({ name: selectedListName }).then(function (foundList) {
      for (let i = 0; i < foundList.items.length; i++) {
        if (newItem === foundList.items[i]) {
          sameItem = "true"
        }
      }
      if (sameItem === "false") {
        foundList.items.push(newItem);
        foundList.checkboxStatus.push("notChecked");
        foundList.save();
        selectedListItems = foundList.items;
        selectedListCheckboxes = foundList.checkboxStatus;
        res.redirect("/Todolists");
      } else {
        List.find({}).select("name").then(function (allLists) {
          res.render("sameitem", { allLists: allLists, selectedListName: selectedListName, selectedListItems: selectedListItems, selectedListCheckboxes: selectedListCheckboxes });
        });
      }
    });
  }
});

app.post("/deleteItems", function (req, res) {
  const deleteItems = req.body.deleteItems;
  List.findOne({ name: selectedListName }).then(function (foundList) {
    foundList.items.splice(deleteItems, 1);
    foundList.checkboxStatus.splice(deleteItems, 1);
    foundList.save();
    selectedListItems = foundList.items;
    selectedListCheckboxes = foundList.checkboxStatus;
  });
  res.redirect("/Todolists");
});

app.post("/checkboxClick", function (req, res) {
  var clickedBox = req.body.checkboxStatus;
  List.findOne({ name: selectedListName }).then(function (foundList) {
    if (foundList.checkboxStatus[clickedBox] === "notChecked") {
      foundList.checkboxStatus[clickedBox] = "checked"
      foundList.save();
      selectedListCheckboxes = foundList.checkboxStatus;
    } else {
      foundList.checkboxStatus[clickedBox] = "notChecked"
      foundList.save();
      selectedListCheckboxes = foundList.checkboxStatus;
    }
  });
  res.redirect("/Todolists");
});

app.post("/deleteLists", function (req, res) {
  const deleteLists = req.body.deleteLists;
  if (deleteLists === selectedListName) {
    selectedListName = "Please Choose or Create a List"
    selectedListItems = [];
    selectedListCheckboxes = [];
  };
  List.findOneAndDelete({ name: deleteLists }).then(function () {

  });
  res.redirect("/Todolists");
});


app.post("/createNewList", function (req, res) {
  const newListName = _.startCase(req.body.newListName);
  if (newListName === "") {
    res.send("<h1>List name can't be empty!");
  } else {
    List.findOne({ name: newListName }).then(function (foundList) {
      if (!foundList) {
        const newList = new List({
          name: newListName,
          items: [],
          checkboxStatus: []
        });
        newList.save();
        res.redirect("/Todolists");
      } else {
        List.find({}).select("name").then(function (allLists) {
          res.render("sameitem", { allLists: allLists, selectedListName: selectedListName, selectedListItems: selectedListItems, selectedListCheckboxes: selectedListCheckboxes });
        });
      }
    });
  }
});

app.post("/selectingList", function (req, res) {
  selectedListName = req.body.selectedListNameButton;
  List.findOne({ name: selectedListName }).then(function (foundList) {
    if (!foundList) {
      List.findOne({ name: initialList }).then(function (firstList) {
        selectedListItems = firstList.items;
        selectedListCheckboxes = firstList.checkboxStatus;
      });
    } else {
      selectedListItems = foundList.items;
      selectedListCheckboxes = foundList.checkboxStatus;
    }
  });
  res.redirect("/Todolists");
});

//Meteorology Section//
app.get("/Meteorology", function (req, res) {

  const appKey = "c600cd74b89ca2bf564dae8d62c0ee12";
  const units = "metric"
  const urlWeather = "https://api.openweathermap.org/data/2.5/weather?appid=" + appKey + "&units=" + units + "&q=" + cityQuery + ""
  const urlForecast = "https://api.openweathermap.org/data/2.5/forecast?appid=" + appKey + "&units=" + units + "&q=" + cityQuery + ""

  var temp = "";
  var weatherDescription = "";
  var icon = "";
  var weatherConditionUrl = "";


  https.get(urlWeather, function (response) {

    if (response.statusCode === 200) {
      response.on("data", function (data) {
        const weatherData = JSON.parse(data);
        temp = weatherData.main.temp;
        weatherDescription = weatherData.weather[0].description;
        icon = weatherData.weather[0].icon;
        weatherConditionUrl = "https://openweathermap.org/img/wn/" + icon + "@2x.png"
        // res.write("<p>The weather is currently " + weatherDescription + "</p>");
        // res.write("<h2>The temperature in " + query + " is " + temp + " degrees Celcius</h2>");
        // res.write("<img src=" + weatherConditionUrl + ">");
        // res.send();

        https.get(urlForecast, function (response) {

          if (response.statusCode === 200) {
            let data1 = "";

            response.on("data", function (chunk) {
              data1 += chunk;
            });

            response.on("end", function () {
              try {
                const forecastData = JSON.parse(data1);
                var unixTimeDayOne = forecastData.list[0].dt;
                var unixTimeDayTwo = forecastData.list[1].dt;
                var unixTimeDayThree = forecastData.list[2].dt;
                var unixTimeDayFour = forecastData.list[3].dt;
                var unixTimeDayFive = forecastData.list[4].dt;
                var minTempDayOne = forecastData.list[0].main.temp_min;
                var minTempDayTwo = forecastData.list[1].main.temp_min;
                var minTempDayThree = forecastData.list[2].main.temp_min;
                var minTempDayFour = forecastData.list[3].main.temp_min;
                var minTempDayFive = forecastData.list[4].main.temp_min;
                var maxTempDayOne = forecastData.list[0].main.temp_max;
                var maxTempDayTwo = forecastData.list[1].main.temp_max;
                var maxTempDayThree = forecastData.list[2].main.temp_max;
                var maxTempDayFour = forecastData.list[3].main.temp_max;
                var maxTempDayFive = forecastData.list[4].main.temp_max;
                var iconDayOne = forecastData.list[0].weather[0].icon;
                var iconDayTwo = forecastData.list[1].weather[0].icon;
                var iconDayThree = forecastData.list[2].weather[0].icon;
                var iconDayFour = forecastData.list[3].weather[0].icon;
                var iconDayFive = forecastData.list[4].weather[0].icon;
                var dayOne = new Date(unixTimeDayOne * 1000).toLocaleString('en-us', { weekday: 'short' });
                var dayTwo = new Date(unixTimeDayTwo * 1000).toLocaleString('en-us', { weekday: 'short' });
                var dayThree = new Date(unixTimeDayThree * 1000).toLocaleString('en-us', { weekday: 'short' });
                var dayFour = new Date(unixTimeDayFour * 1000).toLocaleString('en-us', { weekday: 'short' });
                var dayFive = new Date(unixTimeDayFive * 1000).toLocaleString('en-us', { weekday: 'short' });
                var tryOut= forecastData.list[0].dt_txt
                console.log(tryOut);
                
                
              } catch (error) {
                console.error("Error parsing JSON:", error);
              }
              res.render("meteo", { cityQuery: cityQuery, weatherDescription: weatherDescription, temp: temp, weatherConditionUrl: weatherConditionUrl, dayOne: dayOne, dayTwo: dayTwo, dayThree: dayThree, dayFour: dayFour, dayFive: dayFive });
            });
          }else {
            res.send("There is a problem with the forecast data parsing");
          }

        });
      });
    } else if (response.statusCode == 404) {
      res.send("Please check the spelling of &nbsp;'" + cityQuery + "'");
    } else {
      res.send("Check the code");
    }
  });

});

// let unix_timestamp = 1686657600
// // Create a new JavaScript Date object based on the timestamp
// // multiplied by 1000 so that the argument is in milliseconds, not seconds.
// var date = new Date(unix_timestamp * 1000);
// // Hours part from the timestamp
// var day = date.getDay();
// var hours = date.getHours();
// // Minutes part from the timestamp
// var minutes = "0" + date.getMinutes();
// // Seconds part from the timestamp
// var seconds = "0" + date.getSeconds();

// // Will display time in 10:30:23 format
// var formattedTime = hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);



app.post("/cityQuery", function (req, res) {
  cityQuery = _.capitalize(req.body.cityQuery);
  res.redirect("/Meteorology");
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});
