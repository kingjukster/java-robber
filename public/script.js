async function fetchGrid() {
    try {
      const response = await fetch('/grid');
      const gridText = await response.text();
      document.getElementById('grid').textContent = gridText;
    } catch (error) {
      console.error('Error fetching grid:', error);
    }
  }
  

  const grid = document.getElementById('grid');
    const gameContainer = document.getElementById('game-container');

    function startGame() {
      gameContainer.style.display = 'block'; // Show the grid
      document.getElementById('start-game').style.display = 'none'; // Hide start button

      // Fetch the initial grid setup from backend
      fetch('/start-game')
        .then(response => response.json())
        .then(data => {
          if (data.cityGrid) {
            populateGrid(data.cityGrid);
          }
        })
        .catch(error => console.error('Error:', error));
    }

    function populateGrid(cityGrid) {
      const grid = document.getElementById('grid');
      grid.innerHTML = ''; // Clear previous grid
  
      for (let row = 0; row < 10; row++) {
          for (let col = 0; col < 10; col++) {
              const box = document.createElement('div');
              box.classList.add('cell');
  
              const cell = cityGrid[row][col];
              if (cell === 'J') {
                  box.textContent = 'J';
                  box.style.backgroundColor = '#ffeb3b';
              } else if (cell === 'R') {
                  box.textContent = 'R';
                  box.style.backgroundColor = '#f44336';
              } else if (cell === 'P') {
                  box.textContent = 'P';
                  box.style.backgroundColor = '#2196f3';
              } else {
                  box.textContent = '.';
                  box.style.backgroundColor = '#ddd';
              }
  
              grid.appendChild(box);
          }
      }
  }
  


    function nextTurn() {
      fetch('/next-turn')
        .then(response => response.json())
        .then(data => {
          if (data.message) {
            alert(data.message);  // Show game-over message
            document.getElementById('next-turn-btn').disabled = true;  // Disable button
            return;
          }
          if (data.cityGrid) {
            populateGrid(data.cityGrid);
          }
        })
        .catch(error => console.error('Error:', error));
    }
