import { describe, expect, it } from 'vitest'

import { csfFramework } from '../data/sources'
import {
  buildDefaultAnswers,
  buildDefaultRequiredSeals,
  computeSovereigntyScore,
} from './scoring'
import { buildPdfOverviewDocument } from './pdfExport'

describe('buildPdfOverviewDocument', () => {
  it('renders a short overview document with objective snapshot rows', () => {
    const answers = buildDefaultAnswers(csfFramework, 3)
    const requiredSeals = buildDefaultRequiredSeals(csfFramework, 2)
    const result = computeSovereigntyScore(csfFramework, answers, requiredSeals)

    const documentHtml = buildPdfOverviewDocument({
      framework: csfFramework,
      result,
      generatedAt: new Date('2026-03-08T12:00:00Z'),
    })

    expect(documentHtml).toContain('Cloud Sovereignty Assessment Overview')
    expect(documentHtml).toContain('Short Overview')
    expect(documentHtml).toContain('Objective Snapshot')
    expect(documentHtml).toContain('SOV-1')
    expect(documentHtml).toContain('SOV-8')
  })
})
