const main_body = document.querySelector("body");
const btn_start = document.querySelector("#btn-start");
const intro_screen = document.querySelector("#introduction");
const attempt_screen = document.querySelector("#attempt-quiz");
const review_screen = document.querySelector("#review-quiz");
const btn_submit = document.querySelector("#btn-submit");
const btn_retry = document.querySelector("#btn-try-again");

const dialog = document.querySelector("#confirm-dialog");
const btn_confirmed = dialog.querySelector("#btn_confirmed");
const btn_discard = dialog.querySelector("#btn_discard");
const radio_set = document.querySelectorAll("input");

function toAttemptQuiz() {
    intro_screen.classList.toggle("hidden");
    attempt_screen.classList.toggle("hidden");
    main_body.scrollIntoView(true)
}

function toReviewScreen() {
    attempt_screen.classList.toggle("hidden");
    review_screen.classList.toggle("hidden");
    main_body.scrollIntoView(true)

}

function toIntroductionScreen() {
    intro_screen.classList.toggle("hidden");
    review_screen.classList.toggle("hidden");
    main_body.scrollIntoView(true)

}

function onRadioButtonChange(event) {
    const changedButton = event.target;
    const otherButtons = changedButton.parentElement.parentElement.querySelectorAll("input");

    otherButtons.forEach(value => {
        value.checked = false;
        value.parentElement.classList.add("option");
        value.parentElement.classList.remove("option-selected");
    });

    changedButton.parentElement.classList.add("option-selected");
    changedButton.parentElement.classList.remove("option");
    changedButton.checked = true;
}


function showConfirmDialog() {
    dialog.classList.toggle("hidden");
    window.scroll(0, main_body.scrollHeight);
}

function initAnswer() {
    const allButton = document.querySelectorAll("input");
    allButton.forEach((value) => {
        if (value.checked) {
            value.parentElement.classList.add("option-selected");
            value.parentElement.classList.remove("option");
        }
    })
}

initAnswer();
btn_start.addEventListener("click", toAttemptQuiz);
btn_submit.addEventListener("click", showConfirmDialog);
btn_retry.addEventListener("click", toIntroductionScreen);
btn_discard.addEventListener("click", event => {
    dialog.classList.toggle("hidden");
});
btn_confirmed.addEventListener("click", toReviewScreen);
radio_set.forEach(value => value.addEventListener("change",onRadioButtonChange))