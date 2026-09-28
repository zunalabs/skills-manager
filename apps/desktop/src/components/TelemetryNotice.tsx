import { BarChart3, X } from 'lucide-react'

interface TelemetryNoticeProps {
  onDismiss: () => void
}

export default function TelemetryNotice({ onDismiss }: TelemetryNoticeProps) {
  return (
    <aside className="telemetry-notice" role="status" aria-label="Anonymous usage analytics">
      <div className="telemetry-notice-icon"><BarChart3 size={16} /></div>
      <div>
        <strong>Anonymous usage analytics are on</strong>
        <p>Skills Manager measures feature use and success rates. It never sends skill names, contents, file paths, repositories, feedback text, emails, or tokens.</p>
      </div>
      <button className="telemetry-dismiss" onClick={onDismiss} aria-label="Dismiss analytics notice"><X size={14} /></button>
    </aside>
  )
}
