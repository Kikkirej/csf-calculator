/* SPDX-License-Identifier: GPL-3.0-or-later */

import type {
  AnswerMap,
  CsfFramework,
  CsfObjective,
  ObjectiveScoreResult,
  RequiredSealMap,
  SealLevel,
  SovereigntyScoreResult,
} from './types'

const MIN_SEAL_LEVEL = 0
const MAX_SEAL_LEVEL = 4
const DEFAULT_QUESTION_SCORE = 2
export const DEFAULT_REQUIRED_SEAL: SealLevel = 2

const toSealLevel = (value: number): SealLevel => {
  const normalized = Math.max(MIN_SEAL_LEVEL, Math.min(MAX_SEAL_LEVEL, Math.floor(value)))
  return normalized as SealLevel
}

const clampQuestionScore = (value: number, maxPoints: number): number => {
  if (!Number.isFinite(value)) {
    return 0
  }

  return Math.max(0, Math.min(maxPoints, value))
}

const roundTo = (value: number, decimals: number): number => {
  const factor = 10 ** decimals
  return Math.round(value * factor) / factor
}

const toSealScale = (score: number, maxPoints: number): number => {
  if (maxPoints <= 0) {
    return 0
  }

  return (score / maxPoints) * MAX_SEAL_LEVEL
}

export const deriveSealFromResponses = (sealScaleResponses: number[]): SealLevel => {
  if (sealScaleResponses.length === 0) {
    return 0
  }

  const average =
    sealScaleResponses.reduce((sum, response) => sum + response, 0) /
    sealScaleResponses.length

  let weaknessCap = MAX_SEAL_LEVEL

  if (sealScaleResponses.some((response) => response <= 0)) {
    weaknessCap = 1
  } else if (sealScaleResponses.some((response) => response <= 1)) {
    weaknessCap = 2
  } else if (sealScaleResponses.some((response) => response <= 2)) {
    weaknessCap = 3
  }

  return toSealLevel(Math.min(Math.floor(average), weaknessCap))
}

const scoreObjective = (
  objective: CsfObjective,
  answers: AnswerMap,
  requiredSeals: RequiredSealMap,
): ObjectiveScoreResult => {
  const questionBreakdown = objective.questions.map((question) => {
    const rawAnswer = answers[question.id]
    const score = clampQuestionScore(rawAnswer ?? 0, question.maxPoints)

    return {
      questionId: question.id,
      prompt: question.prompt,
      sourceSection: question.sourceSection,
      score,
      maxPoints: question.maxPoints,
    }
  })

  const earnedPoints = questionBreakdown.reduce(
    (sum, question) => sum + question.score,
    0,
  )
  const maxPoints = questionBreakdown.reduce(
    (sum, question) => sum + question.maxPoints,
    0,
  )
  const normalizedScore = maxPoints === 0 ? 0 : earnedPoints / maxPoints
  const weightedContribution = normalizedScore * objective.weight
  const sealScaleResponses = questionBreakdown.map((question) =>
    toSealScale(question.score, question.maxPoints),
  )
  const derivedSeal = deriveSealFromResponses(sealScaleResponses)
  const requiredSeal = toSealLevel(requiredSeals[objective.id] ?? DEFAULT_REQUIRED_SEAL)
  const passesRequiredSeal = derivedSeal >= requiredSeal

  return {
    objectiveId: objective.id,
    objectiveName: objective.name,
    weight: objective.weight,
    earnedPoints,
    maxPoints,
    normalizedScore,
    weightedContribution,
    derivedSeal,
    requiredSeal,
    passesRequiredSeal,
    questionBreakdown,
  }
}

export const buildDefaultAnswers = (
  framework: CsfFramework,
  defaultScore = DEFAULT_QUESTION_SCORE,
): AnswerMap => {
  const answerMap: AnswerMap = {}

  framework.objectives.forEach((objective) => {
    objective.questions.forEach((question) => {
      answerMap[question.id] = clampQuestionScore(defaultScore, question.maxPoints)
    })
  })

  return answerMap
}

export const buildDefaultRequiredSeals = (
  framework: CsfFramework,
  defaultRequiredSeal: SealLevel = DEFAULT_REQUIRED_SEAL,
): RequiredSealMap => {
  const requiredSealMap: RequiredSealMap = {}

  framework.objectives.forEach((objective) => {
    requiredSealMap[objective.id] = defaultRequiredSeal
  })

  return requiredSealMap
}

export const computeSovereigntyScore = (
  framework: CsfFramework,
  answers: AnswerMap,
  requiredSeals: RequiredSealMap,
): SovereigntyScoreResult => {
  const objectiveResults = framework.objectives.map((objective) =>
    scoreObjective(objective, answers, requiredSeals),
  )

  const weightTotal = framework.objectives.reduce(
    (sum, objective) => sum + objective.weight,
    0,
  )

  if (weightTotal !== framework.scoring.weightsMustSumTo) {
    throw new Error(
      `Objective weights must sum to ${framework.scoring.weightsMustSumTo} but got ${weightTotal}.`,
    )
  }

  const score = objectiveResults.reduce(
    (sum, objectiveResult) => sum + objectiveResult.weightedContribution,
    0,
  )
  const failingObjectives = objectiveResults
    .filter((objectiveResult) => !objectiveResult.passesRequiredSeal)
    .map((objectiveResult) => objectiveResult.objectiveId)

  return {
    score: roundTo(score, 2),
    weightTotal,
    passesAllRequiredSeals: failingObjectives.length === 0,
    failingObjectives,
    objectiveResults,
  }
}
