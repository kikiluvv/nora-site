var currentIndex = 0;
var images = document.querySelectorAll('.preview-img');

function showImage(index) {
    if (index >= 0 && index < images.length) {
        currentIndex = index;
        var imgSrc = images[currentIndex].getAttribute('src');
        var img = document.createElement('img');
        img.src = imgSrc;
        img.className = 'modal-image';
        var modalContent = document.querySelector('.modal-content');
        modalContent.innerHTML = ''; // Clear the modal content
        modalContent.appendChild(img);
    }
}

