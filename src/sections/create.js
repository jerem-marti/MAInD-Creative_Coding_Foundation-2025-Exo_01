import { getPin } from "../indexed-db";
import { addPin, updatePin } from "../indexed-db";
import { textDialog, confirmDialog } from "../helpers";

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

// In update mode, holds the state. Also used to know if we are in update or create mode.
let pinBeingUpdated = null;

const displayForm = (pinId = null) => {

    //reset form
    resetForm();

    if (pinId) {
        updatePinForm(pinId);
    } else {
        newPinForm();
    }
};

const newPinForm = () => {
    // Set the flag to indicate we are creating a new pin
    pinBeingUpdated = null;
    submitButton.textContent = 'Create Pin';
    submitButton.onclick = () => {
        const file = imageInput.files[0] || null;
        addPin({
            color: colorInput.value,
            image: file,
            title: titleInput.value,
            description: descriptionInput.value,
            link: linkInput.value
        }).then((newPin) => {
            textDialog('Pin created successfully!', 2000, 'success');
            resetForm();
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
        // Set the flag to indicate we are updating an existing pin
        pinBeingUpdated = pinData;
        // Populate the form fields with the existing pin data
        colorInput.value = pinData.color || '';
        titleInput.value = pinData.title || '';
        descriptionInput.value = pinData.description || '';
        if (pinData.image) {
            imagePreview.src = URL.createObjectURL(pinData.image);
            imagePreview.classList.add('active');
        }
        linkInput.value = pinData.link || '';

        // Set the submit button to update mode
        submitButton.textContent = 'Update Pin';
        submitButton.onclick = () => {
            const file = imageInput.files[0] || pinData.image || null;
            pinData.color = colorInput.value;
            pinData.title = titleInput.value;
            pinData.description = descriptionInput.value;
            pinData.image = file;
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

const resetForm = () => {
    form.reset();
    imagePreview.src = '';
    imagePreview.classList.remove('active');
};

const hasBeenEdited = () => {
    if (pinBeingUpdated && 
        (titleInput.value !== pinBeingUpdated.title || descriptionInput.value !== pinBeingUpdated.description || linkInput.value !== pinBeingUpdated.link
        || (imageInput.files[0] !== undefined && JSON.stringify(imageInput.files[0]) !== JSON.stringify(pinBeingUpdated.image)))) {
        // If any field has changed, return true
        return true;
    }
    // In create mode, consider the form edited if any field is filled
    else if (pinBeingUpdated === null && (titleInput.value || descriptionInput.value || linkInput.value || imageInput.files.length > 0)) {
        // If any field is filled, return true
        return true;
    }
    // If not in update mode or no changes detected, return false
    return false;
};

const isLeavingFormUnsaved = () => {
    return new Promise((resolve) => {
        const isActiveSection = document.getElementById('create-section').classList.contains('active');

        // not on the form → nothing to check
        if (!isActiveSection) {
            resolve(false);
            return;
        }

        // on the form but nothing changed → ok to leave
        if (!hasBeenEdited()) {
            resolve(false);
            return;
        }

        // on the form + edited → ask user
        confirmDialog('You have unsaved changes. Are you sure you want to leave without saving?', 'Leave', 'Stay')
        .then((confirmedLeave) => {
            if (!confirmedLeave) {
                history.replaceState(null, '', '#create' + (pinBeingUpdated ? `-${pinBeingUpdated.id}` : ''));
                resolve(true);
            } else {
                // user decided to leave
                resolve(false);
            }
        });
    });
};


// Add listener for image input change
imageInput.addEventListener('change', () => {
    const file = imageInput.files[0];
    if (file) {
        imagePreview.src = URL.createObjectURL(file);
        imagePreview.classList.add('active');
    }
});

// Add listener to image input button to trigger file input
document.getElementById('pin-form-image-upload').addEventListener('click', () => {
    imageInput.click();
});

export { displayForm, isLeavingFormUnsaved };