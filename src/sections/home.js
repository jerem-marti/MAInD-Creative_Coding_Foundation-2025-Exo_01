import { getAllPins, textSearchPins } from "../indexed-db";

// Elements
const pinsContainer = document.getElementById('masonry-list');

const displayPins = (pins) => {
    // Clear existing pins
    pinsContainer.innerHTML = '';
    
    // Add new pins
    pins.forEach(pin => {
        const pinElement = document.createElement('pin-card');
        pinElement.setAttribute('id', pin.id);
        pinElement.setAttribute('color', pin.color);
        pinElement.setAttribute('title', pin.title);
        pinElement.setAttribute('description', pin.description);
        pinElement.setAttribute('image', pin.image);
        pinElement.setAttribute('link', pin.link);
        pinElement.setAttribute('created-at', pin.createdAt);
        pinElement.setAttribute('updated-at', pin.updatedAt);
        pinsContainer.appendChild(pinElement);
    });
};

const displayAllPins = () => {
    getAllPins().then(pins => {
        console.log('Displaying all pins:', pins);
        displayPins(pins);
    });
};

const displaySearchedPins = (query) => {
    textSearchPins(query).then(pins => displayPins(pins));
};

export { displayAllPins, displaySearchedPins }