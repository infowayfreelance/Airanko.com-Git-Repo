'use client'

import { useState } from 'react'
import { CheckCircle2, AlertCircle, Loader2, Send } from 'lucide-react'

type Subject =
  | 'General Enquiry'
  | 'Bug Report'
  | 'Feature Request'
  | 'Business / Partnership'
  | 'Privacy / Legal'
  | 'Other'

const SUBJECTS: Subject[] = [
  'General Enquiry',
  'Bug Report',
  'Feature Request',
  'Business / Partnership',
  'Privacy / Legal',
  'Other',
]

type FieldErrors = Partial<Record<'name' | 'email' | 'subject' | 'message', string>>

export default function ContactForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [subject, setSubject] = useState<Subject | ''>('')
  const [message, setMessage] = useState('')
  const [errors, setErrors] = useState<FieldErrors>({})
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  function validate(): FieldErrors {
    const e: FieldErrors = {}
    if (!name.trim()) e.name = 'Please enter your name.'
    if (!email.trim()) e.email = 'Please enter your email.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Please enter a valid email address.'
    if (!subject) e.subject = 'Please choose a subject.'
    if (!message.trim()) e.message = 'Please enter a message.'
    else if (message.trim().length < 20) e.message = 'Message must be at least 20 characters.'
    return e
  }

  async function handleSubmit(ev: React.FormEvent<HTMLFormElement>) {
    ev.preventDefault()
    const v = validate()
    setErrors(v)
    if (Object.keys(v).length > 0) return

    setStatus('sending')
    setErrorMessage('')

    try {
      // TODO: wire up to a real API route (e.g. POST /api/contact) that emails support@airanko.com.
      // For now, this is a client-only stub that simulates a successful send so the UX
      // can be tested end-to-end without a backend dependency.
      await new Promise((resolve) => setTimeout(resolve, 900))
      // eslint-disable-next-line no-console
      console.log('[contact-form] submission:', { name, email, subject, message })
      setStatus('success')
    } catch (err) {
      setStatus('error')
      setErrorMessage(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    }
  }

  if (status === 'success') {
    return (
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-8 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
          <CheckCircle2 className="h-6 w-6" />
        </div>
        <div>
          <h2 className="font-heading text-xl font-bold text-foreground">Message sent</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Thanks, {name.split(' ')[0] || 'friend'} — we&rsquo;ll get back to you within 1&ndash;2 business days at <strong className="text-foreground">{email}</strong>.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setName(''); setEmail(''); setSubject(''); setMessage('')
            setErrors({}); setStatus('idle')
          }}
          className="text-sm font-medium text-primary hover:underline"
        >
          Send another message
        </button>
      </div>
    )
  }

  const inputCls =
    'block w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/70 transition-shadow focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30'

  return (
    <form noValidate onSubmit={handleSubmit} className="space-y-5">
      <Field label="Name" required error={errors.name} htmlFor="contact-name">
        <input
          id="contact-name"
          type="text"
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          aria-invalid={!!errors.name}
          className={inputCls}
          placeholder="Jane Doe"
        />
      </Field>

      <Field label="Email" required error={errors.email} htmlFor="contact-email">
        <input
          id="contact-email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-invalid={!!errors.email}
          className={inputCls}
          placeholder="you@example.com"
        />
      </Field>

      <Field label="Subject" required error={errors.subject} htmlFor="contact-subject">
        <select
          id="contact-subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value as Subject)}
          aria-invalid={!!errors.subject}
          className={inputCls}
        >
          <option value="">Choose a topic…</option>
          {SUBJECTS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </Field>

      <Field
        label="Message"
        required
        error={errors.message}
        htmlFor="contact-message"
        hint={`${message.trim().length}/20 characters minimum`}
      >
        <textarea
          id="contact-message"
          rows={6}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          aria-invalid={!!errors.message}
          className={`${inputCls} resize-y`}
          placeholder="Tell us what's on your mind…"
        />
      </Field>

      {status === 'error' && (
        <div className="flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/5 p-3 text-sm text-red-600">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{errorMessage || 'Something went wrong. Please try again.'}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={status === 'sending'}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === 'sending' ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Sending…
          </>
        ) : (
          <>
            <Send className="h-4 w-4" />
            Send Message
          </>
        )}
      </button>
    </form>
  )
}

function Field({
  label, required, error, htmlFor, hint, children,
}: {
  label: string
  required?: boolean
  error?: string
  htmlFor: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-foreground">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>
      {children}
      {error ? (
        <p className="mt-1.5 text-xs text-red-600">{error}</p>
      ) : hint ? (
        <p className="mt-1.5 text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  )
}
