import './elements/pin-card.js';

import {displaySection, activateLink} from './helpers.js';

// future sections imports go here

const router = () => {
    
    const hashs = window.location.hash.split('-');

    activateLink(hashs[0]);

    switch(hashs[0]) {
        case '#home':
            displaySection('pins');
            // future pins list display code goes here
            break;
        case '#create':
            displaySection('create');
            break;
        case '#edit':
            displaySection('create');
            // future pin edit display code goes here
            break;
        case '#pins':
            if(hashs[1]){
                displaySection(`pin`);
                // future pin detail display code goes here
            } else {
                window.location.hash = '#home';
                displaySection('pins');
            }
            break;
        case '#search':
            displaySection('pins');
            // future search display code goes here
            break;
        // future sections cases go here
        default:
            // If the hash does not match any section, display the home section
            window.location.hash = '#home';
            displaySection('pins');
    }
};

// Listen to hash changes to implement the router
window.addEventListener('hashchange', router);

// Call the router once
router();