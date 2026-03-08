/* SPDX-License-Identifier: GPL-3.0-or-later */

import { describe, expect, it } from 'vitest'

import { csfFramework } from '../data/sources'
import { buildDefaultAnswers, buildDefaultRequiredSeals } from './scoring'
import {
  buildShareLink,
  createShareQuestionParams,
  createShareRequiredSealParams,
  parseSharePrefilledAnswers,
  parseSharePrefilledRequiredSeals,
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
    const requiredSealParams = createShareRequiredSealParams(csfFramework)

    const parsedAnswers = parseSharePrefilledAnswers(
      questionParams,
      '?Sov1.1=4&Sov2.2=2&Sov3.1=9&Sov4.1=abc',
    )
    const parsedRequiredSeals = parseSharePrefilledRequiredSeals(
      requiredSealParams,
      '?Sov1.seal=3&Sov2.seal=1&Sov3.seal=8&Sov4.seal=-1',
    )

    expect(parsedAnswers['SOV1-Q1']).toBe(4)
    expect(parsedAnswers['SOV2-Q2']).toBe(2)
    expect(parsedAnswers['SOV3-Q1']).toBeUndefined()
    expect(parsedAnswers['SOV4-Q1']).toBeUndefined()
    expect(parsedRequiredSeals['SOV-1']).toBe(3)
    expect(parsedRequiredSeals['SOV-2']).toBe(1)
    expect(parsedRequiredSeals['SOV-3']).toBeUndefined()
    expect(parsedRequiredSeals['SOV-4']).toBeUndefined()
  })

  it('builds a link containing question and required seal parameters', () => {
    const questionParams = createShareQuestionParams(csfFramework)
    const requiredSealParams = createShareRequiredSealParams(csfFramework)
    const answers = buildDefaultAnswers(csfFramework, 3)
    const requiredSeals = buildDefaultRequiredSeals(csfFramework, 2)
    answers['SOV1-Q1'] = 4
    requiredSeals['SOV-1'] = 3

    const link = buildShareLink(
      questionParams,
      requiredSealParams,
      answers,
      requiredSeals,
      'https://example.org/sovereignity-calculator/',
    )

    const linkParams = new URL(link).searchParams

    expect(linkParams.get('Sov1.1')).toBe('4')
    expect(linkParams.get('Sov8.3')).toBe('3')
    expect(linkParams.get('Sov1.seal')).toBe('3')
    expect(linkParams.get('Sov8.seal')).toBe('2')
    expect(Array.from(linkParams.keys())).toHaveLength(
      questionParams.length + requiredSealParams.length,
    )
  })
})
