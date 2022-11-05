const express = require("express");
const mongodb = require('mongodb');
const app = express();
const cors=require('cors')

app.use(cors({origin:true}))
let db;

// Init
app.use(express.json());
app.use(express.urlencoded({extended: true}))

class Attempt {
    _id = null;
    questions = [];
    startedAt = null;
    completed;

    constructor(id, questions, startedAt, completed = false) {
        this._id = id;
        this.questions = questions;
        this.startedAt = startedAt;
        this.completed = completed;
    }
}

// API methods
app.post("/attempts", async function (req, res) {
    const questionList = await getQuestions();
    const returnList = JSON.parse(JSON.stringify(questionList)).map(value => {
        delete value["correctAnswer"];
        return value
    });
    console.log(questionList);
    const obId = await mongodb.ObjectId();

    const attempt = new Attempt(obId, questionList, (new Date()),false);
    const attemptResponse = new Attempt(obId,returnList, (new Date()),false);
    await db.collection("attempts").insertOne(attempt);

    res.json(attemptResponse);
    res.status(201);
});
app.post("/attempts/:id/submit", async function (req, res) {
    const attemptId = req.params.id;
    let score = 0;
    const userAnswers = req.body.userAnswers;
    console.log(userAnswers);
    const correctAnswers = {};

    let serverAttempt = null;
    try {
        serverAttempt = (await db.collection("attempts").findOne({_id: mongodb.ObjectId(attemptId)}));
    } catch (err) {
    }
    if (serverAttempt === null) {
        res.status(404);
        res.end("Id not found");
        return;
    }
    if (serverAttempt.completed) {
        res.status(204);
        res.end("Attempt already finished");
        return;
    }
    const serverQuestion = serverAttempt["questions"];
    serverQuestion.forEach(ques => {
        const quesId = ques._id;
        const correctAns = ques.correctAnswer;

        correctAnswers[quesId] = correctAns;

        if (userAnswers[quesId] !== null) {
            if (userAnswers[quesId] === correctAns) {
                score++;
            }
        }
    });
    let scoreText = '';
    if (score < 5) {
        scoreText = 'Practice more to improve it :D';
    } else if (score < 7) {
        scoreText = 'Good, keep up!';
    } else if (score < 9) {
        scoreText = 'Well done!';
    } else {
        scoreText = 'Perfect!!';
    }

    const finishAttempt = new Attempt(attemptId, serverQuestion, serverAttempt.startedAt, true);
    finishAttempt["userAnswers"] = userAnswers;
    finishAttempt["score"] = score;
    finishAttempt["scoreText"] = scoreText;
    finishAttempt["correctAnswers"] = correctAnswers;

    res.status(200);
    res.json(finishAttempt);
});

async function getQuestions() {
    const arrQuestFromServer = await db.collection("questions").find().toArray();
    const arrQuest = arrQuestFromServer
        .map(value => ({value, sort: Math.random()}))
        .sort((a, b) => a.sort - b.sort)
        .map(({value}) => {
            return value;
        }).slice(0, 10);
    return arrQuest;
}
// Server connect
const initServer = async () => {
    app.listen(3000, function () {
        console.log("Server running on 3000");
    });

    const cli = await mongodb.MongoClient.connect("mongodb://localhost:27017");
    db = cli.db("wpr-quiz");
    console.log("Database connected");
};

initServer();
