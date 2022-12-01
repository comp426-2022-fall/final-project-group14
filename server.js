// const express = require("express")
// const minimist = require("minimist")
// const roll = require("./lib/roll.js")
// let fetch = import("node-fetch")
import fetch from 'node-fetch';
import express from 'express';
import roll from './lib/roll.js';
import minimist from 'minimist';
import path from 'path';


//setup __dirname
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
console.log(__dirname);


const app = express();
app.set('views',path.join(__dirname,'views'));
app.set("view engine", "ejs");

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
app.post("/app/choose-race/", async function(req, res){
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
    //info from api
    const combatorder = "https://www.dnd5eapi.co/api/rule-sections/the-order-of-combat";
    const response = await fetch(combatorder);
    const order = await response.json();
    const orderarray = order.desc.split("\n");
    const combatrule1 = orderarray.slice(1,3);
    const combatrule2 = orderarray.slice(5,7);

    //start page of battle, explaining the background
    app.get("/app/E2/", function(req, res){
        res.sendFile(__dirname + "/html/battle.html");
    });

    //if the player choose to join the fight, here is the page
    //step1:determine surprise
    var win = "you lose";
    app.get("/app/E2/fight", function(req, res){  
        const playernum = roll(20,1,1).results[0];
        const wolfnum = roll(20,1,1).results[0];
        const choice = "Because you choose to join the fight, you have the chance to surprise the winter wolf. To determine whether you success, you need to roll a 20-side dice. If your number + dexterity is bigger than the number of wolf + wolf wisdom, you win!"
        //const dex = ability["str"];
        const surp = orderarray.slice(12,20);
        
        if(playernum >= wolfnum){
            win = "you win!";
        }else{
            win = "you lose";
        }
        //console.log(orderarray.slice(20,24));

        res.render("combat-surprise",{surp:surp,choice:choice,first:orderarray[0],second:combatrule1.toString(),third:orderarray[4],forth:combatrule2.toString(),playernum:playernum,wolfnum:wolfnum,win:win});
    });

        
        //if the player choose "try to hide", he is forced to join
    app.get("/app/E2/notyetfight", function(req, res){
        res.sendFile(__dirname + "/html/precombat.html");
    });
        
    //TODO: if win, attack if lose, get hurt or none

    //step 2&3: roll initiative
    var initi = "You are second!";
    app.post("/app/E2/fight", function(req,res){
        const stepposition = orderarray.slice(7,8);
        const step2 = orderarray.slice(8,9);
        const playernum = roll(20,1,1).results[0];
        const wolfnum = roll(20,1,1).results[0];
        const initirule = orderarray.slice(20,28);
        if(playernum >= wolfnum){
            initi = "You are first!";
        }else{
            initi = "You are second!";
        }
        res.render("combat-initiative",{initirule:initirule,position:stepposition, initiative:step2,playernum:playernum,wolfnum:wolfnum,order:initi});
    })

    //TODO: find a way to remember the order 

    //step 4: start the turn and take actions
    const combataction = "https://www.dnd5eapi.co/api/rule-sections/actions-in-combat";
    const response2 = await fetch(combataction);
    const act = await response2.json();
    const acts = act.desc.split("\n");

    app.get("/app/E2/fight/turns",function(req,res){
        const step4 = orderarray.slice(9,10);
        const head = acts.slice(0,1);
        const intro = acts.slice(1,5);
        const attack = acts.slice(6,11);
        const dodge = acts.slice(28,31);
        const hide = acts.slice(38,42);
        //console.log(acts);
        //console.log(acts.slice(38,42));
        res.render("combat-actions",{hide:hide,dodge:dodge,attack:attack,turns:step4,intro:intro,head:head})
    })





var port = 3000
app.listen(port, function(req, res){
    console.log("Server is listening on port " + port+".")
})