import { deletePin } from '../indexed-db';
import { textDialog, confirmDialog } from '../helpers';

// Define custom events
const copyToClipboard = new CustomEvent('copy-to-clipboard');
const moreOptions = new CustomEvent('more-options');

// Define the PinCard custom element
class PinCard extends HTMLElement {

    // This method is called when the element is added to the DOM
    connectedCallback() {
        this.render();
    }

    // disconnectedCallback() {
    //     // Remove the Pin from IndexedDB when the element is removed from the DOM
    //     const pinId = this.getAttribute('id') ? parseInt(this.getAttribute('id')) : null;
    //     if (pinId) {
    //         deletePin(pinId).catch((error) => {
    //             console.error('Error deleting pin from database:', error);
    //         });
    //     } else {
    //         console.error('PinCard element is missing required "id" attribute for deletion.');
    //     }
    // }

    render() {
        // Create a new element from the template in the index.html
        const fragment = document.querySelector('#pin-template').content.cloneNode(true);
        const newPinElement = fragment.querySelector('.masonry-pin');

        // Create a js object to hold the pin data
        const pinData = this.getData();

        // Populate the new element with the mandatory fields
        fragment.querySelector('.masonry-pin-link').href = `#pins-${pinData.id}`;
        fragment.querySelector('.masonry-pin-title').textContent = pinData.title;
        const createdAt = new Date(pinData.createdAt);
        fragment.querySelector('.masonry-pin-created-at').textContent = `Created: ${createdAt.toLocaleDateString()} ${createdAt.toLocaleTimeString()}`;
        fragment.querySelector('.masonry-pin-edit-link').href = `#create-${pinData.id}`;

        // Populate the new element with the optional fields
        if(!pinData.link) {
            fragment.querySelector('.masonry-pin-link-icon').remove();
        } 
        if (pinData.image) {
            fragment.querySelector('.masonry-pin-image').src = pinData.image;
        } else {
            fragment.querySelector('.masonry-pin-image').remove();
        }
        if (pinData.color) {
            // `fragment` is a DocumentFragment (from template.content.cloneNode(true)).
            // DocumentFragment does not have setAttribute / style — apply the style to the element inside it.
            newPinElement.style.setProperty('background-color', `var(--card-color-${pinData.color})`);
        }
        if (pinData.description) {
            fragment.querySelector('.masonry-pin-description').textContent = pinData.description;
        } else {
            fragment.querySelector('.masonry-pin-description').remove();
        }
        if (!pinData.updatedAt) {
            fragment.querySelector('.masonry-pin-updated-at').remove();
        } else {
            const updatedAt = new Date(pinData.updatedAt);
            fragment.querySelector('.masonry-pin-updated-at').textContent = `Updated: ${updatedAt.toLocaleDateString()} ${updatedAt.toLocaleTimeString()}`;
        }

        // Add event listener to the copy the content of the pin to clipboard
        fragment.querySelector('.masonry-pin-copy-button')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.copyToClipboard();
        });

        // Add event listener to the more button to show more options (future implementation)
        fragment.querySelector('.masonry-pin-more-button')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.toggleMoreOptions(newPinElement);
        });

        // Add event listener to the delete button to delete the pin
        fragment.querySelector('.masonry-pin-delete-button')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.delete(newPinElement);
        });

        // Replace this custom element with the new populated element
        this.replaceWith(fragment);
    }

    getData() {
        return {
            id: this.getAttribute('id') ? parseInt(this.getAttribute('id')) : undefined,
            color: this.getAttribute('color') || 'Error: No Color',
            title: this.getAttribute('title') || 'Error: No Title',
            description: this.getAttribute('description') || '',
            image: this.getAttribute('image') || '',
            link: this.getAttribute('link') || '',
            createdAt: this.getAttribute('created-at') || 'Error: No Created At',
            updatedAt: this.getAttribute('updated-at') || '',
        };
    }

    copyToClipboard() {
        const pinData = this.getData();
        navigator.clipboard.writeText(`
            Title: ${pinData.title}\n
            Description: ${pinData.description}\n
            Link: ${pinData.link}\n
            Image: ${pinData.image}\n
            Created At: ${pinData.createdAt}\n
            Updated At: ${pinData.updatedAt}`
        ).then(() => {
            textDialog('Pin data copied to clipboard!', 2000, 'success');
        }).catch((error) => {
            textDialog('Error copying pin data.', 4000, 'error');
            console.error('Error copying pin data:', error);
        });
    }

    toggleMoreOptions(pinElement) {
        const moreOptionsElement = pinElement.querySelector('.masonry-pin-more-options');
        if (!moreOptionsElement) {
            console.error('More options element not found.');
            return;
        }
        if(moreOptionsElement.classList.contains('hidden')) {
            moreOptionsElement.classList.remove('hidden');
            const moreOptionsButton = pinElement.querySelector('.masonry-pin-more-button');

            const closeMoreOptionsEvent = (event) => {
                if (event.target !== moreOptionsElement 
                    && !moreOptionsElement.contains(event.target)
                    && event.target !== moreOptionsButton
                    && !moreOptionsButton.contains(event.target)) {
                    moreOptionsElement.classList.add('hidden');
                    document.removeEventListener('click', closeMoreOptionsEvent);
                }
            }

            document.addEventListener('click', closeMoreOptionsEvent);
        } else {
            moreOptionsElement.classList.add('hidden');
        }
    }

    delete(pinElement) {
        const pinId = this.getAttribute('id') ? parseInt(this.getAttribute('id')) : null;
        if (pinId) {
            confirmDialog('Are you sure you want to delete this pin? This is irreversible!', 'Delete', 'Keep')
            .then((confirmed) => {
                if (confirmed) {
                    deletePin(pinId)
                    .then(() => {
                        textDialog('Pin deleted successfully!', 2000, 'success');
                        // Remove the pin element from the DOM
                        pinElement.remove();
                    })
                    .catch((error) => {
                        textDialog('Error deleting pin from database.', 4000, 'error');
                        console.error('Error deleting pin from database:', error);
                    });
                }
            });
        }
    }
}
// Define the tag for the custom element and the class to use to create it in the DOM
customElements.define('pin-card', PinCard);