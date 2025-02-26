document.addEventListener('DOMContentLoaded', () => {
    const grid = document.querySelector('.grid'); // Select the game grid container
    const size = 4; // Define the grid size (4x4 for 2048)
    let board = []; // The game board represented as a 2D array
    let currentScore = 0; // Player's current score
    const currentScoreElem = document.getElementById('current-score'); // HTML element displaying the current score

    // Retrieve the high score from local storage, or default to 0 if not found
    let highScore = localStorage.getItem('2048-highScore') || 0;
    const highScoreElem = document.getElementById('high-score');
    highScoreElem.textContent = highScore;

    const gameOverElem = document.getElementById('game-over'); // Element to display game over message

    // Function to update the player's score
    function updateScore(value) {
        currentScore += value; // Increase the score by the merged tile value
        currentScoreElem.textContent = currentScore;
        
        // If the new score exceeds the high score, update it
        if (currentScore > highScore) {
            highScore = currentScore;
            highScoreElem.textContent = highScore;
            localStorage.setItem('2048-highScore', highScore); // Save new high score in local storage
        }
    }

    // Function to restart the game
    function restartGame() {
        currentScore = 0;
        currentScoreElem.textContent = '0';
        gameOverElem.style.display = 'none'; // Hide the game over message
        initializeGame(); // Reset the board and start a new game
    }

    // Function to initialize the game board
    function initializeGame() {
        board = [...Array(size)].map(e => Array(size).fill(0)); // Create a 4x4 grid filled with zeros
        placeRandom(); // Add the first random tile
        placeRandom(); // Add the second random tile
        renderBoard(); // Update the UI
    }

    // Function to update the game board visually
    function renderBoard() {
        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                const cell = document.querySelector(`[data-row="${i}"][data-col="${j}"]`);
                const prevValue = cell.dataset.value;
                const currentValue = board[i][j];
                
                if (currentValue !== 0) {
                    cell.dataset.value = currentValue;
                    cell.textContent = currentValue;
                    
                    // Check if the tile was merged, and apply animation
                    if (currentValue !== parseInt(prevValue) && !cell.classList.contains('new-tile')) {
                        cell.classList.add('merged-tile');
                    }
                } else {
                    cell.textContent = '';
                    delete cell.dataset.value;
                    cell.classList.remove('merged-tile', 'new-tile');
                }
            }
        }

        // Remove animation classes after a short delay
        setTimeout(() => {
            const cells = document.querySelectorAll('.grid-cell');
            cells.forEach(cell => {
                cell.classList.remove('merged-tile', 'new-tile');
            });
        }, 300);
    }

    // Function to add a new random tile (either 2 or 4) to the board
    function placeRandom() {
        const available = []; // List of empty cells
        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                if (board[i][j] === 0) {
                    available.push({ x: i, y: j });
                }
            }
        }

        if (available.length > 0) {
            const randomCell = available[Math.floor(Math.random() * available.length)]; // Choose a random empty cell
            board[randomCell.x][randomCell.y] = Math.random() < 0.9 ? 2 : 4; // Assign a 2 or 4 (90% chance for 2)
            const cell = document.querySelector(`[data-row="${randomCell.x}"][data-col="${randomCell.y}"]`);
            cell.classList.add('new-tile'); // Apply animation to new tile
        }
    }

    // Function to handle tile movement based on arrow key input
    function move(direction) {
        let hasChanged = false; // Flag to track if the board changes

        if (direction === 'ArrowUp' || direction === 'ArrowDown') {
            for (let j = 0; j < size; j++) {
                const column = [...Array(size)].map((_, i) => board[i][j]); // Get the column
                const newColumn = transform(column, direction === 'ArrowUp'); // Process the column
                for (let i = 0; i < size; i++) {
                    if (board[i][j] !== newColumn[i]) {
                        hasChanged = true;
                        board[i][j] = newColumn[i];
                    }
                }
            }
        } else if (direction === 'ArrowLeft' || direction === 'ArrowRight') {
            for (let i = 0; i < size; i++) {
                const row = board[i]; // Get the row
                const newRow = transform(row, direction === 'ArrowLeft'); // Process the row
                if (row.join(',') !== newRow.join(',')) {
                    hasChanged = true;
                    board[i] = newRow;
                }
            }
        }
        
        if (hasChanged) {
            placeRandom(); // Add a new tile after a valid move
            renderBoard(); // Update the UI
            checkGameOver(); // Check if the game is over
        }
    }

    // Function to process a row or column based on movement direction
    function transform(line, moveTowardsStart) {
        let newLine = line.filter(cell => cell !== 0); // Remove zeros
        if (!moveTowardsStart) {
            newLine.reverse(); // Reverse for right/down movement
        }
        
        for (let i = 0; i < newLine.length - 1; i++) {
            if (newLine[i] === newLine[i + 1]) {
                newLine[i] *= 2; // Merge tiles
                updateScore(newLine[i]); // Update score
                newLine.splice(i + 1, 1); // Remove merged tile
            }
        }
        
        while (newLine.length < size) {
            newLine.push(0); // Fill empty spaces with zeros
        }
        
        if (!moveTowardsStart) {
            newLine.reverse(); // Reverse back after processing
        }
        return newLine;
    }

    // Function to check if the game is over
    function checkGameOver() {
        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                if (board[i][j] === 0) return; // If there is an empty space, game is not over
                if (j < size - 1 && board[i][j] === board[i][j + 1]) return; // Check horizontal merge possibility
                if (i < size - 1 && board[i][j] === board[i + 1][j]) return; // Check vertical merge possibility
            }
        }
        gameOverElem.style.display = 'flex'; // Display game over screen if no moves left
    }

    // Event listeners
    document.addEventListener('keydown', event => {
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
            move(event.key);
        }
    });
    document.getElementById('restart-btn').addEventListener('click', restartGame);

    initializeGame(); // Start the game
});
