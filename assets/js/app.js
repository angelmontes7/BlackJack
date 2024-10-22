/////////////////////////////////////////////////////////////////////////////////
// Author: Nnamdi Nwanze
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
        const username = this.getUsername();
        this.Blackjack.player.username = username; // Set the username in the player object
        document.getElementById('usernameDisplay').textContent = `Player: ${username}`;
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

    getMoveXHR: function() {
        // Creates instance to interact with the server
        const xhr = new XMLHttpRequest();

        // Gets the scores of player and dealer
        const userScore = blackjack.player.userhand.getScore();
        const dealerScore = blackjack.dealer.getScore();

        // Inputs the scores of both into the url to send to the server
        const url = `https://convers-e.com/blackjackadvice.php?userscore=${userScore}&dealerscore=${dealerScore}`;

        // Initializes a new asynchronous HTTP GET request to the specified URL
        xhr.open("GET", url, true);

        // Store reference to the current context
        const self = this;
        
        // waits for response once received readystate changes and executes code
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) { // Check the request state (4 = Completed)
                if (xhr.status === 200) { // Checks the HTTP status code (200 = success)
                    const response = JSON.parse(xhr.responseText); // Uses the JSON format and parses it into a JavaScript object
                    console.log("Full XHR response:", response); // Log full response for debugging
                    addMessage(`Advice (XHR): ${response.content.Advice}`); // Adds message to div based on server output
    
                    // Passes the advice from the response triggering the games logic
                    self.Blackjack.getRemoteAdvice(response.content.Advice);
                } else {
                    addMessage("An error occurred. Please try again.");
                }
            }
        };
        // Sends request to server
        xhr.send();
    },
    
    getMoveJQuery: function() {
        // Gets the scores of player and dealer
        const userScore = blackjack.player.userhand.getScore();
        const dealerScore = blackjack.dealer.getScore();

        // Inputs the scores of both into the url to send to the server
        const url = `https://convers-e.com/blackjackadvice.php?userscore=${userScore}&dealerscore=${dealerScore}`;
        
        // Makes a GET request to the specified "url" the response parameter contains the servers response
        $.get(url, function(response) {
            console.log("Full jQuery response:", response); // Log full response for Debugging
            
            // Access the advice from the server (advice is embedded in the content)
            const advice = response.content.Advice;
            
            // Checks if advice was successfully retrieved 
            if (advice) {
                addMessage(`Advice (jQuery): ${advice}`); // Adds message to div based on server output
                gamePlay.Blackjack.getRemoteAdvice(advice); // Execute the move based on the advice
            } else {
                addMessage("Advice not found in the response.");
                console.error("Advice is missing or response format is different:", response);
            }
        }).fail(function() { // Callback that is executed if the GET request fails for any reason
            addMessage("An error occurred. Please try again.");
        });
    },
    
    getMoveFetch: function() {
        // Gets the scores of player and dealer
        const userScore = blackjack.player.userhand.getScore(); 
        const dealerScore = blackjack.dealer.getScore();   
        
        // Inputs the scores of both into the url to send to the server
        const url = `https://convers-e.com/blackjackadvice.php?userscore=${userScore}&dealerscore=${dealerScore}`;
        
        // Makes HTTP request
        fetch(url)
            .then(response => {
                // Checks if the response was successful
                if (!response.ok) {
                    throw new Error(`Network response was not ok, status: ${response.status}`);
                }
                console.log("Full Fetch response:", response); // Log full response for Debugging

                // Converts and returns the JSON string into JavaScript Object
                return response.json();
            })

            // Handles the data returned by the " return response.json();"
            .then(data => {
                const advice = data.content.Advice; // Gets the advice that was extracted from the server
                addMessage(`Advice (Fetch): ${advice}`); // Adds message to div based on server output
                gamePlay.Blackjack.getRemoteAdvice(advice); // Execute the move based on the advice
            })
            // Handles the errors
            .catch(error => {
                addMessage("An error occurred. Please try again.");
                console.error("Fetch Error:", error);
            });
    },

    // Helper functions below

    startRound: function() {
        blackjack.deal(); // Deal cards to player and dealer
        updateCardsLeftDisplay(); // Update card count display
        isGameInPlay = true; // Set game state to in play
        addMessage("Game started! Good luck!");
    },

    incrementBet: function() {
        if (!isGameInPlay && currentBet + 10 <= this.Blackjack.player.userWallet.getValue()) {
            currentBet += 10;
            updateBetDisplay(currentBet); // Update bet display
        } else {
            addMessage("Cannot exceed wallet amount.");
        }
    },

    decrementBet: function() {
        if (!isGameInPlay && currentBet - 10 >= 100) { // Minimum bet is $100
            currentBet -= 10;
            updateBetDisplay(currentBet); // Update bet display
        } else {
            addMessage("Minimum bet is $100.");
        }
    },
    
};

// Start a blackjack game
gamePlay.playGame();