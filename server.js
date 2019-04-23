//pull in CLIENTID AND CLIENTSECRET from process.env file
require("dotenv").config({ path: "process.env" });

var passport = require("passport");
var FacebookStrategy = require("passport-facebook");
var express = require("express");
var bodyParser = require("body-parser");
var PORT = process.env.PORT || 3000;
var app = express();
var db = require("./models");
// Set Handlebars
var exphbs = require("express-handlebars");

//Facebook setup for passport
passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.CLIENTID,
      clientSecret: process.env.CLIENTSECRET,
      callbackURL: "https://plateplanner.herokuapp.com/auth/facebook/callback",
      //Start ngrok and use their provide url .../auth/facebook/callback when not deployed
      // callbackURL: "https://be209c6f.ngrok.io/auth/facebook/callback",
      profileFields: [
        "id",
        "displayName",
        "emails",
        "picture.width(200).height(200)"
      ]
    },
    function(accessToken, refreshToken, profile, cb) {
      return cb(null, profile);
    }
  )
);
//Initialize Facebook
app.use(passport.initialize());

// Serve static content for the app from the "public" directory in the application directory.
app.use(express.static("public"));

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// parse application/json
app.use(bodyParser.json());

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

require("./routes/routes.js")(app);

// Start our server so that it can begin listening to client requests.
db.sequelize.sync({ force: false }).then(function() {
  app.listen(PORT, function() {
    console.log("Server listening on: http://localhost:" + PORT);
  });
});
