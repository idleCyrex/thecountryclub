import { NextResponse } from 'next/server'
import { z } from 'zod'
import { connectDb, hasDb } from '@/lib/db'

export const runtime = 'nodejs'

const INTERESTS = ['membership', 'tennis', 'spa', 'personal-training', 'other'] as const

const Inquiry = z.object({
  name: z.string().trim().min(2, 'Please enter your name').max(120),
  email: z.email('Please enter a valid email').max(200),
  phone: z.string().trim().max(40).optional().or(z.literal('').transform(() => undefined)),
  interest: z.enum(INTERESTS),
  message: z.string().trim().min(5, 'Tell us a little more').max(4000),
  company: z.string().optional(), // honeypot: humans never see this field
})

export async function POST(req: Request) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON body' }, { status: 400 })
  }

  const parsed = Inquiry.safeParse(body)
  if (!parsed.success) {
    const fields: Record<string, string> = {}
    for (const issue of parsed.error.issues) fields[String(issue.path[0] ?? 'form')] ??= issue.message
    return NextResponse.json({ ok: false, error: 'Please check the highlighted fields', fields }, { status: 422 })
  }

  const { company, ...data } = parsed.data
  if (company) return NextResponse.json({ ok: true }) // bot: pretend success, store nothing

  if (!hasDb()) {
    return NextResponse.json(
      { ok: false, error: 'Online inquiries are not configured yet (no database). Please call +1 721-544-4321.' },
      { status: 503 },
    )
  }

  try {
    await connectDb()
    const { InquiryModel } = await import('@/models')
    await InquiryModel.create({
      ...data,
      ip: req.headers.get('x-forwarded-for')?.split(',')[0]?.trim(),
      userAgent: req.headers.get('user-agent')?.slice(0, 300) ?? undefined,
    })
    return NextResponse.json({ ok: true }, { status: 201 })
  } catch (e) {
    console.error('[inquiry]', e)
    return NextResponse.json({ ok: false, error: 'We could not save your message. Please call +1 721-544-4321.' }, { status: 500 })
  }
}

export function GET() {
  return NextResponse.json({ ok: false, error: 'Use POST' }, { status: 405 })
}
