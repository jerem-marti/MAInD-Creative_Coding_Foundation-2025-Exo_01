////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Navigation helper functions

// Hide the active section and show the section coresponding to the given id
const displaySection = (id) => {
    // Hide the currently active section if any
    document.querySelectorAll('section.active')?.forEach(section => section.classList.remove('active'));

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

////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Dialog helper functions

const dialog = document.querySelector('dialog');

const textDialog = (message, duration = 2000, type = 'neutral') => {
    dialog.textContent = message;
    dialog.className = type;
    dialog.showModal();

    setTimeout(() => {
        dialog.close();
    }, duration);
};

const confirmDialog = (question, primaryBtnText, secondaryBtnText, reverse = false) => {
    return new Promise((resolve) => {

        // Clear previous dialog content
        const dialog = document.querySelector('dialog');
        dialog.className = 'confirm';
        dialog.innerHTML = `
            <div class="dialog-header">
                <span class="material-icons dialog-icon">warning</span>
                <h2>Confirmation</h2>
            </div>
            <p>${question}</p>
            <div class="dialog-buttons ${reverse ? 'reverse' : ''}">
                <button class="primary">${primaryBtnText}</button>
                <button class="secondary">${secondaryBtnText}</button>
            </div>
        `;

        dialog.querySelector('.primary').addEventListener('click', () => {
            dialog.classList.remove('confirm');
            dialog.close();
            resolve(true);
        });

        dialog.querySelector('.secondary').addEventListener('click', () => {
            dialog.classList.remove('confirm');
            dialog.close();
            resolve(false);
        });

        // dialog.appendChild(iconElem);

        // // Create and append question element to the dialog
        // const questionElem = document.createElement('p');
        // questionElem.textContent = question;
        // dialog.appendChild(questionElem);

        // // Create buttons container
        // const buttonsDiv = document.createElement('div');
        // buttonsDiv.className = 'dialog-buttons';
        // if (reverse) {
        //     buttonsDiv.classList.add('reverse');
        // }
        // dialog.appendChild(buttonsDiv);

        // // Append primary button to the dialog
        // const primaryBtn = document.createElement('button');
        // primaryBtn.textContent = primaryBtnText;
        // primaryBtn.className = 'primary';
        // primaryBtn.addEventListener('click', () => {
        //     dialog.close();
        //     resolve(true);
        // });
        // buttonsDiv.appendChild(primaryBtn);

        // // Append secondary button to the dialog
        // const secondaryBtn = document.createElement('button');
        // secondaryBtn.textContent = secondaryBtnText;
        // secondaryBtn.className = 'secondary';
        // secondaryBtn.addEventListener('click', () => {
        //     dialog.close();
        //     resolve(false);
        // });
        // buttonsDiv.appendChild(secondaryBtn);

        dialog.showModal();
    });
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Color helper functions

const calcTextColor = (bgColor) => {
    // Calculate the perceptive luminance (aka luma) - human eye favors green color
    const r = bgColor.r;
    const g = bgColor.g;
    const b = bgColor.b;
    const luma = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

    // Return a contrasting text color (black or white) based on the background color's luminance
    return luma > 0.5 ? 'black' : 'white';
};

export {displaySection, activateLink, textDialog, confirmDialog, calcTextColor};