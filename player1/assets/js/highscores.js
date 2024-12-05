document.addEventListener('DOMContentLoaded', function () {
    const highscoresTableBody = document.querySelector('#highscores-table tbody');

    // Fetch high scores from the server
    fetch('http://127.0.0.1:3000/highscores')
        .then((response) => {
            if (!response.ok) {
                throw new Error('Failed to fetch high scores');
            }
            return response.json(); // Parse JSON response
        })
        .then((highscores) => {
            // Clear existing rows
            highscoresTableBody.innerHTML = '';

            // Populate the table with high scores
            highscores.forEach((score, index) => {
                const row = document.createElement('tr');

                // Create cells for rank, username, and high score
                const rankCell = document.createElement('td');
                rankCell.textContent = index + 1; // Rank starts at 1

                const usernameCell = document.createElement('td');
                usernameCell.textContent = score.username;

                const highScoreCell = document.createElement('td');
                highScoreCell.textContent = score.highScore;

                // Append cells to the row
                row.appendChild(rankCell);
                row.appendChild(usernameCell);
                row.appendChild(highScoreCell);

                // Append row to the table body
                highscoresTableBody.appendChild(row);
            });
        })
        .catch((error) => {
            console.error('Error fetching high scores:', error);
            highscoresTableBody.innerHTML = '<tr><td colspan="3">Failed to load high scores</td></tr>';
        });
});
