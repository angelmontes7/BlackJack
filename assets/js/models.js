/////////////////////////////////////////////////////////////////////////////////
// Author: Angel Montes
// Purpose: Sets up the Models of an MVC blackjack game
/////////////////////////////////////////////////////////////////////////////////
// models.js
// Setup variables for global use
const suits = ["H", "S", "C", "D"];  // Allowable suits
const maxCardsPerSuit = 13;          // Max cards per suit
let isGameInPlay = false; // Initially, the game is not in play (links to listeners)
let currentBet = 0; // Initialize the current bet amount (links to listeners)
// Card object defining setters and getters
var card = {
    suit: "",  // Property to hold the card's suit
    rank: 0,   // Property to hold the card's rank

    // Sets the rank of the card
    setRank: function (value) {
        if (value >= 1 && value <= maxCardsPerSuit) {
            this.rank = value;
        } else {
            throw new Error("Rank must be between 1 and " + maxCardsPerSuit + ".");
        }
    },

    // Gets the rank of the card
    getRank: function () {
        return this.rank;
    },

    // Sets the suit of the card
    setSuit: function (value) {
        if (suits.includes(value)) {
            this.suit = value;
        } else {
            throw new Error("Invalid suit. Must be one of: " + suits.join(", ") + ".");
        }
    },

    // Gets the suit of the card
    getSuit: function () {
        return this.suit;
    },

    // Helper function 
    createCard: function (suit, rank) {
        var newCard = Object.create(card);  // Create a new card object
        newCard.setSuit(suit);
        newCard.setRank(rank);
        return newCard;
    },

    // Helper function. Method to get the value of the card (Ace can be 1 or 11)
    getCardNumber: function () {
        if (this.rank === 1) {
            // Ace can be 1 or 11. Returning 11 by default (game logic will adjust if needed)
            return 11;
        } else if (this.rank > 10) {
            return 10;  // Face cards (J, Q, K) are valued at 10
        }
        return this.rank;  // Return the rank for cards 2-10
    }
};

// Object to define a card deck
var card_deck = {
    deck: [],
    cardsLeft: 0,
    standardDeckSize: 52,

    // Creates a standard 52-card deck
    initialize: function () {
        this.deck = [];  // Reset the deck
        for (let suit of suits) {
            for (let rank = 1; rank <= maxCardsPerSuit; rank++) {
                let newCard = card.createCard(suit, rank);  // Use createCard method
                this.deck.push(newCard);
            }
        }
        this.cardsLeft = this.standardDeckSize;  // Set cards left to 52
    },

    // Fisher-Yates algorithm
    shuffle: function () {
        for (let i = this.deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];  // Swap cards
        }
    },

    // Draw a card from the deck
    dealCard: function () {
        if (this.cardsLeft < 16) {
            // Show the shuffling modal
            document.getElementById("shufflingModal").style.display = "block";

            // Delay for 3 seconds before shuffling the deck
            setTimeout(() => {
                // Shuffle the deck
                this.initialize();  // Reinitialize the deck to 52 cards
                this.shuffle();  // Shuffle the newly reset deck
                updateCardsLeftDisplay();  // Update the display to reflect 52 cards left
                console.log("Deck shuffled");

                // Hide the modal
                document.getElementById("shufflingModal").style.display = "none";
    
            }, 3000); // 3000 milliseconds = 3 seconds
            
        }
        const dealtCard = this.deck.pop();  // Remove and return the top card
        this.cardsLeft--;
        return dealtCard;  // Return the dealt card
    }
};

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
    carddeck: Object.create(card_deck),  // Card deck object for the game
    dealer: Object.create(hand),         // Dealer's hand object
    player: Object.create(user),         // Player object representing the user
    dealersHitLimit: 16,                 // Dealer must hit if their score is below 16

    // Initializes a blackjack game (creates a deck, shuffles it, and initializes player's wallet)
    initialize: function () {
        this.carddeck.initialize();      // Initialize the deck
        this.carddeck.shuffle();         // Shuffle the deck
        this.player.initialize();        // Initialize the player with $1,000 in wallet
        console.log("Blackjack game initialized.");
    },

    // Deals a hand in a blackjack game
    deal: function () {
        resetView();
        if (currentBet > blackjack.player.userWallet.getValue()) {
            addMessage("Not enough funds to place this bet.");
            return; // Prevent dealing if the bet is too high
        }
    
        // Deduct the bet amount from the player's wallet
        blackjack.setBet(currentBet);
        updateWalletDisplay(); // Update the wallet display after betting

        // Reset both player and dealer hands
        this.dealer.reset();
        this.player.userhand.reset();

        // Dealer gets two cards, one face down and one face up
        const dealerCard1 = this.carddeck.dealCard();  // Face-down card
        this.dealer.addCard(dealerCard1);  // Face-down card
        showDealtCard(this.dealer, true);  // Show dealer's facedown card

        const dealerCard2 = this.carddeck.dealCard();  // Face-up card
        this.dealer.addCard(dealerCard2);  // Face-up card
        showDealtCard(this.dealer, false);  // Show dealer's faceup card
        

        // Player gets two face-up cards
        const playerCard1 = this.carddeck.dealCard();
        this.player.userhand.addCard(playerCard1);
        showDealtCard(this.player.userhand, false);  // Show player's first card

        const playerCard2 = this.carddeck.dealCard();
        this.player.userhand.addCard(playerCard2);
        showDealtCard(this.player.userhand, false);  // Show player's second card

        
        // Log the cards dealt to the dealer
        console.log(`Dealer's cards: ${dealerCard1.getRank()} of ${dealerCard1.getSuit()} (face down), ${dealerCard2.getRank()} of ${dealerCard2.getSuit()} (face up)`);

        // Log the cards dealt to the player
        console.log(`Player's cards: ${playerCard1.getRank()} of ${playerCard1.getSuit()}, ${playerCard2.getRank()} of ${playerCard2.getSuit()}`);

        console.log("Cards dealt to both player and dealer.");
    },

    // Deals a card to the player as long as their score is under 21
    hit: function () {
        if (!this.didPlayerBust() && !this.didPlayerGetTwentyOne()) {
            const newCard = this.carddeck.dealCard();
            this.player.userhand.addCard(newCard);      // Add it to the player's hand

            console.log(`Player hits and receives: ${newCard.getRank()} of ${newCard.getSuit()}`);

            
            showDealtCard(blackjack.player.userhand, false); 
           
            updateCardsLeftDisplay(); 
        }

        if (this.didPlayerBust()) {
            console.log("Player busted!");
            addMessage("You bust! Dealer wins.");
            revealDealerFaceDownCard();
            isGameInPlay = false; // End game if the player busts
            gamePlay.isGameOver();
        } else if (this.didPlayerGetTwentyOne()) {
            console.log("Player has 21!");
            addMessage("You Win. You got 21. Automatic Win!");
            revealDealerFaceDownCard();
            isGameInPlay = false; // End game if the player busts
            gamePlay.isGameOver();
        }
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

    // Called in the app.js file and links the ajax calls to the rest of the program
    getRemoteAdvice: function(advice) {
        if (advice.toLowerCase() === "hit") {
            this.hit(); // Perform hit action if advice is to hit
        } else if (advice.toLowerCase() === "stay") {
            this.stay(); // Perform stay action if advice is to stay
        }
    },
    
    // Helper Function to have the dealer draw cards if user is winning
    stay: function() {
        this.player.userhand.isTurnEnded = true; // End player's turn
        addMessage("Your turn has ended. Dealer's turn now.");
        isGameInPlay = false; // End game if the player busts

        // Reveals the dealers face down card
        revealDealerFaceDownCard();

         // Dealer plays their turn
         while (blackjack.dealer.getScore() < this.dealersHitLimit) { // Dealer hits if value is less than 16
            let card = blackjack.carddeck.dealCard(); // Deal a card to the dealer
            blackjack.dealer.addCard(card); // Add it to the dealer's hand
            console.log(`Dealer hits and receives: ${card.getRank()} of ${card.getSuit()}`);
            showDealtCard(blackjack.dealer, false); // Show the new card
        }

        updateCardsLeftDisplay(); 
        
        // Determine winner
        gamePlay.isGameOver();
    },
};