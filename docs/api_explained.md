# List of API Endpoints

Our API has interactions with another [api](https://www.dnd5eapi.co/docs/#overview--getting-started), which is the rule book of the Dnd.
Below is the list of API endpoints we used in our project.

## IMPORTANT
### Because Our simulator is character-based, users need to go through the simulator from the beginning to set up character data to continue. This means you will run into an error if you go to the future part (Encounter 1 and 2) without setting up your character first!

## Login and character set up
### /app/
This is the beginning of our project. It leads the user to the log-in page. Users have to enter their emails and passwords before they enter the game, so that their settings about their characters can be saved.

### /app/name/
This page lets the user name their character. If you click `Name!`, you will go to the next step `/app/choose-race/`.

### /app/choose-race/
This is the first step to set up a character. This API describes four races, including elf, dwarf, halfling, and human. For example, if the user chooses elf, the `/app/elf/` updates the character table with race elf and redirects to `/app/class/`.

### /app/class/
This page is similar to `/app/choose-race/`. It gives the user four classes to choose from for their character. After the user decides on a class, it leads to `/app/ability/`.

### /app/ability/
This page introduces the rule of determining the score of each ability. The button `Start rolling` leads the user to roll a dice for Strength, Dexterity, Constitution, Intelligence, Wisdom, and Charisma. Every ability has its own page. On each page, the button `Roll your dice` allows the user to see the result of their dices, and the button `next` directs the user to the page of the next ability. The last endpoint for these abilities is `/app/ability/str/dex/con/int/wis/cha/`.

### /app/character-summary/
This page summarizes all the information about the character the user has just created. On this page, in addition to clicking `Start my journey` to enter the game session, the user can also choose to delete the account(`/app/delete_account/`)or re-select abilities(`/app/ability/`). 


## Story background and Encounter 1
### /app/background/
This is the beginning of Encounter 1. This API introduces the background story of the game, so that this simulator can be more immersive. After clicking the button at the bottom of the page, you will go to `/app/conversation/` and start a conversation with two characters in the story.

### /app/conversation/
This page provides the user with two options to make. If you click the `reject` button, you will go to `/app/reject/`. Otherwise, you will go to `/app/accept/`.

### /app/reject/
This API tells you that you have to make the choice again if you want to enter further games. When you click the `make the choice again` button, you will go back to `/app/conversation/`.

### /app/accept/
This page continues the story. The button takes the user to `/app/survivalcheck/`.

### /app/survivalcheck/
This page introduces the definition of survival check and its result -- exhaustion mode. After clicking the button `Roll your dice`, the results of ten dices appear on the screen. The button `next` directs the user to different pages, since the result of the survival check leads to `/app/survivalcheck/checkresult/`, which redirect to different modes such as exaustion(`/app/survivalcheck/exhaustion`), failure(`/app/survivalcheck/fail`), and E2(`/app/E2`).

### /app/survivalcheck/exhaustion
This page takes the user to "exhaustion.ejs", which that the character enters exhaustion mode. It also shows the level of exhaustion. After clicking the button `Enter the battle`, the user can also go to `/app/E2` and begin Encounter2.

### /app/survivalcheck/fail
This page tells the user that the character doesn't survive the cold damage. The button `let's try again` directs to `/app/survivalcheck/`.

## Encounter 2 and ending
### /app/E2
This is the beginning of the Ecounter2: battle section. This API introduces the story background of this battle and gives you two buttons to select your decisions. If you choose `Try to hide`, you will go to `/app/E2/notyetfight`; if you choose `Help Alvan`, you will go to `/app/E2/fight`.

### /app/E2/notyetfight
This page tells the user that he/she is noticed by the wolf and forced to join the fight. The button takes the user to `/app/E2/fight`.

### /app/E2/fight
This endpoint has an app.get page and an app.post page. The app.get page introduces the first step of combat which is `determine surprise`. The button `Roll your dice` allows the user to see the result, and the button `next` directs the user to the app.post page. (The `join the fight` button in `/app/E2/notyetfight` also takes the user to the app.post page.)
The app.post page is the second and the third steps of combat. After rolling the dice, the `next` button takes the user to the next step, which is `/app/E2/fight/turns`.

### /app/E2/fight/turns
This page is where the combat actually starts. There are 3 buttons that represent 3 types of actions a user can choose during combat. After each action, the user will come back to this endpoint until the wolf is dead. The user can also hit the `End the game` button to end this simulator early.
The first action is `ATTACK`. This button takes the user to `/app/E2/fight/turns/attack`.
The second action is `DODGE`. This button takes the user to `/app/E2/fight/turns/dodge`.
The third action is `HIDE`. This button takes the user to `/app/E2/fight/turns/hide`.

### /app/E2/fight/turns
This page is where the combat actually starts. There are 3 buttons that represent 3 types of actions a user can choose during combat. After each action, the user will come back to this endpoint until the wolf is dead. The user can also hit the `End the game` button to end this simulator early.
The first action is `ATTACK`. This button takes the user to `/app/E2/fight/turns/attack`.
The second action is `DODGE`. This button takes the user to `/app/E2/fight/turns/dodge`.
The third action is `HIDE`. This button takes the user to `/app/E2/fight/turns/hide`.

### /app/E2/fight/turns/attack
This page introduces the rule of making an attack and allows the user to roll a dice to determine whether the attack is successful. 
If the attack is successful, the `Next` button takes the user to "combat-actions-miss.ejs" , which is a page that tells the user the attack fails. The user can hit the `next` button to the `/app/E2/fight/turns` to start another turn.
If the attack is successful, the `Next` button takes the user to "combat-actions-damage.ejs", which is a page allowing the user to roll another dice to determine how much the wolf is hurt. The user can hit the `next` button to the `/app/E2/fight/turns` to start another turn.

### /app/E2/fight/turns/dodge
This page introduces the rule of dodging, and the user can roll the dice to determine whether the dodge is successful. The user can hit the `next` button to the `/app/E2/fight/turns` to start another turn.

### /app/E2/fight/turns/hide
This page introduces the rule of hiding, and the user can roll the dice to determine whether the hide is successful. The user can hit the `next` button to the `/app/E2/fight/turns` to start another turn.

### /app/ending
This page is the ending of the simulator. If the wolf is dead, the user will be directed to the page "/html/ending-win.html". Otherwise, the user will be directed to the page "/html/ending-fail.html". These pages tell the user the result, and the simulator officially ends on these pages. If the user wants to start again, he/she can go back to `/app` to start over.