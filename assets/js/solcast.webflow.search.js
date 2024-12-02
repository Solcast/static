// On first load of Search Page Hides empty results message

document.addEventListener('DOMContentLoaded', function() {
    if (window.location.hash === '#empty') {
        const elements = document.querySelectorAll('.search-results_empty');
        elements.forEach(element => {
            element.style.display = 'none';
        });
    }
});
