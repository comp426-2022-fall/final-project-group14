const express = require("express")
const minimist = require("minimist")
const roll = require("./lib/roll.js")
const node-fetch = require("node-fetch")

const app = express()

// User profile json; should contain all personal information about the user
// The final step of character setup displays this info
var user = {}

// an array of 6 abilities
const ability = []

// API base url
const base_url = "https://www.dnd5eapi.co/api/"

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

// User choose race
app.get("/app/choose-race/", function(req, res){

    res.sendFile(__dirname + "/html/choose-race.html")
})

// User choose race
app.post("/app/choose-race/", function(req, res){
    //button to choose race from dwarf, elf, half, human
    const race = req.body.race;
    
    user["race"] = race;

    // TODO: pull info about race from DnD API
    var endpoint = "race/"
    var url = base_url + endpoint + race
    const response = await fetch(url);
    const data = await response.json();

    // get ability bonuses for each race
    var strength = 0
    var dexterity = 0
    var constitution = 0
    var intelligence = 0
    var wisdom = 0
    var charisma = 0

    const ability_bonuses = data.ability_bonuses;
    for (var i=0; i<ability_bonuses.length; i++) {
        // add ability bonuses to each character
        var ability_num = ability_bonuses[i];
        var ability_index = ability_num.ability_score.index;
        var bonus = parseInt(ability_num.bonus)
        switch (ability_index){
            case "str":
                strength = strength + bonus
                break
            case "dex":
                dexterity = dexterity + bonus
                break
            case "con":
                constitution = constitution + bonus
                break
            case "int":
                intelligence = intelligence + bonus
                break
            case "wis":
                wisdom = wisdom + bonus
                break
            case "cha":
                charisma = charisma + bonus
                break
            default:
                console.log("ability bonus not found: " + ability_index)          
        }
    }

    // ability is global
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

// User choose ability
app.get("/app/ability/", function(req, res){
    res.sendFile(__dirname + "/html/ability.html")
})


app.get("/character-summary", function(req, res){
    res.render("character", {userInfo: user});
})

//Story background

//Encounter 1

//Encounter 2
app.get("/app/E2/", function(req, res){
    res.sendFile(__dirname + "/html/battle.html");
});
app.get("/app/E2/fight", function(req, res){
    res.sendFile(__dirname + "/html/combat1.0.html");
});
app.get("/app/E2/notyetfight", function(req, res){
    res.sendFile(__dirname + "/html/combat1.1.html");
});

var port = 3000
app.listen(port, function(req, res){
    console.log("Server is listening on port " + port+".")
})