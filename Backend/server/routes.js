const express = require('express');
const router = express.Router();
const path = require('path');
const mydb = require('./dbmgr.js');

const player1Path = path.join(__dirname, '../../player1');
const player2Path = path.join(__dirname, '../../player2');
const backendPath = path.join(__dirname, '../../Backend');

let player1Rounds = 0, player2Rounds = 0;
let player1UsedIndexPage = false, player1UsedGamePlayPage = false;

router.use('/player1/assets', express.static(player1Path + '/assets', { setHeaders }));
router.use('/player2/assets', express.static(player2Path + '/assets', { setHeaders }));
router.use('/Backend/server', express.static(backendPath + '/server', { setHeaders }));

function setHeaders(res, filePath) {
    if (/\.js$/.test(filePath)) res.setHeader('Content-Type', 'application/javascript');
    else if (/\.css$/.test(filePath)) res.setHeader('Content-Type', 'text/css');
}


router.get('/p4', function (req, res) {
    mydb.findAll(0);
    res.send("Finding all records");
});

router.get('/p5', function (req, res) {
    mydb.deleteCollection();
    res.send("Deleted Collection")
});

router.get('/', (req, res) => {
    if (!player1UsedIndexPage) {
        res.sendFile(path.join(player1Path, 'index.html'));
        player1UsedIndexPage = true;
    } else {
        res.sendFile(path.join(player2Path, 'index.html'));
        player1UsedIndexPage = false;
    }
});

router.get('/gameplay.html', (req, res) => {
    if (!player1UsedGamePlayPage) {
        res.sendFile(path.join(player1Path, 'gameplay.html'));
        player1UsedGamePlayPage = true;
    } else {
        res.sendFile(path.join(player2Path, 'gameplay.html'));
        player1UsedGamePlayPage = false;
    }
});

// POST route to handle username submission
router.post('/username', (req, res) => {
    const { username } = req.body;
    if (!username) return res.status(400).send("Username required");
    mydb.findRec({ username }, (user) => {
        if (!user) { mydb.insertRec({ username, highScore: 0 }); res.status(201).send("User added"); }
        else res.status(200).send("User exists");
    });
});


router.get('/player1', function (req, res) {
    const { username, status, wallet } = req.query; // Retrieve query parameters
    
    console.log('Received request for player1:', req.query);

    // Validate the required parameters
    if (!username || !status || wallet === undefined) {
        return res.status(400).send("Missing parameters");
    }

    // Update the number of rounds the player has made
    if (status !== 'gameover') {
        console.log("Inside round counter");
        console.log("Playerrounds: ", player1Rounds);
        player1Rounds++;
        console.log("Playerrounds: ", player1Rounds);
    }

    if (status === 'gameover') {
        console.log("Inside gameover");
        // If the game is over, check if the player is in the database
        mydb.findRec({ username }, (user) => {
            if (!user) {
                console.log("inside player1 if statement");
                // If the player doesn't exist in the database, add them
                mydb.insertRec({ username: username, highScore: player1Rounds });
                console.log(`Added new player: ${username}`);
            } else {
                console.log("inside player1 ELSE statement");
                // If the player exists, check if their current score is higher than the stored high score
                if (player1Rounds > user.highScore) {
                    // Update the player's high score if the current score is better
                    mydb.updateData({ username }, { highScore: player1Rounds }, (err, message) => {
                        if (err) {
                            console.error('Error updating data:', err);
                            return res.status(500).send("Error updating high score");
                        }
                        console.log(message); // "1 document updated"
                    });
                    console.log(`Updated ${username}'s high score to ${player1Rounds}`);
                }
            }
        });
    }

    // Send response with updated game data
    res.status(200).send(`Hello ${username}! Status: ${status}, Wallet: $${wallet}`);
});


router.get('/player2', function (req, res) {
    const { username, status, wallet } = req.query; // Retrieve query parameters
    
    console.log('Received request for player1:', req.query);

    // Validate the required parameters
    if (!username || !status || wallet === undefined) {
        return res.status(400).send("Missing parameters");
    }

    // Update the number of rounds the player has made
    if (status !== 'gameover') {
        console.log("Inside round counter");
        console.log("Playerrounds: ", player2Rounds);
        player2Rounds++;
        console.log("Playerrounds: ", player2Rounds);
    }

    if (status === 'gameover') {
        console.log("Inside gameover");
        // If the game is over, check if the player is in the database
        mydb.findRec({ username }, (user) => {
            if (!user) {
                console.log("inside player2 if statement");
                // If the player doesn't exist in the database, add them
                mydb.insertRec({ username: username, highScore: player2Rounds });
                console.log(`Added new player: ${username}`);
            } else {
                console.log("inside player2 ELSE statement");
                // If the player exists, check if their current score is higher than the stored high score
                if (player2Rounds > user.highScore) {
                    // Update the player's high score if the current score is better
                    mydb.updateData({ username }, { highScore: player2Rounds }, (err, message) => {
                        if (err) {
                            console.error('Error updating data:', err);
                            return res.status(500).send("Error updating high score");
                        }
                        console.log(message); // "1 document updated"
                    });
                    console.log(`Updated ${username}'s high score to ${player2Rounds}`);
                }
            }
        });
    }

    // Send response with updated game data
    res.status(200).send(`Hello ${username}! Status: ${status}, Wallet: $${wallet}`);
});

router.get('/highscores', (req, res) => {
    mydb.findAll(0, (results) => {
        if (results) {
            // Sort results by highScore in descending order
            const sortedResults = results.sort((a, b) => b.highScore - a.highScore);

            res.status(200).json(
                sortedResults.map((user) => ({
                    username: user.username,
                    highScore: user.highScore,
                }))
            );
        } else {
            res.status(404).send("No high scores found");
        }
    });
});

module.exports = router;