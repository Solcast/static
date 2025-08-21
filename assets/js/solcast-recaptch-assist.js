
document.addEventListener('DOMContentLoaded', function () {
const recaptchaEl = document.querySelector('.g-recaptcha');

if (!recaptchaEl) return;

const form = recaptchaEl.closest('form');
if (!form) return;

const submitButton = form.querySelector('button[type="submit"]');
if (!submitButton) return;

function disableSubmit() {
    submitButton.classList.add('is-disabled');
}

function enableSubmit() {
    submitButton.classList.remove('is-disabled');
}

disableSubmit();

// Handle actual form submission check
form.addEventListener('submit', function (e) {
    const token = grecaptcha.getResponse();
    if (!token) {
    e.preventDefault(); // Block submission
    disableSubmit();
    }
});

window.onCaptchaSuccess = function () {
    enableSubmit();
};

window.onCaptchaExpired = function () {
    disableSubmit();
};
});