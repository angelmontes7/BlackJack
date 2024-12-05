// mySocket.js
const myURL = "http://127.0.0.1:3000";
const socket = io(myURL, { secure: true });

// Game state variables
let bothPlayersReady = false;
let thisPlayerReady = false;
let playerNumber = null; // Default value, will be updated on registration
let isSinglePlayer = true; // Start assuming single player

// Register player when connection is established
socket.on('connect', () => {
    socket.emit('registerPlayer', playerNumber);
    console.log(`Registered as Player ${playerNumber}`);
});

socket.on('playerNumber', (number) => {
    playerNumber = number;
    console.log(`Assigned as Player ${playerNumber}`);
});

function sendMoveToServer(playerNumber, moveData) {
    $.ajax({
        url: `http://127.0.0.1:3000/player${playerNumber}`,
        method: 'GET',
        data: {
            username: gamePlay.getUsername(),
            status: moveData,
            wallet: blackjack.player.userWallet.getValue()
        },
        success: function(response) {
            console.log('Move sent successfully');
        },
        error: function(error) {
            console.error('Move error:', error);
        }
    });
}

// Ready state functions
function emitReadyStatus() {
    socket.emit('playerReady', { playerNumber });
    thisPlayerReady = true;
}

// Emit player action events
function emitPlayerAction(action, data, playerNumber) {
    socket.emit('playerMove', {
        action: action,
        data: data,
        playerNumber: playerNumber
    });
}

function emitHitRequest() {
    socket.emit('hitRequest', { 
        playerNumber 
    });
}

// Dealer turn handlers
socket.on('dealerReveal', (data) => {
    console.log('Dealer reveals cards:', data);
    const dealerHand = document.getElementById('dealerHand');
    if (dealerHand) {
        dealerHand.innerHTML = '';
        
        data.cards.forEach(card => {
            const cardElement = document.createElement('div');
            cardElement.classList.add('card_deck');
            cardElement.id = `${card.suit}${card.rank}`;
            dealerHand.appendChild(cardElement);
            cardElement.style.animation = 'slideIn 0.5s ease-out';
        });
    }
});

socket.on('dealerHit', (data) => {
    console.log('Dealer hits:', data);
    const dealerHand = document.getElementById('dealerHand');
    if (dealerHand && data.card) {
        const cardElement = document.createElement('div');
        cardElement.classList.add('card_deck');
        cardElement.id = `${data.card.suit}${data.card.rank}`;
        dealerHand.appendChild(cardElement);
        cardElement.style.animation = 'slideIn 0.5s ease-out';
        
        addMessage(`Dealer hits and receives: ${data.card.rank} of ${data.card.suit}`);
    }
});

socket.on('dealerDone', (data) => {
    console.log('Dealer finished with score:', data.finalScore);
    addMessage(`Dealer stands with ${data.finalScore}`);

    // Reset game state
    isGameInPlay = false;
    thisPlayerReady = false;
    bothPlayersReady = false;

    // Enable ready button for next round
    const readyButton = document.getElementById("readyButton");
    if (readyButton) {
        readyButton.disabled = false;
        readyButton.textContent = "Ready";
    }

    document.getElementById("dealButton").disabled = true;

    gamePlay.isGameOver();
    addMessage("Click Ready when you want to play another round!");
});

// Player move handlers
socket.on('updatePlayer1Board', (data) => {
    if (!data) {
        console.error('No data received in updatePlayer1Board');
        return;
    }

    const opponentHand = document.getElementById('opponentHand');
    if (!opponentHand) {
        console.error('Opponent hand element not found');
        return;
    }

    if (data.action === 'hit' && data.card) {
        try {
            const cardElement = document.createElement('div');
            cardElement.classList.add('card_deck');
            cardElement.id = `${data.card.suit}${data.card.rank}`;
            cardElement.style.animation = 'slideIn 0.5s ease-out';
            
            opponentHand.appendChild(cardElement);
            console.log('Added card to opponent hand:', data.card);
            updateOpponentScore();
        } catch (error) {
            console.error('Error adding opponent card:', error);
        }
    } else if (data.action === 'stay') {
        console.log("Opponent Player 1 chose to stay.");
        addMessage("Opponent Player 1 chose to stay.");
    }
});

socket.on('updatePlayer2Board', (data) => {
    // Same implementation as updatePlayer1Board
    if (!data) {
        console.error('No data received in updatePlayer2Board');
        return;
    }

    const opponentHand = document.getElementById('opponentHand');
    if (!opponentHand) {
        console.error('Opponent hand element not found');
        return;
    }

    if (data.action === 'hit' && data.card) {
        try {
            const cardElement = document.createElement('div');
            cardElement.classList.add('card_deck');
            cardElement.id = `${data.card.suit}${data.card.rank}`;
            cardElement.style.animation = 'slideIn 0.5s ease-out';
            
            opponentHand.appendChild(cardElement);
            console.log('Added card to opponent hand:', data.card);
            updateOpponentScore();
        } catch (error) {
            console.error('Error adding opponent card:', error);
        }
    } else if (data.action === 'stay') {
        console.log("Opponent Player 2 chose to stay.");
        addMessage("Opponent Player 2 chose to stay.");
    }
});

// Function to update the opponent's score
function updateOpponentScore() {
    const opponentHand = document.getElementById('opponentHand');
    const opponentCards = opponentHand.getElementsByClassName('card_deck');

    let score = 0;
    Array.from(opponentCards).forEach(cardElement => {
        const cardRank = parseInt(cardElement.id.replace(/[^\d]/g, ''), 10);  // Extract rank from card ID
        score += cardRank > 10 ? 10 : cardRank;  // Face cards are worth 10
    });

    document.getElementById('opponentScore').textContent = `Opponent Score: ${score}`; // Update score display
}

// Listen for ready state updates


socket.on('bothPlayersReady', () => {
    if (!isSinglePlayer) { // Only handle in multiplayer mode
        bothPlayersReady = true;
        addMessage("Both players ready! Deal can begin.");
        enableDealButton();
    }
});

socket.on('playerCountUpdate', (count) => {
    if (count === 1) {
        isSinglePlayer = true;
        bothPlayersReady = true; // Allow single player to play
        enableDealButton();
        addMessage("Single player mode - Ready to play!");
    } else {
        isSinglePlayer = false;
        if (!thisPlayerReady) {
            bothPlayersReady = false; // Reset when second player joins
            disableDealButton();
            addMessage("Second player joined - Both players must click ready!");
        } else {
            // Even if this player is ready, wait for other player
            bothPlayersReady = false;
            disableDealButton();
            addMessage("Waiting for opponent to be ready...");
        }
    }
});

socket.on('dealResponse', (dealData) => {
    // Clear all hands
    document.getElementById('dealerHand').innerHTML = '';
    document.getElementById('playerHand').innerHTML = '';
    document.getElementById('opponentHand').innerHTML = '';

    // Reset hands
    blackjack.dealer.reset();
    blackjack.player.userhand.reset();

    // Add cards to dealer's hand
    dealData.dealerCards.forEach((card, index) => {
        if (index === 0) {
            // First card is face down
            showDealtCard(blackjack.dealer, true);
        } else {
            // Use the helper function to create card
            const newCard = window.createCardFromData(card);
            blackjack.dealer.addCard(newCard);
            showDealtCard(blackjack.dealer, false);
        }
    });

    // Add cards to player's hand based on player number
    const playerCards = playerNumber === 1 ? dealData.player1Cards : dealData.player2Cards;
    const opponentCards = playerNumber === 1 ? dealData.player2Cards : dealData.player1Cards;

    playerCards.forEach(card => {
        // Use the helper function to create card
        const newCard = window.createCardFromData(card);
        blackjack.player.userhand.addCard(newCard);
        showDealtCard(blackjack.player.userhand, false);
    });

    // Show opponent's cards
    opponentCards.forEach(card => {
        const cardElement = document.createElement('div');
        cardElement.classList.add('card_deck');
        cardElement.id = `${card.suit}${card.rank}`;
        document.getElementById('opponentHand').appendChild(cardElement);
    });

    isGameInPlay = true;
    updateCardsLeftDisplay();
});

socket.on('hitResponse', (data) => {
    console.log("Received hit card:", data.card);
    const newCard = createCardFromData(data.card); // Use createCardFromData instead of createCardObject
    blackjack.player.userhand.addCard(newCard);
    showDealtCard(blackjack.player.userhand, false); // Render the new card
});


// Handle opponent's moves
function handleOpponentMove(moveData) {
    console.log(`Received move from opponent:`, moveData);
    
    switch (moveData.action) {
        case 'hit':
            showOpponentCard(moveData.data.card);
            addMessage(`Opponent hit and received a card`);
            break;
            
        case 'stay':
            addMessage(`Opponent chose to stay`);
            break;
            
        case 'bet':
            addMessage(`Opponent bet $${moveData.data.amount}`);
            break;
            
        case 'dealStart':
            handleOpponentDealStart(moveData.data);
            break;
    }
}

// Show opponent's new card
function showOpponentCard(cardData) {
    const opponentHand = document.getElementById('opponentHand');
    const cardElement = document.createElement('div');
    cardElement.classList.add('card_deck');
    cardElement.id = `${cardData.suit}${cardData.rank}`;
    opponentHand.appendChild(cardElement);
    cardElement.style.animation = 'slideIn 0.5s ease-out';
}

// Handle opponent starting new round
function handleOpponentDealStart(data) {
    const opponentHand = document.getElementById('opponentHand');
    opponentHand.innerHTML = ''; // Clear previous hand
    
    // Show initial cards
    data.cards.forEach(card => {
        const cardElement = document.createElement('div');
        cardElement.classList.add('card_deck');
        if (card.facedown) {
            cardElement.classList.add('facedown');
        } else {
            cardElement.id = `${card.suit}${card.rank}`;
        }
        opponentHand.appendChild(cardElement);
    });
    
    addMessage(`Opponent started a new round`);
}

function enableDealButton() {
    const dealButton = document.getElementById("dealButton");
    if (dealButton) {
        dealButton.disabled = false;
        addMessage("Deal button enabled - You can start the game!");
    }
}

function disableDealButton() {
    const dealButton = document.getElementById("dealButton");
    if (dealButton) {
        dealButton.disabled = true;
    }
}

// Listen for the 'shufflingModal' event
socket.on('shufflingModal', function (data) {
    if (data.showModal) {
        // Show the shuffling modal
        document.getElementById("shufflingModal").style.display = "block";
    } else {
        // Hide the shuffling modal
        document.getElementById("shufflingModal").style.display = "none";
    }
});

// Export socket functions
window.socketHandler = {
    emitPlayerAction,
    emitHitRequest,
    handleOpponentMove,
    emitReadyStatus,
    sendMoveToServer,
    isBothPlayersReady: () => bothPlayersReady,
    isThisPlayerReady: () => thisPlayerReady
};