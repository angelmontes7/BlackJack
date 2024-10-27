/////////////////////////////////////////////////////////////////////////////////
//Author: Angel Montes
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
    if (isGameInPlay) {
        addMessage("Game is in play. You can't adjust the bet right now.");
    } else if (currentBet + 10 <= blackjack.player.userWallet.getValue()) {
        currentBet += 10;
        updateBetDisplay(currentBet); // Update bet display
    } else {
        addMessage("Cannot exceed wallet amount.");
    }
});


// Bet Decrement button event listener
document.getElementById("decrementButton").addEventListener("click", function() {
    if (isGameInPlay) {
        addMessage("Game is in play. You can't adjust the bet right now."); 
    }else if (!isGameInPlay && currentBet - 10 >= 100) { // Minimum bet is $100
        currentBet -= 10;
        updateBetDisplay(currentBet); // Update bet display
    } else {
        addMessage("Minimum bet is $100.");
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

// Listeners using jQuery selectors for the AJAX buttons
$(document).ready(function() {
    // Event listener for XHR request
    $("#xhr-button").on("click", function() {
        if (isGameInPlay) {  // Only allow if the game is in play
            blackjack.getMoveXHR();
        } else {
            addMessage("You can't request advice until the game is in play.");
        }
    });

    // Event listener for jQuery request
    $("#jquery-button").on("click", function() {
        if (isGameInPlay) {  // Only allow if the game is in play
            blackjack.getMoveJQuery();
        } else {
            addMessage("You can't request advice until the game is in play.");
        }
    });

    // Event listener for Fetch request
    $("#fetch-button").on("click", function() {
        if (isGameInPlay) {  // Only allow if the game is in play
            blackjack.getMoveFetch();
        } else {
            addMessage("You can't request advice until the game is in play.");
        }
    });
});
