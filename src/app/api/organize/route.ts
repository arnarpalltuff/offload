import { NextResponse } from 'next/server';
import { DEMO_MODE, DEMO_ORGANIZED, DEMO_RAW_TEXT } from '@/lib/demo';
import { rateLimit, getClientIP } from '@/lib/rate-limit';
import { MAX_TEXT_LENGTH } from '@/lib/limits';

export async function POST(request: Request) {
  // Rate limit: 10 organize requests per minute per IP
  const ip = getClientIP(request);
  const { allowed, resetInSeconds } = rateLimit(`organize:${ip}`, 10, 60);
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
    // If user typed custom text, build a smart parse from their input
    if (sanitizedText && sanitizedText !== DEMO_RAW_TEXT) {
      // Split on sentence boundaries, newlines, commas between clauses, and "and" / "also" connectors
      const sentences = sanitizedText
        .split(/[.!?\n]+|,\s*(?=I |i |also |and I |but |plus )/i)
        .map((s) => s.trim())
        .filter((s) => s.length > 3);
      const now = new Date().toISOString();
      const mustDo: typeof DEMO_ORGANIZED.must_do = [];
      const canWait: typeof DEMO_ORGANIZED.can_wait = [];
      const ideas: typeof DEMO_ORGANIZED.ideas = [];
      const worries: typeof DEMO_ORGANIZED.worries = [];

      // Expanded keyword detection with phrase matching
      const worryPatterns = ['worry', 'worried', 'anxious', 'anxiety', 'stress', 'stressed', 'scared', 'afraid', 'nervous', 'overwhelm', 'can\'t stop thinking', 'keep thinking about', 'what if', 'terrified', 'dread', 'panic', 'losing sleep', 'up at night', 'not sure if', 'afraid that', 'concerned about', 'freaking out'];
      const ideaPatterns = ['idea', 'maybe i should', 'maybe i could', 'could try', 'wonder if', 'dream', 'imagine', 'someday', 'what about', 'wouldn\'t it be', 'been thinking about starting', 'want to learn', 'want to try', 'side project', 'it would be cool', 'i wish', 'one day'];
      const urgentPatterns = ['today', 'tonight', 'deadline', 'due', 'asap', 'urgent', 'right now', 'must', 'need to', 'have to', 'got to', 'gotta', 'before end of', 'by tomorrow', 'by end of day', 'someone is waiting', 'meeting', 'appointment', 'call back', 'overdue', 'late on', 'promised'];
      const waitPatterns = ['at some point', 'eventually', 'when i get a chance', 'should probably', 'one of these days', 'this week', 'next week', 'soon', 'not urgent'];

      sentences.forEach((s, i) => {
        const lower = s.toLowerCase();
        const item = { id: `u${i}`, text: s.charAt(0).toUpperCase() + s.slice(1), priority: 1, completed: false, notes: '', created_at: now };

        // Score each category
        const worryScore = worryPatterns.filter((w) => lower.includes(w)).length;
        const ideaScore = ideaPatterns.filter((w) => lower.includes(w)).length;
        const urgentScore = urgentPatterns.filter((w) => lower.includes(w)).length;
        const waitScore = waitPatterns.filter((w) => lower.includes(w)).length;

        // Also detect emotional tone
        const hasQuestionMark = s.includes('?');
        const hasEmotionalWords = /feel|felt|feeling|emotion|heart|soul|love|hate|angry|sad|happy|hurt|pain|lonely|alone/i.test(s);

        if (worryScore > 0 || (hasQuestionMark && hasEmotionalWords)) {
          worries.push({ ...item, category: 'worries' });
        } else if (ideaScore > 0 && ideaScore >= urgentScore) {
          ideas.push({ ...item, category: 'ideas' });
        } else if (urgentScore > 0 && urgentScore > waitScore) {
          mustDo.push({ ...item, category: 'must_do' });
        } else if (waitScore > 0 || (ideaScore === 0 && urgentScore === 0)) {
          canWait.push({ ...item, category: 'can_wait' });
        } else {
          canWait.push({ ...item, category: 'can_wait' });
        }
      });

      // Assign priorities within each category
      [mustDo, canWait, ideas, worries].forEach((list) => {
        list.forEach((item, idx) => { item.priority = Math.min(idx + 1, 3); });
      });

      // Ensure at least one item exists
      if (mustDo.length === 0 && canWait.length === 0 && ideas.length === 0 && worries.length === 0) {
        canWait.push({ id: 'u0', text: sanitizedText.slice(0, 200), category: 'can_wait', priority: 1, completed: false, notes: '', created_at: now });
      }

      // Generate a contextual summary
      const total = mustDo.length + canWait.length + ideas.length + worries.length;
      const summaryParts: string[] = [];

      if (total === 1) {
        summaryParts.push('One thing on your mind. Sometimes that\'s all it takes to feel heavy — or all it takes to feel clear once you name it.');
      } else if (mustDo.length > 0 && worries.length > 0) {
        summaryParts.push(`You've got ${mustDo.length} thing${mustDo.length > 1 ? 's that need' : ' that needs'} action and ${worries.length} that need${worries.length === 1 ? 's' : ''} acknowledgment. Start with "${mustDo[0].text}" — knocking out the urgent stuff first will free up mental space to sit with the worries.`);
      } else if (mustDo.length > 0) {
        summaryParts.push(`${mustDo.length} thing${mustDo.length > 1 ? 's' : ''} with real urgency. "${mustDo[0].text}" is your domino — start there and the rest gets easier.`);
      } else if (worries.length > 0 && ideas.length > 0) {
        summaryParts.push(`No fires to put out — that\'s good. But your brain is split between worrying and dreaming. The worries will shrink once you externalize them (which you just did). Now give the ideas some air.`);
      } else if (worries.length > 0) {
        summaryParts.push(`What you shared is mostly emotional weight, not tasks. That's important to recognize — your brain doesn't need a to-do list right now, it needs to be heard. Writing this down was the right move.`);
      } else if (ideas.length > canWait.length) {
        summaryParts.push(`Your brain is in creative mode. ${ideas.length} ideas came out of this dump. Don't try to act on all of them — pick the one that gives you the most energy and give it 10 minutes today. The rest will keep.`);
      } else {
        summaryParts.push(`${total} things pulled from your brain dump. Nothing is on fire — which means you get to choose where to start instead of reacting. That's a good place to be.`);
      }

      const organized = {
        must_do: mustDo,
        can_wait: canWait,
        ideas,
        worries,
        summary: summaryParts.join(' '),
      };
      return NextResponse.json({ organized });
    }
    return NextResponse.json({ organized: DEMO_ORGANIZED });
  }

  // Live mode: use Claude API
  try {
    const Anthropic = (await import('@anthropic-ai/sdk')).default;
    const anthropic = new Anthropic();

    const now = new Date();
    const timeOfDay = now.getHours() < 12 ? 'morning' : now.getHours() < 17 ? 'afternoon' : 'evening';
    const dayOfWeek = now.toLocaleDateString('en-US', { weekday: 'long' });

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2500,
      system: `You are Lumen, an AI thinking partner in a journaling app called Offload. You think like a cognitive behavioral therapist who also happens to be someone's sharpest, most caring friend. You notice what people say, but you also notice what they don't say.

## Context
- It is ${dayOfWeek} ${timeOfDay}.
- The user just did a "brain dump" — they typed out everything on their mind without filtering. This is raw, unprocessed thought. Your job is to bring structure to chaos and make them feel genuinely lighter.

## Output format
Return ONLY valid JSON:
{
  "must_do": [{"id": "m1", "text": "...", "category": "must_do", "priority": 1, "completed": false, "notes": "", "created_at": "${now.toISOString()}"}],
  "can_wait": [{"id": "c1", "text": "...", "category": "can_wait", "priority": 1, "completed": false, "notes": "", "created_at": "${now.toISOString()}"}],
  "ideas": [{"id": "i1", "text": "...", "category": "ideas", "priority": 1, "completed": false, "notes": "", "created_at": "${now.toISOString()}"}],
  "worries": [{"id": "w1", "text": "...", "category": "worries", "priority": 1, "completed": false, "notes": "", "created_at": "${now.toISOString()}"}],
  "summary": "..."
}

## Categorization — think like a triage nurse for the mind

### must_do (Urgent & time-bound)
Apply the "tomorrow test": if this slips to tomorrow, will there be a real consequence — a missed deadline, a disappointed person, a compounding problem? If yes, it's must_do. If not, resist the anxiety's attempt to make everything feel urgent.
- Things someone is waiting on → must_do
- Things with explicit or implied deadlines → must_do
- Things that compound if delayed (e.g., health symptoms, legal deadlines) → must_do
- Emotional urgency alone does NOT make something must_do

### can_wait (Important but flexible)
These are real tasks that matter — just not today. Be honest about the difference between "I should" and "I must."
- Things the user mentioned wanting to do but gave no timeline → can_wait
- Maintenance tasks (organizing, cleaning, admin) → can_wait
- Things that would be nice to do this week but nothing breaks if they don't → can_wait

### ideas (Creative seeds)
These are precious. The user's subconscious is offering something — treat ideas with genuine enthusiasm, not corporate bullet points.
- "What if..." or "Maybe I should..." statements → ideas
- Aspirations, side projects, things that light them up → ideas
- Frame each idea as a possibility, not a task. "Explore building..." not "Build..."

### worries (Emotional weight)
These are the things the brain keeps looping on. The goal isn't to solve them — it's to externalize them so the user can see them clearly instead of carrying them invisibly.
- Anxieties, fears, emotional undercurrents → worries
- Rephrase for clarity but KEEP the emotional weight. "Am I spending enough time with my kids?" not "Evaluate family time allocation"
- If something is both a task AND a worry (e.g., "terrified about the presentation"), put the task in must_do and add a separate worry that names the emotion

## Item text guidelines
- Preserve the user's vocabulary and tone. If they swore, you can clean it up but keep the energy
- Make tasks specific and completable. "Reply to Jake's email about the timeline" not "Handle emails"
- For worries, articulate what the user might struggle to say clearly. Name the real fear underneath
- Split compound thoughts into separate items. "Call mom and figure out finances" = 2 items
- Priority: 1 = do this first, 2 = do this second, 3 = do this when you can

## Summary — this is where you really shine
Write 2-4 sentences that demonstrate you actually understood what's going on in this person's life right now. Your summary should:

1. **Name the emotional undercurrent.** Not just "you have a lot going on" — but WHY it feels heavy. Is it decision fatigue? Too many open loops? One big thing casting a shadow over everything else? Competing priorities pulling them in different directions?

2. **Give them a specific first move.** Not "start with the must-dos" — name THE one thing. "The quarterly report is the domino — everything else gets easier once that's off your plate."

3. **Notice something they might not see.** A pattern, a contradiction, an unspoken need. "You mentioned three different things about work but nothing about rest — when did you last take a real break?"

4. **Time-aware closing.** ${timeOfDay === 'morning' ? 'Set them up for the day ahead with energy and focus.' : timeOfDay === 'afternoon' ? 'Help them salvage the rest of the day — what is still realistic?' : 'Acknowledge it is late. Help them let go of today and set up tomorrow.'}

### What NEVER goes in the summary:
- "Great job organizing your thoughts!" or any praise for using the app
- "Remember to take care of yourself" or any generic self-care advice
- Motivational quotes or "You've got this!" energy
- Restating the categories ("You have 3 must-dos and 2 worries...")

Tone: warm but honest. Like a friend who respects you enough to tell you the truth. Slightly conversational. Sentences that make the user think "...huh, yeah, that's exactly it."`,
      messages: [{ role: 'user', content: sanitizedText }],
    });

    const content = message.content[0];
    if (content.type !== 'text') throw new Error('Unexpected response type');
    let organized;
    try {
      organized = JSON.parse(content.text);
    } catch {
      return NextResponse.json({ error: 'AI returned an invalid response. Please try again.' }, { status: 502 });
    }
    if (!organized.must_do || !organized.can_wait || !organized.ideas || !organized.worries) {
      return NextResponse.json({ error: 'AI returned an incomplete response. Please try again.' }, { status: 502 });
    }
    return NextResponse.json({ organized });
  } catch {
    return NextResponse.json({ error: 'Failed to organize thoughts. Please try again.' }, { status: 500 });
  }
}
