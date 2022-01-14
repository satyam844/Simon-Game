//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const e = require("express");
const app = express();
const _ = require("lodash");
app.set('view engine', 'ejs');
mongoose.connect("mongodb+srv://admin-satyam:test123@cluster0.zqkpt.mongodb.net/todolistDB");
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

const itemsSchema = {
  name : String
}
 const listSchema = {
   name : String,
   items :[itemsSchema]
 }
const Item = mongoose.model("Item",itemsSchema);
const List = mongoose.model("List",listSchema);

// database will be used instead
// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];

const item1 = new Item({
  name : "Welcome to your todolist"
})
const item2 = new Item({
  name : "Hit the + button to add new items"
})
const item3 = new Item({
  name : "<-- Hit this to delete an item"
})

const defaultItems = [item1,item2,item3];



app.get("/", function(req, res) {

   Item.find({},function(err,foundItems){
     if(foundItems.length == 0){
Item.insertMany(defaultItems,function(err){
  if(err){
    console.log(err);
  }
  else{
    console.log("Successfully inserted data into Database");
  }
})
res.redirect("/");
     }
       else{
        res.render("list",{listTitle : "Today", newListItems : foundItems}); 
       }
   })
});
app.get("/:topic",function(req,res){
      const customListName    = _.capitalize(req.params.topic);
      List.findOne({name : customListName},function(err,list){
        if(!err){
           if(!list){
            //  Create new List
            const list = new List({
              name : customListName,
              items : defaultItems
            })
          list.save();
          res.redirect("/"+customListName);
           }else{
        //  Show existing List
        res.render("list",{listTitle : customListName , newListItems : list.items})
           }
        }
      })
    
})

app.post("/", function(req, res){

  const item = new Item({
    name : req.body.newItem
  });

    const listName = req.body.list;
    if(listName == "Today"){
      item.save();
 res.redirect("/");
    }else{
   List.findOne({name : listName},function(err,foundList){
     foundList.items.push(item);
     foundList.save();
     res.redirect("/"+listName);
   })
    }
  
 
 
});

app.post("/delet",function(req,res){
  console.log(req.body.checkbox);
  const checkedItemId = req.body.checkbox;
  const listName = req.body.list;
  if(listName == "Today"){
    Item.findByIdAndRemove(checkedItemId,function(err){
      if(!err){
        console.log("Successfully deleted item from database");
         res.redirect("/");
      }
    })
  }else{
    List.findOneAndUpdate({name : listName},{$pull :{items :{ _id : checkedItemId }}}
      ,function(err,foundList){
     if(!err){
        res. redirect("/"+listName)
     }       
      })
  }
  
})

app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
