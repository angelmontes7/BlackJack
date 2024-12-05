const suits = ["H", "S", "C", "D"];  // Allowable suits
const maxCardsPerSuit = 13;          // Max cards per suit

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
            // Shuffle the deck
            this.initialize();  // Reinitialize the deck to 52 cards
            this.shuffle();  // Shuffle the newly reset deck
            console.log("Deck shuffled");
        }
        const dealtCard = this.deck.pop();  // Remove and return the top card
        this.cardsLeft--;
        return dealtCard;  // Return the dealt card
    }
};

// Shared deck implementation
let sharedDeck = null;

function getSharedDeck() {
    if (!sharedDeck) {
        sharedDeck = Object.create(card_deck);
        sharedDeck.initialize();
        sharedDeck.shuffle();
    }
    return sharedDeck;
}

// Export everything needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        card,
        card_deck,
        getSharedDeck,
        resetSharedDeck: () => {
            sharedDeck = null;
        }
    };
}

// At the end of carddeck.js
if (typeof window !== 'undefined') {
    window.card = card;
    window.card_deck = card_deck;
    // Add a helper function for creating cards from data
    window.createCardFromData = function(cardData) {
        const newCard = Object.create(card);
        newCard.setSuit(cardData.suit);
        newCard.setRank(cardData.rank);
        return newCard;
    };
}