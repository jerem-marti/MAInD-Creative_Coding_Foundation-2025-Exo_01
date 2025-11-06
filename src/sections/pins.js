/**
 * @file Controller of the pins display section.
 */
import { getAllPins, textSearchPins } from "../indexed-db";

// Elements
const pinsContainer = document.getElementById('masonry-list');
const searchInput = document.getElementById('search-input');

/** 
 * Display a list of pins in the pins section.
 * @param {Array} pins
 */
const displayPins = (pins) => {
    // Clear existing pins
    pinsContainer.innerHTML = '';
    
    // Add new pins
    pins.forEach(pin => {
        const pinElement = document.createElement('pin-card');
        pinElement.setAttribute('id', pin.id);
        pinElement.setAttribute('color', pin.color);
        pinElement.setAttribute('title', pin.title);
        if(pin.description) pinElement.setAttribute('description', pin.description);
        if(pin.image) pinElement.setAttribute('image', URL.createObjectURL(pin.image));
        if(pin.link) pinElement.setAttribute('link', pin.link);
        pinElement.setAttribute('created-at', pin.createdAt);
        pinElement.setAttribute('updated-at', pin.updatedAt);
        pinsContainer.insertBefore(pinElement, pinsContainer.firstChild);
    });
};

/** 
 * Fetch and display all pins in the pins section.
 * @returns {void}
 */
const displayAllPins = () => {
    searchInput.value = '';
    getAllPins().then(pins => {
        displayPins(pins);
    });
};

/**
 * Fetch and display pins matching the search query.
 * @param {string} query
 * @returns {void}
*/
const displaySearchedPins = (query) => {
    searchInput.value = query;
    textSearchPins(query).then(pins => displayPins(pins));
};

export { displayAllPins, displaySearchedPins }