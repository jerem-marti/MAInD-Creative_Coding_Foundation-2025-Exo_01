import { addPin, updatePin, deletePin } from '../indexed-db';
import { showDialog } from '../helpers';

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
        const newElement = document.querySelector('#pin-template').content.cloneNode(true);

        // Create a js object to hold the pin data
        const pinData = {
            id: this.getAttribute('id') ? parseInt(this.getAttribute('id')) : undefined,
            color: this.getAttribute('color') || 'white',
            title: this.getAttribute('title') || 'Error: No Title',
            description: this.getAttribute('description') || '',
            image: this.getAttribute('image') || '',
            link: this.getAttribute('link') || '',
            createdAt: this.getAttribute('created-at') || 'Error: No Created At',
            updatedAt: this.getAttribute('updated-at') || '',
        };

        // Populate the new element with the mandatory fields
        newElement.querySelector('.masonry-pin-id').textContent = pinData.id;
        newElement.querySelector('.masonry-pin-title').textContent = pinData.title;
        const createdAt = new Date(pinData.createdAt);
        newElement.querySelector('.masonry-pin-created-at').textContent = `Created: ${createdAt.toLocaleDateString()} ${createdAt.toLocaleTimeString()}`;

        // Populate the new element with the optional fields
        if(!pinData.link) {
            newElement.querySelector('a span').remove();
        } 
        if (pinData.image) {
            newElement.querySelector('img').src = pinData.image;
            newElement.querySelector('img').alt = pinData.title;
        } else {
            newElement.querySelector('img').remove();
        }
        if (pinData.color) {
            // `newElement` is a DocumentFragment (from template.content.cloneNode(true)).
            // DocumentFragment does not have setAttribute / style — apply the style to the element inside it.
            newElement.querySelector('.masonry-pin').style.setProperty('background-color', `var(--card-color-${pinData.color})`);
        }
        if (pinData.description) {
            newElement.querySelector('.masonry-pin-description').textContent = pinData.description;
        } else {
            newElement.querySelector('.masonry-pin-description').remove();
        }
        if (pinData.link) {
            newElement.querySelector('.masonry-pin-link').href = pinData.link;
        } else {
            newElement.querySelector('.masonry-pin-link').remove();
        }
        if (!pinData.updatedAt) {
            newElement.querySelector('.masonry-pin-updated-at').remove();
        } else {
            const updatedAt = new Date(pinData.updatedAt);
            newElement.querySelector('.masonry-pin-updated-at').textContent = `Updated: ${updatedAt.toLocaleDateString()} ${updatedAt.toLocaleTimeString()}`;
        }

        // Add event listener to the copy the content of the pin to clipboard
        this.querySelector('.masonry-pin-copy-btn')?.addEventListener('click', (e) => {
            e.preventDefault();
            const pinData = {
                id: this.getAttribute('id'),
                title: this.querySelector('.masonry-pin-title').textContent,
                description: this.querySelector('.masonry-pin-description').textContent,
                link: this.querySelector('.masonry-pin-link').href,
                image: this.querySelector('img').src,
                createdAt: this.getAttribute('created-at'),
                updatedAt: this.getAttribute('updated-at'),
            };
            navigator.clipboard.writeText(`
                Title: ${pinData.title}\n
                Description: ${pinData.description}\n
                Link: ${pinData.link}\n
                Image: ${pinData.image}\n
                Created At: ${pinData.createdAt}\n
                Updated At: ${pinData.updatedAt}`
            ).then(() => {
                    showDialog('Pin data copied to clipboard!', 2000, 'success');
            }).catch((error) => {
                showDialog('Error copying pin data.', 4000, 'error');
                console.error('Error copying pin data:', error);
            });
            this.dispatchEvent(copyToClipboard);
        });

        // Add event listener to the more button to show more options (future implementation)
        this.querySelector('.masonry-pin-more-btn')?.addEventListener('click', (e) => {
            e.preventDefault();
            // Future implementation for more options
            showDialog('More options coming soon!', 2000, 'neutral');
            this.dispatchEvent(new CustomEvent('moreOptions'));
        });

        // Replace this custom element with the new populated element
        this.replaceWith(newElement);
    }

    
}
// Define the tag for the custom element and the class to use to create it in the DOM
customElements.define('pin-card', PinCard);