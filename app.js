//jshint esversion:6
const express = require("express");
const bodyParser = require("body-parser");
const mongoose=require("mongoose");
const date=require(__dirname+"/date.js");
const _=require("lodash");

const app = express();
app.set("view engine", "ejs");

//connect mongodb to node
// mongoose.connect("mongodb://127.0.0.1:27017/todolistDB");
const uri="mongodb+srv://shashiTodoList:todolist@cluster0.lzerxgy.mongodb.net/todolistDB?retryWrites=true&w=majority";
mongoose.connect(uri);
console.log("Connecting to mongoDB");

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

//creating new Schema
const itemSchema= new mongoose.Schema({
  name:String
});
//creating mongoose model base on schema
const itemModel= mongoose.model("itemList",itemSchema);

const item1=new itemModel({
  name:"Welcome to my ToDoList."
});
const item2=new itemModel({
  name:"Hit the + button to Add a new item."
});
const item3=new itemModel({
  name:"<--- Hit this to delete this item."
});
//store item in array
const defaultItems=[item1,item2,item3];

//dynamic list Schema
const listSchema=new mongoose.Schema({
  name:String,
  items:[itemSchema]
});
//dynamic page Model
const listModel= mongoose.model("List", listSchema);

// let currentDay=date.getDay();
let currentDay=date.getDate();

//HomePage
app.get("/", async (req, res)=> {
  try {
    const foundItems=await itemModel.find();
      if(foundItems.length===0){
      //inserting item into collection
        itemModel.insertMany(defaultItems);
        console.log("Item Added Successfully.");
        res.redirect("/");
      }
      else{
        res.render("list", { listTitle: currentDay,newListItems:foundItems});
      }
  } catch (error) {
    res.status(500).json({error:"Internal Server Error!"})
  } 
});

//dynamic Category list
app.get("/:customListName", async (req, res)=> {
  try {
    const customListName=_.capitalize(req.params.customListName);
    const foundList=await listModel.findOne({name: customListName});
      if(!foundList){
        //create a new list
        const list= new listModel({
          name:customListName,
          items:defaultItems
        });
        list.save();
        res.redirect("/"+ customListName);
      }
      else if(customListName==="About"){
        res.render("about");
      }
      else{
        //show the existing list
        res.render("list", {listTitle: foundList.name, newListItems:foundList.items})
      } 
  } catch (error) {
    console.log(error);
  }
});

//inserting
app.post("/",async (req,res)=>{
  const itemName =req.body.newItem;
  const listName =req.body.list;
  const item=new itemModel({
    name:itemName
  });

  if(listName===currentDay){
    item.save();
    res.redirect("/");
  }
  else{
    const foundList=await listModel.findOne({name: listName});
    foundList.items.push(item);
    foundList.save();
    res.redirect("/"+listName);
  }

});

//Deleting
app.post("/delete",async (req,res)=>{
  const checkedItemId=req.body.checkbox;
  const listName=req.body.listName;
  if(listName===currentDay){
    await itemModel.findByIdAndRemove(checkedItemId);
    console.log("Item Deleted Successfully.");
    res.redirect("/");
  }
  else{
    const foundList=await listModel.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemId}}});
      if(!foundList){
       console.log("No list found with name :"+ listName)
      }else{
        res.redirect("/"+listName);
      }
  }
});
app.listen(3000, function () {
  console.log("Server started at port 3000");
});
