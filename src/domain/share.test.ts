import { describe, expect, it } from 'vitest'

import { csfFramework } from '../data/sources'
import { buildDefaultAnswers } from './scoring'
import {
  buildShareLink,
  createShareQuestionParams,
  parseSharePrefilledAnswers,
} from './share'

describe('share helpers', () => {
  it('creates parameter names in SovX.Y format', () => {
    const questionParams = createShareQuestionParams(csfFramework)

    expect(questionParams).toHaveLength(24)
    expect(questionParams[0]?.paramKey).toBe('Sov1.1')
    expect(questionParams[1]?.paramKey).toBe('Sov1.2')
    expect(questionParams[23]?.paramKey).toBe('Sov8.3')
  })

  it('parses valid query values and ignores invalid ones', () => {
    const questionParams = createShareQuestionParams(csfFramework)

    const parsedAnswers = parseSharePrefilledAnswers(
      questionParams,
      '?Sov1.1=4&Sov2.2=2&Sov3.1=9&Sov4.1=abc',
    )

    expect(parsedAnswers['SOV1-Q1']).toBe(4)
    expect(parsedAnswers['SOV2-Q2']).toBe(2)
    expect(parsedAnswers['SOV3-Q1']).toBeUndefined()
    expect(parsedAnswers['SOV4-Q1']).toBeUndefined()
  })

  it('builds a link containing all question parameters', () => {
    const questionParams = createShareQuestionParams(csfFramework)
    const answers = buildDefaultAnswers(csfFramework, 3)
    answers['SOV1-Q1'] = 4

    const link = buildShareLink(
      questionParams,
      answers,
      'https://example.org/sovereignity-calculator/',
    )

    const linkParams = new URL(link).searchParams

    expect(linkParams.get('Sov1.1')).toBe('4')
    expect(linkParams.get('Sov8.3')).toBe('3')
    expect(Array.from(linkParams.keys())).toHaveLength(questionParams.length)
  })
})
