"use strict";
var express = require("express");
var mongo = require("mongodb");
var mongoose = require("mongoose");
var shortId = require("shortid");
var validUrl = require("valid-url");
var count = 0;
var cors = require("cors");
//can change cout to shortid
var bodyParser = require('body-parser')

var app = express();

// Basic Configuration
var port = process.env.PORT || 3000;

/** this project needs a db !! **/

// mongoose.connect(process.env.MONGOLAB_URI);

app.use(cors());

/** this project needs to parse POST bodies **/
// you should mount the body-parser here

app.use("/public", express.static(process.cwd() + "/public"));

app.get("/", function(req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

// your first API endpoint...
app.get("/api/hello", function(req, res) {
  res.json({ greeting: "hello API" });
});


app.use(bodyParser.urlencoded({extended: false}));

app.post("/:url(*)", function(req, res) {  
     //console.log("connected to database");
  mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true }, function(err,db) {
    if (err) {
      console.log("Error in connecting to database");
    } else {
      //var a=req.body.url;
      //console.log(a);
      let url = req.body.url;
      var short = shortId.generate();
      //console.log(url);
      if (validUrl.isUri(url)) {
        let collections = db.collection("links");
        var shortUrl="https://url-shortener99.glitch.me/" + short;
        var obj = {
          original_url: url,
          short_url: shortUrl
        };
        count++;
        //res.send(JSON.stringify(obj));
        res.json({
          original_url:url,
          short_url:shortUrl
        });
        //console.log(shortUrl);
        collections.insertOne(obj, function(err, data) {
          if (err) {
            console.log("error inserting in database");
          }
          //console.log("INSERTED");
        });
      } else {
        res.send({
          error: "The URL format is wrong kindly recheck the url and POST again"
        });
      }
    }
    db.close();
  });
});

app.get("/:now", function(req, res) {
  //console.log("IN");
  mongoose.connect(process.env.MONGO_URL,{ useNewUrlParser: true }, function(err,db) {
    if (err) {
      console.log("cannot connect to database second time");
    } else {
      let collections = db.collection("links"); 
      let val = req.params.now;
      //console.log(val);
      var shortUrl="https://url-shortener99.glitch.me/".toString() + val.toString();
      //console.log(shortUrl);
      collections.findOne({ short_url:shortUrl },function(err, data) {
        //console.log(data);  
        if (data != null) {
            //console.log(data);
            res.redirect(data.original_url);
          } else {
            //console.log(val);
            console.log("short url not found in database");
          }
        });
    }
    db.close();
  });
});
app.get("api/exercise/users")
app.listen(port, function() {
  console.log("Node.js listening ...");
});
