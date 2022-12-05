var express = require("express");
var mongoose = require("mongoose");
const User = require("./models/user");
require("dotenv").config();
var app = express();
var database = require("./config/database");
var bodyParser = require("body-parser"); // pull information from HTML POST (express4)
var bcrypt = require("bcryptjs");
var jwt = require("jsonwebtoken");
var port = process.env.PORT || 8000;
const auth = require("./middleware/auth");
app.use(bodyParser.urlencoded({ extended: "true" })); // parse application/x-www-form-urlencoded
app.use(bodyParser.json()); // parse application/json
app.use(bodyParser.json({ type: "application/vnd.api+json" })); // parse application/vnd.api+json as json
var path = require("path");
const exphbs = require("express-handlebars");
app.use(express.static(path.join(__dirname, "public")));
app.engine(
  ".hbs",
  exphbs.engine({
    extname: ".hbs",
    runtimeOptions: {
      allowProtoPropertiesByDefault: true,
      allowProtoMethodsByDefault: true,
    },
  })
);
app.set("view engine", ".hbs");

mongoose.connect(database.url);

var Restaurant = require("./models/restaurant");

// Register
app.post("/register", async (req, res) => {
  // Our register logic starts here
  console.log(req.body);
  try {
    // Get user input
    const { first_name, last_name, email, password } = req.body;

    // Validate user input
    if (!(email && password && first_name && last_name)) {
      res.status(400).send("All input is required");
    }

    // check if user already exist
    // Validate if user exist in our database
    const oldUser = await User.findOne({ email });

    if (oldUser) {
      return res.status(409).send("User Already Exist. Please Login");
    }

    //Encrypt user password
    encryptedPassword = await bcrypt.hash(password, 10);

    // Create user in our database
    const user = await User.create({
      first_name,
      last_name,
      email: email.toLowerCase(), // sanitize: convert email to lowercase
      password: encryptedPassword,
    });
    console.log("here");
    // Create token
    const token = jwt.sign(
      { user_id: user._id, email },
      process.env.TOKEN_KEY,
      {
        expiresIn: "2h",
      }
    );
    // save user token
    user.token = token;

    // return new user
    res.status(201).json(user);
  } catch (err) {
    console.log(err);
  }
  // Our register logic ends here
});

// Login
app.post("/login", async (req, res) => {
  // Our login logic starts here
  try {
    // Get user input
    const { email, password } = req.body;

    // Validate user input
    if (!(email && password)) {
      res.status(400).send("All input is required");
      console.log("first if");
    }
    // Validate if user exist in our database
    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      // Create token
      const token = jwt.sign(
        { user_id: user._id, email },
        process.env.TOKEN_KEY,
        {
          expiresIn: "2h",
        }
      );

      // save user token
      user.token = token;
      console.log("second if");
      // user
      res.status(200).json(user);
    } else {
      console.log("after try");
      res.status(400).send("Invalid Credentials");
    }
  } catch (err) {
    console.log(err);
  }
  // Our register logic ends here
});

// ...

//get all Restaurant data from db
app.get("/api/restaurant/:pageCount?/:pageNum?", auth, function (req, res) {
  // use mongoose to get all todos in the database

  let pageCount = parseInt(req.params.pageCount);
  console.log("pageCount: ", pageCount);
  let pageNum = parseInt(req.params.pageNum);
  console.log("pageNum: ", pageNum);
  Restaurant.find(function (err, restaurants) {
    if (!isNaN(pageCount)) {
      let bigarray = restaurants;
      console.log("bigarray: ", bigarray);
      var size = pageCount;
      console.log("size: ", size);
      var arrayOfArrays = [];
      for (var i = 0; i < bigarray.length; i += size) {
        arrayOfArrays.push(bigarray.slice(i, i + size));
      }
      if (err) res.send(err);
      res.json(arrayOfArrays[pageNum - 1]); // return all Restaurants in JSON format
    } else {
      Restaurant.find(function (err, restaurants) {
        if (err) res.send(err);
        res.json(restaurants);
      });
    }
  });
});

// api page perpage borough
app.get(
  "/api/restaurant/:pageCount?/:pageNum?/:borough?",
  auth,
  function (req, res) {
    console.log(req.body);

    let page = parseInt(req.params.pageCount);
    console.log("page: ", page);
    let perPage = parseInt(req.params.pageNum);
    console.log("perPage: ", perPage);
    let borough = req.params.borough;
    console.log("borough: ", borough);
    let myborougharray = [];
    Restaurant.find(function (err, restaurants) {
      for (let jsondata in restaurants) {
        //console.log(jsondata);
        if (restaurants[jsondata].borough == borough) {
          //console.log("Here");'
          myborougharray.push(restaurants[jsondata]);
        }
      }
      //console.log("here " + myborougharray);
      if (!isNaN(page) && !isNaN(perPage)) {
        let bigarray = myborougharray;
        //console.log("bigarray: ", bigarray);
        var size = perPage;
        console.log("size: ", size);
        var arrayOfArrays = [];
        for (var i = 0; i < bigarray.length; i += size) {
          arrayOfArrays.push(bigarray.slice(i, i + size));
        }
        console.log(arrayOfArrays[page - 1]);
        if (err) res.send(err);
        res.json(arrayOfArrays[page - 1]); // return all Restaurants in JSON format
      } else {
        Restaurant.find(function (err, restaurants) {
          if (err) res.send(err);
          res.json(restaurants);
        });
      }
    });
  }
);

//
app.get("/api/pageborough/:token?", async function (req, res) {
  // use mongoose to get all books in the database
  res.render("allbook");
});

app.post("/api/insert/data", function (req, res) {
  // use mongoose to get all todos in the database

  console.log(req.body);

  let page = parseInt(req.body.page);
  console.log("page: ", page);
  let perPage = parseInt(req.body.perPage);
  console.log("perPage: ", perPage);
  let borough = req.body.borough;
  console.log("borough: ", borough);
  let myborougharray = [];
  Restaurant.find(function (err, restaurants) {
    for (let jsondata in restaurants) {
      //console.log(jsondata);
      if (restaurants[jsondata].borough == borough) {
        //console.log("Here");'
        myborougharray.push(restaurants[jsondata]);
      }
    }
    //console.log("here " + myborougharray);
    if (!isNaN(page) && !isNaN(perPage)) {
      let bigarray = myborougharray;
      //console.log("bigarray: ", bigarray);
      var size = perPage;
      console.log("size: ", size);
      var arrayOfArrays = [];
      for (var i = 0; i < bigarray.length; i += size) {
        arrayOfArrays.push(bigarray.slice(i, i + size));
      }
      console.log(arrayOfArrays[page - 1]);
      if (err) res.send(err);
      //res.json(arrayOfArrays[page - 1]); // return all Restaurants in JSON format
      res.render("boroughdata", {
        boroughdata: arrayOfArrays[page - 1],
      });
    } else {
      Restaurant.find(function (err, restaurants) {
        if (err) res.send(err);
        res.json(restaurants);
      });
    }
  });
});

// get a Restaurant with ID of 1
app.get("/api/restaurantdata/:restaurant_id", auth, function (req, res) {
  let id = req.params.restaurant_id;
  Restaurant.findById(id, function (err, restaurant) {
    if (err) res.send(err);

    res.json(restaurant);
  });
});

// create Restaurant and send back all Restaurants after creation
app.post("/api/restaurant", auth, function (req, res) {
  // create mongose method to create a new record into collection
  console.log(req.body);

  // let address = req.body.address;
  // let id = req.params._id;
  let building = req.body.building;
  let coord1 = req.body.coord1;
  let coord2 = req.body.coord2;
  let street = req.body.street;
  let zipcode = req.body.zipcode;
  let borough = req.body.borough;
  let cuisine = req.body.cuisine;
  let date = req.body.date;
  let score = req.body.score;
  let grade = req.body.grade;
  let name = req.body.name;
  let restaurant_id = req.body.restaurant_id;

  let address = {
    building: building,
    street: street,
    zipcode: zipcode,
    coord: [coord1, coord2],
  };

  let grades = {
    date: date,
    grade: grade,
    score: score,
  };

  let restaurant_data = {
    address: address,
    borough: borough,
    cuisine: cuisine,
    grades: [grades],
    name: name,
    restaurant_id: restaurant_id,
  };

  Restaurant.create(restaurant_data, function (err, restaurant) {
    if (err) res.send(err);

    // get and return all the restaurant after newly created restaurant record
    Restaurant.find(function (err, restaurants) {
      if (err) res.send(err);
      res.json(restaurants);
    });
  });
});

// create Restaurant and send back all restaurant after creation
app.put("/api/restaurant/:restaurant_id", auth, function (req, res) {
  // create mongose method to update an existing record into collection
  console.log(req.body);

  let id = req.params.restaurant_id;
  var data = {
    name: req.body.name,
    borough: req.body.borough,
  };

  // save the user
  Restaurant.findByIdAndUpdate(id, data, function (err, restaurant) {
    if (err) throw err;

    res.send("Successfully! restaurant updated - " + restaurant.name);
  });
});

// delete a restaurant by id
app.delete("/api/restaurant/:restaurant_id", auth, function (req, res) {
  console.log(req.params.restaurant_id);
  let id = req.params.restaurant_id;
  Restaurant.remove(
    {
      _id: id,
    },
    function (err) {
      if (err) res.send(err);
      else res.send("Successfully! restaurant has been Deleted.");
    }
  );
});

app.listen(port);
console.log("App listening on port : " + port);
