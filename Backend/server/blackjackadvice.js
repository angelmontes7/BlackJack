

const fs = require('fs');
const path = require('path');

// Use __dirname to ensure the correct path to counts.json
const countsFile = path.join(__dirname, 'counts.json');


const generateAdvice = (userscore, dealerscore, callback) => {
    let advice;
    let userScore = parseInt(userscore);
    let dealerScore = parseInt(dealerscore);
  
    // Validate user score and set defaults
    if (isNaN(userScore) || userScore < 4 || userScore > 21) {
      userScore = 14; // Default user score
    }
  
    // Validate dealer score and set defaults
    if (isNaN(dealerScore) || dealerScore < 2 || dealerScore > 11) {
      dealerScore = 6; // Default dealer score
    }
  
    // Check if both scores are invalid
    if ((isNaN(userscore) && isNaN(dealerscore)) || (userScore < 4 || userScore > 21 && dealerScore < 2 || dealerScore > 11)) {
      callback({
        status: 'Error',
        message: 'Both scores are invalid. Please provide valid scores for both the player and dealer.'
      });
      return;
    }
  
    // Determine advice based on scores
    if (dealerScore >= 2 && dealerScore <= 5) {
      if (userScore >= 17 && userScore <= 21) {
        advice = 'Stay';
      } else if (userScore >= 13 && userScore <= 16) {
        advice = 'Stay';
      } else if (userScore >= 4 && userScore <= 12) {
        advice = 'Hit';
      }
    } else if (dealerScore >= 6 && dealerScore <= 11) {
      if (userScore >= 17 && userScore <= 21) {
        advice = 'Stay';
      } else if (userScore >= 13 && userScore <= 16) {
        advice = 'Hit';
      } else if (userScore >= 4 && userScore <= 12) {
        advice = 'Hit';
      }
    }
  
    // Send the generated advice back through the callback
    callback({
      status: 'Success',
      content: {
        "User's Score": userScore,
        "Dealer's Score": dealerScore,
        "Advice": advice || 'No advice found'
      }
    });
  };
  

// Load the current counts from the file
function loadCounts(callback) {
  fs.readFile(countsFile, 'utf8', (err, data) => {
      if (err) {
          console.error('Error reading counts file:', err);
          // If the file doesn't exist or there's an error, assume initial counts
          callback({ wins: 0, losses: 0, pushes: 0 });
          return;
      }

      try {
          const counts = JSON.parse(data);
          callback(counts);
      } catch (parseError) {
          console.error('Error parsing counts file:', parseError);
          callback({ wins: 0, losses: 0, pushes: 0 });
      }
  });
}

// Save the updated counts to the file
function saveCounts(counts, callback) {
  fs.writeFile(countsFile, JSON.stringify(counts, null, 2), 'utf8', (err) => {
      if (err) {
          console.error('Error saving counts file:', err);
          callback(err);
          return;
      }
      callback(null);
  });
}

// Update the win, loss, or push counts based on the outcome
function updateOutcome(outcome, callback) {
  loadCounts((counts) => {
      // Update the counts based on the outcome
      if (outcome === 'won') {
          counts.wins += 1;
      } else if (outcome === 'lost') {
          counts.losses += 1;
      } else if (outcome === 'push') {
          counts.pushes += 1;
      }

      // Save the updated counts
      saveCounts(counts, (err) => {
          if (err) {
              callback(err, null);
              return;
          }
          callback(null, counts);
      });
  });
}

function resetCounts(callback) {
  const resetData = { wins: 0, losses: 0, pushes: 0 };
  saveCounts(resetData, callback);
}

// Export the function to be used in the server
module.exports = {
  generateAdvice,
  updateOutcome,
  resetCounts
};
