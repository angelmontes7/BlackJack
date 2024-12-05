/////////////////////////////////////////////////////////////////////////////////
// Author: Angel Montes
// Purpose: Sets up the Models of an MVC blackjack game
/////////////////////////////////////////////////////////////////////////////////
// models.js

// Setup variables for global use
let isGameInPlay = false; // Initially, the game is not in play (links to listeners)
let currentBet = 0; // Initialize the current bet amount (links to listeners)

// Object defining a player's hand
var hand = {
    cards: [],  // Array to hold the cards in the hand
    score: 0,   // The total score of the hand
    aces: 0,    // Count of aces in hand

    // Method to add a card to the hand
    addCard: function (card) {
        this.cards.push(card);  // Add the card to the cards array
        this.setScore(card.getCardNumber());  // Update the score with the card's value
        if (card.getRank() === 1) {
            this.aces++;  // Track the number of aces in the hand
        }
        // Adjust score if the hand has an Ace and the score exceeds 21
        while (this.score > 21 && this.aces > 0) {
            this.score -= 10;  // Convert an Ace from 11 to 1
            this.aces--;
        }
    },

    // Method to set the score based on the value added
    setScore: function (value) {
        this.score += value;  // Add the value of the card to the score
    },

    // Method to get the current score
    getScore: function () {
        return this.score;  // Return the current score
    },

    // Method to reset the hand
    reset: function () {
        this.cards = [];  // Clear the cards array
        this.score = 0;   // Reset the score to zero
        this.aces = 0;    // Reset ace count
    }
};

// Accounting model object for a player
var wallet = {
    value: 0,  // Stores the value of the wallet

    // Sets the value of the wallet
    setValue: function (amount) {
        this.value = amount;
        console.log(`Wallet set to: $${this.value}`);  // Log the wallet's new value
    },

    // Gets the current value of the wallet
    getValue: function () {
        return this.value;
    },

    // Adds the specified amount to the wallet
    addValue: function (amount) {
        this.value += amount;
        console.log(`Added $${amount} to wallet. New wallet value: $${this.value}`);  // Log the wallet's update
    },

    // Decreases the wallet value by the specified amount
    decrementValue: function (amount) {
        if (this.value >= amount) {
            this.value -= amount;
            console.log(`Decremented $${amount} from wallet. New wallet value: $${this.value}`);  // Log the wallet's update
        } else {
            console.error("Not enough funds in the wallet!");
        }
    }
};

// Model for defining a player in the game
var user = {
    userhand: Object.create(hand),    // Uses a hand object to hold the player's cards
    userBet: 0,                       // Amount the user is betting in the current round
    userWallet: Object.create(wallet),  // Uses a wallet object to hold the user's purse                     // Property to hold username

    // Sets the user's bet value
    setUserBet: function (amount) {
        if (amount > this.userWallet.getValue()) {
            console.error("Insufficient funds to place this bet.");
        } else {
            this.userBet = amount;
            this.userWallet.decrementValue(amount);  // Deduct bet from wallet
        }
    },

    // Initializes the user's wallet with $1,000
    initialize: function () {
        this.userWallet.setValue(1000);
    }
};

// Blackjack game model
var blackjack = {
    dealer: Object.create(hand),         // Dealer's hand object
    player: Object.create(user),         // Player object representing the user
    dealersHitLimit: 16,                 // Dealer must hit if their score is below 16
    currentMove: '',

    // Initializes a blackjack game (creates a deck, shuffles it, and initializes player's wallet)
    initialize: function () {
        this.player.initialize();        // Initialize the player with $1,000 in wallet
        console.log("Blackjack game initialized.");
    },

    // Deals a hand in a blackjack game
    deal: function () {
        resetView();
        if (currentBet > blackjack.player.userWallet.getValue()) {
            addMessage("Not enough funds to place this bet.");
            return;
        }
    
        // Emit deal request to server and deduct bet
        socket.emit('dealRequest', {
            playerNumber: playerNumber,
            betAmount: currentBet
        });
    
        // Deduct bet and update display
        blackjack.setBet(currentBet);
        updateWalletDisplay();
    },

    // Deals a card to the player as long as their score is under 21
    hit: function () {
        if (!this.didPlayerBust() && !this.didPlayerGetTwentyOne()) {
            this.currentMove = 'hit';
            
            // Request a new card from the server
            window.socketHandler.emitHitRequest();

            // Send the move to both the WebSocket and server
            window.socketHandler.emitPlayerAction('hit', {
                action: 'hit',
                move: this.currentMove,
                playerNumber: playerNumber
            });

        }

        if (this.didPlayerBust()) {
            window.socketHandler.sendMoveToServer(playerNumber, this.currentMove);
            this.checkBothPlayersFinished();
            revealDealerFaceDownCard();
            isGameInPlay = false;
            gamePlay.isGameOver();
        } else if (this.didPlayerGetTwentyOne()) {
            window.socketHandler.sendMoveToServer(playerNumber, this.currentMove);
            console.log("Player has 21!");
            addMessage("You Win. You got 21. Automatic Win!");
            this.checkBothPlayersFinished();
            revealDealerFaceDownCard();
            isGameInPlay = false;
            gamePlay.isGameOver();
        }
    },

    stay: function() {
        this.currentMove = 'stay' // track the current move
        this.player.userhand.isTurnEnded = true; // End player's turn

        window.socketHandler.emitPlayerAction('stay', {
            action: 'stay',
            move: this.currentMove,
            playerNumber: playerNumber
        });

        window.socketHandler.sendMoveToServer(playerNumber, this.currentMove);


        addMessage("Your turn has ended. Waiting for other player to finish their turn...")

        isGameInPlay = false;
    },

    // Sets the bet amount before the round starts
    setBet: function (amount) {
        this.player.setUserBet(amount);
    },

    // Checks if the player's score exceeds 21 (used in listeners)
    didPlayerBust: function () {
        return this.player.userhand.getScore() > 21;
    },

    // Checks if the player's score is exactly 21 (helper function)
    didPlayerGetTwentyOne: function () {
        return this.player.userhand.getScore() === 21;
    },

    checkBothPlayersFinished: function() {
        if (this.player.userhand.isTurnEnded) {
            bothPlayersFinished = true;
            revealDealerFaceDownCard();
        }
    },

};