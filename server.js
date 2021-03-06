require("dotenv").config();

var express=require("express");
var exphbs=require("express-handlebars");
var logger=require("morgan");
var mongoose=require("mongoose");
var axios=require("axios");
var cheerio=require("cheerio");

var db=require("./models");
var PORT=process.env.PORT || 3000

var app=express();
app.engine("handlebars", exphbs());
app.set("view engine", "handlebars");

app.use(logger("dev"));
app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.use(express.static("public"));

var MONGODB_URI=process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";
mongoose.connect(MONGODB_URI);

app.get("/", function(req, res){res.render("index",{});});

//GET route for scraping my favorite retro games sites
app.get("/scrape", function(req, res)
{
    axios.get("http://indieretronews.com/").then(function(response){
        var $=cheerio.load(response.data);
        $("h3").each(function(i, element){
            var result={};
            result.title=$(this).children("a").text();
            result.link=$(this).children("a").attr("href");
            db.Article.create(result)
            .then(function(dbArticle){
                console.log(dbArticle);
            }).catch(function(err){
                console.log(err);
            });
            console.log("Scrape Complete");
            res.redirect("/");
        });
    });  
});

//    axios.get("http://retrorgb.com/").then(function(response){
//        var $=cheerio.load(response.data);
//        $("h2").each(function(i, element){
//            if($(this).children("a").text()!="RetroRGB")
//            {
//                var result={};
//                result.title=$(this).children("a").text();
//                result.link=$(this).children("a").attr("href");
//            }
//        });        
//    });

//GET route for grabbing all articles
app.get("/articles", function(req, res){
    db.Article.find({})
        .then(function(dbArticle){
            res.json({dbArticle});
        }).catch(function(err) {
            res.json(err);
        });
});

//GET route for grabbing a specific article's associated note
app.get("/articles/:id", function(req, res){
    db.Article.findOne({_id: req.params.id}).populate("note")
        .then(function(dbArticle){
            res.json(dbArticle);
        }).catch(function(err){
            res.json(err);
        });
});

//POST route for saving/updating an article's associated note
app.post("/articles/:id", function(req, res){
    db.Note.create(req.body)
        .then(function(dbNote){
            return db.Article.findOneAndUpdate({_id: req.params.id}, {note: dbNote._id}, {new: true});
        }).then(function(dbArticle){
            res.json(dbArticle);
        }).catch(function(err){
            res.json(err);
        });
});

app.listen(PORT, function(){
    console.log("App running on port " + PORT + "!");
});