import { describe, expect, it } from 'vitest'

import { csfFramework } from '../data/sources'
import {
  buildDefaultAnswers,
  buildDefaultRequiredSeals,
  computeSovereigntyScore,
} from './scoring'

describe('computeSovereigntyScore', () => {
  it('returns a perfect score with all answers at maximum', () => {
    const answers = buildDefaultAnswers(csfFramework, 4)
    const requiredSeals = buildDefaultRequiredSeals(csfFramework, 2)

    const result = computeSovereigntyScore(csfFramework, answers, requiredSeals)

    expect(result.score).toBe(100)
    expect(result.passesAllRequiredSeals).toBe(true)
    expect(result.objectiveResults.every((objectiveResult) => objectiveResult.derivedSeal === 4)).toBe(true)
  })

  it('marks all objectives as failing when required SEAL exceeds derived SEAL', () => {
    const answers = buildDefaultAnswers(csfFramework, 2)
    const requiredSeals = buildDefaultRequiredSeals(csfFramework, 3)

    const result = computeSovereigntyScore(csfFramework, answers, requiredSeals)

    expect(result.score).toBe(50)
    expect(result.passesAllRequiredSeals).toBe(false)
    expect(result.failingObjectives).toHaveLength(8)
  })

  it('applies a weakness cap to objective SEAL when one contributing question is very weak', () => {
    const answers = buildDefaultAnswers(csfFramework, 4)
    const requiredSeals = buildDefaultRequiredSeals(csfFramework, 2)
    answers['SOV5-Q3'] = 0

    const result = computeSovereigntyScore(csfFramework, answers, requiredSeals)
    const supplyChain = result.objectiveResults.find(
      (objectiveResult) => objectiveResult.objectiveId === 'SOV-5',
    )

    expect(supplyChain).toBeDefined()
    expect(supplyChain?.derivedSeal).toBe(1)
    expect(supplyChain?.passesRequiredSeal).toBe(false)
  })

  it('throws when configured weights do not match the expected sum', () => {
    const invalidFramework = structuredClone(csfFramework)
    invalidFramework.objectives[0].weight = 19
    const answers = buildDefaultAnswers(invalidFramework, 3)
    const requiredSeals = buildDefaultRequiredSeals(invalidFramework, 2)

    expect(() =>
      computeSovereigntyScore(invalidFramework, answers, requiredSeals),
    ).toThrow('Objective weights must sum to 100')
  })
})
