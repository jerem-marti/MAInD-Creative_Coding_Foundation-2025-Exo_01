// Hide the active section and show the section coresponding to the given id
const displaySection = (id) => {
    // Hide the currently active section if any
    document.querySelector('section.active')?.classList.remove('active');

    // Try to show the section corresponding to the given id 
    document.querySelector(`#${id}-section`)?.classList.add('active');
};

// Hide the active nav link and show the link coresponding to the given id
const activateLink = (id) => {
    // Deactivate the currently active link if any
    document.querySelector('nav a.active')?.classList.remove('active');

    // Activate the link corresponding to the given id
    document.querySelector(`nav a[href="${id}"]`)?.classList.add('active');
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Search bar helper functions
const searchButton = document.querySelector('#search-button');
const searchInput = document.querySelector('#search-input');

searchInput.addEventListener('input', (event) => {
    if( event.target.value === '') {
        // Clear search
        window.location.hash = 'home';
        searchButton.classList.remove('active');
        return;
    }
    window.location.hash = `#search-${encodeURIComponent(event.target.value)}`;
    searchButton.classList.add('active');
});

searchButton.addEventListener('click', () => {
    if (searchButton.classList.contains('active')) {
        // Clear search
        searchInput.value = '';
        window.location.hash = 'home';
        searchButton.classList.remove('active');
    }
});

export {displaySection, activateLink};