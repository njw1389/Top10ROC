document.addEventListener('click', function(event) {
    var target = event.target.closest('a');
    if (target && target.href && location.host === target.host) {
        event.preventDefault();
        location.href = target.href;
    }
});

//document.addEventListener('contextmenu', function(e) {
    //e.preventDefault(); // Prevents the default context menu from showing
//});

// Disable text selection on the entire document
document.onselectstart = function () {
    return false;
}; 

// This event listener waits for the initial HTML document to be loaded and parsed
document.addEventListener('DOMContentLoaded', async () => {
    let placesData = [];

    try {
        const response = await fetch('assets/data/data.json'); 
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        placesData = await response.json(); 
    } catch (error) {
        console.error("Could not load places data: ", error);
    }

    function splitPlacesData(placesData) {
        // Filter activities places
        const activitiesPlaces = placesData.places.filter(place => place.category === "Activity");
    
        // Filter food places (restaurants)
        const foodPlaces = placesData.places.filter(place => place.category === "Restaurant");
    
        // Return the two datasets
        return { activitiesPlaces, foodPlaces };
    }

    const { activitiesPlaces, foodPlaces } = splitPlacesData(placesData);
    
    const slideLeft = document.getElementById('slideLeft');
    const slideRight = document.getElementById('slideRight');
    let currentSlideIndex = 0; // To keep track of the current slide
    let currentPlacePhotos = []; // To store the current place's photo list

    function updateSlide(direction) {
        // Update current slide index based on direction
        if (direction === 'left') {
            currentSlideIndex = (currentSlideIndex - 1 + currentPlacePhotos.length) % currentPlacePhotos.length;
        } else if (direction === 'right') {
            currentSlideIndex = (currentSlideIndex + 1) % currentPlacePhotos.length;
        }

        // Update the modal photo's background image
        placePhoto.style.backgroundImage = `url('${currentPlacePhotos[currentSlideIndex]}')`;
    }

    slideLeft.addEventListener('click', () => updateSlide('left'));
    slideRight.addEventListener('click', () => updateSlide('right'));

    const placesList = document.getElementById('placesList');
    const placeModal = document.getElementById('placeModal');
    const placeTitle = document.getElementById('placeTitle');
    const placeDescription = document.getElementById('placeDescription');
    const placeAddress = document.getElementById('placeAddress');
    const placeWebsite = document.getElementById('placeWebsite');
    const placePhone = document.getElementById('placePhone');
    const placeHours = document.getElementById('placeHours');
    const closeModal = document.getElementsByClassName('close')[0];
  
    function isCookiesEnabled() {
        try {
            document.cookie = "testcookie; SameSite=None; Secure";
            const cookieEnabled = document.cookie.indexOf("testcookie") !== -1;
            document.cookie = "testcookie=; SameSite=None; Secure";
            return cookieEnabled;
        } catch {
            return false;
        }
    }
      
    function getFavorites() {
        if (isCookiesEnabled()) {
            const cookie = document.cookie.split('; ').find(row => row.startsWith('favorites='));
            return cookie ? JSON.parse(cookie.split('=')[1]) : [];
        } else {
            const favorites = localStorage.getItem('favorites');
            return favorites ? JSON.parse(favorites) : [];
        }
    }
      
    function setFavorites(favorites) {
        if (isCookiesEnabled()) {
            document.cookie = `favorites=${JSON.stringify(favorites)};path=/; SameSite=None; Secure`;
        } else {
            localStorage.setItem('favorites', JSON.stringify(favorites));
        }
    }

    let isAnimating = false; // Flag to track animation state
    let isOpen = false; // Track whether the modal is open
    const currentPage = window.location.pathname.split("/").pop(); // Detect current page by checking the URL: This will give you the filename, such as 'favorites.html' or 'index.html'
  
    function preloadImages(imageUrls, callback) {
        let loadedCount = 0;
        let imagesToLoad = imageUrls.length;
    
        imageUrls.forEach(url => {
            const img = new Image();
            img.onload = () => {
                loadedCount++;
                if (loadedCount === imagesToLoad) {
                    console.log('All images preloaded');
                    if (typeof callback === 'function') {
                        callback(); // All images are loaded, call the callback if provided
                    }
                }
            };
            img.onerror = () => {
                console.error('Error loading image:', url);
            };
            img.src = url;
        });
    }    

    // Function to open the modal with slide-in animation
    function openModal(place) {
        if (isAnimating || isOpen) return; // Prevent opening if animating or already open

        isAnimating = true; // Set animation flag

        currentPlacePhotos = place.photolist;

        preloadImages(currentPlacePhotos);

        // Update modal content
        placeTitle.textContent = place.name;
        placeDescription.textContent = place.description;
        placeAddress.innerHTML = `<a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.address)}" target="_blank">${place.address}</a>`;
        placeWebsite.innerHTML = `<a href="${place.website}" target="_blank">${place.website}</a>`;
        placePhone.innerHTML = `<a href="tel:${place.phone}">${place.phone}</a>`;
        
        // Get current day of the week
        const days = ['Sunday:', 'Monday:', 'Tuesday:', 'Wednesday:', 'Thursday:', 'Friday:', 'Saturday:'];
        const currentDate = new Date();
        const currentDay = days[currentDate.getDay()];

        // Helper function to convert time to 24-hour format
        function convertTo24HourFormat(hour, minute, meridian) {
            hour = parseInt(hour);
            minute = parseInt(minute) / 60; // Convert minutes to a decimal
            if (meridian === 'PM' && hour !== 12) {
                hour += 12; // Convert PM times to 24-hour format
            } else if (meridian === 'AM' && hour === 12) {
                hour = 0; // Convert 12 AM to 00 hours
            }
            return hour + minute;
        }

        // Function to determine status color based on the place's current status
        function getStatusColor(status) {
            switch (status) {
                case 'Open':
                    return 'green';
                case 'Closed':
                    return 'red';
                case 'Opening Soon':
                    return 'orange';
                case 'Closing Soon':
                    return 'orange';
                default:
                    return 'black'; // Default color
            }
        }

        // Function to process hours and generate the status (Open, Closed, etc.) based on current time
        
        function determineStatus(hoursMatches, currentTime) {
            let statusText = 'Closed'; // Default status
        
            for (let i = 0; i < hoursMatches.length; i++) {
                let [_, startHour, startMinute = '00', startMeridian, endHour, endMinute = '00', endMeridian] = hoursMatches[i];
                if (!startMeridian) {
                    startMeridian = endMeridian; // Apply the end meridian to the start time if start meridian is not specified
                }
                const openingTime = convertTo24HourFormat(startHour, startMinute, startMeridian);
                const closingTime = convertTo24HourFormat(endHour, endMinute, endMeridian);
        
                // Check if it's the last time slot or a single time slot day
                let isLastSlot = i === hoursMatches.length - 1;
        
                if (currentTime < openingTime) {
                    statusText = 'Opening Soon';
                    break; // Before opening time, no need to check further
                } else if (currentTime >= openingTime && currentTime < closingTime) {
                    statusText = 'Open'; // Within open hours
                    if (closingTime - currentTime <= 1) {
                        statusText = 'Closing Soon'; // Within the last hour before closing
                    }
                    break; // Found a matching time range where it's open
                } else if (!isLastSlot && currentTime >= closingTime && currentTime < convertTo24HourFormat(hoursMatches[i + 1][1], hoursMatches[i + 1][2] || '00', hoursMatches[i + 1][3] || endMeridian)) {
                    statusText = 'Opening Soon'; // After closing time but before the next opening time
                    break;
                } else if (isLastSlot && currentTime >= closingTime) {
                    statusText = 'Closed'; // After the last closing time
                    break;
                }
            }
            return statusText;
        }        

        // Main function to bold the current day's hours
        function boldCurrentDayHours(hoursHTML) {
            const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            const currentDate = new Date();
            const currentDayIndex = currentDate.getDay(); // Get the index of the current day
            const currentTime = currentDate.getHours() + (currentDate.getMinutes() / 60); // Convert current time to decimal hours
            let paragraphs = hoursHTML.split('</p>').map(paragraph => paragraph + '</p>').slice(0, -1); // Split hours HTML into paragraphs

            let orderedParagraphs = reorderParagraphsByCurrentDay(paragraphs, currentDayIndex, days); // Reorder paragraphs so the current day is first
            let statusText = processCurrentDayHours(orderedParagraphs[0], currentTime); // Process current day's hours to determine status
            const statusSpan = `<span style="color: ${getStatusColor(statusText)};">${statusText}</span>`; // Wrap status in a span with color
            orderedParagraphs[0] = `<strong>${days[currentDayIndex]}</strong> - ${statusSpan}${orderedParagraphs[0].substring(orderedParagraphs[0].indexOf(':'))}`; // Update the current day paragraph

            return orderedParagraphs.join(''); // Return the updated hours HTML
        }

        // Function to reorder paragraphs to start with the current day
        function reorderParagraphsByCurrentDay(paragraphs, currentDayIndex, days) {
            let orderedParagraphs = [];
            for (let i = currentDayIndex; i < currentDayIndex + 7; i++) {
                let dayIndex = i % 7; // Wrap around the week
                let dayParagraphIndex = paragraphs.findIndex(paragraph => paragraph.includes(days[dayIndex]));
                if (dayParagraphIndex !== -1) {
                    orderedParagraphs.push(paragraphs[dayParagraphIndex]);
                }
            }
            return orderedParagraphs;
        }

        // Function to process the current day's hours paragraph and determine the status
        function processCurrentDayHours(currentDayHours, currentTime) {
            if (currentDayHours.includes('Closed')) {
                return 'Closed';
            } else if (currentDayHours.includes('All Day')) {
                return 'Open';
            } else {
                const hoursMatches = [...currentDayHours.matchAll(/(\d+):(\d+)?(AM|PM)? - (\d+):(\d+)(AM|PM)/g)];
                return determineStatus(hoursMatches, currentTime);
            }
        }
        
        function cleanUpAndWrapHours(htmlString) {
            // Remove empty <p> tags
            let cleanedHtml = htmlString.replace(/<p><\/p>/g, '');
            
            // Split the cleaned HTML into an array of lines
            let lines = cleanedHtml.split('</p>');
            
            // Process each line to ensure it's properly wrapped in <p> tags
            let processedLines = lines.map(line => {
                // Check if the line is already properly wrapped or not empty
                if (line.trim() && !line.startsWith('<p>')) {
                    return `<p>${line}</p>`; // Wrap in <p> tags
                }
                return line; // Return the line as is if it's empty or already wrapped
            });
        
            // Join the processed lines back into a single HTML string
            return processedLines.join('');
        }        

        // Apply the bolding function to the place's hours and set the innerHTML
        function updatePlaceStatus() {
            let boldedHoursHTML = boldCurrentDayHours(place.hours); // Existing call to bold the current day's hours
            let cleanedAndWrappedHTML = cleanUpAndWrapHours(boldedHoursHTML); // New call to clean and wrap the HTML
            placeHours.innerHTML = cleanedAndWrappedHTML; // Set the cleaned and wrapped HTML as the innerHTML
        }        

        let updateIntervalId = null;
        let updateTimeoutId = null;

        function startAdjustedInterval() {
            // Clear any existing timeout and interval to prevent multiple intervals from running
            clearTimeout(updateTimeoutId);
            clearInterval(updateIntervalId);

            // Update status immediately for the current modal
            updatePlaceStatus();

            // Calculate milliseconds until the next full minute
            const now = new Date();
            const timeUntilNextMinute = (60 - now.getSeconds()) * 1000 - now.getMilliseconds();

            // Adjust the first interval to sync with the start of the next minute
            updateTimeoutId = setTimeout(() => {
                updatePlaceStatus(); // Ensure update at the start of the next minute

                // Then, continue updating at the start of each new minute
                updateIntervalId = setInterval(updatePlaceStatus, 60000);
            }, timeUntilNextMinute);
        }
        
        // Initialize the adjusted interval on page load
        startAdjustedInterval();        

        // Initialize the slideshow
        currentSlideIndex = 0; // Reset slide index each time a modal opens
        currentPlacePhotos = place.photolist; // Update the photo list
        updateSlide(); // Initialize the slideshow with the first photo

        // Add or update star icon for favorites
        const starIcon = document.createElement('i');
        starIcon.classList = 'fa fa-star star-icon';
        starIcon.style.color = getFavorites().includes(place.id) ? 'gold' : 'grey'; // Change color based on favorite status
        starIcon.onclick = function() {
            // Toggle favorite status on click
            const favorites = getFavorites();
            const index = favorites.indexOf(place.id);
            if (index === -1) {
                favorites.push(place.id);
                starIcon.style.color = 'gold';
            } else {
                favorites.splice(index, 1);
                starIcon.style.color = 'grey';
            }
            setFavorites(favorites); // Update favorites in storage
            favoriteModified = true;
        };
        // Ensure only one star icon is added
        const modalContent = document.querySelector('.modal-content');
        const existingStarIcon = modalContent.querySelector('.star-icon');
        if (existingStarIcon) {
            existingStarIcon.remove();
        }
        modalContent.insertBefore(starIcon, modalContent.firstChild); // Insert the star at the beginning of the modal content

        // Disable scrolling on the main page
        document.body.style.overflow = 'hidden';

        // Existing code to display the modal
        placeModal.style.transform = 'translateX(-100%)';
        placeModal.style.display = 'block';
        setTimeout(() => {
            placeModal.style.transform = 'translateX(0)';
            isAnimating = false; // Reset animation flag after animation starts
            isOpen = true; // Set modal to open
        }, 20); // A delay of 20 milliseconds is usually enough
    }       

    // Function to close the modal with slide-out animation
    function closeModalFunc() {
        if (isAnimating || !isOpen) return; // Prevent closing if animating or already closed

        isAnimating = true; // Set animation flag
        placeModal.style.transform = 'translateX(-100%)';

        placeModal.addEventListener('transitionend', function handler() {
            placeModal.style.display = 'none';
            placeModal.removeEventListener('transitionend', handler);
            isAnimating = false; // Reset animation flag
            isOpen = false; // Set modal to closed

            // Re-enable scrolling on the main page
            document.body.style.overflow = '';

            // If a favorite was modified, refresh the favorites display
            if (currentPage === 'favorites.html') {
                filterAndDisplayFavorites(); // Refresh the display of favorites
                favoriteModified = false; // Reset the flag after refreshing
            }
        });
    }
  
    closeModal.onclick = closeModalFunc;
    window.onclick = function(event) {
        if (event.target === placeModal) {
            closeModalFunc();
        }
    };

    const favoritesList = document.getElementById('mainPage'); // Adjust if the actual container has a different ID
    
    function displayFavorites() {
        const favorites = getFavorites(); // Retrieve favorite place IDs
        const favoritePlaces = placesData.places.filter(place => favorites.includes(place.id)); // Filter places to get only favorites
    
        favoritePlaces.forEach(place => {
            const placeDiv = document.createElement('div');
            placeDiv.className = 'placeItem';
            placeDiv.style.backgroundImage = `url('${place.photolist[0]}')`; // Use the first image as background
    
            // Create and append the fake button
            const fakeButton = document.createElement('div');
            fakeButton.className = 'fake-button';
            fakeButton.textContent = 'Learn More';
            placeDiv.appendChild(fakeButton);
    
            placeDiv.onclick = () => {
                openModal(place); // Ensure openModal function can handle being called from favorites page
            };
    
            // Append the placeDiv to the favorites list container
            favoritesList.appendChild(placeDiv);
        });
    }

    // First, get references to both checkboxes
    if (currentPage === 'index.html') {
        const chkActivities = document.getElementById('chkActivities');
        const chkRestaurants = document.getElementById('chkRestaurants');
    }

    function loadCapsuleState() {
        let stateJson;
    
        if (navigator.cookieEnabled) {
            const name = "capsuleState=";
            const decodedCookie = decodeURIComponent(document.cookie);
            const ca = decodedCookie.split(';');
            for(let i = 0; i <ca.length; i++) {
                let c = ca[i];
                while (c.charAt(0) === ' ') {
                    c = c.substring(1);
                }
                if (c.indexOf(name) === 0) {
                    stateJson = c.substring(name.length, c.length);
                    break;
                }
            }
        } else {
            stateJson = localStorage.getItem('capsuleState');
        }
    
        if (stateJson) {
            const state = JSON.parse(stateJson);
            chkActivities.checked = state.activities;
            chkRestaurants.checked = state.restaurants;
    
            // Update and render places based on the loaded state
            updateAndRenderPlaces();
        } else {
            // Default state if nothing is saved
            chkActivities.checked = true;
            chkRestaurants.checked = false;
            updateAndRenderPlaces();
        }
    }    

    function saveCapsuleState() {
        const state = {
            activities: chkActivities.checked,
            restaurants: chkRestaurants.checked
        };
        const stateJson = JSON.stringify(state);
    
        if (navigator.cookieEnabled) {
            // Expires in 7 days
            const d = new Date();
            d.setTime(d.getTime() + (7*24*60*60*1000));
            const expires = "expires="+ d.toUTCString();
            // Adding Secure and SameSite=None attributes
            document.cookie = "capsuleState=" + stateJson + ";" + expires + ";path=/;Secure;SameSite=None";
        } else {
            localStorage.setItem('capsuleState', stateJson);
        }
    }       

    // Function to handle checkbox changes and update the places list
    function handleCheckboxChange(e) {
        if (this.checked) {
            // If the checkbox is being checked, uncheck the other one
            if (this.id === 'chkActivities') {
                chkRestaurants.checked = false;
            } else if (this.id === 'chkRestaurants') {
                chkActivities.checked = false;
            }
            // Update and render places based on the current selection
            updateAndRenderPlaces();
            saveCapsuleState();
        } else {
            // Prevent the checkbox from being unchecked directly
            e.preventDefault();
            this.checked = true;
        }
    }

    // Function to update and render places based on the checkbox selection
    function updateAndRenderPlaces() {
        // Clear the current places list
        placesList.innerHTML = '';
        
        // Filter placesData based on the selected category
        const selectedPlaces = chkActivities.checked ? activitiesPlaces : foodPlaces;
        
        // Render the filtered places
        renderPlaces(selectedPlaces);
    }

    // Add event listeners to both checkboxes and bind them to the function
    if (currentPage === 'index.html') {
        chkActivities.addEventListener('change', handleCheckboxChange);
        chkRestaurants.addEventListener('change', handleCheckboxChange);
    }

    // Initialize one of them as checked to ensure one is always selected
    if (currentPage === 'index.html') {
        chkActivities.checked = true; // For example, default to 'Activities' checked
    }

    function renderPlaces(selectedPlaces) {
        // Render places into the DOM
        selectedPlaces.slice().reverse().forEach(place => {
            const cardDiv = document.createElement('div');
            cardDiv.className = 'card';

            const placeDiv = document.createElement('div');
            placeDiv.className = 'placeItem no-select loading-background'; // Add loading-background class
            placeDiv.style.backgroundImage = `url('${place.photolist[0]}')`; // Set the first image as background

            const img = new Image();
            img.onload = function() {
                placeDiv.classList.remove('loading-background'); // Remove the loading background once the image is loaded
            };
            img.src = place.photolist[0]; // This triggers the loading
    
            let rank = selectedPlaces.indexOf(place) + 1; // Adjust rank based on the current array iteration
            // Create the heading with Rank and Place Name
            const rankHeading = document.createElement('h2');
            rankHeading.textContent = `Rank ${rank}: ${place.name}`;
    
            // Create and append the fake button
            const fakeButton = document.createElement('div');
            fakeButton.className = 'fake-button';
            fakeButton.textContent = 'Learn More';
            placeDiv.appendChild(fakeButton);
    
            placeDiv.onclick = () => {
                openModal(place);
            };
    
            // Append the rank heading before the placeDiv
            cardDiv.appendChild(rankHeading);
            cardDiv.appendChild(placeDiv);
            placesList.appendChild(cardDiv);
        });
    }    

    if (currentPage === 'favorites.html') {
        // Run only on favorites.html
        displayFavorites();
    } else if (currentPage === 'index.html') {
        updateAndRenderPlaces();
    } 

    // New code to handle sort-by-dropdown logic
    const sortActivitiesCheckbox = document.getElementById('sort-activities');
    const sortRestaurantsCheckbox = document.getElementById('sort-restaurants');

    function filterAndDisplayFavorites() {
        // Clear existing favorites from the display
        favoritesList.innerHTML = '';

        let filterCategory = [];
        if (sortActivitiesCheckbox.checked && sortRestaurantsCheckbox.checked) {
            filterCategory = ['Activity', 'Restaurant'];
        } else if (sortActivitiesCheckbox.checked) {
            filterCategory = ['Activity'];
        } else if (sortRestaurantsCheckbox.checked) {
            filterCategory = ['Restaurant'];
        }

        const favorites = getFavorites(); // Retrieve favorite place IDs
        let filteredPlaces = placesData.places.filter(place => favorites.includes(place.id) && filterCategory.includes(place.category));

        // Adjusted logic to determine which message to display
        if (filteredPlaces.length > 0) {
            displayPlaces(filteredPlaces);
        } else {
            // Check if any checkbox is unchecked, display the "no favorites" message
            if (!sortActivitiesCheckbox.checked || !sortRestaurantsCheckbox.checked) {
                displayNoFavoritesMessage(true);
            } else {
                // If both checkboxes are checked but no favorites match, display a different message
                displayNoFavoritesMessage(false);
            }
        }
    }

    function displayNoFavoritesMessage(isFilterEmpty) {
        const messageDivContainer = document.createElement('div');
        messageDivContainer.className = 'no-favorites-message-container';

        const messageDiv = document.createElement('div');
        messageDiv.className = 'no-favorites-message';

        if (isFilterEmpty) {
            messageDiv.innerHTML = '<p>No favorites available. Please reset filters.</p>';
            const resetButton = document.createElement('button');
            resetButton.textContent = 'Reset Filters';
            resetButton.onclick = function() {
                sortActivitiesCheckbox.checked = true;
                sortRestaurantsCheckbox.checked = true;
                filterAndDisplayFavorites();
            };
            messageDiv.appendChild(resetButton);
            messageDivContainer.appendChild(messageDiv);
        } else {
            messageDiv.innerHTML = '<p>You don\'t have any favorites. Please look at our ranking and add some.</p>';
            const goToIndexButton = document.createElement('button');
            goToIndexButton.textContent = 'View Rankings';
            goToIndexButton.onclick = function() {
                window.location.href = 'index.html';
            };
            messageDiv.appendChild(goToIndexButton);
            messageDivContainer.appendChild(messageDiv);
        }

        favoritesList.appendChild(messageDivContainer);
    }

    // Helper function to display places
    function displayPlaces(places) {
        places.forEach(place => {
            const cardDiv = document.createElement('div');
            cardDiv.className = 'card';

            const placeDiv = document.createElement('div');
            placeDiv.className = 'placeItem';
            placeDiv.style.backgroundImage = `url('${place.photolist[0]}')`;

            const rankHeading = document.createElement('h2');
            rankHeading.textContent = `${place.name}`;

            const fakeButton = document.createElement('div');
            fakeButton.className = 'fake-button';
            fakeButton.textContent = 'Learn More';
            placeDiv.appendChild(fakeButton);

            placeDiv.onclick = () => openModal(place);
        
            cardDiv.appendChild(rankHeading);
            cardDiv.appendChild(placeDiv);
            favoritesList.appendChild(cardDiv);
        });
    }

    // Event listeners for checkbox changes
    if (currentPage === 'favorites.html') {
        sortActivitiesCheckbox.addEventListener('change', filterAndDisplayFavorites);
        sortRestaurantsCheckbox.addEventListener('change', filterAndDisplayFavorites);
    }

    // Call filterAndDisplayFavorites initially to display the correct favorites based on the initial checkbox states
    if (currentPage === 'favorites.html') {
        filterAndDisplayFavorites();
    }

    // Toggle for the dropdown menu
    const sortByButton = document.querySelector('.sort-by-dropdown button');
    const dropdownMenu = document.querySelector('.sort-by-dropdown > div');
    const sortByIcon = document.getElementById('SortByIcon');
    let dropdownIsOpen = false; // Track the state of the dropdown
    let isAnimating2 = false; // Flag to prevent re-triggering animations

    function toggleDropdown() {
        if (isAnimating2) return; // Exit if an animation is already in progress

        if (dropdownIsOpen) {
            CloseAnimation();
            sortByButton.style.setProperty('box-shadow', '0 2px 5px rgba(0, 0, 0, 0.2)');
            setTimeout(() => {
                sortByButton.style.setProperty('border-bottom-right-radius', '10px');
                sortByButton.style.setProperty('border-bottom-left-radius', '10px');
            }, 100);
        } else {
            sortByButton.style.setProperty('box-shadow', '0 0 0 rgba(0, 0, 0, 0)');
            sortByButton.style.setProperty('border-bottom-right-radius', '0');
            sortByButton.style.setProperty('border-bottom-left-radius', '0');
            OpenAnimation();
        }
    }

    // Animation for opening the dropdown
    function OpenAnimation() {
        const start = performance.now();
        const duration = 300; // Animation duration in milliseconds
        const initialRotation = 0;
        const finalRotation = 180;
        const initialOpacity = 0;
        const finalOpacity = 1;

        function animate(time) {
            const elapsedTime = time - start;
            const rotationProgress = elapsedTime / duration;
            const opacityProgress = elapsedTime / (duration / 2); // Faster opacity change

            if (elapsedTime < duration) {
                const currentRotation = initialRotation + (finalRotation - initialRotation) * rotationProgress;
                const currentOpacity = initialOpacity + (finalOpacity - initialOpacity) * Math.min(opacityProgress, 1);
                sortByIcon.style.transform = `rotate(${currentRotation}deg)`;
                dropdownMenu.style.opacity = currentOpacity;
                dropdownMenu.style.display = 'block';
                requestAnimationFrame(animate);
            } else {
                sortByIcon.style.transform = `rotate(${finalRotation}deg)`;
                dropdownMenu.style.opacity = finalOpacity;
                dropdownIsOpen = true;
                isAnimating2 = false;
            }
        }
        isAnimating2 = true;
        requestAnimationFrame(animate);
    }

    // Animation for closing the dropdown
    function CloseAnimation() {
        const start = performance.now();
        const duration = 300; // Animation duration in milliseconds
        const initialRotation = 180;
        const finalRotation = 0;
        const initialOpacity = 1;
        const finalOpacity = 0;

        function animate(time) {
            const elapsedTime = time - start;
            const rotationProgress = elapsedTime / duration;
            const opacityProgress = elapsedTime / (duration / 2); // Faster opacity change

            if (elapsedTime < duration) {
                const currentRotation = initialRotation + (finalRotation - initialRotation) * rotationProgress;
                const currentOpacity = initialOpacity + (finalOpacity - initialOpacity) * Math.min(opacityProgress, 1);
                sortByIcon.style.transform = `rotate(${currentRotation}deg)`;
                dropdownMenu.style.opacity = currentOpacity;
                requestAnimationFrame(animate);
            } else {
                sortByIcon.style.transform = `rotate(${finalRotation}deg)`;
                dropdownMenu.style.opacity = finalOpacity;
                dropdownMenu.style.display = 'none';
                dropdownIsOpen = false;
                isAnimating2 = false;
            }
        }
        isAnimating2 = true;
        requestAnimationFrame(animate);
    }

    // Attach the toggle event listener to the button
    if (currentPage === 'favorites.html') {
        sortByButton.addEventListener('click', toggleDropdown);
    }
    
    if (currentPage === 'index.html') {
        loadCapsuleState(); // Load the state from storage when the page loads
    }

    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
          navigator.serviceWorker.register('sw.js').then(registration => {
            console.log('ServiceWorker registration successful with scope: ', registration.scope);
          }, err => {
            console.log('ServiceWorker registration failed: ', err);
          });
        });
    }      
});