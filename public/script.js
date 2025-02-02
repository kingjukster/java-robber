async function fetchGrid() {
    try {
      const response = await fetch('/grid');
      const gridText = await response.text();
      document.getElementById('grid').textContent = gridText;
    } catch (error) {
      console.error('Error fetching grid:', error);
    }
  }
  
  fetchGrid();
  setInterval(fetchGrid, 1000); // Fetch grid every second to update
  