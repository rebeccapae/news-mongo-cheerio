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
            result.saved = false;
    
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
    db.Article.find({})
    .then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    });
});

// Show Saved Articles
app.get("/articles/saved", function(req, res) {
    db.Article.find({ saved: true }) 
    .then(function(dbArticleSaved) {
        res.json(dbArticleSaved);
      })
      .catch(function(err) {
        res.json(err);
      });
});

// Save articles chosen by user
app.post("/articles/:id/save", function(req, res) {
    db.Article.findOneAndUpdate({_id: req.params.id }, { saved: true})
    .then(function() {
        console.log("saved article to db")
    })
});

//Delete Article
app.post("/articles/:id/delete", function(req, res) {
    db.Article.findOneAndUpdate({_id: req.params.id}, { saved: false})
    .then(function() {
    console.log("article unsaved and changed to false in db")
    })
});

//Find specific Article by id and populate with note
app.get("/articles/:id/notes", function(req, res) {
    db.Article.findOne({_id: req.params.id })
    .then(function(dbArticle) {
        res.send(dbArticle);
    })
    .catch(function(err) {
        res.send(err)
    });
});

//Save the article to db
app.post("/articles/:id/notes/save", function(req, res) {
    db.Article.findOneAndUpdate({_id: req.params.id }, { note: req.body.note})
    .then(function(error, edited){
        console.log("note saved to db")
        if (error) {
            console.log(error);
            res.send(error);
          }
          else {
            console.log(edited);
            res.send(edited);
          }
    })
})

//delete note from db
app.post("/articles/:id/deletenote", function(req, res) {
    db.Article.update({_id: req.params.id }, {$unset:{ note: ""} })
    .then(function(error, edited){
        console.log("note deleted from db")
        if (error) {
            console.log(error);
            res.send(error);
          }
          else {
            console.log(edited);
            res.send(edited);
          }
    })
})


// Saving/update Article's note
app.post("/articles/:id/notes", function(req, res) {
    db.Note.create(req.body)
    .then(function(dbNote){
        return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id}, { new: true });
    })
    .then(function(dbArticle) {
        res.json(dbArticle);
    })
    .catch(function(err) {
        res.json(err)
    });
});
  
  // Start the server
  app.listen(PORT, function() {
    console.log("App running on port " + PORT + "!");
  });

