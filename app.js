//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
var _ = require('lodash');
const mongoose=require("mongoose");
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-chirag:test123@cluster0-iekhj.mongodb.net/test?retryWrites=true&w=majority/todolistDB",{useNewUrlParser: true,useUnifiedTopology: true });


const itemsSchema={
    name: String
}

const Item = mongoose.model("Item",itemsSchema);

const wakeup= new Item({
  name:"Wake Up"
})
const takeBath= new Item({
  name:"Take Bath"
})
const prepare= new Item({
  name:"Prepare breakfast"
})
const defaultItems=[wakeup,takeBath,prepare];

const listSchema={
  name: String,
  items: [itemsSchema]
}
const List=mongoose.model("List",listSchema);

app.get("/", function(req, res) {

  Item.find({},function(err,foundItems){
    if(foundItems.length===0){
      Item.insertMany([wakeup,takeBath,prepare],function(err){
        if(err){
          console.log(err);
        }else{
          console.log("items saved in database");
        }
      });
      res.redirect("/");
    }
  res.render("list", {listTitle: "Today", newListItems: foundItems});
  })

});
app.get("/:parameterName",function(req,res){
  const customListName=req.params.parameterName;

  List.findOne({name: customListName},function(err, foundList){
    if(!err){
      if(!foundList){
        //create a new list
        const list=new List({
          name: customListName,
          items: defaultItems
        });
        list.save();
        res.redirect("/"+customListName);
      }else{
        //show existing list
        res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
      }

    }
  });

  
//   console.log(_.lowerCase(name));
//   Item.find({},function(err,foundItems){
//     if(foundItems.length===0){
//       Item.insertMany([wakeup,takeBath,prepare],function(err){
//         if(err){
//           console.log(err);
//         }else{
//           console.log("items saved in database");
//         }
//       });
//       res.redirect("/name");
//     }
//   res.render("list", {listTitle: _.lowerCase(name), newListItems: foundItems});
// })
})

app.post("/", function(req, res){

  const newItem = req.body.newItem;
  const listName= req.body.list;
  const item=new Item({
    name:newItem
  })
  if(listName==="Today")
  {
    item.save();
    res.redirect("/");
  }
  else{
    List.findOne({name: listName},function(err, foundList){
    foundList.items.push(item);
    foundList.save();
    res.redirect("/"+listName);
    })
  }
});

app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});

app.post("/deleted",function(req,res){
  const listName=req.body.listName;
  const checkedItemId=req.body.checkbox;
  if(listName==="today"){
  Item.deleteOne({_id: checkedItemId},function(err){
    if(err){
        console.log(err);
    }else{
        console.log("sucessfully deleted");
    }
    res.redirect("/");
})

  }else{
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id: checkedItemId}}},function(err,foundList){
      if(!err){
        res.redirect("/"+listName);
      }
    })
  }
})

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
