# List of API Endpoints

Our API has interactions with another [api](https://www.dnd5eapi.co/docs/#overview--getting-started), which is the rule book of the Dnd.
And here is list of API endpoints we used in our project

## IMPORTANT
### Because Our simulator is character-bases, users need to go through the simulator from the beginnig to set up character data to continue. This means you will run into error if you go to the future part (Encounter 1 and 2) without setting up your character first!

## Login and character set up





## Story background and Encounter 1






## Encounter 2 and ending
### /app/E2
This is the begninning of the Ecounter2: battle section. This apu introduces the story background of this battle and give you two buttons to select your decisions. If you choose  `Try to hide`, you will go to `/app/E2/notyetfight`; if you choose `Help Alvan`, you will go to `/app/E2/fight`.

### /app/E2/notyetfight
This page tells player that he/she is noticed by the wolf and forced to joint the fight. The button takes player to `/app/E2/fight`

### /app/E2/fight
This end point has a app.get page and a app.post page. The app.get page introduces the firt step of combat which is `determine surprise`. The button `Roll your dice` allows the user to see the result, and the button `next` directs user to the app.post page. (The `join the fight` button in `/app/E2/notyetfight` also takes user to the app.post page.
The app.post page is the second and the third steps of combat. After rolling the dice, the `next` button takes player to the next step, which is `/app/E2/fight/turns`.

### /app/E2/fight/turns
This page is where the combat actually starts. There are 3 buttons represents 3 types of actions a player can choose during the combat. After each action, user will come back to this endpoint until the wolf is dead. The user can also hit the `End the game` button to end this simulator early.
The first action is `ATTACK`. This button takes user to `/app/E2/fight/turns/attack`.
The second action is `DODGE`. This button takes user to `/app/E2/fight/turns/dodge`.
The third action is `HIDE`. This button takes user to `/app/E2/fight/turns/hide`.

### /app/E2/fight/turns/attack
This page introduces the rule of making an attack and allows the user to roll a dice to determine whether the attack is successful. 
If the attack is successful, the `Next` button takes user to "combat-actions-miss.ejs" , which is a page tells user the attack fails. The user can hit the `next` button to the `/app/E2/fight/turns` to start another turn.
If the attack is successful, the `Next` button takes user to "combat-actions-damage.ejs", which is a page allowing user to roll another dice to determine how much the wolf is hurt. The user can hit the `next` button to the `/app/E2/fight/turns` to start another turn.

### /app/E2/fight/turns/dodge
This page introduces the rule of dodging, and the user can roll the dice to determine whether the dodge is successful. The user can hit the `next` button to the `/app/E2/fight/turns` to start another turn.

### /app/E2/fight/turns/hide
This page introduces the rule of hiding, and the user can roll the dice to determine whether the hide is successful. The user can hit the `next` button to the `/app/E2/fight/turns` to start another turn.

### /app/ending
This page is the ending of the simulator. If the wolf is dead, the user will be directed to the page of "/html/ending-win.html". Otherwise, the user will be directed to the page of "/html/ending-fail.html". These pages tell the user the result, and the simulator officially ends in these pages. If the user want to start again, he/she can go back to `/app` to start over.