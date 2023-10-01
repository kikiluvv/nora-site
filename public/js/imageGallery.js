// JavaScript/jQuery
$(document).ready(function () {
    var currentIndex = 0;
    var images = $('.child-img');
    var modalOpen = false; // Variable to track if the modal is open

    console.log(modalOpen);

    // Function to show the image at the specified index
    function showImage(index) {
        if (index >= 0 && index < images.length) {
            currentIndex = index;
            var imgSrc = $(images[currentIndex]).attr('src');
            var img = '<img src="' + imgSrc + '" class="modal-image">';
            $('.modal-content').html(img);
        }
    }

    // Function to open the modal
    function openModal() {
        $('#gallery-modal').css({
            display: 'flex',
        });
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
        console.log(modalOpen);
    }

    // Function to close the modal
    function closeModal() {
        $('#gallery-modal').css({
            display: 'none',
        });
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
        console.log(modalOpen);
    }


    // Click event on .child-img
    $('.child-img').click(function (event) {
        event.stopPropagation(); // Prevent the click event from propagating to the document
        currentIndex = $(this).index();
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
