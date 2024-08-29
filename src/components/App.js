import { useEffect, useReducer } from "react";

import Header from "./Header";
import Main from "./Main";
import Loader from "./Loader";
import Error from "./Error";
import StartScreen from "./StartScreen";
import Progress from "./Progress";
import Question from "./Question";
import Footer from "./Footer";
import NextButton from "./NextButton";
import Timer from "./Timer";
import FinishedScreen from "./FinishedScreen";

const SECS_PER_QUESTION = 30;

const initialState = {
  questions: [],
  // status possíveis: "loading", "error","ready", "ative", "finished"
  status: "loading",
  index: 0,
  answer: null,
  points: 0,
  highscore: 0,
  secondsRemaining: null,
};

function reducer(state, action) {
  switch (action.type) {
    case "dataReceived":
      return {
        ...state,
        questions: action.payload.questions,
        status: "ready",
      };
    case "dataFailed":
      return {
        ...state,
        status: "error",
      };
    case "start":
      return {
        ...state,
        status: "active",
        secondsRemaining: state.questions.length * SECS_PER_QUESTION,
      };
    case "newAnswer":
      const question = state.questions.at(state.index);
      return {
        ...state,
        answer: action.payload,
        points:
          action.payload === question.correctOption
            ? state.points + question.points
            : state.points,
      };
    case "nextQuestion":
      return { ...state, index: state.index + 1, answer: null };
    case "finish":
      return {
        ...state,
        status: "finished",
        highscore: Math.max(state.points, state.highscore),
      };
    case "restart":
      return {
        ...initialState,
        highscore: state.highscore,
        status: "ready",
        questions: state.questions,
      };
    case "tick":
      return {
        ...state,
        secondsRemaining: state.secondsRemaining - 1,
        status: state.secondsRemaining === 0 ? "finished" : state.status,
        highscore:
          state.secondsRemaining === 0
            ? Math.max(state.points, state.highscore)
            : state.highscore,
      };
    default:
      throw new Error("Unknown action");
  }
}

export default function App() {
  const [
    { questions, status, index, answer, points, highscore, secondsRemaining },
    dispatch,
  ] = useReducer(reducer, initialState);

  console.log(questions);

  const numQuestions = questions.length;
  const maxPoints = questions.reduce((prev, cur) => prev + cur.points, 0);

  useEffect(function () {
    async function fetchData() {
      const res = await fetch(
        "https://miguel-willians.github.io/questions-react-quiz/data/questions.json"
      );

      if (!res.ok) dispatch({ type: "dataFailed" });

      const data = await res.json();
      // console.log(data);
      dispatch({ type: "dataReceived", payload: data });
    }

    fetchData();
  }, []);
  return (
    <div className="app">
      <Header />
      <Main>
        {status === "loading" && <Loader />}
        {status === "error" && <Error />}
        {status === "ready" && (
          <StartScreen numQuestions={numQuestions} dispatch={dispatch} />
        )}
        {status === "active" && (
          <>
            <Progress
              points={points}
              index={index}
              numQuestions={numQuestions}
              maxPoints={maxPoints}
              answer={answer}
            />
            <Question
              question={questions[index]}
              dispatch={dispatch}
              answer={answer}
            />
            <Footer>
              <Timer dispatch={dispatch} secondsRemaining={secondsRemaining} />
              <NextButton
                dispatch={dispatch}
                answer={answer}
                index={index}
                numQuestions={numQuestions}
              />
            </Footer>
          </>
        )}
        {status === "finished" && (
          <FinishedScreen
            maxPoints={maxPoints}
            points={points}
            highscore={highscore}
            dispatch={dispatch}
          />
        )}
      </Main>
    </div>
  );
}
