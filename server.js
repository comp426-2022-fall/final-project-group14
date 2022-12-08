import fetch from 'node-fetch';
import express from 'express';
import roll from './lib/roll.js';
import path from 'path';
import Database from "better-sqlite3"
import bonus from'./lib/get_ability_bonus.js';

//setup __dirname
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

//setup database
const db = new Database("userInfo.db")
db.pragma('journal_mode = WAL');

// Userinfo table
const userInit = `CREATE TABLE users ( id INTEGER PRIMARY KEY AUTOINCREMENT, email VARCHAR, pass VARCHAR );`
try {
    db.exec(userInit);
} catch (error) {
}

// Log table
const logInit = `CREATE TABLE logs ( id INTEGER PRIMARY KEY AUTOINCREMENT, email VARCHAR, message VARCHAR, time VARCHAR);`
try {
    db.exec(logInit);
} catch (error) {
}

// Character table
const chaInit = `CREATE TABLE characters ( id INTEGER PRIMARY KEY AUTOINCREMENT, email VARCHAR, name VARCHAR, race VARCHAR, class VARCHAR, hd VARCHAR, str VARCHAR, dex VARCHAR, con VARCHAR, int VARCHAR, wis VARCHAR, cha VARCHAR);`
try {
    db.exec(chaInit);
} catch (error) {
}

const app = express();
app.set('views',path.join(__dirname,'views'));
app.set("view engine", "ejs");

// API base url
const base_url = "https://www.dnd5eapi.co/api/"

app.use(express.urlencoded({ extended: true}));
app.use(express.json())
app.set('view engine', 'ejs');
app.use(express.static("public"));

//root page
app.get("/", function(req, res){
    res.redirect("/app/");
})

// User Login Page
app.get("/app/", function(req, res){
    res.sendFile(__dirname + "/html/signup.html")
})

// User Login Enter info
app.post("/app/", function(req, res){
    const email = req.body.email;
    const pass = req.body.password;
    req.app.set('email', email);
    req.app.set('pass', pass);
    const timeElapsed = Date.now();
    const today = new Date(timeElapsed);

    const stmt = db.prepare(`SELECT * FROM users WHERE email='${email}' and pass='${pass}';`);
    let row = stmt.get();

    // If you have not registered, it will automatically generate new account for you
    if (row === undefined) {
        //new user entry
        const userInfo = `
        INSERT INTO users (email, pass) VALUES ('${email}', '${pass}')
        `
        db.exec(userInfo)
        
        //new character entry
        const chaInfo = `
        INSERT INTO characters (email) VALUES ('${email}')
        `
        db.exec(chaInfo)
        
        //new log entry
        
        const newLog = `INSERT INTO logs (email, message, time) VALUES ('${email}', 'register account', '${today.toISOString()}');`;
        db.exec(newLog)
        res.redirect("/app/name/");
    } else{
        // if you have registered and played the game, the web will direct you to the character summary page
        const stmt2 = `INSERT INTO logs (email, message, time) VALUES ('${email}', 'log in', '${today.toISOString()}');`;
        db.exec(stmt2)
        res.redirect("/app/character-summary/")
    }
    

})

// Delete account
app.get("/app/delete_account/", function(req, res){
    const timeElapsed = Date.now();
    const today = new Date(timeElapsed);
    let email = req.app.get('email')
    let pass = req.app.get('pass')
    const stmt1 = `INSERT INTO logs (email, message, time) VALUES ('${email}', 'delete account and start over', '${today.toISOString()}');`;
    db.exec(stmt1)

    const stmt2 = `DELETE FROM users WHERE email='${email}' and pass='${pass}'`
    db.exec(stmt2)

    const stamt3 = `DELETE FROM characters WHERE email='${email}'`
    db.exec(stamt3)
    
    // Redirect to login after delete account
    res.redirect("/app/")
}) 

// User names character
app.get("/app/name/", function(req, res){
    const timeElapsed = Date.now();
    const today = new Date(timeElapsed);
    let email = req.app.get('email')
    const stmt1 = `INSERT INTO logs (email, message, time) VALUES ('${email}', 'choose character name', '${today.toISOString()}');`;
    db.exec(stmt1)

    res.sendFile(__dirname + "/html/name.html")
})

app.post("/app/name/", function(req, res){
    const name = req.body.name;
    req.app.set('character-name', name)
    
    let email = req.app.get('email')
    const stmt2 = `
    UPDATE characters SET name = '${name}' WHERE email = '${email}'
    `
    db.exec(stmt2)

    res.redirect("/app/choose-race/")
})

var endpoint = "races/"
var elf = "elf";
var dwarf = "dwarf"
var halfling = "halfling"
var human = "human"  

const elf_data = await fetch(base_url+endpoint+elf);
const elf_json = await elf_data.json();
const dwarf_data = await fetch(base_url+endpoint+ dwarf)
const dwarf_json = await dwarf_data.json()
const halfling_data = await fetch(base_url+endpoint+halfling)
const halfling_json = await halfling_data.json()
const human_data = await fetch(base_url+endpoint+human)
const human_json = await human_data.json()

// User chooses race
app.get("/app/choose-race/", async function(req, res){
    const timeElapsed = Date.now();
    const today = new Date(timeElapsed);
    let email = req.app.get('email')
    const stmt1 = `INSERT INTO logs (email, message, time) VALUES ('${email}', 'choose race', '${today.toISOString()}');`;
    db.exec(stmt1)

    var elf_des = elf_json["alignment"]
    var dwarf_des = dwarf_json["alignment"]
    var halfling_des = halfling_json["alignment"]
    var human_des = human_json["alignment"]

    res.render("race", {elf: elf_des, dwarf: dwarf_des, halfling: halfling_des, human: human_des})
})

// User chooses elf
app.get("/app/elf/", async function(req, res){
    const timeElapsed = Date.now();
    const today = new Date(timeElapsed);
    let email = req.app.get('email')
    const stmt1 = `INSERT INTO logs (email, message, time) VALUES ('${email}', 'choose race - elf', '${today.toISOString()}');`;
    db.exec(stmt1)

    // update character table with race
    var race = 'elf'
    const stmt2 = `
    UPDATE characters SET race = '${race}' WHERE email = '${email}'
    `
    db.exec(stmt2)

    req.app.set('race', 'elf')

    var race_data = elf_json
    var ability = bonus(race_data)
    req.app.set('bonus', ability)
    res.redirect("/app/class/")
})

// User chooses dwarf
app.get("/app/dwarf/", function(req, res){
    const timeElapsed = Date.now();
    const today = new Date(timeElapsed);
    let email = req.app.get('email')
    const stmt1 = `INSERT INTO logs (email, message, time) VALUES ('${email}', 'choose race - dwarf', '${today.toISOString()}');`;
    db.exec(stmt1)

    var race = 'dwarf'
    const stmt2 = `
    UPDATE characters SET race = '${race}' WHERE email = '${email}'
    `
    db.exec(stmt2)

    req.app.set('race', 'dwarf')
    var race_data = dwarf_json
    var ability = bonus(race_data)
    req.app.set('bonus', ability)
    res.redirect("/app/class/")
})

// User chooses halfling
app.get("/app/halfling/", function(req, res){
    const timeElapsed = Date.now();
    const today = new Date(timeElapsed);
    let email = req.app.get('email')
    const stmt1 = `INSERT INTO logs (email, message, time) VALUES ('${email}', 'choose race - halfling', '${today.toISOString()}');`;
    db.exec(stmt1)

    var race = 'halfling'
    const stmt2 = `
    UPDATE characters SET race = '${race}' WHERE email = '${email}'
    `
    db.exec(stmt2)

    req.app.set('race', 'halfling')
    var race_data = halfling_json
    var ability = bonus(race_data)
    req.app.set('bonus', ability)
    res.redirect("/app/class/")
})

// User chooses human
app.get("/app/human/", function(req, res){
    const timeElapsed = Date.now();
    const today = new Date(timeElapsed);
    let email = req.app.get('email')
    const stmt1 = `INSERT INTO logs (email, message, time) VALUES ('${email}', 'choose race - human', '${today.toISOString()}');`;
    db.exec(stmt1)

    var race = 'human'
    const stmt2 = `
    UPDATE characters SET race = '${race}' WHERE email = '${email}'
    `
    db.exec(stmt2)

    req.app.set('race', 'human')
    var race_data = human_json
    var ability = bonus(race_data)
    req.app.set('bonus', ability)
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

// User chooses class
app.get("/app/class/", function(req, res){
    const timeElapsed = Date.now();
    const today = new Date(timeElapsed);
    let email = req.app.get('email')
    const stmt1 = `INSERT INTO logs (email, message, time) VALUES ('${email}', 'choose class', '${today.toISOString()}');`;
    db.exec(stmt1)

    res.sendFile(__dirname + "/html/class.html")
})

// User chooses barbarian
app.get("/app/barbarian/", function(req, res){
    const timeElapsed = Date.now();
    const today = new Date(timeElapsed);
    let email = req.app.get('email')
    const stmt1 = `INSERT INTO logs (email, message, time) VALUES ('${email}', 'choose class - barbarian', '${today.toISOString()}');`;
    db.exec(stmt1)

    var job = 'barbarian'
    var hd = parseInt(bar_json["hit_die"]) +45
    req.app.set('class', job)
    req.app.set('hd', hd)

    const stmt2 = `
    UPDATE characters SET class = '${job}', hd = '${hd}' WHERE email = '${email}'
    `
    db.exec(stmt2)

    res.redirect("/app/ability/")
})

// User chooses cleric
app.get("/app/cleric/", function(req, res){
    const timeElapsed = Date.now();
    const today = new Date(timeElapsed);
    let email = req.app.get('email')
    const stmt1 = `INSERT INTO logs (email, message, time) VALUES ('${email}', 'choose class - cleric', '${today.toISOString()}');`;
    db.exec(stmt1)

    var job = 'cleric'
    var hd = parseInt(cleric_json["hit_die"])+45
    const stmt2 = `
    UPDATE characters SET class = '${job}', hd = '${hd}' WHERE email = '${email}'
    `
    db.exec(stmt2)

    req.app.set('class', 'cleric')
    req.app.set('hd', hd)
    res.redirect("/app/ability/")
})

app.get("/app/fighter/", function(req, res){
    const timeElapsed = Date.now();
    const today = new Date(timeElapsed);
    let email = req.app.get('email')
    const stmt1 = `INSERT INTO logs (email, message, time) VALUES ('${email}', 'choose class - fighter', '${today.toISOString()}');`;
    db.exec(stmt1)

    var job = 'fighter'
    var hd = parseInt(fighter_json["hit_die"])+45
    const stmt2 = `
    UPDATE characters SET class = '${job}', hd = '${hd}' WHERE email = '${email}'
    `
    db.exec(stmt2)

    req.app.set('class', 'fighter')
    req.app.set('hd', hd)
    res.redirect("/app/ability/")
})

app.get("/app/wizard/", function(req, res){
    const timeElapsed = Date.now();
    const today = new Date(timeElapsed);
    let email = req.app.get('email')
    const stmt1 = `INSERT INTO logs (email, message, time) VALUES ('${email}', 'choose class - wizard', '${today.toISOString()}');`;
    db.exec(stmt1)

    var job = 'wizard'
    var hd = parseInt(wizard_json["hit_die"])+45
    const stmt2 = `
    UPDATE characters SET class = '${job}', hd = '${hd}' WHERE email = '${email}'
    `
    db.exec(stmt2)

    req.app.set('class', 'wizard')
    req.app.set('hd', hd)
    res.redirect("/app/ability/")
})

app.get("/app/ability/", function(req, res){
    const timeElapsed = Date.now();
    const today = new Date(timeElapsed);
    let email = req.app.get('email')
    const stmt1 = `INSERT INTO logs (email, message, time) VALUES ('${email}', 'roll ability', '${today.toISOString()}');`;
    db.exec(stmt1)

    res.sendFile(__dirname + "/html/ability.html")
})

// User choose ability
app.get("/app/ability/str/", function(req, res){
    const timeElapsed = Date.now();
    const today = new Date(timeElapsed);
    let email = req.app.get('email')
    const stmt1 = `INSERT INTO logs (email, message, time) VALUES ('${email}', 'set strength', '${today.toISOString()}');`;
    db.exec(stmt1)

    var result = roll(6, 1, 3).results[0]
    const bonus = app.get('bonus')
    var strength = bonus[0] + result

    const stmt2 = `
    UPDATE characters SET str = '${strength}' WHERE email = '${email}'
    `
    db.exec(stmt2)

    req.app.set('str', strength)
    res.render("strength", {roll: result, strength: strength})
})

app.get("/app/ability/str/dex/", function(req, res){
    const timeElapsed = Date.now();
    const today = new Date(timeElapsed);
    let email = req.app.get('email')
    const stmt1 = `INSERT INTO logs (email, message, time) VALUES ('${email}', 'set dexterity', '${today.toISOString()}');`;
    db.exec(stmt1)

    var result = roll(6, 1, 3).results[0]
    const bonus = app.get('bonus')
    var dex = bonus[1] + result
    req.app.set('dex', dex)

    const stmt2 = `
    UPDATE characters SET dex = '${dex}' WHERE email = '${email}'
    `
    db.exec(stmt2)

    res.render("dexterity", {roll: result, dex: dex})
})

app.get("/app/ability/str/dex/con/", function(req, res){
    const timeElapsed = Date.now();
    const today = new Date(timeElapsed);
    let email = req.app.get('email')
    const stmt1 = `INSERT INTO logs (email, message, time) VALUES ('${email}', 'set constitution', '${today.toISOString()}');`;
    db.exec(stmt1)

    var result = roll(6, 1, 3).results[0]
    const bonus = app.get('bonus')
    var con = bonus[2] + result
    req.app.set('con', con)

    const stmt2 = `
    UPDATE characters SET con = '${con}' WHERE email = '${email}'
    `
    db.exec(stmt2)

    res.render("constitution", {roll: result, con: con})
})

app.get("/app/ability/str/dex/con/int/", function(req, res){
    const timeElapsed = Date.now();
    const today = new Date(timeElapsed);
    let email = req.app.get('email')
    const stmt1 = `INSERT INTO logs (email, message, time) VALUES ('${email}', 'set intelligence', '${today.toISOString()}');`;
    db.exec(stmt1)

    var result = roll(6, 1, 3).results[0]
    const bonus = app.get('bonus')
    var int = bonus[3] + result
    req.app.set('int', int)

    const stmt2 = `
    UPDATE characters SET int = '${int}' WHERE email = '${email}'
    `
    db.exec(stmt2)

    res.render("intelligence", {roll: result, int: int})
})

app.get("/app/ability/str/dex/con/int/wis/", function(req, res){
    const timeElapsed = Date.now();
    const today = new Date(timeElapsed);
    let email = req.app.get('email')
    const stmt1 = `INSERT INTO logs (email, message, time) VALUES ('${email}', 'set wisdom', '${today.toISOString()}');`;
    db.exec(stmt1)

    var result = roll(6, 1, 3).results[0]
    const bonus = app.get('bonus')
    var wis = bonus[4] + result
    req.app.set('wis', wis)

    const stmt2 = `
    UPDATE characters SET wis = '${wis}' WHERE email = '${email}'
    `
    db.exec(stmt2)

    res.render("wisdom", {roll: result, wis:wis})
})

app.get("/app/ability/str/dex/con/int/wis/cha/", function(req, res){
    const timeElapsed = Date.now();
    const today = new Date(timeElapsed);
    let email = req.app.get('email')
    const stmt1 = `INSERT INTO logs (email, message, time) VALUES ('${email}', 'set charisma', '${today.toISOString()}');`;
    db.exec(stmt1)

    var result = roll(6, 1, 3).results[0]
    const bonus = app.get('bonus')
    var cha = bonus[5] + result
    req.app.set('cha', cha)

    const stmt2 = `
    UPDATE characters SET cha = '${cha}' WHERE email = '${email}'
    `
    db.exec(stmt2)

    res.render("charisma", {roll: result, cha: cha})
})

// User can view their infomation here.
// This page also has buttons for users to delete their account and update their ability information
app.get("/app/character-summary/", function(req, res){
    const timeElapsed = Date.now();
    const today = new Date(timeElapsed);
    let email = req.app.get('email')
    const stmt1 = `INSERT INTO logs (email, message, time) VALUES ('${email}', 'view character summary', '${today.toISOString()}');`;
    db.exec(stmt1)

    const stmt2 = db.prepare(`SELECT * FROM characters WHERE email = '${email}';`);
    var all = stmt2.all();
    
    res.render("character-summary", {data: all});
})

//Story background
app.get("/app/background", function(req, res){
    const timeElapsed = Date.now();
    const today = new Date(timeElapsed);
    let email = req.app.get('email')
    const stmt1 = `INSERT INTO logs (email, message, time) VALUES ('${email}', 'enter encounter 1', '${today.toISOString()}');`;
    db.exec(stmt1)

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
    const exhaustion = "https://www.dnd5eapi.co/api/conditions/exhaustion";
    const result = await fetch(exhaustion);
    const words = await result.json();
    const description = words.desc;
    const explanation = description.slice(0,1);
    app.get("/app/survivalcheck",function(req,res){
        
        const timeElapsed = Date.now();
        const today = new Date(timeElapsed);
        let email = req.app.get('email')
        const stmt1 = `INSERT INTO logs (email, message, time) VALUES ('${email}', 'survival check', '${today.toISOString()}');`;
        db.exec(stmt1)

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
        res.render('survivalcheck',{dices:dices,explanation:explanation})
    })
    app.get("/app/survivalcheck/checkresult",function(req,res){
        
        const timeElapsed = Date.now();
        const today = new Date(timeElapsed);
        let email = req.app.get('email')
        const stmt1 = `INSERT INTO logs (email, message, time) VALUES ('${email}', 'get survival check result', '${today.toISOString()}');`;
        db.exec(stmt1)

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
    const level1 = description.slice(1,2);
    const level2 = description.slice(2,3);
    const level3 = description.slice(3,4);
    const level4 = description.slice(4,5);
    const level5 = description.slice(5,6);

    app.get("/app/survivalcheck/exhaustion",function(req,res){
        
        const timeElapsed = Date.now();
        const today = new Date(timeElapsed);
        let email = req.app.get('email')
        const stmt1 = `INSERT INTO logs (email, message, time) VALUES ('${email}', 'enter exhaustion mode', '${today.toISOString()}');`;
        db.exec(stmt1)
        
        var level = Math.floor(Math.random() * 5) + 1;
        console.log(level)
        //1 - Disadvantage on ability checks
        if(level == 1){
            res.render('exhaustion',{level:level1})
        } 
        //2 - Speed halved
        if(level ==2){
            res.render('exhaustion',{level:level2})
        } 
        //Disadvantage on attack rolls and saving throws
        if(level ==3){
            res.render('exhaustion',{level:level3})
        }
        //4 - Hit point maximum halved
        if(level==4){
            res.render('exhaustion',{level:level4})
        }
        //5 - Speed reduced to 0
        if(level ==5){
            res.render('exhaustion',{level:level5})
        }
    })

    // if the player fails the survival check
    app.get("/app/survivalcheck/fail",function(req,res){
        const timeElapsed = Date.now();
        const today = new Date(timeElapsed);
        let email = req.app.get('email')
        const stmt1 = `INSERT INTO logs (email, message, time) VALUES ('${email}', 'failed survival check', '${today.toISOString()}');`;
        db.exec(stmt1)

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
    
        const timeElapsed = Date.now();
        const today = new Date(timeElapsed);
        let email = req.app.get('email')
        const stmt1 = `INSERT INTO logs (email, message, time) VALUES ('${email}', 'enter encounter 2', '${today.toISOString()}');`;
        db.exec(stmt1)
    
        res.sendFile(__dirname + "/html/battle.html");
    });

    //if the player choose to join the fight, here is the page
    //step1:determine surprise
    var win = "you lose";
    app.get("/app/E2/fight", function(req, res){  
        
        const timeElapsed = Date.now();
        const today = new Date(timeElapsed);
        let email = req.app.get('email')
        const stmt1 = `INSERT INTO logs (email, message, time) VALUES ('${email}', 'choose fight', '${today.toISOString()}');`;
        db.exec(stmt1)

        const playernum = roll(20,1,1).results[0];
        const wolfnum = roll(20,1,1).results[0];
        const choice = "Because you choose to join the fight, you have the chance to surprise the winter wolf. To determine whether you success, you need to roll a 20-side dice. If your number + dexterity is bigger than the number of wolf + wolf wisdom, you win!(p.s wolf wisdom is 12!!)"
        const surp = orderarray.slice(12,20);
        const stmt2 = db.prepare(`SELECT * FROM characters WHERE email = '${email}';`);
        var all = stmt2.get();
        var dex = all["dex"]
        
        if(playernum+dex>= wolfnum+12){
            wolflife -= 10;
            win = "you win! The wolf did not notice you, and you hit it with 10 points!";
            
            const stmt3 = `INSERT INTO logs (email, message, time) VALUES ('${email}', 'fight-win', '${today.toISOString()}');`;
            db.exec(stmt3)
        }else{
            win = "you lose, the wolf noticed you and you start to fight.";

            const stmt3 = `INSERT INTO logs (email, message, time) VALUES ('${email}', 'fight-lose', '${today.toISOString()}');`;
            db.exec(stmt3)
        }
        
        res.render("combat-surprise",{surp:surp,choice:choice,first:orderarray[0],second:combatrule1.toString(),third:orderarray[4],forth:combatrule2.toString(),playernum:playernum,wolfnum:wolfnum,win:win});
    });

        
        //if the player choose "try to hide", he is forced to join
    app.get("/app/E2/notyetfight", function(req, res){
        const timeElapsed = Date.now();
        const today = new Date(timeElapsed);
        let email = req.app.get('email')
        const stmt1 = `INSERT INTO logs (email, message, time) VALUES ('${email}', 'choose dodge', '${today.toISOString()}');`;
        db.exec(stmt1)

        res.sendFile(__dirname + "/html/precombat.html");
    });

    //step 2&3: roll initiative
    var initi = "You are second to take action!";
    app.post("/app/E2/fight", function(req,res){
        
        const timeElapsed = Date.now();
        const today = new Date(timeElapsed);
        let email = req.app.get('email')
        const stmt1 = `INSERT INTO logs (email, message, time) VALUES ('${email}', 'user take action', '${today.toISOString()}');`;
        db.exec(stmt1)

        
        const stepposition = orderarray.slice(7,8);
        const step2 = orderarray.slice(8,9);
        const playernum = roll(20,1,1).results[0];
        const wolfnum = roll(20,1,1).results[0];
        const initirule = orderarray.slice(20,28);
        if(playernum >= wolfnum){
            initi = "You are first to take action!";
        }else{
            initi = "You are second to take action!";
        }
        res.render("combat-initiative",{initirule:initirule,position:stepposition, initiative:step2,playernum:playernum,wolfnum:wolfnum,order:initi});
    });

    //step 4: start the turn and take actions
    const combataction = "https://www.dnd5eapi.co/api/rule-sections/actions-in-combat";
    const response2 = await fetch(combataction);
    const act = await response2.json();
    const acts = act.desc.split("\n");

    app.get("/app/E2/fight/turns",function(req,res){
        
        const timeElapsed = Date.now();
        const today = new Date(timeElapsed);
        let email = req.app.get('email')
        const stmt1 = `INSERT INTO logs (email, message, time) VALUES ('${email}', 'user fight turns', '${today.toISOString()}');`;
        db.exec(stmt1)
        
        const step4 = orderarray.slice(9,10);
        const head = acts.slice(0,1);
        const intro = acts.slice(1,5);
        const attack = acts.slice(6,11);
        const dodge = acts.slice(28,31);
        const hide = acts.slice(38,42);
        

        if(wolflife<=0){
            res.redirect("/app/ending");
        } else{
            res.render("combat-actions",{hide:hide,dodge:dodge,attack:attack,turns:step4,intro:intro,head:head});
        }
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
        
        const timeElapsed = Date.now();
        const today = new Date(timeElapsed);
        let email = req.app.get('email')
        const stmt1 = `INSERT INTO logs (email, message, time) VALUES ('${email}', 'choose attack', '${today.toISOString()}');`;
        db.exec(stmt1)

        
        const first = attackrule.slice(0,1);
        const sec = attackrule.slice(1,7);
        const attroll = attackrule.slice(10,14);
        const modi = attackrule.slice(14,18);
        
        attackroll = roll(20,1,1).results[0];

        if(attackroll+3 >= 13){
            
            const timeElapsed = Date.now();
            const today = new Date(timeElapsed);
            let email = req.app.get('email')
            const stmt2 = `INSERT INTO logs (email, message, time) VALUES ('${email}', 'attack - hit', '${today.toISOString()}');`;
            db.exec(stmt2)
            
            attackresult = "you hit!";
        } else{
            const timeElapsed = Date.now();
            const today = new Date(timeElapsed);
            let email = req.app.get('email')
            const stmt2 = `INSERT INTO logs (email, message, time) VALUES ('${email}', 'attack - miss', '${today.toISOString()}');`;
            db.exec(stmt2)

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
        let email = req.app.get('email')
        const stmt2 = db.prepare(`SELECT * FROM characters WHERE email = '${email}';`);
        var all = stmt2.get();
        var playerlife = all["hd"]
        if(wolfpossi >= 8){
            wolfharm = 6;
            playerlife -= 6;
            const stmt3 = `
            UPDATE characters SET hd = '${playerlife}' WHERE email = '${email}'
            `
            db.exec(stmt3);
        }
        const dama = damagerule.slice(12,17);

        if(attackresult==="you hit!"){
            var playernum = roll(15,1,1).results[0]+3;
            wolflife -= playernum;
            res.render("combat-actions-damage",{hd:playerlife,wolflife:wolflife,playernum:playernum,dama:dama,wolfharm:wolfharm});
        } else{
            res.render("combat-actions-miss",{hd:playerlife,wolfharm:wolfharm});
        }
    });

    //second:dodge
    app.get("/app/E2/fight/turns/dodge", function(req,res){
        
        const timeElapsed = Date.now();
        const today = new Date(timeElapsed);
        let email = req.app.get('email')
        const stmt1 = `INSERT INTO logs (email, message, time) VALUES ('${email}', 'dodge', '${today.toISOString()}');`;
        db.exec(stmt1)
        
        const stmt2 = db.prepare(`SELECT * FROM characters WHERE email = '${email}';`);
        var all = stmt2.get();
        var playerlife = all["hd"]
        const dodge = acts.slice(28,31);
        var wolfpossi = roll(10,1,1).results[0];
        var wolfharm = 0;
        if(wolfpossi >= 8){
            wolfharm = 3;
            playerlife -= wolfharm;
            const stmt3 = `
            UPDATE characters SET hd = '${playerlife}' WHERE email = '${email}'
            `
            db.exec(stmt3);
        }
        res.render("combat-actions-dodge",{hd:playerlife,dodge:dodge,wolfharm:wolfharm});
    });

    //third:hide
    app.get("/app/E2/fight/turns/hide", function(req,res){
        
        const timeElapsed = Date.now();
        const today = new Date(timeElapsed);
        let email = req.app.get('email')
        const stmt1 = `INSERT INTO logs (email, message, time) VALUES ('${email}', 'hide', '${today.toISOString()}');`;
        db.exec(stmt1)
        
        const hide = acts.slice(38,42);
        var hi_suc = roll(20,1,1).results[0]+3;
        var success = "";
        var wolfharm = 0;
        const stmt2 = db.prepare(`SELECT * FROM characters WHERE email = '${email}';`);
        var all = stmt2.get();
        var playerlife = all["hd"]

        if(hi_suc >= 10){
            success = "You hide successfully!"
        } else{
            success = "You are seen by the wolf."
            var wolfpossi = roll(10,1,1).results[0];
            var wolfharm = 0;
            if(wolfpossi >= 8){
                wolfharm = 6;
                playerlife -= wolfharm;
                const stmt3 = `
            UPDATE characters SET hd = '${playerlife}' WHERE email = '${email}'
            `
            db.exec(stmt3);
            }
        }
        res.render("combat-actions-hide",{hd:playerlife,hide:hide,playernum:hi_suc,success:success,wolfharm:wolfharm});
    });

    //ending
    app.get("/app/ending",function(req,res){
        
        const timeElapsed = Date.now();
        const today = new Date(timeElapsed);
        let email = req.app.get('email')
        const stmt1 = `INSERT INTO logs (email, message, time) VALUES ('${email}', 'end game', '${today.toISOString()}');`;
        db.exec(stmt1)
        
        const stmt2 = db.prepare(`SELECT * FROM characters WHERE email = '${email}';`);
        var all = stmt2.get();
        var playerlife = all["hd"]

        if(wolflife <= 0 && playerlife <=0){
            if(initi==="You are first to take action!"){
                res.sendFile(__dirname + "/html/ending-win.html");
            } else{
                res.sendFile(__dirname + "/html/ending-fail.html");
            }
        }
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