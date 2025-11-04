import { getPin, deletePin } from "../indexed-db";
import { textDialog, confirmDialog } from "../helpers";

// Control elements
const backButton = document.getElementById('display-pin-back-button');
const imgFullpageOpen = document.getElementById('display-pin-img-fullpage-open');
const imgFullpageClose = document.getElementById('display-pin-img-fullpage-close');
const imgFullpageDownload = document.getElementById('display-pin-img-fullpage-download');
const copyPinButton = document.getElementById('display-pin-copy-button');
const moreOptionsButton = document.getElementById('display-pin-more-options-button');

// More options popup elements
const moreOptionsPopup = document.getElementById('display-pin-more-options-popup');
const editPinLink = document.getElementById('display-pin-edit-link');
const deletePinButton = document.getElementById('display-pin-delete-button');

// Pin display elements
const pinImage = document.getElementById('display-pin-image');
const pinTitle = document.getElementById('display-pin-title');
const pinLink = document.getElementById('display-pin-link');
const pinDescription = document.getElementById('display-pin-description');
const pinCreatedAt = document.getElementById('display-pin-created-at');
const pinUpdatedAt = document.getElementById('display-pin-updated-at');

// Pin store the current displayed pin ID
let currentPin = null;

const displayPin = (pinId) => {
    clearPinDisplay();
    getPin(pinId).then((pin) => {
        if (pin) {
            // Store the current pin
            currentPin = pin;
            // Populate pin data
            if(pin.image) {
                pinImage.src = URL.createObjectURL(pin.image);
            } else {
                pinImage.classList.add('hidden');
                imgFullpageOpen.classList.add('hidden');
                imgFullpageClose.classList.add('hidden');
                imgFullpageDownload.classList.add('hidden');
            }
            pinTitle.textContent = pin.title;
            if(pin.link) {
                // test if link starts with http:// or https://, else add http://
                if (!/^https?:\/\//i.test(pin.link)) {
                    pin.link = 'http://' + pin.link;
                }
                pinLink.href = pin.link;
            } else {
                pinLink.classList.add('hidden');
            }
            pinDescription.textContent = pin.description ? pin.description : pinDescription.classList.add('hidden');
            pinCreatedAt.textContent = pin.createdAt ? new Date(pin.createdAt).toLocaleString() : textDialog('Unknown creation date.', 3000, 'error');
            pinUpdatedAt.textContent = pinUpdatedAt ? new Date(pin.updatedAt).toLocaleString() : textDialog('Unknown update date.', 3000, 'error');
            // Set edit link
            editPinLink.href = `#create-${pin.id}`;
        } else {
            textDialog('Pin not found.', 3000, 'error');
        }
    });
};

const clearPinDisplay = () => {
    currentPin = null;
    pinImage.src = '';
    pinImage.classList.remove('hidden');
    imgFullpageOpen.classList.remove('hidden');
    imgFullpageClose.classList.remove('hidden');
    imgFullpageDownload.classList.remove('hidden');
    pinTitle.textContent = '';
    pinLink.href = '';
    pinLink.classList.remove('hidden');
    pinDescription.textContent = '';
    pinDescription.classList.remove('hidden');
    pinCreatedAt.textContent = '';
    pinUpdatedAt.textContent = '';
};

// Event listeners for control buttons
backButton.addEventListener('click', () => {
    window.history.back();
});

imgFullpageOpen.addEventListener('click', () => {
    pinImage.classList.add('fullpage');
});

imgFullpageClose.addEventListener('click', () => {
    pinImage.classList.remove('fullpage');
});

imgFullpageDownload.addEventListener('click', () => {
    if (currentPin && currentPin.image) {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(currentPin.image);
        link.download = `${currentPin.title || 'pin-image'}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } else {
        textDialog('No image available to download.', 4000, 'error');
    }
});

copyPinButton.addEventListener('click', () => {
    let text = '';
    text += `Title: ${currentPin.title}\n`;
    if (currentPin.description) text += `Description: ${currentPin.description}\n`;
    if (currentPin.link) text += `Link: ${currentPin.link}\n`;

    if (currentPin.image && ClipboardItem.supports(currentPin.image.type)) {
        navigator.clipboard.write([
            new ClipboardItem({
                "text/plain": text,
                [currentPin.image.type]: currentPin.image
            })
        ]).then(() => {
            textDialog('Pin data copied to clipboard!', 2000, 'success');
        }).catch((error) => {
            textDialog('Error copying pin data to clipboard.', 4000, 'error');
            console.error('Error copying pin data to clipboard:', error);
        });
    } else {
        navigator.clipboard.writeText(text).then(() => {
            textDialog('Only pin text data could be copied to clipboard! The image format is not supported.', 2000, 'warning');
        }).catch((error) => {
            textDialog('Error copying pin text data to clipboard.', 4000, 'error');
            console.error('Error copying pin text data to clipboard:', error);
        });
    }
});

moreOptionsButton.addEventListener('click', () => {
    if (!moreOptionsPopup) {
        console.error('More options popup element not found.');
        return;
    }
    if (moreOptionsPopup.classList.contains('hidden')) {
        moreOptionsPopup.classList.remove('hidden');

        const closeMoreOptionsEvent = (event) => {
            if (event.target !== moreOptionsPopup 
                && !moreOptionsPopup.contains(event.target)
                && event.target !== moreOptionsButton
                && !moreOptionsButton.contains(event.target)) {
                moreOptionsPopup.classList.add('hidden');
                document.removeEventListener('click', closeMoreOptionsEvent);
            }
        };
        document.addEventListener('click', closeMoreOptionsEvent);
    } else {
        moreOptionsPopup.classList.add('hidden');
    }
});

deletePinButton.addEventListener('click', () => {
    confirmDialog('Are you sure you want to delete this pin? This is irreversible!', 'Delete', 'Keep')
    .then((confirmed) => {
        if (confirmed) {
            deletePin(currentPin.id).then(() => {
                // Navigate back to home after deletion
                window.location.hash = '#home';
                textDialog('Pin deleted successfully.', 2000, 'success');
            }).catch((error) => {
                textDialog('Error deleting pin from database.', 4000, 'error');
                console.error('Error deleting pin from database:', error);
            });
        }
    });
});

export { displayPin };