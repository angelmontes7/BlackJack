const express = require('express');
const { Server } = require('socket.io');
const path = require('path');
const cardDeck = require('./carddeck');
const app = express();

// CORS Setup
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

const initializeWebSockets = (server) => {
  const io = new Server(server);
  const connectedPlayers = new Map(); // Track connected players
  const readyPlayers = new Set(); // Track ready players
  const gameState = {
    playersFinished: new Set(), // Track which players have finished
    dealerCards: [], // Store dealer's cards
    dealerHitLimit: 16 // Dealer must hit on 16 or below
  };
  let nextPlayerNumber = 1; // Track the next player number (1 or 2)

  function calculateDealerScore(cards) {
    let score = 0;
    let aces = 0;

    cards.forEach(card => {
      const value = card.getRank();
      if (value === 1) {
        aces++;
        score += 11;
      } else {
        score += value > 10 ? 10 : value;
      }
    });

    // Adjust for aces if score is over 21
    while (score > 21 && aces > 0) {
      score -= 10;
      aces--;
    }

    return score;
  }

  function handleDealerTurn() {
    // First reveal initial dealer cards
    io.emit('dealerReveal', {
      cards: gameState.dealerCards.map(card => ({
        suit: card.getSuit(),
        rank: card.getRank()
      }))
    });

    // Calculate initial dealer score
    let dealerScore = calculateDealerScore(gameState.dealerCards);
    const deck = cardDeck.getSharedDeck();

    // Dealer hits until reaching 17 or higher
    while (dealerScore <= gameState.dealerHitLimit) {
      const newCard = deck.dealCard();
      gameState.dealerCards.push(newCard);
      dealerScore = calculateDealerScore(gameState.dealerCards);

      // Broadcast the new card to all players
      io.emit('dealerHit', {
        card: {
          suit: newCard.getSuit(),
          rank: newCard.getRank()
        },
        dealerScore: dealerScore
      });
    }

    // Broadcast final dealer score
    io.emit('dealerDone', {
      finalScore: dealerScore
    });

    // Reset game state for next round
    gameState.playersFinished.clear();
    gameState.dealerCards = [];
  }
  io.on('connection', (socket) => {
      console.log('A user connected:', socket.id);

      // Register player and assign player number
      socket.on('registerPlayer', () => {
          const playerNumber = nextPlayerNumber; // Assign the next available player number
          connectedPlayers.set(socket.id, playerNumber);
          console.log(`Player ${playerNumber} registered with socket ID: ${socket.id}`);

          // After assigning player number, increment for the next player
          nextPlayerNumber = nextPlayerNumber === 1 ? 2 : 1;

          socket.emit('playerNumber', playerNumber); // Send the player number to the client
          io.emit('playerCountUpdate', connectedPlayers.size);
      });

      // Handle ready status
      socket.on('playerReady', (data) => {
          readyPlayers.add(socket.id);
          
          io.emit('playerReadyUpdate', {
            readyCount: readyPlayers.size,
            totalPlayers: connectedPlayers.size,
            playerNumber: connectedPlayers.get(socket.id)
          });

          // Check if both players are ready (only in multiplayer)
          if (connectedPlayers.size === 2 && readyPlayers.size === 2) {
              io.emit('bothPlayersReady');
          }
      });

      // Handle dealing cards
      socket.on('dealRequest', (data) => {
          const deck = cardDeck.getSharedDeck();
          const isSinglePlayer = connectedPlayers.size === 1;
          const requestingPlayer = connectedPlayers.get(socket.id);

          // Deal cards
          const dealerCards = [deck.dealCard(), deck.dealCard()];
          const player1Cards = [deck.dealCard(), deck.dealCard()];
          
          // Only deal player2 cards if in multiplayer mode
          const player2Cards = !isSinglePlayer ? [deck.dealCard(), deck.dealCard()] : [];

          // Broadcast deal to all players
          io.emit('dealResponse', {
              dealerCards: [
                  { facedown: true },
                  { suit: dealerCards[1].getSuit(), rank: dealerCards[1].getRank() }
              ],
              player1Cards: player1Cards.map(card => ({
                  suit: card.getSuit(),
                  rank: card.getRank()
              })),
              player2Cards: player2Cards.map(card => ({
                  suit: card.getSuit(),
                  rank: card.getRank()
              }))
          });
          // Store dealer's cards in game state
          gameState.dealerCards = dealerCards;

          // Reset game state for the new round
          gameState.playersFinished.clear();

          // Notify all players to start new round
          io.emit('roundStart');
      });

      // Listen for player moves
      socket.on('playerMove', (moveData) => {
        const playerNumber = connectedPlayers.get(socket.id);
        console.log(`Player ${playerNumber} move:`, moveData);

        if (moveData.action === 'stay') {
            gameState.playersFinished.add(playerNumber);
            
            // Broadcast stay action to other players
            socket.broadcast.emit(`updatePlayer${playerNumber}Board`, {
                action: 'stay',
                playerNumber: playerNumber
            });

            // If all players have finished, start dealer's turn
            if (gameState.playersFinished.size === connectedPlayers.size) {
                handleDealerTurn();
            }
        } else {
            // Broadcast other moves to the appropriate opponent
            if (playerNumber === 1) {
                socket.broadcast.emit('updatePlayer2Board', moveData);
            } else if (playerNumber === 2) {
                socket.broadcast.emit('updatePlayer1Board', moveData);
            }
        }
    });

    // Handle hit request
    socket.on('hitRequest', (data) => {
        const playerNumber = connectedPlayers.get(socket.id);
        const deck = cardDeck.getSharedDeck();
        const newCard = deck.dealCard();
    
        socket.emit('hitResponse', {
            card: {
                suit: newCard.getSuit(),
                rank: newCard.getRank()
            }
        });
    
        socket.broadcast.emit(`updatePlayer${playerNumber === 1 ? '1' : '2'}Board`, {
            action: 'hit',
            card: {
                suit: newCard.getSuit(),
                rank: newCard.getRank()
            },
            playerNumber: playerNumber
        });
    });

    // Handle disconnect
    socket.on('disconnect', () => {
        console.log('A user disconnected:', socket.id);
        const wasPlayer = connectedPlayers.get(socket.id);
        connectedPlayers.delete(socket.id);
        readyPlayers.delete(socket.id);
        gameState.playersFinished.delete(wasPlayer);

        io.emit('playerCountUpdate', connectedPlayers.size);

        if (connectedPlayers.size === 1) {
            for (let [remainingSocketId] of connectedPlayers) {
                readyPlayers.add(remainingSocketId);
            }
        }

        console.log(`Player ${wasPlayer} disconnected, ${connectedPlayers.size} players remaining`);
    });
  });
};

// Export the app and WebSocket initializer for use in server.js
module.exports = { app, initializeWebSockets };
