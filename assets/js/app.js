/////////////////////////////////////////////////////////////////////////////////
// Author: Angel Montes
// Purpose: Create a blackjack game using objects and an MVC design
/////////////////////////////////////////////////////////////////////////////////

var gamePlay = {
    // Blackjack object initialized
    Blackjack: Object.create(blackjack),

    // Gets the username from the URL parameters
    getUsername: function() {
        const urlParams = new URLSearchParams(window.location.search); // Get URL parameters
        return urlParams.get('username'); // Return the username
    },

    // Method to start the game
    playGame: function() {
        const username = displayUsername()
        this.Blackjack.initialize(); // Initialize the game with wallet setup
        
        console.log("Starting game for:", username); // Debugging
        
        addMessage(`Welcome, ${username}! Get ready to play Blackjack!`)
    }, 

    // Method to check if the game is over
    isGameOver: function() {
        // Compare scores and determine the winner
        let playerScore = blackjack.player.userhand.getScore();
        let dealerScore = blackjack.dealer.getScore();
        
        if (playerScore > 21) {
            addMessage("You bust! Dealer wins.");
            console.log("Player busted. No winnings.");
            // Wallet stays decremented
        } else if (dealerScore > 21 || playerScore > dealerScore) {
            addMessage("You win!");
            blackjack.player.userWallet.addValue(currentBet * 2); // Add winnings to wallet
            console.log(`Player wins! Wallet updated by $${currentBet * 2}`);
        } else if (playerScore < dealerScore) {
            addMessage("Dealer wins.");
            console.log("Dealer wins. No winnings.");
            // Wallet stays decremented
        } else {
            addMessage("It's a tie!");
            blackjack.player.userWallet.addValue(currentBet); // Return the bet in case of tie
            console.log(`It's a tie. Bet of $${currentBet} returned to the wallet.`);
        }

        updateWalletDisplay();
        resetBetDisplay()
        updateBetDisplay();

        // Check if the player is out of money
        if (blackjack.player.userWallet.getValue() <= 0) {
            addMessage("You are out of money! Please reset the game to play again.");
            return;
        }
    },

    // Method to reset the game board and start a new game

    resetGame: function() {
        // Reset player and dealer hands
        blackjack.dealer.reset();
        blackjack.player.userhand.reset();
        blackjack.carddeck.initialize();
        blackjack.carddeck.shuffle();
        blackjack.player.userWallet.setValue(1000);

        resetBetDisplay();
        updateWalletDisplay();
        updateCardsLeftDisplay();

        isGameInPlay = false; // Reset game state

        clearMessages(); // Clear messages
        resetView(); // Reset UI


    },

    // Helper functions below

    startRound: function() {
        blackjack.deal(); // Deal cards to player and dealer
        updateCardsLeftDisplay(); // Update card count display
        isGameInPlay = true; // Set game state to in play
        addMessage("Game started! Good luck!");
    },
    
};

// Start a blackjack game
gamePlay.playGame();