/////////////////////////////////////////////////////////////////////////////////
//Author: Angel Montes
//Purpose: Controls the listeners of an MVC blackjack game
/////////////////////////////////////////////////////////////////////////////////
//listeners.js
// Assuming we have a variable to track the game state



// Add ready button listener
document.getElementById("readyButton").addEventListener("click", function() {
    if (!thisPlayerReady) {
        thisPlayerReady = true;
        this.disabled = true;
        this.textContent = "Ready!";
        window.socketHandler.emitReadyStatus();
    }
});

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

    if (!bothPlayersReady) {
        addMessage("Waiting for all players to be ready!");
        return;
    }
    
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
    if (isGameInPlay) {
        blackjack.hit()
    }
});


// Stay button event listener
document.getElementById("stayButton").addEventListener("click", function() {
    if (isGameInPlay) { // Check if it's the user's turn
        blackjack.stay();
    }
});
  
  