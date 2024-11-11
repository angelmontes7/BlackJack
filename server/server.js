// server.js
const http = require('http');
const url = require('url');
const hostname = '127.0.0.1';
const port = 3000;
const blackjackAdvice = require('./blackjackadvice');

// Create the server
const server = http.createServer((req, res) => {
  // Parse the query parameters
  const queryObject = url.parse(req.url, true).query;

  console.log(`Full request URL: ${req.url}`);

  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*'); 
  res.setHeader('Access-Control-Allow-Methods', 'GET'); 
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type'); 

  // Check if it's an advice request
  if (queryObject.userscore && queryObject.dealerscore) {

    console.log(`Received request: userscore = ${queryObject.userscore}, dealerscore = ${queryObject.dealerscore}`);

    // Sends query parameters to generateAdvice function
    blackjackAdvice.generateAdvice(queryObject.userscore, queryObject.dealerscore, (advice) => {
      console.log(`Generated advice: ${JSON.stringify(advice)}`); // Log the generated advice
      if (advice.status === 'Error') {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(advice));
      } else {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(advice));
      }
    });
    // Checks if its a outcome request
  } else if (queryObject.outcome) {
    // Handle outcome tracking requests
    const outcome = queryObject.outcome;
    console.log(`Received outcome request: outcome = ${outcome}`);

    if (['won', 'lost', 'push'].includes(outcome)) {
      // Calls updateOutcome to update the counts and respond with the new counts
      blackjackAdvice.updateOutcome(outcome, (err, updatedCounts) => {
        if (err) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            status: 'Error',
            message: 'Failed to update outcome.',
          }));
        } else {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            status: 'Success',
            content: {
              wins: updatedCounts.wins,
              losses: updatedCounts.losses,
              pushes: updatedCounts.pushes,
            },
          }));
        }
      });
      // Error handling if sent parameter is not a valid outcome
    } else {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        status: 'Error',
        message: 'Invalid outcome parameter. Must be "won", "lost", or "push".',
      }));
    }
    
  } else {
    // Handle requests with missing or incorrect parameters
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'Error',
      message: 'Invalid parameters. Please provide userscore and dealerscore for advice, or outcome for tracking.',
    }));
  }
});

// Start the server on port 3000
server.listen(port, hostname, () => {

  // Resets the counts when a new server call is created
  blackjackAdvice.resetCounts((err) => {
    if (err) {
        console.error('Failed to reset counts:', err);
    } else {
        console.log('Counts reset to zero.');
    }
  });

  console.log('Server running at http://127.0.0.1:3000/');
});

