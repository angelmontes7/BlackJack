/////////////////////////////////////////////////////////////////////////////////
//Author: Angel Montes
//Purpose: Controls the View of an MVC blackjack game
/////////////////////////////////////////////////////////////////////////////////
//view.js
//addMessage(msg) – adds a given text (msg) to the message div.

//adds a given class to an element if it does not have the class. Does nothing otherwise.
function addClass(element, className) {
    if (element.classList)	//if element has a class list
        element.classList.add(className);	//add class
    else if (!hasClass(element, className))	//else check if it doesn't have the class
        element.className += " " + className;
}

// removes a given class from an element if the class has it. Does nothing otherwise.
function removeClass(element, className) {
    if (element.classList)
        element.classList.remove(className);
}

function addMessage(msg) {
    const messageArea = document.getElementById('messageArea');
    
    // Create a new paragraph element for the message
    const newMessage = document.createElement('p'); 
    newMessage.textContent = msg; // Set the message text

    // Prepend the new message to the message area
    messageArea.prepend(newMessage);
}

// clearMessages – Removes all messages from the message div.
function clearMessages() {
    var messageDiv = document.getElementById("messageArea"); // Get the message div
    if (messageDiv) {
        messageDiv.innerHTML = ""; // Clear the inner HTML to remove all content
    }
}

// setUsername – Displays username on the game page.
function setUsername(userName) {
    var usernameDisplay = document.getElementById("usernameDisplay"); // Get the username display element
    if (usernameDisplay) {
        usernameDisplay.innerHTML = "Welcome, " + userName + "!"; // Display the username with a welcome message
    }
}

// resetView - Resets the game board.
function resetView() {
    clearMessages();

    // Reset player and dealer hand displays
    document.getElementById("dealerHand").innerHTML = ""; // Clear dealer hand
    document.getElementById("playerHand").innerHTML = ""; // Clear player hand

    // Hide game buttons or reset their states
    document.getElementById("hitButton").disabled = false; // Enable hit button
    document.getElementById("stayButton").disabled = false; // Enable stay button
}

//show a div given the div's ID
function showDiv(divID) {
    var userDiv = document.getElementById(divID);
    if (userDiv !== null)
        userDiv.style.display = "block";
}

// hide a div given the div's ID
function hideDiv(divID) {
    var div = document.getElementById(divID); // Get the div element by its ID
    if (div) {
        div.style.display = "none"; // Hide the div by setting its display style to 'none'
    }
}

// show a dealt card for a given player (user or dealer)
function showDealtCard(player, facedown) {
    // Condition statement to determine wheteher the "player" is either the player or dealer than gets the hand
    const handElement = player === blackjack.dealer ? document.getElementById("dealerHand") : document.getElementById("playerHand");
    let card = player.cards[player.cards.length - 1];

    let cardElement = document.createElement("div");
    cardElement.classList.add("card_deck");
    
    if (facedown) {
        cardElement.className += " facedown"; // Add class for facedown styling
        cardElement.id = "facedown"; // ID for facedown card
    } else {
        cardElement.id = getCardId(card); // Set ID based on suit and rank
    }

    handElement.appendChild(cardElement); // Append to the correct element
    
    cardElement.style.animation = 'slideIn 0.5s ease-out';

}

function updateBetDisplay() {
    document.getElementById("currentBet").innerText = `Current Bet: $${currentBet}`;
}


// Helper functions below


// Get the card ID based on its suit and rank (in showDealtCard)
function getCardId(card) {
    const suit = card.getSuit()
    const rank = card.getRank()
    return `${suit}${rank}`;

}

function updateCardsLeftDisplay() {
    document.getElementById("cardsLeftCount").innerText = blackjack.carddeck.cardsLeft;
}

function resetBetDisplay() {
    currentBet = 0
    document.getElementById("currentBet").innerHTML = `Current Bet: $${currentBet}`;
}

function revealDealerFaceDownCard() {
    const faceDownCard = document.getElementById('facedown'); // Get the face-down card element
    if (faceDownCard) {
        const card = blackjack.dealer.cards[0]; // Get the first (face-down) card in the dealer's hand
        faceDownCard.id = getCardId(card); // Update the card's ID to show its rank and suit
        faceDownCard.classList.remove("facedown"); // Remove the facedown class
    }
}

function updateWalletDisplay() {
    const walletElement = document.getElementById("walletDisplay");
    if (walletElement) {
        walletElement.innerText = `Wallet: $${blackjack.player.userWallet.getValue()}`;
    }
}

