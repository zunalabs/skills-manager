import { describe, expect, it } from 'vitest'
import { countBucket, durationBucket } from './telemetry'
import { sanitizeTelemetryEvent } from './telemetryPolicy'

describe('telemetry policy', () => {
  it('keeps only approved properties for approved events', () => {
    expect(sanitizeTelemetryEvent('install_completed', {
      source_type: 'github',
      target_agent: 'Codex',
      success: true,
      repository_url: 'https://github.com/private/repo',
      skill_name: 'private-skill',
    })).toEqual({
      eventName: 'install_completed',
      properties: { source_type: 'github', target_agent: 'Codex', success: true },
    })
  })

  it('rejects unknown events and unsupported property values', () => {
    expect(sanitizeTelemetryEvent('skill_contents_read', { contents: 'secret' })).toBeNull()
    expect(sanitizeTelemetryEvent('app_opened', { architecture: ['x64'] })).toEqual({
      eventName: 'app_opened',
      properties: {},
    })
  })
})

describe('telemetry buckets', () => {
  it('groups counts without reporting exact library size', () => {
    expect([0, 1, 5, 6, 20, 21, 50, 51].map(countBucket)).toEqual([
      '0', '1-5', '1-5', '6-20', '6-20', '21-50', '21-50', '51+',
    ])
  })

  it('groups scan duration without reporting exact timing', () => {
    expect([0, 249, 250, 999, 1000, 2999, 3000].map(durationBucket)).toEqual([
      '<250ms', '<250ms', '250-999ms', '250-999ms', '1-3s', '1-3s', '3s+',
    ])
  })
})
