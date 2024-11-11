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

        let outcome;

        // Compare scores and determine the winner
        let playerScore = blackjack.player.userhand.getScore();
        let dealerScore = blackjack.dealer.getScore();
        
        if (playerScore > 21) {
            // Wallet stays decremented
            addMessage("You bust! Dealer wins.");
            console.log("Player busted. No winnings.");
            outcome = 'lost';
        } else if (dealerScore > 21 || playerScore > dealerScore) {
            addMessage("You win!");
            blackjack.player.userWallet.addValue(currentBet * 2); // Add winnings to wallet
            console.log(`Player wins! Wallet updated by $${currentBet * 2}`);
            outcome = 'won';
        } else if (playerScore < dealerScore) {
            // Wallet stays decremented
            addMessage("Dealer wins.");
            console.log("Dealer wins. No winnings.");
            outcome = 'lost';
        } else {
            addMessage("It's a tie!");
            blackjack.player.userWallet.addValue(currentBet); // Return the bet in case of tie
            console.log(`It's a tie. Bet of $${currentBet} returned to the wallet.`);
            outcome = 'push'; // tie
        }

        updateWalletDisplay();
        resetBetDisplay()
        updateBetDisplay();
        this.reportOutcome(outcome); // sends outcome of the round

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

    startRound: function() {
        blackjack.deal(); // Deal cards to player and dealer
        updateCardsLeftDisplay(); // Update card count display
        isGameInPlay = true; // Set game state to in play
        addMessage("Game started! Good luck!");
    },

    reportOutcome: function (outcome) {
        // Construct the GET request URL
        const url = `http://127.0.0.1:3000/?outcome=${outcome}`;
        
        // Send the GET request
        $.get(url, (response) => {
            // Handle the server's response
            if (response.status === 'Success') {
                // Gets the wins, losses, and pushes from the response
                const { wins, losses, pushes } = response.content;
                addMessage(`Total Wins: ${wins}, Total Losses: ${losses}, Total Pushes: ${pushes}`);
            } else {
                addMessage('Failed to report outcome.');
            }
        }).fail((jqXHR, textStatus, errorThrown) => {
            console.error('Error reporting outcome:', textStatus, errorThrown);
            addMessage('Failed to report outcome');
        });
    },
};

// Start a blackjack game
gamePlay.playGame();