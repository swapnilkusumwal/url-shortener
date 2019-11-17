'use strict';
var express = require('express');
var mongo = require('mongodb');
var mongoose = require('mongoose');  
//var shortid = require('shortid');
//shortid.characters('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ$&');
var validUrl = require('valid-url');
var count=0;
var cors = require('cors');

var app = express();

// Basic Configuration 
var port = process.env.PORT || 3000;

/** this project needs a db !! **/ 
// mongoose.connect(process.env.MONGOLAB_URI);

app.use(cors());

/** this project needs to parse POST bodies **/
// you should mount the body-parser here

app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});

  
// your first API endpoint... 
app.get("/api/hello", function (req, res) {
  res.json({greeting: 'hello API'});
});

app.get("/api/shorturl/new/:url(*)",function(req,res){
  mongoose.connect(process.env.MONGO_URL,{ useNewUrlParser: true},function(err,db){
    if(err){
      console.log("Error in connecting to database");
    }
    else
      {
        let url=req.params.url;
        
        if(validUrl.isUri(url)){
       
          let collections=db.collections('links');
          var obj={
            original_url:url,
            short:"https://url-shortener99.glitch.me/"+count.toString()
          };
          count++;
          collections.insert(obj,function(err,data){
            if(err)
              {
                console.log("error inserting in database");
              }
            else
              db.close();
          });
        }
        else
          {
            res.send({
              error:"The URL format is wrong kindly recheck the url and POST again"
            });
          }
      }
  });
});

app.get("/:now",function(req,res){
  mongoose.connect(process.env.MONGO_URL,{useNewUrlParser:true},function(err,db){
     if(err){
       console.log("cannot connect to database second time");
     }
    else
      {
        let collections=db.collections("links");
        let val=req.params.now;
        
        collections.findOne({short:"https://url-shortener99.glitch.me/"+val.toString()},function(err,data){
          if(data!=null){
            res.redirect(data.url);
          }
          else
            {
              console.log("short url not found in database");
            }
          db.close();
        });
      }
  });
});


app.listen(port, function () {
  console.log('Node.js listening ...');
});