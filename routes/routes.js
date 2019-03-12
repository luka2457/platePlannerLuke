// Dependencies
// =============================================================
var path = require("path");
var db = require("../models");
var passport = require("passport");
var key = require("../keys");

require('dotenv').config({
  path: './process.env'
});


//variables
let userInfo ={};

// Routes
// =============================================================
module.exports = function (app) {

  // Each of the below routes handles the sign in and HTML/handlebars page that the user is sent to 
  // index route loads home.html
  app.get("/", function (req, res) {
    if (userInfo.userId == undefined) {
      console.log("not logged in");
      res.redirect('/login');
    } else {
      res.render('home');
    }
  });

  // profile route loads profile.html
  app.get("/profile", renderProfileList);

  // cart route loads shopping cart
  app.get("/cart", renderShoppingList);

  //terms and conditions html 
  app.get("/terms", function (req, res) {
    res.sendFile(path.join(__dirname, "../public/term.html"));
  })
  //privacy html
  app.get("/privacy", function (req, res) {
    res.sendFile(path.join(__dirname, "../public/privacy.html"));
  })

  //login route
  app.get('/login',
    passport.authenticate('facebook', { scope : ['email', 'public_profile'] })
  );

  //login callback route
  app.get('/auth/facebook/callback',
    passport.authenticate('facebook', { session: false }),
    function (req, res) {
      let userId = req.user.id;
      console.log(req.user);
      let userName = req.user.displayName;
      let userEmail = req.user.emails[0].value;
      let userPic = req.user.photos[0].value;
      userInfo = {
        userId: userId,
        userName: userName,
        userEmail: userEmail,
        userPic: userPic
      }
      // POST route new user
      // app.post("/api/users", function (req, res) {
      console.log("user either created or found in api-routes");
      //console.log(req.body)
      db.UsersTable.findOrCreate({
        where: {
          id: userInfo.userId,
          userName: userInfo.userName,
          userEmail: userInfo.userEmail,
          userPic: userInfo.userPic
        },
      }).error(function (err) { //error handling
        console.log(err);
      })
      //});
      // Successful authentication, redirect home.
      res.redirect('/');
      // res.send('auth was good');
    });

  //logout route
  app.get('/logout', function (req, res) {
    req.logout();
    userInfo.userId = undefined;
    res.redirect('/');
  });



  //API ROUTES BELOW

  // GET route for API key and userInfo
  app.get('/getkey', function (req, res) {
    console.log(userInfo);
    let sentVariable = {key, userInfo};
    res.send(sentVariable);
  });



  //RECIPES
  // GET route for getting all of the recipes
  app.get("/api/recipes", function (req, res) {
    db.RecipeTable.findAll({
      where: {
        UsersTableId: userInfo.userId
      },
      include: [{
        model: db.UsersTable,
        required: true
      }]
    }).then(function (dbRecipes) {
      res.json(dbRecipes);
    })
  });
  // POST route for saving a new recipe
  app.post("/api/recipes", function (req, res) {
    console.log(req.body);
    db.RecipeTable.findOrCreate({
      where: {
        id: req.body.id,
        recipeName: req.body.recipeName,
        recipeImage: req.body.recipeImage,
        recipeSource: req.body.recipeSource,
        UsersTableId: req.body.UsersTableId
      },
    }).error(function (err) { //error handling
      console.log(err);
    }).then(function (dbTodo) {
      res.json(dbTodo);
    });
  });

  // DELETE route for deleting ingredients
  app.delete("/api/recipes/:id", function (req, res) {
    db.RecipeTable.destroy({
      where: {
        id: req.params.id
      },
      include: [{
        model: db.CartTable,
        where: { RecipeTableId: req.params.id },
        required: true
      }]
    }).then(function (db) {
      res.json(db);
    });
  });


  //CART
  // GET route for getting all of the content for the cart
  app.get("/api/cart", function (req, res) {
    db.CartTable.findAll({
      where: {
        UsersTableId: userInfo.userId
      },
      include: [{
        model: db.UsersTable,
        required: true
      }]
    }).then(function (dbUsers) {
      res.json(dbUsers);
    })
  });
  // POST route new item to cart
  app.post("/api/cart", function (req, res) {
    console.log(req.body)
    db.CartTable.create({
      RecipeTableId: req.body.RecipeTableId,
      Ingredients: req.body.Ingredients,
      UsersTableId: req.body.UsersTableId
    }).error(function (err) { //error handling
      console.log(err);
    }).then(function (dbTodo) {
      res.json(dbTodo);
    });
  });
  // DELETE route for deleting ingredients
  app.delete("/api/cart/:id", function (req, res) {
    db.CartTable.destroy({
      where: {
        id: req.params.id
      },
    }).then(function (db) {
      res.json(db);
    });
  });
}


//this function allows handlebars to display the database variables
function renderProfileList(req, res) {
  if (userInfo.userId == undefined) {
    res.redirect('/login');
  } else {
    db.RecipeTable.findAll({
      where: {
        UsersTableId: userInfo.userId
      }
    }).then(function (profileInfoToHTML) {
      res.render("profile", { RecipeTable: profileInfoToHTML });
    })
  }
};

//this function allows handlebars to display the database variables
function renderShoppingList(req, res) {
  if (userInfo.userId == undefined) {
    res.redirect('/login');
  } else {
    db.CartTable.findAll({
      where: {
        UsersTableId: userInfo.userId
      }
    }).then(function (cartInfoToHTML) {
      res.render("shoppinglist", { CartTable: cartInfoToHTML });
    })
  }
};

