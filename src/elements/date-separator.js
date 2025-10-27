class DateSeparator extends HTMLElement {

    // This method is called when the element is added to the DOM
    connectedCallback() {
        // Create a new element from the template in the index.html
        const newElement = document.querySelector('#list-date-separator-template').content.cloneNode(true);
        // Populate the new element with the attribute and inner HTML of this custom element
        newElement.querySelector('.date-label').textContent = this.getAttribute('date');
        newElement.querySelector('ol').innerHTML = this.innerHTML;
        this.replaceWith(newElement);
    }
}

// Define the tag for the custom element and the class to use to create it in the DOM
customElements.define('date-separator', DateSeparator);