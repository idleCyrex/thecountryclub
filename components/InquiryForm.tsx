'use client'

import { useState, type FormEvent } from 'react'
import { SETTINGS } from '@/content/site'

const INTERESTS = [
  { v: 'membership', l: 'Membership' },
  { v: 'tennis', l: 'Tennis' },
  { v: 'spa', l: 'Impulse Spa' },
  { v: 'personal-training', l: 'Personal training' },
  { v: 'other', l: 'Question / comment' },
] as const

type Status = { kind: 'idle' } | { kind: 'sending' } | { kind: 'ok' } | { kind: 'error'; message: string; fields?: Record<string, string> }

interface Props {
  initialInterest?: string
  phone?: string
  phoneHref?: string
}

export default function InquiryForm({ initialInterest = 'membership', phone = SETTINGS.phone, phoneHref = SETTINGS.phoneHref }: Props) {
  const [status, setStatus] = useState<Status>({ kind: 'idle' })
  const valid = INTERESTS.some((i) => i.v === initialInterest) ? initialInterest : 'membership'

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const data = Object.fromEntries(new FormData(form).entries())
    setStatus({ kind: 'sending' })
    try {
      const res = await fetch('/api/inquiry', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(data) })
      const json = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string; fields?: Record<string, string> }
      if (res.ok && json.ok) {
        setStatus({ kind: 'ok' })
        form.reset()
      } else {
        setStatus({ kind: 'error', message: json.error ?? `Something went wrong. Please call ${phone}.`, fields: json.fields })
      }
    } catch {
      setStatus({ kind: 'error', message: `Network error. Please try again or call ${phone}.` })
    }
  }

  const err = (f: string) => (status.kind === 'error' ? status.fields?.[f] : undefined)
  const fieldCls = (f: string) => `field${err(f) ? ' is-invalid' : ''}`

  if (status.kind === 'ok') {
    return (
      <div className="form-done" role="status">
        <p className="display form-done__title">THANK YOU</p>
        <p className="form-done__text">Your message is in. The front desk will get back to you shortly.</p>
        <button className="btn btn--outline" onClick={() => setStatus({ kind: 'idle' })}>
          Send another
        </button>
      </div>
    )
  }

  return (
    <form className="form" onSubmit={submit} noValidate key={valid}>
      <div className="form__hp" aria-hidden="true">
        <label>
          Company
          <input name="company" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <fieldset className="chips">
        <legend className="field__label">I&apos;m interested in</legend>
        <div className="chips__row">
          {INTERESTS.map((i) => (
            <label key={i.v} className="chip">
              <input type="radio" name="interest" value={i.v} defaultChecked={i.v === valid} />
              <span>{i.l}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <label className={fieldCls('name')}>
        <span className="field__label">Name</span>
        <span className="field__control">
          <input name="name" required minLength={2} maxLength={120} autoComplete="name" aria-invalid={!!err('name')} />
        </span>
        {err('name') && <em>{err('name')}</em>}
      </label>
      <div className="form__row">
        <label className={fieldCls('email')}>
          <span className="field__label">Email</span>
          <span className="field__control">
            <input name="email" type="email" required maxLength={200} autoComplete="email" aria-invalid={!!err('email')} />
          </span>
          {err('email') && <em>{err('email')}</em>}
        </label>
        <label className="field">
          <span className="field__label">Phone (optional)</span>
          <span className="field__control">
            <input name="phone" type="tel" maxLength={40} autoComplete="tel" />
          </span>
        </label>
      </div>
      <label className={fieldCls('message')}>
        <span className="field__label">Message</span>
        <span className="field__control">
          <textarea name="message" required minLength={5} maxLength={4000} rows={4} aria-invalid={!!err('message')} />
        </span>
        {err('message') && <em>{err('message')}</em>}
      </label>

      {status.kind === 'error' && (
        <p className="form__error" role="alert">
          {status.message}
        </p>
      )}
      <button className="btn form__submit" type="submit" disabled={status.kind === 'sending'}>
        {status.kind === 'sending' ? 'Sending…' : 'Send inquiry'}
      </button>
      <p className="form__alt">
        Prefer to talk? <a href={phoneHref}>Call {phone}</a>
      </p>
    </form>
  )
}
