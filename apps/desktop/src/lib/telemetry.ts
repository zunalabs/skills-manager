import { TelemetryEventName } from '../types'

export type TelemetryProperties = Record<string, string | number | boolean>

export function trackTelemetry(eventName: TelemetryEventName, properties?: TelemetryProperties) {
  return window.skillsAPI.trackTelemetry(eventName, properties).catch(() => {})
}

export function countBucket(value: number): string {
  if (value === 0) return '0'
  if (value <= 5) return '1-5'
  if (value <= 20) return '6-20'
  if (value <= 50) return '21-50'
  return '51+'
}

export function durationBucket(milliseconds: number): string {
  if (milliseconds < 250) return '<250ms'
  if (milliseconds < 1000) return '250-999ms'
  if (milliseconds < 3000) return '1-3s'
  return '3s+'
}
