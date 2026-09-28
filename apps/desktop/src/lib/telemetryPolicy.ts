export const TELEMETRY_PROPERTIES: Record<string, ReadonlySet<string>> = {
  app_opened: new Set(['architecture']),
  scan_completed: new Set(['duration', 'connected_agents', 'skills']),
  install_completed: new Set(['source_type', 'target_agent', 'success']),
  copy_completed: new Set(['source_agent', 'target_agent', 'success']),
  discover_opened: new Set(),
  feedback_submitted: new Set(['category', 'has_rating']),
}

export function sanitizeTelemetryEvent(eventName: string, properties: Record<string, unknown> = {}) {
  if (!Object.prototype.hasOwnProperty.call(TELEMETRY_PROPERTIES, eventName)) return null

  const allowedKeys = TELEMETRY_PROPERTIES[eventName]
  const safeProperties: Record<string, string | number | boolean> = {}
  for (const [key, value] of Object.entries(properties)) {
    if (allowedKeys.has(key) && ['string', 'number', 'boolean'].includes(typeof value)) {
      safeProperties[key] = value as string | number | boolean
    }
  }

  return { eventName, properties: safeProperties }
}
