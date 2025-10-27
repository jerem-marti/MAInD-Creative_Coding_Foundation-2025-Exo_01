class PinCard extends HTMLElement {
    // This method is called when the element is added to the DOM
    connectedCallback() {
        // Create a new element from the template in the index.html
        const newElement = document.querySelector('#pin-template').content.cloneNode(true);
        // Populate the new element with the attributes
        if (this.hasAttribute('id')) {
            newElement.querySelector('a').href = `#pins-${this.getAttribute('id')}`;
        } else {
            console.error('PinCard element is missing required "id" attribute.');
        }
        if( !this.hasAttribute('link') || !this.getAttribute('link').isValidHTTPUrl()) {
            newElement.querySelector('a span').remove();
        }
        if (this.hasAttribute('image')) {
            newElement.querySelector('img').src = this.getAttribute('image');
        } else {
            newElement.removeChild(newElement.querySelector('img'));
        }
        if (this.hasAttribute('title')) {
            newElement.querySelector('.masonry-pin-title').textContent = this.getAttribute('title');
        } else {
            console.error('PinCard element is missing required "title" attribute.');
        }
        if (this.hasAttribute('description')) {
            newElement.querySelector('.masonry-pin-description').textContent = this.getAttribute('description');
        } else {
            newElement.removeChild(newElement.querySelector('.masonry-pin-description'));
        }

        this.replaceWith(newElement);
    }   
}
// Define the tag for the custom element and the class to use to create it in the DOM
customElements.define('pin-card', PinCard);