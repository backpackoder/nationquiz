import { useTranslation } from "react-i18next";

// Commons
import { THEMES } from "../commons/commons";

export function useQuizData() {
  const { t } = useTranslation();
  const { FLAGS, CAPITALS, DEMOGRAPHY } = THEMES;

  const quizData = [
    {
      theme: FLAGS,
      title: t(`quizList.${FLAGS}.title`),
      description: t(`quizList.${FLAGS}.description`),
    },
    {
      theme: CAPITALS,
      title: t(`quizList.${CAPITALS}.title`),
      description: t(`quizList.${CAPITALS}.description`),
    },
    {
      theme: DEMOGRAPHY,
      title: t(`quizList.${DEMOGRAPHY}.title`),
      description: t(`quizList.${DEMOGRAPHY}.description`),
    },
  ];

  return { quizData };
}
