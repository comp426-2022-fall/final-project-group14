
    var button_name = "button1";
    var button = document.getElementById(button_name);
    button.onclick = function() {

    // 3 dice results
    var dice1 = Math.floor(Math.random() * 6) + 1
    var dice2 = Math.floor(Math.random() * 6) + 1
    var dice3 = Math.floor(Math.random() * 6) + 1
    var total = dice1 + dice2 + dice3

    // update dice image
    var randomDiceImage1 = "dice" + dice1 + ".png";
    var randomDiceImage2 = "dice" + dice2 + ".png";
    var randomDiceImage3 = "dice" + dice3 + ".png";
    var randomImageSource1 = "images/" + randomDiceImage1;
    var randomImageSource2 = "images/" + randomDiceImage2;
    var randomImageSource3 = "images/" + randomDiceImage3;

    var image_class = "img1"
    var image1 = document.querySelectorAll(image_class)[0];
    var image2 = document.querySelectorAll(image_class)[1];
    var image3 = document.querySelectorAll(image_class)[2];

    image1.setAttribute("src", randomImageSource1);
    image2.setAttribute("src", randomImageSource2);
    image3.setAttribute("src", randomImageSource3);

    var ability_name = "ability1"
    var placeholder = document.getElementById(ability_name);
    placeholder.innerHTML = total;
    }