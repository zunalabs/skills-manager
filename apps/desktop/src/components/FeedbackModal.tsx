import { useState } from 'react'
import * as RadixDialog from '@radix-ui/react-dialog'
import { Bug, Lightbulb, MessageCircle, Send, X } from 'lucide-react'
import { FeedbackPayload } from '../types'
import { trackTelemetry } from '../lib/telemetry'

const categories = [
  { value: 'bug', label: 'Bug', icon: Bug },
  { value: 'idea', label: 'Idea', icon: Lightbulb },
  { value: 'general', label: 'General', icon: MessageCircle },
] as const

export default function FeedbackModal({ onClose }: { onClose: () => void }) {
  const [category, setCategory] = useState<FeedbackPayload['category']>('idea')
  const [rating, setRating] = useState<number | undefined>()
  const [message, setMessage] = useState('')
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [error, setError] = useState('')

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!message.trim()) return
    setStatus('sending')
    setError('')
    const result = await window.skillsAPI.submitFeedback({
      category,
      rating,
      message: message.trim(),
      email: email.trim() || undefined,
    })
    if (result.ok) {
      void trackTelemetry('feedback_submitted', {
        category,
        has_rating: rating !== undefined,
      })
      setStatus('sent')
    }
    else {
      setStatus('error')
      setError(result.error || 'Feedback could not be sent right now.')
    }
  }

  return (
    <RadixDialog.Root open onOpenChange={(open) => !open && onClose()}>
      <RadixDialog.Portal>
        <RadixDialog.Overlay className="app-overlay fixed inset-0 z-50" />
        <RadixDialog.Content className="app-dialog feedback-dialog fixed left-1/2 top-1/2 z-50 focus:outline-none">
          <div className="feedback-header">
            <div>
              <RadixDialog.Title>Send feedback</RadixDialog.Title>
              <RadixDialog.Description>Help shape the next version of Skills Manager.</RadixDialog.Description>
            </div>
            <RadixDialog.Close asChild>
              <button aria-label="Close feedback"><X size={15} /></button>
            </RadixDialog.Close>
          </div>

          {status === 'sent' ? (
            <div className="feedback-success">
              <span><Send size={18} /></span>
              <h2>Feedback received</h2>
              <p>Thank you. Every message is read.</p>
              <button onClick={onClose}>Done</button>
            </div>
          ) : (
            <form className="feedback-form" onSubmit={submit}>
              <fieldset>
                <legend>What is this about?</legend>
                <div className="feedback-categories">
                  {categories.map(({ value, label, icon: Icon }) => (
                    <button
                      type="button"
                      key={value}
                      className={category === value ? 'selected' : ''}
                      onClick={() => setCategory(value)}
                    >
                      <Icon size={14} />{label}
                    </button>
                  ))}
                </div>
              </fieldset>

              <fieldset>
                <legend>How is the app working for you? <span>Optional</span></legend>
                <div className="feedback-rating" aria-label="Rating from 1 to 5">
                  {[1, 2, 3, 4, 5].map((score) => (
                    <button
                      type="button"
                      key={score}
                      className={rating === score ? 'selected' : ''}
                      onClick={() => setRating(rating === score ? undefined : score)}
                      aria-label={`${score} out of 5`}
                    >{score}</button>
                  ))}
                </div>
              </fieldset>

              <label>
                <span>Your feedback</span>
                <textarea
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  placeholder="What happened, or what would make the app better?"
                  rows={5}
                  maxLength={4000}
                  required
                />
              </label>

              <label>
                <span>Email <em>Optional, for a reply</em></span>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                />
              </label>

              <p className="feedback-privacy">
                Sends your message, optional rating and email, app version, and operating system.
                Skill names, file paths, and tokens are never included.
              </p>
              {status === 'error' && <p className="feedback-error">{error}</p>}

              <div className="feedback-actions">
                <button type="button" onClick={onClose}>Cancel</button>
                <button type="submit" className="primary" disabled={!message.trim() || status === 'sending'}>
                  {status === 'sending' ? 'Sending…' : 'Send feedback'}
                </button>
              </div>
            </form>
          )}
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  )
}
