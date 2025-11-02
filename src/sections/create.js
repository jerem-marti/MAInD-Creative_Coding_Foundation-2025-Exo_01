import { getPin } from "../indexed-db";
import { addPin, updatePin } from "../indexed-db";
import { textDialog } from "../helpers";

// Form
const form = document.getElementById('create-pin-form');

// Fields
const imageInput = form.elements['pin-image'];
const imagePreview = document.getElementById('image-preview');
const colorInput = form.elements['pin-color'];
const titleInput = form.elements['pin-title'];
const descriptionInput = form.elements['pin-description'];
const linkInput = form.elements['pin-link'];
const submitButton = document.getElementById('pin-form-submit-btn');

// Dialog
const dialog = document.querySelector('dialog');

const displayForm = (pinId = null) => {

    //reset form fields
    form.reset();

    if (pinId) {
        updatePinForm(pinId);
    } else {
        newPinForm();
    }
};

const newPinForm = () => {
    submitButton.textContent = 'Create Pin';
    submitButton.onclick = () => {
        addPin({
            color: colorInput.value,
            image: imageInput.value,
            title: titleInput.value,
            description: descriptionInput.value,
            link: linkInput.value
        }).then((newPin) => {
            textDialog('Pin created successfully!', 2000, 'success');
            form.reset();
            console.log('New pin created:', newPin);
            // get the new pin and console log it
            getPin(newPin).then((pin) => {
                console.log('Retrieved new pin:', pin);
            });
        }).catch((error) => {
            textDialog('Error creating pin.', 4000, 'error');
            console.error('Error creating pin:', error);
        });
    };
}

const updatePinForm = (pinId) => {
    // If an ID is present, fetch the pin data for editing
    pinId = parseInt(pinId);
    getPin(pinId).then((pinData) => {
            // Populate the form fields with the existing pin data
            colorInput.value = pinData.color || '';
            titleInput.value = pinData.title || '';
            descriptionInput.value = pinData.description || '';
            // TO CHECK IF NEED TO CHANGE BETWEEN BLOB AND URL ---------------------------------------------------------------
            imageInput.value = pinData.image || '';
            if (pinData.image) {
                imagePreview.src = pinData.image;
            }
            linkInput.value = pinData.link || '';

            // Set the submit button to update mode
            submitButton.textContent = 'Update Pin';
            submitButton.onclick = () => {
                pinData.color = colorInput.value;
                pinData.title = titleInput.value;
                pinData.description = descriptionInput.value;
                pinData.image = imageInput.value;
                pinData.link = linkInput.value;
                updatePin(pinData).then(() => {
                    textDialog('Pin updated successfully!', 2000, 'success');
                }).catch((error) => {
                    textDialog('Error updating pin.', 4000, 'error');
                    console.error('Error updating pin:', error);
                });
            };
    }).catch((error) => {
        textDialog('Error fetching pin data for editing.', 4000, 'error');
        console.error('Error fetching pin data:', error);
        window.location.hash = '#create';
        displayForm();
    });
};

export { displayForm };