const express = require("express")
const minimist = require("minimist")
const roll = require("./lib/roll.js")

const app = express()

// User profile json; should contain all personal information about the user
// The final step of character setup displays this info
var user = {}

// an array of 6 abilities
const ability = ["str", "dex", "con", "int", "wis", "cha"]

app.use(express.urlencoded({ extended: true}));
app.use(express.json())
app.set('view engine', 'ejs');
app.use(express.static("public"));

// User Login Page
app.get("/app/", function(req, res){
    res.sendFile(__dirname + "/html/signup.html")
})

// User Login Enter info
app.post("/app/", function(req, res){
    // Get personal info from the signup page
    const firstName = req.body.fName;
    const lastName = req.body.lName;
    const email = req.body.email;
    
    //add personal info to user json
    user["fName"] = firstName;
    user["lName"] = lastName;
    user["email"] = email;

    res.redirect("/app/choose-race");
})

app.get("/app/choose-race/", function(req, res){
    res.sendFile(__dirname + "/html/choose-race.html")
})

app.post("/app/choose-race/", function(req, res){
    //button to choose race from dwarf, elf, half, human
    const race = req.body.race;
    
    user["race"] = race;

    // TODO: pull info about race from DnD API
    // get ability bonuses for each race
    var strength
    var dexterity
    var constitution
    var intelligence
    var wisdom
    var charisma

    const ability = []
    ability.push({"str": strength})
    ability.push({"dex": dexterity})
    ability.push({"con": constitution})
    ability.push({"int": intelligence})
    ability.push({"wis": wisdom})
    ability.push({"cha": charisma})

    // put the ability array into user profile json
    user["ability-score"] = ability

    res.redirect("/app/ability");
})

app.get("/app/ability/", function(req, res){
    res.sendFile(__dirname + "/html/ability.html")
})

app.post("/app/ability/", function(req, res){
    // use EJS and for loop to write
    // use roll dice
})

app.get("/character-summary", function(req, res){
    res.render("character", {userInfo: user});
})

var port = 3000
app.listen(port, function(req, res){
    console.log("Server is listening on port " + port+".")
})