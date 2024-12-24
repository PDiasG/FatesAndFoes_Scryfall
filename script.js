// Get references to the DOM elements
const searchBar = document.getElementById('search-bar');
const typeFilter = document.getElementById('type-filter');
const colorFilter = document.getElementById('color-filter');
const factionFilter = document.getElementById('faction-filter');
const cardContainer = document.getElementById('card-container');

// Initialize cards array
let cards = [];
let currentPage = 1;
const cardsPerPage = 50;

// Function to fetch and parse CSV
async function fetchCards() {
  try {
    const response = await fetch('cards.csv');
    const csvText = await response.text();

    // Parse the CSV using PapaParse
    const result = Papa.parse(csvText, {
      delimiter: ";",
      header: true, // Use the first row as header
      skipEmptyLines: true, // Skip empty lines in CSV
    });

    // The parsed data is now an array of objects
    cards = result.data; // This is your array of card objects

    populateFilters(cards); // Populate filters based on the new data
    filterCards(); // Apply initial filtering and pagination
  } catch (error) {
    console.error("Error fetching and parsing CSV:", error);
  }
}

// Function to populate the filter dropdowns
function populateFilters(cards) {
  // Populate type filter
  const types = [...new Set(cards.map(card => card.type))];
  types.forEach(type => {
    const option = document.createElement('option');
    option.value = type;
    option.textContent = type;
    typeFilter.appendChild(option);
  });

  // Populate color filter
  const colors = [...new Set(cards.map(card => card.color))];
  colors.forEach(color => {
    const option = document.createElement('option');
    option.value = color;
    option.textContent = color;
    colorFilter.appendChild(option);
  });

  // Populate faction filter
  const factions = [...new Set(cards.map(card => card.faction))];
  factions.forEach(faction => {
    const option = document.createElement('option');
    option.value = faction;
    option.textContent = faction;
    factionFilter.appendChild(option);
  });
}

// Function to display cards in the grid (only images)
function displayCards(cardsToDisplay) {
  cardContainer.innerHTML = ''; // Clear the grid before adding new cards

  // Calculate start and end indices for the current page
  const startIndex = (currentPage - 1) * cardsPerPage;
  const endIndex = startIndex + cardsPerPage;
  const paginatedCards = cardsToDisplay.slice(startIndex, endIndex);

  // Create a div for each card
  paginatedCards.forEach(card => {
    const cardDiv = document.createElement('div');
    cardDiv.classList.add('card');

    const img = document.createElement('img');
    img.src = card.image_url;
    img.alt = card.name;

    cardDiv.appendChild(img);
    cardContainer.appendChild(cardDiv);
  });
}

// Function to create pagination controls
function createPaginationControls(filteredCount) {
  let paginationControls = document.getElementById('pagination-controls');
  if (!paginationControls) {
    paginationControls = document.createElement('div');
    paginationControls.id = 'pagination-controls';
    paginationControls.style.textAlign = 'center';
    document.body.appendChild(paginationControls);
  }

  const totalPages = Math.ceil(filteredCount / cardsPerPage);
  paginationControls.innerHTML = ''; // Clear old controls

  const prevButton = document.createElement('button');
  prevButton.textContent = 'Previous';
  prevButton.disabled = currentPage === 1;
  prevButton.addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage--;
      filterCards(); // Reapply the filters and update pagination
      window.scrollTo(0, 0); // Scroll to the top of the page
    }
  });
  paginationControls.appendChild(prevButton);

  const pageIndicator = document.createElement('span');
  pageIndicator.textContent = ` Page ${currentPage} of ${totalPages} `;
  paginationControls.appendChild(pageIndicator);

  const nextButton = document.createElement('button');
  nextButton.textContent = 'Next';
  nextButton.disabled = currentPage === totalPages;
  nextButton.addEventListener('click', () => {
    if (currentPage < totalPages) {
      currentPage++;
      filterCards(); // Reapply the filters and update pagination
      window.scrollTo(0, 0); // Scroll to the top of the page
    }
  });
  paginationControls.appendChild(nextButton);

  // Update the card count with the current page's displayed range
  updateCardCount(filteredCount);
}

// Function to filter cards based on input
function filterCards(isFilterChanged = false) {
  // Reset to page 1 only if a filter is changed
  if (isFilterChanged) {
    currentPage = 1;
    window.scrollTo(0, 0); // Scroll to the top of the page
  }

  const query = searchBar.value.toLowerCase();
  const selectedType = typeFilter.value.toLowerCase();
  const selectedColor = colorFilter.value.toLowerCase();
  const selectedFaction = factionFilter.value.toLowerCase();

  const filteredCards = cards.filter(card => {
    const matchesName = card.name.toLowerCase().includes(query);
    const matchesType = selectedType ? card.type.toLowerCase() === selectedType : true;
    const matchesColor = selectedColor ? card.color.toLowerCase() === selectedColor : true;
    const matchesFaction = selectedFaction ? card.faction.toLowerCase() === selectedFaction : true;

    return matchesName && matchesType && matchesColor && matchesFaction;
  });

  // Update the filtered card count display
  updateCardCount(filteredCards);

  // Display the filtered cards and pagination controls
  displayCards(filteredCards);
  createPaginationControls(filteredCards.length);
}

// Function to update the displayed card count
function updateCardCount(filteredCount) {
  // Calculate the range of cards being displayed
  const startIndex = (currentPage - 1) * cardsPerPage + 1; // Start card index for current page (1-based)
  const endIndex = Math.min(currentPage * cardsPerPage, filteredCount); // End card index for current page

  // Display the count in "x of y" format
  document.getElementById('filtered-card-count').textContent = `Showing ${startIndex} - ${endIndex} of ${filteredCount} Cards`;
}

// Function to reset filters
function resetFilters() {
    // Reset all filter inputs
    document.getElementById('color-filter').value = '';
    document.getElementById('faction-filter').value = '';
    document.getElementById('type-filter').value = '';
    document.getElementById('search-bar').value = '';  // Reset name filter

    // Call the function to reapply filters (with empty values)
    filterCards(true);
}

// Listen for changes in the search bar or dropdowns
searchBar.addEventListener('input', () => filterCards(true)); // true indicates a filter change
typeFilter.addEventListener('change', () => filterCards(true));
colorFilter.addEventListener('change', () => filterCards(true));
factionFilter.addEventListener('change', () => filterCards(true));
document.getElementById('reset-filters').addEventListener('click', () => resetFilters());

// Fetch and display cards when the page loads
fetchCards();
