import type { AnswerMap, CsfFramework } from './types'

export interface ShareQuestionParam {
  questionId: string
  paramKey: string
}

const normalizeShareScore = (rawScore: number | undefined): number => {
  if (typeof rawScore !== 'number' || Number.isNaN(rawScore)) {
    return 0
  }

  const roundedScore = Math.round(rawScore)

  if (roundedScore < 0) {
    return 0
  }

  if (roundedScore > 4) {
    return 4
  }

  return roundedScore
}

const parseShareScore = (rawValue: string | null): number | null => {
  if (rawValue === null) {
    return null
  }

  const parsedValue = Number.parseInt(rawValue, 10)

  if (Number.isNaN(parsedValue) || parsedValue < 0 || parsedValue > 4) {
    return null
  }

  return parsedValue
}

export const createShareQuestionParams = (framework: CsfFramework): ShareQuestionParam[] =>
  framework.objectives.flatMap((objective, objectiveIndex) =>
    objective.questions.map((question, questionIndex) => ({
      questionId: question.id,
      paramKey: `Sov${objectiveIndex + 1}.${questionIndex + 1}`,
    })),
  )

export const parseSharePrefilledAnswers = (
  questionParams: ShareQuestionParam[],
  search: string,
): Partial<AnswerMap> => {
  const queryParams = new URLSearchParams(search)
  const answersFromQuery: Partial<AnswerMap> = {}

  questionParams.forEach((questionParam) => {
    const parsedScore = parseShareScore(queryParams.get(questionParam.paramKey))

    if (parsedScore !== null) {
      answersFromQuery[questionParam.questionId] = parsedScore
    }
  })

  return answersFromQuery
}

export const buildShareLink = (
  questionParams: ShareQuestionParam[],
  answers: Partial<AnswerMap>,
  baseUrl: string,
): string => {
  const queryParams = new URLSearchParams()

  questionParams.forEach((questionParam) => {
    queryParams.set(
      questionParam.paramKey,
      String(normalizeShareScore(answers[questionParam.questionId])),
    )
  })

  return `${baseUrl}?${queryParams.toString()}`
}
