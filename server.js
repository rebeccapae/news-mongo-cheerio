var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");
var axios = require("axios");
var cheerio = require("cheerio");

//Require all models
var db = require("./models");

var PORT = 3030;

// Initialize Express
var app = express();

// Configure middleware

// Use morgan logger for logging requests
app.use(logger("dev"));
// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Make public a static folder
app.use(express.static("public"));

// Connect to the Mongo DB
mongoose.connect("mongodb://localhost/MongoNews", { useNewUrlParser: true });

//Routes

//Get route to scrape 
app.get("/scrape", function(req, res) {
    // scraping from Yahoo Finance
    axios.get("https://finance.yahoo.com").then(function(response) {
      var $ = cheerio.load(response.data);
  
      $("li h3").each(function(i, element) {
      
        var result = {};

        scrapedTitle = $(this).children("a").text();
        //If there is nothing in the title, do not add to results
        if(scrapedTitle.length == 0) {
            console.log("no title - do not add to db")
        }
        //If there is a title, find the same title in the db and if there is none, add to the db.
        else{
            result.title = scrapedTitle;
            var entireLink = "https://finance.yahoo.com" + $(this).children("a").attr("href");
            result.link = entireLink;
            result.summary = $(this).siblings("p").text();
    
            db.Article.find({"title": result.title}, function(error, found) {
                if(found.length !== 0){
                    console.log("aready in db")
                }
                else{
                    db.Article.create(result)
                    .then(function(dbArticle) {
                        // View the added result in the console
                        console.log(dbArticle);
                        console.log("added to db")
                    })
                    .catch(function(err) {
                        // If an error occurred, log it
                        console.log(err);
                    });
                };
            });
        };
      });
      res.send("Scrape Complete");
    });
  });

//Shows all articles in the db
app.get("/articles", function(req, res) {
    db.Article.find({}, function(err, found) {
        if(err){
            console.log(err)
        }
        else(
            res.json(found)
        )
    });
});

//Find specific Article by id
app.get("/articles/:id", function(req, res) {
    db.Article.findOne({
    _id: mongojs.ObjectId(req.params.id)
    }, function(error, found) {
    if(error){
        console.log(error);
        res.send(error)
    }
    else{
        console.log(found);
        res.send(found)
    }
    })
});

//   // Route for grabbing a specific Article by id, populate it with it's note
//   app.get("/articles/:id", function(req, res) {
//     // TODO
//     // ====
//     // Finish the route so it finds one article using the req.params.id,
//     // and run the populate method with "note",
//     // then responds with the article with the note included
//   });
  
//   // Route for saving/updating an Article's associated Note
//   app.post("/articles/:id", function(req, res) {
//     // TODO
//     // ====
//     // save the new note that gets posted to the Notes collection
//     // then find an article from the req.params.id
//     // and update it's "note" property with the _id of the new note
//   });
  
  // Start the server
  app.listen(PORT, function() {
    console.log("App running on port " + PORT + "!");
  });

