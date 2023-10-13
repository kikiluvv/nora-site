// JavaScript/jQuery
$(document).ready(function () {
    var currentIndex = 0;
    var images = $('.child-img');
    var modalOpen = false; // Variable to track if the modal is open

    var touchStartX = 0;
    var touchEndX = 0;

    // Function to show the image at the specified index
    function showImage(index) {
        if (index >= 0 && index < images.length) {
            currentIndex = index;
            var imgSrc = $(images[currentIndex]).attr('src');
            var img = '<img src="' + imgSrc + '" class="modal-image">';
            var $modalContent = $('.modal-content');

            $modalContent.css({ opacity: '0' }); // Add slide-out effect
            setTimeout(function () {
                $modalContent.html(img);
                $modalContent.css({ opacity: '1' }); // Remove slide-out effect after changing the image
            }, 300); // Adjust the time to match the transition duration in milliseconds
        }
    }

    // Function to open the modal
    function openModal() {
        $('#gallery-modal').addClass('modal-show');
        $('body').css({
            overflow: 'hidden',
        });
        $('#nav-wrapper').css({
            filter: 'blur(3px)',
        });
        $('#footer-wrapper').css({
            filter: 'blur(3px)',
        });
        $('.gallery-wrapper').css({
            filter: 'blur(3px)',
        });
        modalOpen = true;
    }

    // Function to close the modal
    function closeModal() {
        $('#gallery-modal').removeClass('modal-show');
        $('body').css({
            overflow: 'auto',
        });
        $('#nav-wrapper').css({
            filter: 'none',
        });
        $('#footer-wrapper').css({
            filter: 'none',
        });
        $('.gallery-wrapper').css({
            filter: 'none',
        });
        modalOpen = false;
    }

    // Swipe detection functions
    function handleTouchStart(event) {
        touchStartX = event.touches[0].clientX;
    }

    function handleTouchEnd(event) {
        touchEndX = event.changedTouches[0].clientX;
        handleSwipe();
    }

    function handleSwipe() {
        var swipeThreshold = 50; // Adjust this value as needed

        if (touchStartX - touchEndX > swipeThreshold) {
            // Swipe left, go to the next image
            currentIndex++;
            if (currentIndex >= images.length) {
                currentIndex = 0;
            }
            showImage(currentIndex);
        } else if (touchEndX - touchStartX > swipeThreshold) {
            // Swipe right, go to the previous image
            currentIndex--;
            if (currentIndex < 0) {
                currentIndex = images.length - 1;
            }
            showImage(currentIndex);
        }
    }

    // Add touch event listeners
    $('.modal-content').on('touchstart', handleTouchStart);
    $('.modal-content').on('touchend', handleTouchEnd);


    // Click event on .child-img
    $('.child-img').click(function (event) {
        event.stopPropagation(); // Prevent the click event from propagating to the document
        currentIndex = $(this).data('index'); // Use data-index to get the correct index
        showImage(currentIndex);
        openModal();
    });

    // Click event on the "Previous" button
    $('.prev').click(function (event) {
        event.stopPropagation(); // Prevent the click event from propagating further
        currentIndex--;
        if (currentIndex < 0) {
            currentIndex = images.length - 1;
        }
        showImage(currentIndex);
    });

    // Click event on the "Next" button
    $('.next').click(function (event) {
        event.stopPropagation(); // Prevent the click event from propagating further
        currentIndex++;
        if (currentIndex >= images.length) {
            currentIndex = 0;
        }
        showImage(currentIndex);
    });

    // Click event on the close button
    $('.close').click(function (event) {
        event.stopPropagation(); // Prevent the click event from propagating to the modal
        closeModal();
    });

    // Click event to close the modal when clicking outside of it
    $(document).click(function (event) {
        if (modalOpen && $(event.target).closest('.modal-content').length === 0) {
            closeModal();
        }
    });
});
