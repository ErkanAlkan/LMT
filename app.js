//jshint esversion:6

const express = require("express");
const mongoose = require("mongoose");
const _ = require("lodash");
const app = express();

app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: true }))
app.use(express.static("public"));

mongoose.connect('mongodb://127.0.0.1:27017/todolistDB');

const itemsSchema = new mongoose.Schema({
  name: String
});

const Item = new mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Welcome to your TO DO list!"
});

const item2 = new Item({
  name: "Hit the + button on the right buttom corner to add a new item"
});
const item3 = new Item({
  name: "<= Hit the checkbox to delete an item"
});

const defultItems = [item1, item2, item3];

const listSchema = new mongoose.Schema({
  name: String,
  items: []
});

const List = mongoose.model("List", listSchema);


const initialList = "Quick List"
const list = new List({
  name: initialList,
  items: []
});
list.save();





// app.get("/", function (req, res) {

//   Item.find({}).then(function (founditems) {
//     if (founditems.length === 0) {
//       Item.insertMany(defultItems).then(function () {
//         console.log("Successfully saved defult items to DB");
//       }).catch(function (err) {
//         console.log(err);
//       });
//       res.redirect("/");
//     } else {
//       res.render("list", { listTitle: "Today", newListItems: founditems });
//     }
//   }).catch(function (err) {
//     console.log(err);
//   });
// });

app.get("/", function (req, res) {
  res.render("home");
});

app.get("/Todolists", function (req, res) {
  List.findOne({ name: initialList }).then(function (foundList) {
    const deneme = foundList.items;
    res.render("list", { deneme: deneme });
  });
});

app.post("/additems", function (req, res) {
  const newItem = req.body.newItem;
  List.findOne({ name: initialList }).then(function (foundList) {
    foundList.items.push(newItem);
    foundList.save();

    res.redirect("/Todolists");
  });
});

app.post("/delete" , function(req,res){
  const deleteItems = req.body.deleteItems;
  List.findOne({name: initialList}).then(function(foundList){
    foundList.items.splice(deleteItems, 1);
    foundList.save();
  });
  res.redirect("/Todolists");
})


// app.get("/:customListName", function (req, res) {
//   const customListName = _.capitalize([string = req.params.customListName]);

//   List.findOne({ name: customListName }).then(function (foundList) {
//     if (!foundList) {
//       const list = new List({
//         name: customListName,
//         items: defultItems
//       });
//       list.save();
//       res.redirect("/" + customListName);
//     } else {
//       res.render("list", { listTitle: customListName, newListItems: foundList.items });
//     }
//   }).catch(function (err) {
//     console.log(err);
//   });
// });


// app.post("/", function (req, res) {

//   const itemName = req.body.newItem;
//   const listName = req.body.list;
//   const item = new Item({
//     name: itemName
//   });

//   if (listName === "Today") {
//     item.save();
//     res.redirect("/")
//   } else {
//     List.findOne({ name: listName }).then(function (foundList) {
//       foundList.items.push(item);
//       foundList.save();
//       res.redirect("/" + listName);
//     });
//   }
// });

// app.post("/delete", function (req, res) {
//   const checkedItemId = req.body.checkbox;
//   const listName = req.body.listName;

//   if (listName === "Today") {
//     Item.findByIdAndRemove(checkedItemId).then(function () {
//       console.log("Successfully deleted" + checkedItemId + "from Today's list");
//     }).catch(function (err) {
//       console.log(err);
//     });
//     res.redirect("/");

//   } else {
// List.findOne({ name: listName }).then(function (foundList) {
//   for (let i = 0; i < foundList.items.length; i++) {
//     var stringed = JSON.stringify(foundList.items[i]._id);
//     stringed = stringed.replace('"', '').replace('"', '');

//     if (stringed === checkedItemId) {
//       foundList.items.splice(i, 1);
//       foundList.save();
//       if (foundList.items.length === 0) {
//         foundList.items.push(item1, item2, item3);
//       }
//     }
//   }
//   res.redirect("/" + listName);
// });

// List.findOneAndUpdate({ name: listName }, { $pull: { items: { _id: checkedItemId } } }).then(function () {
//   List.findOne({ name: listName }).then(function (foundList) {
//     if (foundList.items.length === 0) {
//       foundList.items.push(item1, item2, item3);
//       foundList.save();
//     }
//   });
//   res.redirect("/" + listName);
// });
//   }
// });



app.listen(3000, function () {
  console.log("Server started on port 3000");
});
