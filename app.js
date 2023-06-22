const express = require("express");
const mongoose = require("mongoose");
const _ = require("lodash");
const app = express();
const https = require("https");

app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: true }))
app.use(express.static("public"));

mongoose.connect('mongodb+srv://erkanalkanmetu:AETSU2ZBzjjB3IbX@cluster1.jxaszwy.mongodb.net/?retryWrites=true&w=majority');

const listSchema = new mongoose.Schema({
  name: String,
  items: [],
  checkboxStatus: []
});

const List = mongoose.model("List", listSchema);


const initialList = "Quick List"
var selectedListName;
var selectedListItems;
var selectedListCheckboxes;
var cityQuery = "Ravenna";

//localhost - webhost switch constants

const phome = "https://weak-rose-viper-sari.cyclic.app/"
const ptoDoList = phome + "Todolists"
const pmeteo = phome + "Meteorology"
const ptravelPlans = phome + "Travel%20Plans"



//home page
app.get("/", function (req, res) {
  res.render("home", { phome: phome, ptoDoList: ptoDoList, pmeteo: pmeteo, ptravelPlans: ptravelPlans });
});

//TO DO List section
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
      res.redirect("/Todolists");
    }
  });
  List.find({}).select("name").then(function (allLists) {
    if (selectedListName === "") {
      selectedListName = allLists[0].name;
    }
    List.findOne({ name: selectedListName }).then(function (foundList) {
      if (!foundList) {
        console.log("nothing has been found, smth is wrong");
        selectedListName = initialList;
        res.redirect("/Todolists");
      } else {
        selectedListItems = foundList.items;
        selectedListCheckboxes = foundList.checkboxStatus;
        res.render("list", { phome: phome, ptoDoList: ptoDoList, pmeteo: pmeteo, ptravelPlans: ptravelPlans, allLists: allLists, selectedListName: selectedListName, selectedListItems: selectedListItems, selectedListCheckboxes: selectedListCheckboxes });
      }
    });
  });
});

app.post("/additems", function (req, res) {
  const newItem = _.capitalize(req.body.userInput);
  var sameItem = "false";

  if (selectedListName === "Please Choose or Create a List") {
    console.log("Cannot add Items , please choose or Create a List");
    res.redirect("/Todolists");
  } else if (selectedListName === "") {
    console.log("selectedListName is empty");
  } else if (newItem === "") {
    List.find({}).select("name").then(function (allLists) {
      List.findOne({ name: selectedListName }).then(function (foundList) {
        if (!foundList) {
          res.redirect("/Todolists");
        } else {
          selectedListItems = foundList.items;
          selectedListCheckboxes = foundList.checkboxStatus;
          res.render("emptyitemlist", { phome: phome, ptoDoList: ptoDoList, pmeteo: pmeteo, ptravelPlans: ptravelPlans, allLists: allLists, selectedListName: selectedListName, selectedListItems: selectedListItems, selectedListCheckboxes: selectedListCheckboxes });
        }
      });
    });
  } else {
    List.findOne({ name: selectedListName }).then(function (foundList) {
      console.log("selectedlistname ", selectedListName);
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
          List.findOne({ name: selectedListName }).then(function (foundList) {
            selectedListItems = foundList.items;
            selectedListCheckboxes = foundList.checkboxStatus;
            res.render("sameitem", { phome: phome, ptoDoList: ptoDoList, pmeteo: pmeteo, ptravelPlans: ptravelPlans, allLists: allLists, selectedListName: selectedListName, selectedListItems: selectedListItems, selectedListCheckboxes: selectedListCheckboxes });
          });
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
    List.find({}).select("name").then(function (allLists) {
      List.findOne({ name: selectedListName }).then(function (foundList) {
        if (selectedListName === "Please Choose or Create a List") {
          res.render("emptyitemlist", { phome: phome, ptoDoList: ptoDoList, pmeteo: pmeteo, ptravelPlans: ptravelPlans, allLists: allLists, selectedListName: selectedListName, selectedListItems: selectedListItems, selectedListCheckboxes: selectedListCheckboxes });
        } else {
          selectedListItems = foundList.items;
          selectedListCheckboxes = foundList.checkboxStatus;
          res.render("emptyitemlist", { phome: phome, ptoDoList: ptoDoList, pmeteo: pmeteo, ptravelPlans: ptravelPlans, allLists: allLists, selectedListName: selectedListName, selectedListItems: selectedListItems, selectedListCheckboxes: selectedListCheckboxes });
        }
      });
    });
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
          res.render("samelist", { phome: phome, ptoDoList: ptoDoList, pmeteo: pmeteo, ptravelPlans: ptravelPlans, allLists: allLists, selectedListName: selectedListName, selectedListItems: selectedListItems, selectedListCheckboxes: selectedListCheckboxes });
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
        temp = weatherData.main.temp.toFixed(1);
        weatherDescription = weatherData.weather[0].description;
        icon = weatherData.weather[0].icon;
        weatherConditionUrl = "https://openweathermap.org/img/wn/" + icon + "@2x.png"

        https.get(urlForecast, function (response) {

          if (response.statusCode === 200) {
            let data1 = "";

            response.on("data", function (chunk) {
              data1 += chunk;
            });

            response.on("end", function () {
              try {
                const forecastData = JSON.parse(data1);
                var txtTime = forecastData.list[0].dt_txt;
                var txtTimeNumber = Number(txtTime.substr(11, 2));
                let myAdjustingNumber

                switch (txtTimeNumber) {
                  case 0:
                    myAdjustingNumber = 5
                    break;
                  case 3:
                    myAdjustingNumber = 4
                    break;
                  case 6:
                    myAdjustingNumber = 3
                    break;
                  case 9:
                    myAdjustingNumber = 2
                    break;
                  case 12:
                    myAdjustingNumber = 1
                    break;
                  case 15:
                    myAdjustingNumber = 0
                    break;
                  case 18:
                    myAdjustingNumber = 7
                    break;
                  case 21:
                    myAdjustingNumber = 6
                    break;
                }

                //Getting weather icon at 15:00 UTC for each day

                var iconDayOne = "https://openweathermap.org/img/wn/" + forecastData.list[myAdjustingNumber + 8].weather[0].icon + "@2x.png";
                var iconDayTwo = "https://openweathermap.org/img/wn/" + forecastData.list[myAdjustingNumber + 16].weather[0].icon + "@2x.png";
                var iconDayThree = "https://openweathermap.org/img/wn/" + forecastData.list[myAdjustingNumber + 24].weather[0].icon + "@2x.png";
                var iconDayFour = "https://openweathermap.org/img/wn/" + forecastData.list[myAdjustingNumber + 32].weather[0].icon + "@2x.png";




                //Date arrangements for forecasted days
                const currentDate = new Date()
                const dayOneDate = new Date();
                dayOneDate.setDate(currentDate.getDate() + 1);

                const dayTwoDate = new Date();
                dayTwoDate.setDate(currentDate.getDate() + 2);
                const dayThreeDate = new Date();
                dayThreeDate.setDate(currentDate.getDate() + 3);
                const dayFourDate = new Date();
                dayFourDate.setDate(currentDate.getDate() + 4);

                const currentMonth = (currentDate.getMonth() + 1).toLocaleString('en-US', { minimumIntegerDigits: 2, useGrouping: false });
                const dayOneMonth = (dayOneDate.getMonth() + 1).toLocaleString('en-US', { minimumIntegerDigits: 2, useGrouping: false });
                const dayTwoMonth = (dayTwoDate.getMonth() + 1).toLocaleString('en-US', { minimumIntegerDigits: 2, useGrouping: false });
                const dayThreeMonth = (dayThreeDate.getMonth() + 1).toLocaleString('en-US', { minimumIntegerDigits: 2, useGrouping: false });
                const dayFourMonth = (dayFourDate.getMonth() + 1).toLocaleString('en-US', { minimumIntegerDigits: 2, useGrouping: false });

                var currentFinal = currentDate.getDate() + "/" + currentMonth;
                var dayOneFinal = dayOneDate.getDate() + "/" + dayOneMonth;
                var dayTwoFinal = dayTwoDate.getDate() + "/" + dayTwoMonth;
                var dayThreeFinal = dayThreeDate.getDate() + "/" + dayThreeMonth;
                var dayFourFinal = dayFourDate.getDate() + "/" + dayFourMonth;


                //scrapping forecasted temperature data
                var mondayTemp = [];
                var tuesdayTemp = [];
                var wednesdayTemp = [];
                var thursdayTemp = [];
                var fridayTemp = [];
                var saturdayTemp = [];
                var sundayTemp = [];

                for (let i = 0; i < 40; i++) {
                  var dayToCheck = forecastData.list[i].dt;
                  if (new Date(dayToCheck * 1000).toLocaleString('en-us', { weekday: 'short' }) === "Mon") {
                    mondayTemp.push(forecastData.list[i].main.temp_min);
                    mondayTemp.push(forecastData.list[i].main.temp_max);
                  } else if (new Date(dayToCheck * 1000).toLocaleString('en-us', { weekday: 'short' }) === "Tue") {
                    tuesdayTemp.push(forecastData.list[i].main.temp_min);
                    tuesdayTemp.push(forecastData.list[i].main.temp_max);
                  } else if (new Date(dayToCheck * 1000).toLocaleString('en-us', { weekday: 'short' }) === "Wed") {
                    wednesdayTemp.push(forecastData.list[i].main.temp_min);
                    wednesdayTemp.push(forecastData.list[i].main.temp_max);
                  } else if (new Date(dayToCheck * 1000).toLocaleString('en-us', { weekday: 'short' }) === "Thu") {
                    thursdayTemp.push(forecastData.list[i].main.temp_min);
                    thursdayTemp.push(forecastData.list[i].main.temp_max);
                  } else if (new Date(dayToCheck * 1000).toLocaleString('en-us', { weekday: 'short' }) === "Fri") {
                    fridayTemp.push(forecastData.list[i].main.temp_min);
                    fridayTemp.push(forecastData.list[i].main.temp_max);
                  } else if (new Date(dayToCheck * 1000).toLocaleString('en-us', { weekday: 'short' }) === "Sat") {
                    saturdayTemp.push(forecastData.list[i].main.temp_min);
                    saturdayTemp.push(forecastData.list[i].main.temp_max);
                  } else if (new Date(dayToCheck * 1000).toLocaleString('en-us', { weekday: 'short' }) === "Sun") {
                    sundayTemp.push(forecastData.list[i].main.temp_min);
                    sundayTemp.push(forecastData.list[i].main.temp_max);
                  }
                }

                const mondayMaxTemp = Math.max(...mondayTemp).toFixed(1);
                const mondayMinTemp = Math.min(...mondayTemp).toFixed(1);
                const tuesdayMaxTemp = Math.max(...tuesdayTemp).toFixed(1);
                const tuesdayMinTemp = Math.min(...tuesdayTemp).toFixed(1);
                const wednesdayMaxTemp = Math.max(...wednesdayTemp).toFixed(1);
                const wednesdayMinTemp = Math.min(...wednesdayTemp).toFixed(1);
                const thursdayMaxTemp = Math.max(...thursdayTemp).toFixed(1);
                const thursdayMinTemp = Math.min(...thursdayTemp).toFixed(1);
                const fridayMaxTemp = Math.max(...fridayTemp).toFixed(1);
                const fridayMinTemp = Math.min(...fridayTemp).toFixed(1);
                const saturdayMaxTemp = Math.max(...saturdayTemp).toFixed(1);
                const saturdayMinTemp = Math.min(...saturdayTemp).toFixed(1);
                const sundayMaxTemp = Math.max(...sundayTemp).toFixed(1);
                const sundayMinTemp = Math.min(...sundayTemp).toFixed(1);

                //setting min and max temperatures for the following 4 days
                var dayOne
                var dayTwo
                var dayThree
                var dayFour
                var dayOneMaxTemp
                var dayOneMinTemp
                var dayTwoMaxTemp
                var dayTwoMinTemp
                var dayThreeMaxTemp
                var dayThreeMinTemp
                var dayFourMaxTemp
                var dayFourMinTemp
                const todayWeekday = new Date().toLocaleString('en-us', { weekday: 'long' });

                if (todayWeekday === "Sunday") {
                  dayOne = "Monday"
                  dayOneMaxTemp = mondayMaxTemp;
                  dayOneMinTemp = mondayMinTemp;
                  dayTwo = "Tuesday";
                  dayTwoMaxTemp = tuesdayMaxTemp;
                  dayTwoMinTemp = tuesdayMinTemp;
                  dayThree = "Wednesday";
                  dayThreeMaxTemp = wednesdayMaxTemp;
                  dayThreeMinTemp = wednesdayMinTemp;
                  dayFour = "Thursday";
                  dayFourMaxTemp = thursdayMaxTemp;
                  dayFourMinTemp = thursdayMinTemp;
                } else if (todayWeekday === "Monday") {
                  dayOne = "Tuesday"
                  dayOneMaxTemp = tuesdayMaxTemp;
                  dayOneMinTemp = tuesdayMinTemp;
                  dayTwo = "Wednesday";
                  dayTwoMaxTemp = wednesdayMaxTemp;
                  dayTwoMinTemp = wednesdayMinTemp;
                  dayThree = "Thursday";
                  dayThreeMaxTemp = thursdayMaxTemp;
                  dayThreeMinTemp = thursdayMinTemp;
                  dayFour = "Friday";
                  dayFourMaxTemp = fridayMaxTemp;
                  dayFourMinTemp = fridayMinTemp;
                } else if (todayWeekday === "Tuesday") {
                  dayOne = "Wednesday"
                  dayOneMaxTemp = wednesdayMaxTemp;
                  dayOneMinTemp = wednesdayMinTemp;
                  dayTwo = "Thursday";
                  dayTwoMaxTemp = thursdayMaxTemp;
                  dayTwoMinTemp = thursdayMinTemp;
                  dayThree = "Friday";
                  dayThreeMaxTemp = fridayMaxTemp;
                  dayThreeMinTemp = fridayMinTemp;
                  dayFour = "Saturday";
                  dayFourMaxTemp = saturdayMaxTemp;
                  dayFourMinTemp = saturdayMinTemp;
                } else if (todayWeekday === "Wednesday") {
                  dayOne = "Thursday"
                  dayOneMaxTemp = thursdayMaxTemp;
                  dayOneMinTemp = thursdayMinTemp;
                  dayTwo = "Friday";
                  dayTwoMaxTemp = fridayMaxTemp;
                  dayTwoMinTemp = fridayMinTemp;
                  dayThree = "Saturday";
                  dayThreeMaxTemp = saturdayMaxTemp;
                  dayThreeMinTemp = saturdayMinTemp;
                  dayFour = "Sunday";
                  dayFourMaxTemp = sundayMaxTemp;
                  dayFourMinTemp = sundayMinTemp;
                } else if (todayWeekday === "Thursday") {
                  dayOne = "Friday"
                  dayOneMaxTemp = fridayMaxTemp;
                  dayOneMinTemp = fridayMinTemp;
                  dayTwo = "Saturday";
                  dayTwoMaxTemp = saturdayMaxTemp;
                  dayTwoMinTemp = saturdayMinTemp;
                  dayThree = "Sunday";
                  dayThreeMaxTemp = sundayMaxTemp;
                  dayThreeMinTemp = sundayMinTemp;
                  dayFour = "Monday";
                  dayFourMaxTemp = mondayMaxTemp;
                  dayFourMinTemp = mondayMinTemp;
                } else if (todayWeekday === "Friday") {
                  dayOne = "Saturday"
                  dayOneMaxTemp = saturdayMaxTemp;
                  dayOneMinTemp = saturdayMinTemp;
                  dayTwo = "Sunday";
                  dayTwoMaxTemp = sundayMaxTemp;
                  dayTwoMinTemp = sundayMinTemp;
                  dayThree = "Monday";
                  dayThreeMaxTemp = mondayMaxTemp;
                  dayThreeMinTemp = mondayMinTemp;
                  dayFour = "Tuesday";
                  dayFourMaxTemp = tuesdayMaxTemp;
                  dayFourMinTemp = tuesdayMinTemp;
                } else if (todayWeekday === "Saturday") {
                  dayOne = "Sunday"
                  dayOneMaxTemp = sundayMaxTemp;
                  dayOneMinTemp = sundayMinTemp;
                  dayTwo = "Monday";
                  dayTwoMaxTemp = mondayMaxTemp;
                  dayTwoMinTemp = mondayMinTemp;
                  dayThree = "Tuesday";
                  dayThreeMaxTemp = tuesdayMaxTemp;
                  dayThreeMinTemp = tuesdayMinTemp;
                  dayFour = "Wednesday";
                  dayFourMaxTemp = wednesdayMaxTemp;
                  dayFourMinTemp = wednesdayMinTemp;
                }

              } catch (error) {
                console.error("Error parsing JSON:", error);
              }
              res.render("meteo", {
                phome: phome, ptoDoList: ptoDoList, pmeteo: pmeteo, ptravelPlans: ptravelPlans, currentFinal: currentFinal, dayFourFinal: dayFourFinal, dayThreeFinal: dayThreeFinal, dayTwoFinal: dayTwoFinal, dayOneFinal: dayOneFinal, dayFourMinTemp: dayFourMinTemp, dayFourMaxTemp: dayFourMaxTemp,
                dayThreeMinTemp: dayThreeMinTemp, dayThreeMaxTemp: dayThreeMaxTemp, dayTwoMinTemp: dayTwoMinTemp, dayTwoMaxTemp: dayTwoMaxTemp, dayOneMinTemp: dayOneMinTemp, dayOneMaxTemp: dayOneMaxTemp, cityQuery: cityQuery, weatherDescription: weatherDescription,
                temp: temp, weatherConditionUrl: weatherConditionUrl, dayOne: dayOne, dayTwo: dayTwo, dayThree: dayThree, dayFour: dayFour, iconDayOne: iconDayOne, iconDayTwo: iconDayTwo, iconDayThree: iconDayThree, iconDayFour: iconDayFour
              });
            });
          } else {
            res.send("There is a problem with the forecast data parsing");
          }
        });
      });
    } else if (response.statusCode === 404) {

      res.render("wrongspelling", { phome: phome, ptoDoList: ptoDoList, pmeteo: pmeteo, ptravelPlans: ptravelPlans, cityQuery: cityQuery });
      cityQuery = "Ravenna";
    } else {
      console.log(response.statusCode);
      res.send("Check the code");
    }
  });
});


app.post("/cityQuery", function (req, res) {
  cityQuery = _.capitalize(req.body.cityQuery);
  if (cityQuery === "") {
    res.render("emptycityquery", { phome: phome, ptoDoList: ptoDoList, pmeteo: pmeteo, ptravelPlans: ptravelPlans, });
  } else {
    res.redirect("/Meteorology");
  }
});

//Travel Plans Section

app.get("/Travel%20Plans", function (req, res) {
  res.render("travel", { phome: phome, ptoDoList: ptoDoList, pmeteo: pmeteo, ptravelPlans: ptravelPlans });
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});
