/////////////////////////////////////////////////////////////////////////////////
//Author: Nnamdi Nwanze
//Purpose: Controls the listeners of an MVC blackjack game
/////////////////////////////////////////////////////////////////////////////////
//listeners.js
// Assuming we have a variable to track the game state


// Reset button event listener
document.getElementById("resetButton").addEventListener("click", function() {
    gamePlay.resetGame(); // Function to reset the game
});

// Bet Increment button event listener
document.getElementById("incrementButton").addEventListener("click", function() {
    if (!isGameInPlay) {
        gamePlay.incrementBet(); // Function to increase the bet
    }
});

// Bet Decrement button event listener
document.getElementById("decrementButton").addEventListener("click", function() {
    if (!isGameInPlay) {
        gamePlay.decrementBet(); // Function to decrease the bet
    }
});

// Deal button event listener
document.getElementById("dealButton").addEventListener("click", function() {
    if (!isGameInPlay && currentBet >= 100) { // Ensure minimum bet is $100
        gamePlay.startRound(); // Function to start the game
        isGameInPlay = true; // Set game state to in play
    }
    else if (currentBet < 100) {
        addMessage("Minimum bet amount is $100."); // Display warning
    }
    else{
        addMessage("Game is still in play")
    }
});

// Hit button event listener
document.getElementById("hitButton").addEventListener("click", function() {
    if (isGameInPlay) { // Check if it's the user's turn
        blackjack.hit(); // Function to deal a card to the player
    }
});

// Stay button event listener
document.getElementById("stayButton").addEventListener("click", function() {
    if (isGameInPlay) { // Check if it's the user's turn
        blackjack.stay();
    }
});

// XHR button event listener
document.getElementById("xhr-button").addEventListener("click", function() {
    if (isGameInPlay) { // Check if it's the user's turn
        gamePlay.getMoveXHR(); // Call the method to get advice using XHR
    }
});

// jQuery button event listener
document.getElementById("jquery-button").addEventListener("click", function() {
    if (isGameInPlay) { // Check if it's the user's turn
        gamePlay.getMoveJQuery(); // Call the method to get advice using jQuery
    }
});

// Fetch API button event listener
document.getElementById("fetch-button").addEventListener("click", function() {
    if (isGameInPlay) { // Check if it's the user's turn
        gamePlay.getMoveFetch(); // Call the method to get advice using Fetch API
    }
});