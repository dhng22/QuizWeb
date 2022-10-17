const main_body = document.querySelector("body");
const btn_start = document.querySelector("#btn-start");
const intro_screen = document.querySelector("#introduction");
const attempt_screen = document.querySelector("#attempt-quiz");
const review_screen = document.querySelector("#review-quiz");

let questionLen = 0
let question_id = 0;

function toIntroductionScreen() {
    // clear quizzes at review and attempt screen
    review_screen.innerHTML = "";
    attempt_screen.innerHTML = "";

    intro_screen.classList.toggle("hidden");
    review_screen.classList.toggle("hidden");
    main_body.scrollIntoView(true)
}

function toAttemptQuiz() {

    // fetch questions
    fetch("https://wpr-quiz-api.herokuapp.com/attempts", {method: 'post'}).then((response) => {
        return (response.json())
    }).then(data => {
        questionLen = data.questions.length;
        question_id = data._id;
        const questionArr = data.questions;

        // create and append question
        for (let i = 0; i < questionLen; i++) {
            createQuestion(questionArr[i], i, questionLen);
        }
        // append submit box
        const box_submit = document.createElement("p");
        box_submit.innerHTML = "<div id=\"box-submit\">\n" +
            "        <button id=\"btn-submit\">Submit your answers ❯ </button>\n" +
            "      </div>";
        attempt_screen.appendChild(box_submit);
        document.querySelector("#btn-submit").addEventListener("click", showConfirmDialog);

        // add listener
        const radio_set_attempt = attempt_screen.querySelectorAll("input");
        const option_set_attempt = attempt_screen.querySelectorAll(".option");
        const radio_set_review = review_screen.querySelectorAll("input");
        radio_set_attempt.forEach(value => value.addEventListener("change", onRadioButtonChange));
        option_set_attempt.forEach(value => value.addEventListener("click", onOptionChange));
        radio_set_review.forEach(value => value.disabled = true);
    });

    intro_screen.classList.toggle("hidden");
    attempt_screen.classList.toggle("hidden");
    main_body.scrollIntoView(true)
}

function showConfirmDialog() {
    if (confirm("Are you sure?")) {
        toReviewScreen();
    }
}

function toReviewScreen() {
    const dataToPost = {};
    const userAnswer = {};

    // query user answer and assign to `dataToPost`
    const questionList = attempt_screen.querySelectorAll(".question-field");
    questionList.forEach(value => {
        const quesId = value.getAttribute("id");
        let ansList = -1;
        value.querySelectorAll("div").forEach(value1 => {
            if (value1.classList.contains("option-selected")) {
                ansList = value1.getAttribute("index");
            }
        });
        if (ansList !== -1) {
            userAnswer[quesId] = parseInt(ansList, 10);
        }
    });
    dataToPost["userAnswers"] = userAnswer;

    // submit data
    fetch("https://wpr-quiz-api.herokuapp.com/attempts/" + question_id + "/submit", {
        method: "post",
        body: JSON.stringify(dataToPost)
    }).then(response => {
        return response.json();
    }).then(data => {
        // populate answers
        populateCorrectAns(data, userAnswer);

        // append review box
        const reviewBox = document.createElement("p");
        reviewBox.innerHTML = "<div id=\"box-result\">\n" +
            "        <h2>Result:</h2>\n" +
            "        <p id='score' style=\"font-size: 24px\"></p>\n" +
            "        <p ><strong>10%</strong></p>\n" +
            "        <p id='score-text' ></p>\n" +
            "        <button id=\"btn-try-again\">Try again</button>\n" +
            "      </div>"
        review_screen.appendChild(reviewBox);

        // apply score and score-text
        reviewBox.querySelector("#score").textContent = data.score.toString() + "/" + questionLen;
        reviewBox.querySelector("#score-text").textContent = data.scoreText;

        document.querySelector("#btn-try-again").addEventListener("click", toIntroductionScreen);
    });

    // set up for review-screen
    function populateCorrectAns(data, userAnswers) {
        const correctAnswer = data.correctAnswers;

        const questionList = review_screen.querySelectorAll(".question-field");
        questionList.forEach(value => {
            const radioList = value.querySelectorAll("input");
            const optionList = value.querySelectorAll(".option");

            const corrAnsIndx = correctAnswer[value.getAttribute("id")];
            let userAnsIndx = userAnswers[value.getAttribute("id")];
            if (userAnsIndx === undefined) {
                userAnsIndx = -1;
            }
            if (corrAnsIndx === userAnsIndx) {
                radioList[userAnsIndx].checked = true;
                optionList[userAnsIndx].classList.remove("option");
                optionList[userAnsIndx].classList.add("correct-answer");
            } else {
                if (userAnsIndx !== -1) {
                    radioList[userAnsIndx].checked = true;
                    optionList[userAnsIndx].classList.remove("option");
                    optionList[userAnsIndx].classList.add("wrong-answer");
                }
                optionList[corrAnsIndx].classList.remove("option");
                optionList[corrAnsIndx].classList.add("option-correct");
            }
        });

    }

    attempt_screen.classList.toggle("hidden");
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

function onOptionChange(event) {
    const clickedOpt = event.target.querySelector("input");
    clickedOpt.click();
}

btn_start.addEventListener("click", toAttemptQuiz);

function createQuestion(questionArrElement, index, len) {
    const quesIndex = document.createElement("h2");
    quesIndex.classList.add("question-index");
    quesIndex.textContent = "Question " + (index+1) + " of " + len;


    const question = document.createElement("section");
    question.classList.add("question-field");
    question.setAttribute("id", questionArrElement._id);

    const question_text = document.createElement("p");
    question_text.classList.add("question-text");
    question_text.textContent = questionArrElement.text;

    question.appendChild(question_text);

    for (let i = 0; i < questionArrElement.answers.length; i++) {
        const answer = questionArrElement.answers[i]
        const answerBox = document.createElement("div");
        answerBox.classList.add("option");
        answerBox.setAttribute("index",i.toString())

        const radio = document.createElement("input");
        radio.type = "radio";

        const answerText = document.createElement("p");
        answerText.classList.add("answer-text");
        answerText.textContent = answer;

        answerBox.appendChild(radio);
        answerBox.appendChild(answerText);
        question.appendChild(answerBox);
    }

    attempt_screen.appendChild(quesIndex);
    attempt_screen.appendChild(question);
    review_screen.appendChild(quesIndex.cloneNode(true))
    review_screen.appendChild(question.cloneNode(true))
}
