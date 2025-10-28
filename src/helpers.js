// Hide the active section and show the section coresponding to the given id
const displaySection = (id) => {
    // Hide the currently active section if any
    document.querySelector('section.active')?.classList.remove('active');

    // Try to show the section corresponding to the given id 
    document.querySelector(`#${id}-section`)?.classList.add('active');

    if(id === 'create') {
        // Hide the search bar when displaying the create section
        document.querySelector('header').classList.add('no-search-bar');
        // Reset the create pin form
        const createPinForm = document.querySelector('#create-pin-form');
        createPinForm.reset();
        // Reset the image preview
        const imagePreview = createPinForm.querySelector('img');
        imagePreview.src = '';
    } else {
        // Show the search bar for other sections
        document.querySelector('header').classList.remove('no-search-bar');
    }
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