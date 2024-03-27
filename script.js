document.addEventListener("DOMContentLoaded", () => {
  const apiKey = "WK8q9xsTpPb2kRCSX0siCczAHMR4R5vjCc8eN10fsKJ5a9DZFzo0Dedw";
  const searchInput = document.getElementById("search-input");
  const searchButton = document.getElementById("search-btn");
  const searchResultsContainer = document.getElementById("search-results");
  const similarResultsContainer = document.getElementById(
    "similar-results-container"
  );
  const wishlistItemsContainer = document.getElementById("wishlist-items");

  // Load wishlist items from local storage
  const loadWishlistFromStorage = () => {
    const storedItems = localStorage.getItem("wishlistItems");
    if (storedItems) {
      const parsedItems = JSON.parse(storedItems);
      parsedItems.forEach((item) => {
        const imageElement = document.createElement("img");
        imageElement.src = item.imageUrl;

        const nameElement = document.createElement("div");
        nameElement.classList.add("image-name");
        nameElement.textContent = item.name;

        const cardContainer = document.createElement("div");
        cardContainer.classList.add("image-card", "wishlist-card");
        cardContainer.appendChild(imageElement);
        cardContainer.appendChild(nameElement);
        wishlistItemsContainer.appendChild(cardContainer);
      });
    }
  };

  // Load wishlist items from local storage on page load
  loadWishlistFromStorage();

  // Function to fetch search results from Pexels API
  const fetchSearchResults = async (query) => {
    try {
      const response = await fetch(
        `https://api.pexels.com/v1/search?query=${query}&per_page=10`,
        {
          headers: {
            Authorization: apiKey,
          },
        }
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      return data.photos;
    } catch (error) {
      console.error("Error fetching data:", error);
      return [];
    }
  };

  // Function to update local storage with wishlist items
  const updateLocalStorage = () => {
    const wishlistItems = Array.from(wishlistItemsContainer.children).map(
      (card) => {
        return {
          imageUrl: card.querySelector("img").src,
          name: card.querySelector(".image-name").textContent,
        };
      }
    );
    localStorage.setItem("wishlistItems", JSON.stringify(wishlistItems));
  };

  // Function to create an image card
  const createImageCard = (photo, isWishlistItem) => {
    const imageUrl = photo.src.medium;
    const imageElement = document.createElement("img");
    imageElement.src = imageUrl;

    const heartButton = document.createElement("button");
    heartButton.classList.add("heart-button");
    heartButton.innerHTML = isWishlistItem ? "&#x2665;" : "&#x2661;"; // Filled or empty heart symbol

    const cardContainer = document.createElement("div");
    cardContainer.classList.add("image-card");
    cardContainer.appendChild(imageElement);
    cardContainer.appendChild(heartButton);

    heartButton.addEventListener("click", (event) => {
      event.stopPropagation(); // Prevent image click event when clicking the heart button
      toggleWishlistItem(photo, cardContainer, heartButton);
    });

    return cardContainer;
  };

  // Function to toggle wishlist item and update UI
  const toggleWishlistItem = (photo, cardContainer, heartButton) => {
    if (wishlistItemsContainer.contains(cardContainer)) {
      wishlistItemsContainer.removeChild(cardContainer); // Remove from wishlist
      heartButton.innerHTML = "&#x2661;"; // Change heart symbol to empty
      similarResultsContainer.appendChild(cardContainer); // Add back to search results
    } else {
      wishlistItemsContainer.appendChild(cardContainer); // Add to wishlist
      heartButton.innerHTML = "&#x2665;"; // Change heart symbol to filled
    }
    updateLocalStorage();
  };

  // Function to display search results
  const displaySearchResults = (results, isWishlistItem) => {
    const imageContainer = isWishlistItem
      ? wishlistItemsContainer
      : similarResultsContainer;
    imageContainer.innerHTML = ""; // Clear previous results
    if (results.length === 0) {
      imageContainer.innerHTML = "<p>No results found.</p>";
      return;
    }
    results.forEach((photo) => {
      const imageCard = createImageCard(photo, isWishlistItem);
      imageContainer.appendChild(imageCard);
    });
    updateLocalStorage();
  };

  // Event listener for the search button
  searchButton.addEventListener("click", async () => {
    const query = searchInput.value.trim();
    if (query !== "") {
      const searchResults = await fetchSearchResults(query);
      displaySearchResults(searchResults, false); // Display in similar results section
    } else {
      searchResultsContainer.innerHTML = "<p>Please enter a search query.</p>";
    }
  });
});
