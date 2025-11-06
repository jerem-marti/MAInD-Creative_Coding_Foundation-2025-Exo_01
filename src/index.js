/**
 * @file Router for the application.
 * Handles navigation between different sections based on URL hash.
 */
import './elements/pin-card.js';

import {displaySection, activateLink} from './helpers.js';

import {displayAllPins, displaySearchedPins} from './sections/pins.js';
import {displayForm, isLeavingFormUnsaved} from './sections/create.js';
import {displayPin} from './sections/pin.js';

const router = () => {
    
    const hashs = window.location.hash.split('-');

    activateLink(hashs[0]);

    switch(hashs[0]) {
        case '#home':
            displaySection('pins');
            displayAllPins();
            break;
        case '#create':
            displaySection('create');
            if(hashs[1]){
                displayForm(parseInt(hashs[1]));
            } else {
                displayForm();
            }
            break;
        case '#pins':
            if(hashs[1]){
                displaySection(`pin`);
                displayPin(parseInt(hashs[1]));
            } else {
                window.location.hash = '#home';
                displaySection('pins');
            }
            break;
        case '#search':
            displaySection('pins');
            if(hashs[1]){
                displaySearchedPins(decodeURIComponent(hashs[1]));
            } else {
                window.location.hash = '#home';
                displaySection('pins');
            }
            break;
        // future sections cases go here
        default:
            // If the hash does not match any section, display the home section
            window.location.hash = '#home';
            displaySection('pins');
    }
};

// Listen to hash changes to implement the router
window.addEventListener('hashchange', (event) => {
    isLeavingFormUnsaved().then((hasUnsavedChanges) => {
        if (!hasUnsavedChanges) {
            router();
        }
    });
});

// Call the router once
router();