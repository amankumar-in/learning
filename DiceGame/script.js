// // function for a dice game where 2 dices are thrown and the dice with higher result wins
// // the function should return the result of the game
// function diceGame() {
//   // generate random number between 1 and 6 for the first dice
//   const dice1 = Math.floor(Math.random() * 6) + 1;
//   // update the dice image for player 1
//   document.getElementById("player1").src = `assets/dice${dice1}.png`;

//   // generate random number between 1 and 6 for the second dice
//   const dice2 = Math.floor(Math.random() * 6) + 1;
//   // update the dice image for player 2
//   document.getElementById("player2").src = `assets/dice${dice2}.png`;
//   // check if the first dice has a higher result than the second dice
//   if (dice1 > dice2) {
//     return `Player 1 Wins with ${dice1}`;
//   } else if (dice1 < dice2) {
//     return `Player 2 wins with ${dice2}`;
//   } else {
//     return `It's a tie`;
//   }
// }

// add an event listener to the button to call the diceGame function when clicked
document
  .getElementById("rollDiceButton")
  .addEventListener("click", function () {
    document.getElementById("result").innerText = diceGame();
  });

// show or hide flag1 or flag2 based on who wins
function showFlags(winner) {
  if (winner === "Player 1") {
    document.getElementById("flag1").style.display = "block";
    document.getElementById("flag2").style.display = "none";
  } else if (winner === "Player 2") {
    document.getElementById("flag1").style.display = "none";
    document.getElementById("flag2").style.display = "block";
  } else {
    document.getElementById("flag1").style.display = "none";
    document.getElementById("flag2").style.display = "none";
  }
}

// modify the diceGame function to show flags based on the result
function diceGame() {
  const dice1 = Math.floor(Math.random() * 6) + 1;
  document.getElementById("player1").src = `assets/dice${dice1}.png`;

  const dice2 = Math.floor(Math.random() * 6) + 1;
  document.getElementById("player2").src = `assets/dice${dice2}.png`;

  let result;
  if (dice1 > dice2) {
    result = `Player 1 Wins with ${dice1}`;
    showFlags("Player 1");
  } else if (dice1 < dice2) {
    result = `Player 2 wins with ${dice2}`;
    showFlags("Player 2");
  } else {
    result = `It's a tie`;
    showFlags("Tie");
  }
  return result;
}


