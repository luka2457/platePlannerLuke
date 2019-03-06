var passport = require("passport");
var FacebookStrategy = require('passport-facebook')

var express = require("express");
var bodyParser = require("body-parser");

var PORT = process.env.PORT || 8000;

var app = express();

passport.use(
  new FacebookStrategy(
    {
      clientID: '2812611205629771',
      clientSecret: 'debd2a021c974b66ca2c5736dd15e77d',
      callbackURL: "https://efd8e699.ngrok.io/auth/facebook/callback"
    },
    function (accessToken, refreshToken, profile, cb) {
      console.log(profile);
      // User.findOrCreate({ facebookId: profile.id }, function (err, user) {
        return cb(null, profile);
      // });
    }
  )
);

app.use(passport.initialize());

app.get('/auth/facebook',
  passport.authenticate('facebook'));

app.get('/auth/facebook/callback',
  passport.authenticate('facebook', { session: false }),
  function(req, res) {
    // Successful authentication, redirect home.
    //res.redirect('/');
    res.send('auth was good');
  });






var db = require("./models");

// Serve static content for the app from the "public" directory in the application directory.
app.use(express.static("public"));

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// parse application/json
app.use(bodyParser.json());

// Set Handlebars.
var exphbs = require("express-handlebars");

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");


require("./routes/htmlRoutes.js")(app);

require("./routes/api-routes")(app);


// Start our server so that it can begin listening to client requests.
//if force is true it will drop whatever table first and re-create it afterwards
//false however will keep whatever was already there
db.sequelize.sync({ force: false }).then(function () {
  app.listen(PORT, function () {
    // Log (server-side) when our server has started
    console.log("Server listening on: http://localhost:" + PORT);
  });
});
