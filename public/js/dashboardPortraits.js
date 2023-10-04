
//------------------//
//    Add  Handle   //
//------------------//


// Get references to the form and preview elements
const addform = document.getElementById('add-item');

// Listen for form input changes
addform.addEventListener('input', () => updatePreview(addform, 'preview-img1'));


// Update the preview based on form input
function updatePreview(form, imgId) {
    // Capture form data using FormData
    const formData = new FormData(form);

    const imageFile = formData.get('image');

    // Update the preview elements with the form values
    const previewImg = document.getElementById(imgId);


    // Update the preview image if a file is selected
    if (imageFile && imageFile.size > 0) {
        const reader = new FileReader();

        reader.onload = function (e) {
            previewImg.src = e.target.result;
        };

        reader.readAsDataURL(imageFile);
    } else {
        // Use a placeholder image if no file is selected
        previewImg.src = '/public/assets/global/placeholder.jpg';
    }
}



//-----------------------//
//     Remove Handle     //
//-----------------------//

let items; // Initialize the variable
let selectedItems = [];
const itemSelect = document.getElementById('item-select');

fetch('/data/portraits.json')
    .then(response => response.json())
    .then(data => {
        items = data; // Assign the loaded JSON data to the 'items' variable

        items.forEach(item => {
            const wrapper = document.createElement('div');
            wrapper.className = 'checkbox-wrapper'

            const input = document.createElement('input');
            input.type = 'checkbox';
            input.className = 'remove-input'
            input.value = item.id;
            input.name = item.id;
            input.id = item.id;
            input.textContent = item.id;

            const label = document.createElement('label');
            label.className = 'label'
            label.htmlFor = item.id;
            label.textContent = item.id;

            wrapper.appendChild(input);
            wrapper.appendChild(label);

            itemSelect.appendChild(wrapper);
        });

        // Add an event listener to the select input to update the preview
        itemSelect.addEventListener('change', () => {
            updateSelectedItems(); // Update selected items when checkboxes change
        });

    })
    .catch(error => {
        console.error('Error loading JSON data:', error);
    });


function loadImageGallery(selectedItems) {
    const previewGallery = document.querySelector('.preview-gallery');
    previewGallery.innerHTML = ''; // Clear previous images

    let found = false; // Flag to track if at least one item is found

    selectedItems.forEach(itemId => {
        const itemData = items.find(item => item.id === itemId);

        if (itemData && itemData.url) {
            const img = document.createElement('img');
            img.src = '/' + itemData.url; // Prepend a slash to make it an absolute path
            img.alt = `Image ${itemId}`;
            img.className = 'preview-img-remove';
            previewGallery.appendChild(img);
            found = true; // Set the flag to true if an item is found
            console.log(selectedItems)
        }
    });

    // If no item is found, display the placeholder image
    if (!found) {
        const previewGallery = document.querySelector('.preview-gallery');
        previewGallery.innerHTML = '';
        const img = document.createElement('img');
        img.src = '/public/assets/global/placeholder.jpg';
    }
}

// Function to update selected items
function updateSelectedItems() {
    selectedItems = Array.from(itemSelect.querySelectorAll('input[type="checkbox"]:checked')).map(input => input.value);
    loadImageGallery(selectedItems);
    console.log('Updated Selected Items:', selectedItems);
}

// Add a function to handle "Select All" button click
function handleSelectAllClick() {
    event.preventDefault();
    const checkboxes = itemSelect.querySelectorAll('input[type="checkbox"]');
    const selectAllButton = document.getElementById('select-all-btn');

    if (checkboxes.length === 0) {
        return;
    }

    // Determine whether to select or deselect all checkboxes
    const isSelectAll = Array.from(checkboxes).every(checkbox => checkbox.checked);

    checkboxes.forEach(checkbox => {
        checkbox.checked = !isSelectAll;
    });

    // Update the button text based on the current state
    selectAllButton.textContent = isSelectAll ? 'Select All' : 'Deselect All';

    // Update the selected items
    updateSelectedItems();
}

// Add an event listener to the "Select All" button
const selectAllButton = document.getElementById('select-all-btn');
selectAllButton.addEventListener('click', handleSelectAllClick);

function showImage(index) {
    const previewImages = document.querySelectorAll('.preview-img');

    if (index >= 0 && index < previewImages.length) {
        currentIndex = index;
        console.log('index', index);
        console.log('selectedItems.length)', selectedItems.length);

        // Hide all images
        previewImages.forEach((img, i) => {
            if (i === currentIndex) {
                img.style.display = 'block';
            } else {
                img.style.display = 'none';
            }
        });
    }
}


const removeSelectedButton = document.getElementById('remove-selected-btn');
removeSelectedButton.addEventListener('click', () => {
    if (selectedItems.length === 0) {
        // Handle case where no items are selected
        return;
    }
    console.log('Selected Items:', selectedItems);

    // Convert selectedItems to a JSON string
    const requestBody = JSON.stringify({ id: selectedItems });

    // Send an HTTP request to your server to remove the selected items using Axios
    axios.post('/dashboard/portraits/remove-item', requestBody, {
        headers: {
            'Content-Type': 'application/json', // Specify content type as JSON
        },
    })
        .then(response => {
            if (response.status === 200) {
                console.log('Request was successful');
                // Handle the response here
                // You can add a redirect here if needed
                window.location.href = '/dashboard/portraits/';
                window.history.replaceState({}, document.title, window.location.pathname);
            } else {
                // Handle the case where the removal request failed
                console.error('Failed to remove items');
            }
        })
        .catch(error => {
            console.error('Error removing items:', error);
        });
});

