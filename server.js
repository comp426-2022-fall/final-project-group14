// const express = require("express")
// const minimist = require("minimist")
// const roll = require("./lib/roll.js")
// let fetch = import("node-fetch")
import fetch from 'node-fetch';
import express from 'express';
import roll from './lib/roll.js';
import minimist from 'minimist';
import path from 'path';
import Database from "better-sqlite3"
import bonus from'./lib/get_ability_bonus.js';

//setup __dirname
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
console.log(__dirname);

//setup database
const database = new Database("userInfo.db")
db.pragma('journal_mode = WAL');

const sqlInit = `CREATE TABLE users ( id INTEGER PRIMARY KEY AUTOINCREMENT, user VARCHAR, pass VARCHAR );`
try {
    db.exec(sqlInit);
} catch (error) {
}

const sqlInit2 = `CREATE TABLE logs ( id INTEGER PRIMARY KEY AUTOINCREMENT, user VARCHAR, message VARCHAR, time VARCHAR);`
try {
    db.exec(sqlInit2);
} catch (error) {
}

const app = express();
app.set('views',path.join(__dirname,'views'));
app.set("view engine", "ejs");

// User profile json; should contain all personal information about the user
// The final step of character setup displays this info
var user = {}

// an array of 6 abilities
var ability = []

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
    const firstName = req.body.fName;
    const lastName = req.body.lName;
    const email = req.body.email;

    const timeElapsed = Date.now();
    const today = new Date(timeElapsed);

    const stmt1 = `INSERT INTO logs (user, message, time) VALUES ('${user}', 'attempted to login', '${today.toISOString()}');`;
    db.exec(stmt1)

    
    //add personal info to user json
    user["fName"] = firstName;
    user["lName"] = lastName;
    user["email"] = email;

    res.redirect("/app/choose-race");
})

var endpoint = "races/"
var elf = "elf";
var dwarf = "dwarf"
var halfling = "halfing"
var human = "human"  

const elf_data = await fetch(base_url+endpoint+elf);
const elf_json = await elf_data.json();
const dwarf_data = await fetch(base_url+endpoint+ dwarf)
const dwarf_json = await dwarf_data.json()
const halfling_data = await fetch(base_url+endpoint+halfling)
const halfling_json = await halfling_data.json()
const human_data = await fetch(base_url+endpoint+human)
const human_json = await human_data.json()

// User choose race
app.get("/app/choose-race/", async function(req, res){
    var elf_des = elf_json["alignment"]
    var dwarf_des = dwarf_json["alignment"]
    var halfling_des = halfling_json["alignment"]
    var human_des = human_json["alignment"]

    res.render("race", {elf: elf_des, dwarf: dwarf_des, halfling: halfling_des, human: human_des})
})

// User choose race
user["bonus"] = [0,0,0,0,0,0]
app.get("/app/elf/", async function(req, res){
    user["race"] = "elf"
    var race_data = elf_json
    ability = bonus(race_data)
    user["bonus"] = ability
    res.redirect("/app/class/")
})

app.get("/app/dwarf/", function(req, res){
    user["race"] = "dwarf"
    var race_data = dwarf_json
    ability = bonus(race_data)
    user["bonus"] = ability
    res.redirect("/app/class/")
})

app.get("/app/halfling/", function(req, res){
    user["race"] = "halfling"
    var race_data = halfling_json
    ability = bonus(race_data)
    user["bonus"] = ability
    res.redirect("/app/class/")
})

app.get("/app/human/", function(req, res){
    user["race"] = "human"
    var race_data = human_json
    ability = bonus(race_data)
    user["bonus"] = ability
    res.redirect("/app/class/")
})

const endpoint2 = "classes/"
const bar = "barbarian"
const cleric = "cleric"
const fighter = "fighter"
const wizard = "wizard"

const bar_data = await fetch(base_url+endpoint2+bar);
const bar_json = await bar_data.json();
const cleric_data = await fetch(base_url+endpoint2+ cleric)
const cleric_json = await cleric_data.json()
const fighter_data = await fetch(base_url+endpoint2+fighter)
const fighter_json = await fighter_data.json()
const wizard_data = await fetch(base_url+endpoint2+wizard)
const wizard_json = await wizard_data.json()

app.get("/app/class/", function(req, res){
    res.sendFile(__dirname + "/html/class.html")
})

app.get("/app/barbarian/", function(req, res){
    user["class"] = "barbarian"
    user["hd"] = parseInt(bar_json["hit_die"])
    res.redirect("/app/ability/")
})

app.get("/app/cleric/", function(req, res){
    user["class"] = "cleric"
    user["hd"] = parseInt(cleric_json["hit_die"])
    res.redirect("/app/ability/")
})

app.get("/app/fighter/", function(req, res){
    user["class"] = "fighter"
    user["hd"] = parseInt(fighter_json["hit_die"])
    res.redirect("/app/ability/")
})

app.get("/app/wizard/", function(req, res){
    user["class"] = "wizard"
    user["hd"] = parseInt(wizard_json["hit_die"])
    res.redirect("/app/ability/")
})

app.get("/app/ability/", function(req, res){
    res.sendFile(__dirname + "/html/ability.html")
})

// User choose ability
user["ability"] = [0,0,0,0,0,0];
app.get("/app/ability/str/", function(req, res){
    var result = roll(6, 1, 3).results[0]
    user["ability"][0] = user["bonus"][0] + result
    var strength = user["ability"][0]
    res.render("strength", {roll: result, strength: strength})
})

app.get("/app/ability/str/dex/", function(req, res){
    var result = roll(6, 1, 3).results[0]
    user["ability"][1] = user["bonus"][1] + result
    var dex = user["ability"][1]
    res.render("dexterity", {roll: result, dex: dex})
})

app.get("/app/ability/str/dex/con/", function(req, res){
    var result = roll(6, 1, 3).results[0]
    user["ability"][2] = user["bonus"][2] + result
    var con = user["ability"][2]
    res.render("constitution", {roll: result, con: con})
})

app.get("/app/ability/str/dex/con/int/", function(req, res){
    var result = roll(6, 1, 3).results[0]
    user["ability"][3] = user["bonus"][3] + result
    var int = user["ability"][3]
    res.render("intelligence", {roll: result, int: int})
})

app.get("/app/ability/str/dex/con/int/wis/", function(req, res){
    var result = roll(6, 1, 3).results[0]
    user["ability"][4] = user["bonus"][4] + result
    var wis = user["ability"][4]
    res.render("wisdom", {roll: result, wis:wis})
})

app.get("/app/ability/str/dex/con/int/wis/cha/", function(req, res){
    var result = roll(6, 1, 3).results[0]
    user["ability"][5] = user["bonus"][5] + result
    var cha = user["ability"][5]
    res.render("charisma", {roll: result, cha: cha})
})

app.get("/app/name/", function(req, res){
    res.sendFile(__dirname + "/html/name.html")
})

app.post("/app/name/", function(req, res){
    const name = req.body.name;
    user["character-name"] = name;
    res.redirect("/app/character-summary")
})

app.get("/app/character-summary/", function(req, res){
    const name = user["character-name"]
    const race = user["race"]
    const job = user["class"]
    const hd = user["hd"]
    const score = user["ability"]
    var str = score[0]
    var dex = score[1]
    var con = score[2]
    var int = score[3]
    var wis = score[4]
    var cha  = score[5]

    res.render("character-summary", {name:name, race:race, job: job, hd:hd, str:str, dex:dex, con:con, int:int, wis:wis, cha:cha});
})

//Story background
app.get("/app/background", function(req, res){
    res.sendFile(__dirname + "/html/background.html")
})
    //Conversation with the two characters
    app.get("/app/conversation", function(req, res){
        res.sendFile(__dirname + "/html/conversation.html")
    })
    //if the player reject the offer, here is the page
    app.get("/app/reject", function(req, res){
        res.sendFile(__dirname + "/html/reject.html")
    })

//Encounter 1
app.get("/app/accept", function(req, res){
    res.sendFile(__dirname + "/html/encounter1.html")
})
    //survival check for the player leads to exaustion, failure, or the battle
    var totalfail = 0;
    var continuousfail = 0;
    var exaust = 0;
    var dice =0;
    var dices = [];
    app.get("/app/survivalcheck",function(req,res){
        for (var i=0; i<8; i++) {
            dice = Math.floor(Math.random() * 20) + 1;
            dices[i]=dice;
            if(dice <= 10){
                totalfail+=1;
                continuousfail+=1;
            }
            if(dice>10){
                continuousfail=0;
            }
            if(continuousfail >= 3){
                exaust=1;
            }
        }
        res.render('survivalcheck',{dices:dices})
    })
    app.get("/app/survivalcheck/checkresult",function(req,res){
        if(exaust ==1){
            return res.redirect("/app/survivalcheck/exhaustion");
        }
        else if(totalfail >= 5){
            return res.redirect("/app/survivalcheck/fail");
        }else{
            res.redirect("/app/E2/");
        }
    })
    //if the player becomes exausted
    const exhaustion = "https://www.dnd5eapi.co/api/conditions/exhaustion";
    const result = await fetch(exhaustion);
    const words = await result.json();
    const description = words.desc;
    const explanation = description.slice(0,1);
    const level1 = description.slice(1,2);
    const level2 = description.slice(2,3);
    const level3 = description.slice(3,4);
    const level4 = description.slice(4,5);
    const level5 = description.slice(5,6);

    app.get("/app/survivalcheck/exhaustion",function(req,res){
        var level = Math.floor(Math.random() * 5) + 1;
        console.log(level)
        //1 - Disadvantage on ability checks
        if(level == 1){
            res.render('exhaustion',{level:level1,explanation:explanation})
        } 
        //2 - Speed halved
        if(level ==2){
            res.render('exhaustion',{level:level2,explanation:explanation})
        } 
        //Disadvantage on attack rolls and saving throws
        if(level ==3){
            res.render('exhaustion',{level:level3,explanation:explanation})
        }
        //4 - Hit point maximum halved
        if(level==4){
            res.render('exhaustion',{level:level4,explanation:explanation})
        }
        //5 - Speed reduced to 0
        if(level ==5){
            res.render('exhaustion',{level:level5,explanation:explanation})
        }
    })

    // if the player fails the survival check
    app.get("/app/survivalcheck/fail",function(req,res){
        res.sendFile(__dirname + "/html/fail.html");
    })


//Encounter 2
    //info from api
    const combatorder = "https://www.dnd5eapi.co/api/rule-sections/the-order-of-combat";
    const response = await fetch(combatorder);
    const order = await response.json();
    const orderarray = order.desc.split("\n");
    const combatrule1 = orderarray.slice(1,3);
    const combatrule2 = orderarray.slice(5,7);
    var wolflife = 75;

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
        const surp = orderarray.slice(12,20);
        
        if(playernum >= wolfnum){
            win = "you win!";
        }else{
            win = "you lose";
        }
        
        //TODO: add wolf wisdom and player's dex

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
    });

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
    //TODO: end the fight
        res.render("combat-actions",{hide:hide,dodge:dodge,attack:attack,turns:step4,intro:intro,head:head})
    });

    //Three choices
    //first:attack
    const attack = "https://www.dnd5eapi.co/api/rule-sections/making-an-attack";
    const response3 = await fetch(attack);
    const attacks = await response3.json();
    const attackrule = attacks.desc.split("\n");

    //roll the attack roll first:
    var attackroll = 0;
    var attackresult = "you miss"
    app.get("/app/E2/fight/turns/attack", function(req,res){
        const first = attackrule.slice(0,1);
        const sec = attackrule.slice(1,7);
        const attroll = attackrule.slice(10,14);
        const modi = attackrule.slice(14,18);
        //console.log(attackrule.slice(10,18));
        attackroll = roll(20,1,1).results[0];

//TODO: add modifiers
        if(attackroll >= 13){
            attackresult = "you hit!";
        } else{
            attackresult = "you miss";
        }
        res.render("combat-actions-attack",{result:attackresult,playernum:attackroll,modi:modi,attroll:attroll,first:first,sec:sec});
    });

    //if hit, damage roll:
    const damage = "https://www.dnd5eapi.co/api/rule-sections/damage-and-healing";
    const response4 = await fetch(damage);
    const damages = await response4.json();
    const damagerule = damages.desc.split("\n");
    app.post("/app/E2/fight/turns/attack", function(req,res){
        var wolfpossi = roll(10,1,1).results[0];
        var wolfharm = 0;
        if(wolfpossi >= 8){
            wolfharm = 6;
        }
        const dama = damagerule.slice(12,17);

        if(attackresult==="you hit!"){
            //TODO: add modifiers and player's hit point
            var playernum = roll(15,1,1).results[0];
            wolflife -= playernum;
            res.render("combat-actions-damage",{wolflife:wolflife,playernum:playernum,dama:dama,wolfharm:wolfharm});
        } else{
            //TODO: change player's hit
            res.render("combat-actions-miss",{wolfharm:wolfharm});
        }
    });

    //second:dodge
    app.get("/app/E2/fight/turns/dodge", function(req,res){
        const dodge = acts.slice(28,31);
        var wolfpossi = roll(10,1,1).results[0];
        var wolfharm = 0;
        if(wolfpossi >= 8){
            wolfharm = 3;
        }
        //TODO: change player's hit
        res.render("combat-actions-dodge",{dodge:dodge,wolfharm:wolfharm});
    });

    //third:hide
    app.get("/app/E2/fight/turns/hide", function(req,res){
        const hide = acts.slice(38,42);
        var hi_suc = roll(20,1,1).results[0];
        //TODO:add dex modifiers
        var success = "";
        var wolfharm = 0;
        if(hi_suc >= 10){
            success = "You hide successfully!"
        } else{
            success = "You are seen by the wolf."
            var wolfpossi = roll(10,1,1).results[0];
            var wolfharm = 0;
            if(wolfpossi >= 8){
                wolfharm = 6;
            }
        }
        //TODO: change player's hit
        res.render("combat-actions-hide",{hide:hide,playernum:hi_suc,success:success,wolfharm:wolfharm});
    });

    //ending
    app.get("/app/ending",function(req,res){
        //TODO: win if the wolf is dead, lose if the wolf is not dead or the player is dead.
        if(wolflife <= 0){
            res.sendFile(__dirname + "/html/ending-win.html");
        } else{
            res.sendFile(__dirname + "/html/ending-fail.html");
        }
    });

var port = 3000
app.listen(port, function(req, res){
    console.log("Server is listening on port " + port+".")
})