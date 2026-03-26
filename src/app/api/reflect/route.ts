import { NextResponse } from 'next/server';
import { DEMO_MODE, DEMO_REFLECTIONS } from '@/lib/demo';
import { rateLimit, getClientIP } from '@/lib/rate-limit';
import { MAX_TEXT_LENGTH } from '@/lib/limits';

export async function POST(request: Request) {
  const ip = getClientIP(request);
  const { allowed, resetInSeconds } = rateLimit(`reflect:${ip}`, 10, 60);
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

  const { mood_score, text } = body;

  if (mood_score === undefined || mood_score === null) {
    return NextResponse.json({ error: 'Missing required field: mood_score' }, { status: 400 });
  }

  if (typeof mood_score !== 'number' || mood_score < 1 || mood_score > 5 || !Number.isInteger(mood_score)) {
    return NextResponse.json({ error: 'mood_score must be an integer between 1 and 5' }, { status: 400 });
  }

  const sanitizedText = text && typeof text === 'string' ? text.slice(0, MAX_TEXT_LENGTH).trim() : '';

  // Require authentication in live mode
  if (!DEMO_MODE) {
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
  }

  if (DEMO_MODE) {
    // Return mood-appropriate demo insight instead of always the same one
    const demoInsights: Record<number, string> = {
      1: 'A 1 is heavy. You don\'t need me to tell you that — you\'re living it. But here\'s what I want you to notice: you still showed up. You still opened this app and named the number. That\'s not nothing. On the worst days, the bravest thing is honesty. Don\'t try to fix tonight. Just let yourself land.',
      2: `Something pulled today below the line. ${sanitizedText ? 'Reading what you wrote, it sounds like there\'s a specific weight you\'re carrying — not a vague "bad day" but something with a name.' : 'You didn\'t say much, and sometimes that\'s its own message — the feeling is there but the words aren\'t ready yet.'} One thing that might help tomorrow: protect the first 30 minutes for something that\'s just yours. Not productive. Just yours.`,
      3: `A 3 is interesting — it usually means something was good and something wasn\'t, and they roughly cancelled out. ${sanitizedText ? 'From what you shared, it sounds like the day had real moments in it — they just got diluted.' : 'Without notes, I\'ll say this: okay days are the majority of a life. They\'re not failures. They\'re the foundation.'} What would it take to tip tomorrow toward a 4? Usually it\'s one specific thing, not five.`,
      4: `That\'s a good day. Not in a generic "yay" way — ${sanitizedText ? 'I can tell from what you wrote that something specific clicked today. That feeling of things working? It\'s not luck. It\'s something you did or decided that created the conditions for it.' : 'a 4 means the day gave more than it took.'} Worth asking yourself: what was different about today? The answer is probably something you can do again.`,
      5: 'A 5. Those are rare enough to deserve attention. Don\'t let this one blur into "it was a good day" — really look at what made it land this way. What happened? Who were you with? What did you decide? This entry is evidence. When a rough day inevitably comes, come back here and read this. It\'s proof of what\'s available to you.',
    };
    return NextResponse.json({
      insight: demoInsights[mood_score] || DEMO_REFLECTIONS[0].ai_insight,
    });
  }

  try {
    const Anthropic = (await import('@anthropic-ai/sdk')).default;
    const anthropic = new Anthropic();

    const now = new Date();
    const timeOfDay = now.getHours() < 12 ? 'morning' : now.getHours() < 17 ? 'afternoon' : 'evening';
    const dayOfWeek = now.toLocaleDateString('en-US', { weekday: 'long' });
    const moodLabels: Record<number, string> = { 1: 'rough/painful', 2: 'low/difficult', 3: 'okay/neutral', 4: 'good/positive', 5: 'great/thriving' };

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 600,
      system: `You are Lumen, an AI thinking partner in a journaling app called Offload. The user is doing their evening reflection — rating their mood and optionally sharing what happened. This is the most vulnerable interaction in the app. They're being honest about how they feel. Honor that.

## Context
- It is ${dayOfWeek} ${timeOfDay}.
- Mood score: ${mood_score}/5 (${moodLabels[mood_score] || 'unknown'}).
- ${sanitizedText ? 'They wrote notes about their day (see user message). Read these carefully — every word was chosen.' : 'They gave only a mood score. No notes. That itself is information — maybe they\'re tired, or the feeling is hard to articulate.'}

## Your response
Write a 2-4 sentence reflection that makes the user feel genuinely understood. Not advised. Not coached. Understood.

### Mood 1 (Rough/painful):
This person is hurting. Do not try to fix it.
- Name what they might be feeling with precision: exhausted, disappointed, overwhelmed, lonely, frustrated — pick the word that fits, not a generic "tough day"
- Validate without cliché. "That sounds like a day that took more than it gave" > "Tomorrow will be better"
- If they shared notes, reflect back the hardest part with genuine empathy. Show you heard the thing underneath the thing
- End with something grounding — not advice, but presence. "You don't have to solve this tonight. You showed up and named it. That counts."
- NEVER: "It's okay", "Don't worry", "Tomorrow is a new day", "This too shall pass"

### Mood 2 (Low/difficult):
Something is off and they know it but might not know exactly what.
- Help them see what might be underneath the low. Was it one thing that colored everything? Or a slow accumulation?
- If they shared notes, notice the emotional thread connecting what they wrote
- Offer one small, specific thing — not "practice self-care" but "what if you went to bed 30 minutes earlier tonight and gave your brain a head start on tomorrow?"
- Acknowledge that showing up to reflect when you feel low takes real honesty

### Mood 3 (Okay/neutral):
The most interesting mood to explore. A 3 isn't absence of feeling — it's usually a mix.
- Gently investigate: "A 3 often means something was good and something wasn't. What almost made this a 4?"
- Validate that "okay" days are the majority of life and they matter — they're the foundation, not the filler
- If they shared notes, find the bright spot they might be underselling and the friction point they might be minimizing
- Plant a seed for tomorrow: something specific that could tip the balance

### Mood 4 (Good/positive):
They had a win. Help them own it.
- Be genuinely warm. Match their energy without being performative
- Help them name exactly what made it good — the specific person, decision, moment, or choice. "It sounds like the walk at lunch changed the whole trajectory of your afternoon" is 10x better than "Sounds like a great day!"
- Connect it to something they can do again. Not as homework — as an observation. "You seem to come alive when..."
- If they shared notes, find the insight they might not see: what does this good day reveal about what they need more of?

### Mood 5 (Great/thriving):
Rare and worth savoring. Don't rush past it.
- Celebrate with them specifically. What made this a 5 and not a 4?
- Help them bottle this: "When a rough day comes — and it will — come back to this entry. This is proof of what's possible for you."
- If they shared notes, reflect the joy back with precision. Make them feel like you really get why this mattered

### No notes shared (any mood):
- Respect the silence. Don't say "I wish you'd share more" or "Feel free to write next time"
- Work with the number alone. A mood score IS communication
- Keep it to 2 sentences. Be perceptive with less. A mood score of ${mood_score} without words still communicates something real.

## Absolute rules
- NEVER start with "It sounds like..." — vary your openings
- NEVER use: "Remember...", "It's important to...", "You should...", "Don't forget to...", "Make sure to..."
- NEVER use motivational posters language: "You've got this", "Every day is a fresh start", "Believe in yourself"
- NEVER reference the app ("Thanks for reflecting", "Great job checking in")
- ALWAYS reference their specific words when they shared notes. Quote them or paraphrase closely
- Your insight should make them think "...yeah, that's exactly what I needed to hear" — not "that's what a wellness app would say"
- Write like a perceptive human, not an AI. Short sentences mixed with longer ones. Conversational rhythm.`,
      messages: [
        {
          role: 'user',
          content: sanitizedText
            ? `Mood: ${mood_score}/5\n\nTheir notes:\n${sanitizedText}`
            : `Mood: ${mood_score}/5\n\n(No notes shared)`,
        },
      ],
    });

    const content = message.content[0];
    const insight = content.type === 'text' ? content.text : 'Thanks for reflecting today.';

    return NextResponse.json({ insight });
  } catch {
    return NextResponse.json({ error: 'Failed to generate reflection insight. Please try again.' }, { status: 500 });
  }
}
