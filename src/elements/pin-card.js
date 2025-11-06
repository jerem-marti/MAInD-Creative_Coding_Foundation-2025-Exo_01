import { deletePin, getPin } from '../indexed-db';
import { textDialog, confirmDialog, calcTextColor } from '../helpers';

// Define custom events
const copyToClipboard = new CustomEvent('copy-to-clipboard');
const moreOptions = new CustomEvent('more-options');

/** 
 * @class PinCard
 * @description <pin-card> element: renders a pin from a template and wires actions.
 * @extends HTMLElement
 * @example <pin-card id="1" color="red" title="Sample Pin" description="This is a sample pin." image="blob:http://..." link="http://example.com" created-at="2024-01-01T12:00:00Z" updated-at="2024-01-02T12:00:00Z"></pin-card>
 */
class PinCard extends HTMLElement {

    /** Called when the element is inserted into the document. */
    connectedCallback() { this.render(); }

    /** 
     * Render the pin card element.
     * @returns {void}
     */
    render() {
        // Create a new element from the template in the index.html
        const fragment = document.querySelector('#pin-template').content.cloneNode(true);
        const newPinElement = fragment.querySelector('.masonry-pin');

        // Create a js object to hold the pin data
        const pinData = this.getData();

        // Populate the new element with the mandatory fields
        fragment.querySelector('.masonry-pin-link').href = `#pins-${pinData.id}`;
        fragment.querySelector('.masonry-pin-title').textContent = pinData.title;
        const updatedAt = new Date(pinData.updatedAt);
        fragment.querySelector('.masonry-pin-date').textContent += updatedAt.toLocaleDateString();
        fragment.querySelector('.masonry-pin-edit-link').href = `#create-${pinData.id}`;
        
        // `fragment` is a DocumentFragment (from template.content.cloneNode(true)).
        // DocumentFragment does not have setAttribute / style — apply the style to the element inside it.
        newPinElement.style.setProperty('background-color', `var(--card-background-color-${pinData.color})`);
        newPinElement.style.setProperty('color', `var(--card-color-${pinData.color})`);
        
        // Populate the new element with the optional fields
        if(!pinData.link) {
            fragment.querySelector('.masonry-pin-link-icon').remove();
        } 
        if (pinData.image) {
            fragment.querySelector('.masonry-pin-image').src = pinData.image;
        } else {
            fragment.querySelector('.masonry-pin-image').remove();
        }
        if (pinData.description) {
            fragment.querySelector('.masonry-pin-description').textContent = pinData.description;
        } else {
            fragment.querySelector('.masonry-pin-description').remove();
        }

        // Add event listener to the pin card to open the pin details
        newPinElement.addEventListener('click', (e) => {
            // Prevent the click event from propagating if a button or link is clicked
            if (!e.target.closest('button, a')) {
                // Open the pin details by clicking on the pin link
                const pinLink = newPinElement.querySelector('.masonry-pin-link');
                if (pinLink) {
                    pinLink.click();
                }
            }
        });

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

    /** 
     * Get pin data from element attributes.
     * @returns {Object} Pin data object
     */
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

    /** 
     * Copy pin data to clipboard.
     * If the pin has an image and the image type is supported, copy both text and image.
     * Otherwise, copy only the text data and notify the user.
     * @returns {void}
     */
    copyToClipboard() {
        const pinData = this.getData();
        let text = '';
        text += `Title: ${pinData.title}\n`;
        if (pinData.description) text += `Description: ${pinData.description}\n`;
        if (pinData.link) text += `Link: ${pinData.link}\n`;

        if (pinData.image) {
            getPin(pinData.id).then((pin) => {
            if (pin.image && ClipboardItem.supports(pin.image.type)) {
                navigator.clipboard.write([
                    new ClipboardItem({
                        "text/plain": text,
                        [pin.image.type]: pin.image
                    })
                ]).then(() => {
                    textDialog('Pin data copied to clipboard!', 2000, 'success');
                }).catch((error) => {
                    textDialog('Error copying pin data to clipboard.', 4000, 'error');
                    console.error('Error copying pin data to clipboard:', error);
                });
            } else {
                navigator.clipboard.writeText(text)
                .then(() => {
                    textDialog('Only pin text data could be copied to clipboard! The image format is not supported.', 2000, 'warning');
                }).catch((error) => {
                    textDialog('Error copying pin text data to clipboard.', 4000, 'error');
                    console.error('Error copying pin text data to clipboard:', error);
                });
            }
        });
        } else {
            navigator.clipboard.writeText(text)
            .then(() => {
                textDialog('Pin data copied to clipboard!', 2000, 'success');
            }).catch((error) => {
                textDialog('Error copying pin data.', 4000, 'error');
                console.error('Error copying pin data:', error);
            });
        }
    }

        // async function writeClipImg() {
        //     try {
        //         if (ClipboardItem.supports("image/svg+xml")) {
        //         const imgURL = "/my-image.svg";
        //         const data = await fetch(imgURL);
        //         const blob = await data.blob();
        //         await navigator.clipboard.write([
        //             new ClipboardItem({
        //             [blob.type]: blob,
        //             }),
        //         ]);
        //         console.log("Fetched image copied.");
        //         } else {
        //         console.log("SVG images are not supported by the clipboard.");
        //         }
        //     } catch (err) {
        //         console.error(err.name, err.message);
        //     }
        //     }

        // navigator.clipboard.writeText(text).then(() => {
        //     textDialog('Pin data copied to clipboard!', 2000, 'success');
        // }).catch((error) => {
        //     textDialog('Error copying pin data.', 4000, 'error');
        //     console.error('Error copying pin data:', error);
        // });
    
    /** 
     * Toggle the visibility of the more options tooltip.
     * @param {Element} pinElement - The pin card element.
     * @returns {void}
     */
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

    /** 
     * Delete the pin after user confirmation.
     * @param {Element} pinElement - The pin card element.
     * @returns {void}
     */
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