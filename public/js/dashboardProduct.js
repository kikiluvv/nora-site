
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

// Assuming you have an asynchronous way to fetch your JSON data
fetch('/data/products.json')
    .then(response => response.json())
    .then(data => {
        items = data; // Assign the loaded JSON data to the 'items' variable

        // Populate the select input
        const itemSelect = document.getElementById('item-select');

        items.forEach(item => {
            const option = document.createElement('option');
            option.value = item.id; // Set the 'value' attribute to the item's ID
            option.textContent = item.id; // Display the item's ID as the option text
            itemSelect.appendChild(option);
        });

        // Add an event listener to the select input to update the preview
        itemSelect.addEventListener('change', () => {
            const selectedItem = itemSelect.value;
            displayItemImage(selectedItem);
        });
    })
    .catch(error => {
        console.error('Error loading JSON data:', error);
    });



function displayItemImage(itemId) {
    // Fetch the image data based on 'itemId' and update the preview
    const itemData = items.find(item => item.id === itemId);

    if (itemData && itemData.url) {
        const previewImg = document.getElementById('preview-img3');
        previewImg.src = '/' + itemData.url; // Prepend a slash to make it an absolute path
    } else {
        // Handle the case when data for the selected ID is not found
        const previewImg = document.getElementById('preview-img3');
        previewImg.src = '/public/assets/global/placeholder.jpg';
        console.log('Item not found:', itemId);
    }
}





