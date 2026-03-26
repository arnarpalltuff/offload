import { NextResponse } from 'next/server';
import { DEMO_MODE } from '@/lib/demo';
import { rateLimit, getClientIP } from '@/lib/rate-limit';
import { MAX_TEXT_LENGTH } from '@/lib/limits';

export async function POST(request: Request) {
  const ip = getClientIP(request);
  const { allowed, resetInSeconds } = rateLimit(`capture:${ip}`, 20, 60);
  if (!allowed) {
    return NextResponse.json(
      { error: `Too many requests. Try again in ${resetInSeconds} seconds.` },
      { status: 429 },
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 });
  }

  const { text } = body;

  if (!text || typeof text !== 'string') {
    return NextResponse.json({ error: 'Missing required field: text' }, { status: 400 });
  }

  const sanitizedText = text.slice(0, MAX_TEXT_LENGTH).trim();

  if (sanitizedText.length === 0) {
    return NextResponse.json({ error: 'Text cannot be empty' }, { status: 400 });
  }

  if (DEMO_MODE) {
    return NextResponse.json({
      capture: { id: 'demo-cap', text: sanitizedText, category: 'ideas', created_at: new Date().toISOString() },
    });
  }

  // Require authentication in live mode
  try {
    const { createClient } = await import('@/lib/supabase/server');
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const Anthropic = (await import('@anthropic-ai/sdk')).default;
    const anthropic = new Anthropic();

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 150,
      system: `You are Lumen, a quick-capture assistant. The user just fired off a quick thought. Categorize it and optionally clean up the text to be more actionable.

Return ONLY valid JSON: {"category": "...", "cleaned_text": "..."}

## Categories
- **must_do**: Someone is waiting. There's a deadline (explicit or implied). Something breaks or worsens if delayed. A commitment was made. Keywords: "need to", "have to", "deadline", "before", "by", "meeting", "appointment", "reply", "respond"
- **can_wait**: Real task but no urgency. Errands, maintenance, things to batch for later. Admin tasks, shopping, organizing. "Should probably", "at some point", "when I get a chance"
- **ideas**: Creative sparks, aspirations, "what if", business ideas, things to try/explore/learn. Future-oriented thinking. Excitement or curiosity energy.
- **worries**: Fears, anxieties, emotional weight, relationship concerns, health anxiety, money stress, existential questions. The emotional texture matters more than the content — if the person FEELS worried, it's a worry.

## Decision tree
1. Is someone actively waiting or will something break? → must_do
2. Does it carry emotional weight / anxiety / fear? → worries
3. Is it creative, aspirational, or exploratory? → ideas
4. Everything else → can_wait

## cleaned_text rules
- If the text is already clear and actionable, return it unchanged
- If it's shorthand ("dentist", "mom bday"), expand it slightly ("Book dentist appointment", "Get Mom a birthday gift")
- Keep the user's voice — don't over-formalize casual language
- Keep it short — this is a quick capture, not a project plan`,
      messages: [{ role: 'user', content: sanitizedText }],
    });

    const content = message.content[0];
    if (content.type !== 'text') throw new Error('Unexpected');
    let parsed;
    try {
      parsed = JSON.parse(content.text);
    } catch {
      // Fallback if AI returns invalid JSON
      parsed = { category: 'ideas', cleaned_text: sanitizedText };
    }
    const validCategories = ['must_do', 'can_wait', 'ideas', 'worries'];
    const category = validCategories.includes(parsed.category) ? parsed.category : 'ideas';
    const cleanedText = parsed.cleaned_text || sanitizedText;
    return NextResponse.json({
      capture: { id: Date.now().toString(), text: cleanedText, category, created_at: new Date().toISOString() },
    });
  } catch {
    // Fallback to 'ideas' category if Claude API fails
    return NextResponse.json({
      capture: { id: Date.now().toString(), text: sanitizedText, category: 'ideas', created_at: new Date().toISOString() },
    });
  }
}
