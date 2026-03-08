export type ObjectiveId =
  | 'SOV-1'
  | 'SOV-2'
  | 'SOV-3'
  | 'SOV-4'
  | 'SOV-5'
  | 'SOV-6'
  | 'SOV-7'
  | 'SOV-8'

export type SealLevel = 0 | 1 | 2 | 3 | 4

export interface CsfQuestion {
  id: string
  prompt: string
  factor: string
  sourceSection: string
  maxPoints: number
}

export interface CsfObjective {
  id: ObjectiveId
  name: string
  weight: number
  description: string
  sourceSection: string
  contributingFactors: string[]
  questions: CsfQuestion[]
}

export interface CsfSealLevel {
  level: SealLevel
  label: string
  description: string
  sourceSection: string
}

export interface CsfFramework {
  version: string
  title: string
  publicationDate: string
  sourceUrl: string
  scoring: {
    sourceSection: string
    formula: string
    weightsMustSumTo: number
  }
  sealLevels: CsfSealLevel[]
  objectives: CsfObjective[]
}

export type AnswerMap = Record<string, number>

export type RequiredSealMap = Record<string, number>

export interface CalculatorFormValues {
  answers: AnswerMap
  requiredSeals: RequiredSealMap
}

export interface QuestionBreakdown {
  questionId: string
  prompt: string
  sourceSection: string
  score: number
  maxPoints: number
}

export interface ObjectiveScoreResult {
  objectiveId: ObjectiveId
  objectiveName: string
  weight: number
  earnedPoints: number
  maxPoints: number
  normalizedScore: number
  weightedContribution: number
  derivedSeal: SealLevel
  requiredSeal: SealLevel
  passesRequiredSeal: boolean
  questionBreakdown: QuestionBreakdown[]
}

export interface SovereigntyScoreResult {
  score: number
  weightTotal: number
  passesAllRequiredSeals: boolean
  failingObjectives: ObjectiveId[]
  objectiveResults: ObjectiveScoreResult[]
}
