//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const date = require(__dirname + "/date.js");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://liqqianl:Lq19950714@cluster0.kvvk5qk.mongodb.net/todolistDB");

const itemsSchema = mongoose.Schema({
  name: String
});

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item ({
  name: "Sleep early"
});

const item2 = new Item ({
  name: "Eat healthy"
});

const item3 = new Item ({
  name: "Keep exercising"
});

const listsSchema = mongoose.Schema({
  name: String,
  items: [itemsSchema]
});

const List = mongoose.model("List", listsSchema);

//Item.insertMany([item1, item2, item3]);

app.get("/", async function(req, res) {

//const day = date.getDate();

  const items = await Item.find();

  if (items.length == 0) {
    Item.insertMany([item1, item2, item3]);
    res.redirect("/");
  } else {
    
    //res.render("list", {listTitle: day, newListItems: items});
    res.render("list", {listTitle: "Today", newListItems: items});
  }

});

app.post("/", async (req, res) => {

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const newItem = new Item ({
    name: itemName
  });

  if (listName === "Today") {
    await Item.insertMany([newItem]);
    res.redirect("/");
  } else {
    const list = await List.findOne({name: listName});
    list.items.push(newItem);
    list.save();
    res.redirect("/" + listName);
  }
});

app.post("/delete", async (req, res) => {
  const deleteItemId = req.body.checkbox;
  const deleteListName = req.body.listName;

  if (deleteListName === "Today") {
    await Item.findByIdAndRemove(deleteItemId);
    res.redirect("/");
  } else {
    await List.findOneAndUpdate({name: deleteListName}, {$pull: {items: {_id: deleteItemId}}});
    res.redirect("/" + deleteListName);
  }
  
  
});

app.get("/:listName", async (req, res) => {
  const listName = _.capitalize(req.params.listName);

  const retrieveList = await List.findOne({name: listName});
  
  if (!retrieveList) {
    const customList = new List ({
      name: listName,
      items: [item1, item2, item3]
    });

    customList.save();
    console.log("Saved a new list!" + listName);

    res.redirect(`/${listName}`);
  } else {
    console.log("Retrieve the existing list!" + listName);
    res.render("list", {listTitle: listName, newListItems: retrieveList.items});
  }

});

app.get("/about", (req, res) => {
  res.render("about");
});


let port = process.env.PORT;
if (port == null || port == "") {
  port = 8000;
}
app.listen(port);


app.listen(port, () => {
  console.log("Server started successfully");
});
