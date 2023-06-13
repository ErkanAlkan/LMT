const express = require("express");
const mongoose = require("mongoose");
const _ = require("lodash");
const app = express();

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
var selectedListCheckboxes =[];



app.get("/", function (req, res) {
  res.render("home");
});

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
      selectedListItems =[];
      selectedListCheckboxes =[];
    }
  });
  List.find({}).select("name").then(function (allLists) {
    res.render("list", { allLists: allLists, selectedListName: selectedListName, selectedListItems: selectedListItems, selectedListCheckboxes:selectedListCheckboxes });
  });
});

app.post("/additems", function (req, res) {
  const newItem = _.capitalize(req.body.newItem);
  var sameItem = "false";
  
  if (selectedListName === "Please Choose or Create a List"){
    console.log("Cannot add Items , please choose or Create a List");
    res.redirect("/Todolists");
  }else {
    List.findOne({ name: selectedListName }).then(function (foundList) {
      for (let i = 0; i<foundList.items.length; i++){
        if (newItem === foundList.items[i]){
          sameItem = "true"
        }
      }
      if (sameItem === "false"){
        foundList.items.push(newItem);
        foundList.checkboxStatus.push("notChecked");
        foundList.save();
        selectedListItems=foundList.items;
        selectedListCheckboxes=foundList.checkboxStatus;
        res.redirect("/Todolists");
      } else{
        List.find({}).select("name").then(function (allLists) {
          res.render("sameitem", { allLists: allLists, selectedListName: selectedListName, selectedListItems: selectedListItems, selectedListCheckboxes:selectedListCheckboxes });
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
    selectedListItems=foundList.items;
    selectedListCheckboxes=foundList.checkboxStatus;
  });
  res.redirect("/Todolists");
});

app.post("/checkboxClick" ,function(req,res) {
 var clickedBox = req.body.checkboxStatus;
 List.findOne({ name: selectedListName }).then(function (foundList) {
  if(foundList.checkboxStatus[clickedBox] === "notChecked") {
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

app.post("/deleteLists", function(req,res) {
  const deleteLists = req.body.deleteLists;
  if (deleteLists===selectedListName){
    selectedListName= "Please Choose or Create a List"
    selectedListItems = [];
    selectedListCheckboxes = [];
  };
  List.findOneAndDelete({name:deleteLists}).then(function(){
    
  });
  res.redirect("/Todolists");
});


app.post("/createNewList", function (req, res) {
  const newListName = _.startCase(req.body.newListName);
  if (newListName === ""){
    res.send("<h1>List name can't be empty!");
  }else {
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
          res.render("sameitem", { allLists: allLists, selectedListName: selectedListName, selectedListItems: selectedListItems, selectedListCheckboxes:selectedListCheckboxes });
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


app.listen(3000, function () {
  console.log("Server started on port 3000");
});
