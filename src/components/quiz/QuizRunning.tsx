import { useContext, useReducer, useState } from "react";
import { AppContext } from "../../AppContext";

// Types
import { AppProviderProps } from "../../types/main";

// Components
import { Result } from "./Result";
import { Modale } from "../../modales/Modale";
import { GameModale } from "../../modales/GameModale";

type QuizPlayingProps = {
  score: number;
  actualQuestion: number;
  state: any;
  responseSelected: (index: any) => void;
};

export function QuizRunning() {
  const { data, nbOfQuestions, nbOfChoices }: AppProviderProps = useContext(AppContext);

  const [actualQuestion, setActualQuestion] = useState(1);
  const [score, setScore] = useState(0);

  const countriesList: any[] = [];
  if (data) {
    data.map((item: any) => {
      countriesList.push(item.cca2);
    });
  }

  const randomResponseLocation = Math.floor(Math.random() * nbOfChoices);

  function wrongTest() {
    const array = [];

    for (let i = 0; i < nbOfChoices; i++) {
      array.push(getRandomWrongResponse());
    }

    return array;
  }

  function reducer(state: any, action: any) {
    switch (action.type) {
      case "correct answer":
        setScore(score + 1);
        return { ...state, hasResponded: true, isCorrect: true };

      case "wrong answer":
        return { ...state, hasResponded: true, isCorrect: false };

      case "next question":
        setActualQuestion(actualQuestion + 1);
        return {
          ...state,

          correctResponseData: data[getRandomCorrectResponse()],
          correctResponseRandomIndex: randomResponseLocation,

          wrongResponsesData: wrongTest(),

          hasResponded: false,
          isCorrect: false,
        };

      default:
        return new Error("Action not found");
    }
  }

  const [state, dispatch] = useReducer<React.Reducer<any, any>>(reducer, {
    correctResponseData: data[getRandomCorrectResponse()],
    correctResponseRandomIndex: randomResponseLocation,

    wrongResponsesData: wrongTest(),

    hasResponded: false,
    isCorrect: false,
  });

  const { correctResponseData, correctResponseRandomIndex } = state;

  if (data) {
    const search = countriesList.findIndex((item: any) => item === correctResponseData?.cca2);
    if (search !== -1) {
      countriesList.splice(search, 1);
    }
  }

  function getRandomCorrectResponse() {
    return Math.floor(Math.random() * data.length);
  }

  function getRandomWrongResponse() {
    const randomCountry = Math.floor(Math.random() * countriesList.length);
    const countryChosen = countriesList[randomCountry];
    const findCountryIndex = data.findIndex((item: any) => item.cca2 === countryChosen);

    countriesList.splice(randomCountry, 1);

    return findCountryIndex;
  }

  function responseSelected(index: any) {
    const isCorrect = index === correctResponseRandomIndex;

    dispatch({ type: isCorrect ? "correct answer" : "wrong answer" });

    setTimeout(
      () => {
        dispatch({ type: "next question" });
      },
      isCorrect ? 1000 : 2000
    );
  }

  const quizPlayingProps: QuizPlayingProps = {
    score,
    actualQuestion,
    state,
    responseSelected,
  };

  return actualQuestion <= nbOfQuestions ? (
    <QuizPlaying props={quizPlayingProps} />
  ) : (
    <Result score={score} />
  );
}

function QuizPlaying({ props }: { props: QuizPlayingProps }) {
  const { data, nbOfQuestions, nbOfChoices }: AppProviderProps = useContext(AppContext);

  const [isModaleOpened, setIsModaleOpened] = useState(false);

  const { score, actualQuestion, state, responseSelected } = props;
  const {
    correctResponseData,
    correctResponseRandomIndex,
    wrongResponsesData,
    hasResponded,
    isCorrect,
  } = state;

  function reducer(state: any, action: any) {
    switch (action.type) {
      case "restart":
        setIsModaleOpened(true);
        return {
          ...state,
          description:
            "Etes-vous sûr de vouloir recommencer le quiz (votre progression sera perdue) ?",
          confirmation: () => window.location.reload(),
        };

      case "leave":
        setIsModaleOpened(true);
        return {
          ...state,
          description: "Etes-vous sûr de vouloir quitter le quiz (votre progression sera perdue) ?",
          confirmation: "/quiz",
        };

      default:
        throw new Error("Unexpected action");
    }
  }

  const [modaleState, dispatch] = useReducer<React.Reducer<any, any>>(reducer, {
    description: "",
    confirmation: null,
  });

  return (
    <>
      <h2>Quiz principal</h2>
      <p>score: {score}</p>
      <p>
        question n°: {actualQuestion}/{nbOfQuestions}
      </p>
      <p>De quel pays est ce drapeau ?</p>

      <article className="game">
        <img src={correctResponseData?.flags?.png} alt={correctResponseData?.flags?.alt} />

        <ul>
          {Array(nbOfChoices)
            .fill(0)
            .map((_, index) => {
              return index === correctResponseRandomIndex ? (
                <li
                  key={index}
                  className={`correctResponse ${hasResponded ? "active" : "inactive"}`}
                  onClick={() => {
                    !hasResponded && responseSelected(index);
                  }}
                >
                  {correctResponseData?.name?.common}
                </li>
              ) : (
                <li
                  key={index}
                  className={`wrongResponse ${hasResponded && !isCorrect ? "active" : "inactive"}`}
                  onClick={() => {
                    !hasResponded && responseSelected(index);
                  }}
                >
                  {data[wrongResponsesData[index]]?.name?.common}
                </li>
              );
            })}
        </ul>
      </article>

      <div className="buttons">
        <button className="restart" onClick={() => dispatch({ type: "restart" })}>
          Recommencer
        </button>

        <button className="leave" onClick={() => dispatch({ type: "leave" })}>
          Quitter la partie
        </button>
      </div>

      {isModaleOpened && (
        <Modale
          modale="quizRunning"
          children={<GameModale modaleState={modaleState} setIsModaleOpened={setIsModaleOpened} />}
          setIsModaleOpened={setIsModaleOpened}
        />
      )}
    </>
  );
}
