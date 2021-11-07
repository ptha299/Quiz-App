const attemptQuiz = document.querySelector("#attempt-quiz");

//Get the review modal
const tryAgainModal = document.querySelector("#review-quiz");
const score_in_10 = document.querySelector(".per_10");
const score_in_percentage = document.querySelector(".per_100");
const msg = document.querySelector(".message");

const submitBlock = document.createElement("div");
submitBlock.classList.add("submit-block");
attemptQuiz.appendChild(submitBlock);

const submitBtn = document.createElement("button");
submitBtn.textContent = "Submit your answers >";
submitBtn.classList.add("greenButton");
submitBtn.id = "submit-btn";
submitBtn.style.display = "center";
submitBlock.appendChild(submitBtn);

const submit_btn = document.querySelector("#submit-btn");
const submit_block = document.querySelector(".submit-block");
submit_btn.classList.add("hidden");
submit_block.classList.add("hidden");
submit_btn.addEventListener("click", onSubmitQuiz);

//Selected answer
function onClick(event) {
  const choose = document.querySelector(".selected");
  if (choose != null) {
    choose.classList.remove("selected");
  }

  e = event.currentTarget;
  e.classList.add("selected");
}

//Get API
async function getAPI(data = {}) {
  api_url = "https://wpr-quiz-api.herokuapp.com/attempts";
  const response = await fetch(api_url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  const attempt = await response.json();

  return attempt;
}

//variables
let idAttempt;
let userSelection = [];

//Start Quiz
let startButton = document.querySelector("#start_btn");
startButton.addEventListener("click", async () => {
  submit_btn.classList.toggle("hidden");
  submit_block.classList.remove("hidden");
  document.querySelector("#introduction").classList.add("hidden");

  const quesList = await getAPI();

  const questions = quesList.questions;

  //Show questions and options
  questions.map((question, index) => {
    const questionContainer = document.querySelector(".quizBox");

    const quesNumber = document.createElement("h3");
    quesNumber.textContent = "Question " + (index + 1) + " of 10";
    quesNumber.classList.add("h3");

    const quesSen = document.createElement("div");
    quesSen.textContent = question.text;
    quesSen.classList.add("question-text");
    quesSen.id = `${question._id}`;

    questionContainer.appendChild(quesNumber);
    questionContainer.appendChild(quesSen);

    const option_Box = document.createElement("div");
    question.answers.map((answer, id) => {
      const option_Container = document.createElement("div");

      const label = document.createElement("label");
      label.textContent = answer;
      label.setAttribute("for", `q${index + 1}_option${id}`);

      const radioButton = document.createElement("input");
      radioButton.setAttribute("type", "radio");
      radioButton.name = `${quesSen.id}`;
      radioButton.id = `q${index + 1}_option${id}`;
      radioButton.value = id;

      option_Container.appendChild(radioButton);
      option_Container.appendChild(label);

      option_Box.appendChild(option_Container);
      questionContainer.appendChild(option_Box);

      option_Box.classList.add("option-box");
      option_Container.classList.add("option");
      radioButton.addEventListener("click", onClick);
    });
  });

  idAttempt = quesList._id;
});

//Submit API
async function submitAPI(quesId) {
  let body = {
    answers: {},
  };

  const inputs = document.querySelectorAll("input");

  for (input of inputs) {
    if (input.checked) {
      userSelection.push(input);
      body.answers[input.name] = parseInt(input.value);
    }
  }

  const apiSubmit = `https://wpr-quiz-api.herokuapp.com/attempts/${quesId}/submit`;
  const response = await fetch(apiSubmit, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const result = await response.json();
  return result;
}

function onSubmitQuiz() {
  const finish = confirm('Are you sure you want to finish?')
    if (finish == true){
        onSubmitQuizConfirm()
    }
}

//Submit quiz
async function onSubmitQuizConfirm() {
  submit_btn.classList.toggle("hidden");
  submit_block.classList.add("hidden");
  tryAgainModal.classList.toggle("hidden");
  const responseAPI = await submitAPI(idAttempt);

  const inputs = document.querySelectorAll("input");
  for (input of inputs) {
    const quesID = input.name;
    const trueAnswer = parseInt(input.value);
    const selected = document.querySelector(`label[for=${input.id}]`);

    if (trueAnswer == responseAPI.correctAnswers[quesID]) {
      selected.style = "background-color: #ddd;";
      const correctMsg = document.createElement("correctMsg");
      correctMsg.classList.add("message-res");
      correctMsg.textContent = "Correct answer";
      selected.insertAdjacentElement("afterend", correctMsg);
    }
    input.disabled = true;
  }

  //Custom user inputs
  for (input of userSelection) {
    let quesId = input.name;
    let selected_Index = parseInt(input.value);
    let selected = document.querySelector(`label[for=${input.id}]`);

    if (selected_Index == responseAPI.correctAnswers[quesId]) {
      selected.style = "background-color: #d4edda;";
    } else {
      selected.style = "background-color: #f8d7da;";
      const wrongMsg = document.createElement("div");
      wrongMsg.classList.add("message-res");
      wrongMsg.textContent = "Your answer";
      selected.insertAdjacentElement("afterend", wrongMsg);
    }
  }

  const score_10 = `${responseAPI.score}/10`;
  const score_100 = `${(responseAPI.score / 10) * 100}%`;
  score_in_10.textContent = score_10;
  score_in_percentage.textContent = score_100;
  msg.textContent = responseAPI.scoreText;
}

const tryAgain = document.querySelector(".tryAgain");
tryAgain.addEventListener("click", tryAgainHandle);

//try again
function tryAgainHandle() {
  location.reload();
}
