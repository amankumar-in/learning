// // Apply class pressed and remove it after 1 second when clicked using jQuery
// $(".tile").click(function () {
//   $(this).toggleClass("pressed");
//   setTimeout(() => {
//     $(this).toggleClass("pressed");
//   }, 100);
// });

// // Play different sound when different tile is clicked
// $(".tile").click(function () {
//   let audio = new Audio(`sounds/${$(this).attr("id")}.mp3`);
//   audio.play();
// });

// // Press a random tile and play related sound when any key is pressed
// $(document).keypress(function () {
//   // The eq() method returns an element with a specific index number of the selected elements.
//   let randomTile = $(".tile").eq(Math.floor(Math.random() * 4));
//   console.log(randomTile);
//   randomTile.addClass("pressed");
//   setTimeout(() => {
//     randomTile.removeClass("pressed");
//   }, 100);
//   let audio = new Audio(`sounds/${randomTile.attr("id")}.mp3`);
//   audio.play();
// });

// now user is supposed to click the tile that was pressed otherwise "wrong" sound will play and game will be over. If the correct tile is clicked, the game will continue and a new tile will be pressed automatically and related sound will play. User will have to click the tiles in the same order as they were pressed. If user clicks the wrong tile, the game will be over and "wrong" sound will play. This same process will continue until the user makes a mistake.

let gamePattern = [];
let userClickedPattern = [];
let started = false;
let level = 0;

// Start the game on keypress
$(document).keypress(function () {
  if (!started) {
    $("#level-title").text("Level " + level);
    nextSequence();
    started = true;
  }
});

// Handle tile clicks
$(".tile").click(function () {
  let userChosenTile = $(this).attr("id");
  userClickedPattern.push(userChosenTile);

  playSound(userChosenTile);
  animatePress(userChosenTile);

  checkAnswer(userClickedPattern.length - 1);
});

function checkAnswer(currentLevel) {
  if (gamePattern[currentLevel] === userClickedPattern[currentLevel]) {
    if (userClickedPattern.length === gamePattern.length) {
      setTimeout(function () {
        nextSequence();
      }, 1000);
    }
  } else {
    playSound("wrong");
    $("body").addClass("game-over");
    $("#level-title").text("Game Over, Press Any Key to Restart");

    setTimeout(function () {
      $("body").removeClass("game-over");
    }, 200);

    startOver();
  }
}

function nextSequence() {
  userClickedPattern = [];
  level++;
  $("#level-title").text("Level " + level);

  let randomNumber = Math.floor(Math.random() * 4);
  let randomChosenTile = $(".tile").eq(randomNumber).attr("id");
  gamePattern.push(randomChosenTile);

  $("#" + randomChosenTile).addClass("pressed");
  setTimeout(() => {
    $("#" + randomChosenTile).removeClass("pressed");
  }, 100);

  playSound(randomChosenTile);
}

function playSound(name) {
  let audio = new Audio("sounds/" + name + ".mp3");
  audio.play();
}

function animatePress(currentTile) {
  $("#" + currentTile).addClass("pressed");
  setTimeout(function () {
    $("#" + currentTile).removeClass("pressed");
  }, 100);
}

function startOver() {
  level = 0;
  gamePattern = [];
  started = false;
}

