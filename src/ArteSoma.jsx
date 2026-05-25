import { useState, useEffect, useRef } from "react";

const MAX_DAILY = 5;
const STORAGE_KEY = "artesoma:usage";

const SYSTEM_PROMPT = `You are the Creative Micro-Practice Generator.

Your role is to generate short, non-instrumental creative micro-practices rooted in attention, perception, and lived experience. Practices support orientation, clarity, and presence — not self-improvement, performance, productivity, therapy, healing, or optimization.

Practices should feel gentle, low-demand, invitational, embodied, and open-ended.
Use descriptive, neutral, non-evaluative language.

⸻

Initial Interaction Behavior (Required)

The user's inputs will be provided to you directly as a structured message. Do not ask for any further clarifying questions. Proceed immediately to generating the practice based on the inputs provided.

⸻

Scope and Boundaries

If a user explicitly requests therapy, emotional support, diagnosis, or treatment, respond briefly that this tool does not provide that and suggest seeking a qualified therapist or healthcare provider.

Then, in one neutral sentence, state what the tool can offer instead (a non-therapeutic creative micro-practice focused on attention and perception) and invite the user to continue within that scope.

Do not add empathy, reassurance, or interpretation.
Do not reflect emotional language.
Limit the refusal and redirection to two sentences total.

When refusing and redirecting, present the two sentences as separate paragraphs.

After this, present the input questions clearly separated, each on its own line, in list form.

⸻

Global Prohibitions (Apply Everywhere)
• No motivational language, affirmations, advice, or encouragement
• No outcome-, benefit-, or effect-oriented language
• No explanation of purpose or "why it works"
• No interpretation of the user's experience
• No validation, reassurance, or emotional framing
• No recommendations of resources, tools, people, or next steps

Avoid words such as improve, optimize, fix, heal, achieve, support, regulate, or similar outcome-driven terms.

⸻

Language and Tone

Remain neutral in tone (descriptive, non-evaluative) while using invitational phrasing rather than commands.

If the user uses emotional or clinical language, respond without adopting that framing and proceed using neutral state descriptors only.

Do not diagnose, normalize, interpret, or reflect emotional states.

⸻

Minimal Acknowledgment Before Questions

When a user shares personal context, lived experience, or emotional language, include one brief neutral acknowledgment before asking the input questions.

This acknowledgment must:
• Be factual and minimal
• Avoid empathy, reassurance, or validation
• Avoid reflecting or naming emotions
• Avoid diagnosis or interpretation

The purpose is only to signal that the input has been received.

Acceptable examples include:
• "I can offer a brief micro-practice."
• "I can offer a short practice if you'd like."

Do not add more than one sentence.
The acknowledgment must not reference the user's feelings, state, or circumstances, and must not exceed one short sentence.
After this single sentence, proceed immediately to the input questions.

⸻

Conditional Adaptation Based on User Context

If a user names a condition, diagnosis, identity, or lived context (e.g., Parkinson's, ADHD, autism, chronic pain), do not engage the label itself.

Instead:
• Treat it as contextual information about variability, not a problem to address
• Quietly adapt the practice to reduce demand, correction, repetition, and performance pressure
• Bias toward external perceptual anchors and open-ended engagement
• Avoid assumptions about stillness, control, endurance, sequencing, or precision

Do not reference the diagnosis or identity in the practice itself.

If a user explicitly names a condition, do not ask follow-up questions about symptoms, severity, or progression.

Practices must remain valid even if movement, attention, pacing, or engagement fluctuates, pauses, or interrupts the activity.

⸻

Input Collection

The user's time, modality, current state, and any preferences have already been collected and will be provided to you. Generate the practice directly from those inputs without asking further questions.

⸻

Practice Design Constraints

When generating practices:
• Prefer low-demand invitations that do not require correction, repetition, sequencing, or precision
• Allow engagement to occur without requiring stillness or control
• Bias toward external perceptual anchors (light, shadow, surface, object, sound, texture, environment)
• Keep temporal bounds clear and short
• Allow pauses or stopping at any moment

Avoid:
• Counting, pacing, or rhythm cues
• Breathwork
• Balance, posture, or coordination instructions
• Repetitive actions or drills
• Training, improvement, or rehabilitation logic

Do not include conditional instructions based on emotional or mental states (e.g., "if this feels heavy," "if you are overwhelmed").
Permission to stop must be universal and unconditional.

Practices may involve writing, drawing, mark-making, movement, photography, or quiet observation.

⸻

Practice Generation Rules
• Generate one practice unless the user explicitly asks for more
• If multiple practices are requested, generate no more than three
• Do not extend the practice beyond what is generated
• When in doubt, choose fewer steps and less language

⸻

Variability Across Practices

When a session includes more than one practice, or when context implies the user has done recent practices:
• Actively vary the modality, perceptual anchor, spatial scale, and pace across practices
• Do not repeat the same opening gesture, object type, or sensory domain consecutively
• Rotate across: interior/exterior space, still/moving engagement, close/distant focus, tactile/visual/auditory anchors
• If the prior practice used writing, shift toward observation or drawing; if it used a small object, shift toward environment or distance
• Variation does not require contrast for its own sake — it follows naturally from attending to what has not yet been attended to

⸻

Output Format (Always)
1. Title (4–7 words)
2. One-sentence orientation (descriptive only; no explanation or interpretation)
3. Steps: 3–4 total. Never more than 4. Prefer 3 when possible.
Multiple sensory elements must be combined into a single step rather than listed separately.
4. Closing line: a single sentence that invites stopping at any point, without explanation or justification
5. Neuroarts-informed note (1–2 sentences)

Do not add text outside these five sections.

⸻

Neuroarts-Informed Note Guidelines

The neuroarts-informed note must describe perceptual or attentional processes only, using language such as noticing, sensing, orienting, differentiating, tracking, attending, or perceiving.

Do not:
• Describe benefits, outcomes, regulation, control, neuroplasticity, or effects on the user
• Reference the nervous system, calming, grounding, or internal systems
• Imply that attention alters, improves, organizes, or changes movement or internal states

⸻

Guiding Heuristic

When in doubt, choose allowance over control, fewer instructions over more, and openness over correctness.`;

const INTRO_NOTE = {
  en: "Attention practices shaped by your inputs.\nUp to 5 a day.",
  es: "Prácticas de atención moldeadas por tus respuestas.\nHasta 5 por día.",
};

const LIMIT_MSG = {
  en: "You've reached the 5 practice limit for today.\nThis tool is designed for slow, spaced use.\nCome back tomorrow.",
  es: "Has alcanzado el límite de 5 prácticas por hoy.\nEsta herramienta está pensada para un uso lento y espaciado.\nVuelve mañana.",
};

const FONT_URL = "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Karla:wght@300;400&display=swap";

const styles = `
  @import url('${FONT_URL}');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #f5f0eb; }

  @keyframes fadeSlideIn {
    from { opacity: 0; transform: translateY(40px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(12px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .app {
    min-height: 100vh;
    background: #f5f0eb;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 48px 24px 48px;
    font-family: 'Karla', sans-serif;
  }

  .header { text-align: center; margin-bottom: 28px; }

  .header-byline {
    margin-top: 10px;
    font-size: 0.72rem;
    font-weight: 300;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: #5a5248;
  }

  .divider {
    width: 48px; height: 1px;
    background: #c9bfb5;
    margin: 18px auto 0;
  }

  .top-controls {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 20px;
  }

  .lang-btn {
    font-family: 'Karla', sans-serif;
    font-size: 0.7rem;
    font-weight: 400;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    padding: 5px 12px;
    border-radius: 20px;
    border: 1px solid #c9bfb5;
    background: transparent;
    color: #9a8f85;
    cursor: pointer;
    transition: all 0.2s;
  }
  .lang-btn.active { background: #2a2520; color: #f5f0eb; border-color: #2a2520; }
  .lang-btn:hover:not(.active) { border-color: #9a8f85; color: #2a2520; }

  .reset-btn {
    font-family: 'Karla', sans-serif;
    font-size: 0.7rem;
    font-weight: 300;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    padding: 5px 12px;
    border-radius: 20px;
    border: 1px solid transparent;
    background: transparent;
    color: #b5aca3;
    cursor: pointer;
    transition: all 0.2s;
    margin-left: 4px;
  }
  .reset-btn:hover { color: #2a2520; border-color: #c9bfb5; }

  .usage-indicator {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 32px;
  }

  .usage-dot {
    width: 7px; height: 7px;
    border-radius: 50%;
    border: 1px solid #c9bfb5;
    background: transparent;
    transition: background 0.4s, border-color 0.4s;
  }
  .usage-dot.used { background: #9a8f85; border-color: #9a8f85; }

  .intro-note {
    width: 100%;
    max-width: 620px;
    font-family: 'Cormorant Garamond', serif;
    font-size: 1rem;
    font-weight: 300;
    color: #5a5248;
    text-align: center;
    line-height: 1.7;
    margin-top: 16px;
    margin-bottom: 32px;
    white-space: pre-wrap;
  }

  .chat-window {
    width: 100%;
    max-width: 620px;
    display: flex;
    flex-direction: column;
    gap: 28px;
  }

  .message { display: flex; flex-direction: column; }
  .message.user { align-items: flex-end; }
  .message.assistant { align-items: center; }

  .bubble {
    max-width: 96%;
    padding: 16px 20px;
    line-height: 1.75;
    font-size: 0.92rem;
    font-weight: 300;
    color: #2a2520;
    white-space: pre-wrap;
    word-break: break-word;
  }
  .message.user .bubble {
    background: #e8e0d8;
    border-radius: 2px 16px 16px 16px;
    color: #3a3028;
  }
  .message.assistant .bubble {
    background: #fff;
    border-radius: 16px;
    border: 1px solid #e8e0d6;
    font-family: 'Cormorant Garamond', serif;
    font-size: 1.08rem;
    font-weight: 300;
    color: #1a1510;
    line-height: 1.9;
    width: 100%;
  }

  .limit-notice {
    width: 100%;
    max-width: 620px;
    text-align: center;
    font-family: 'Cormorant Garamond', serif;
    font-size: 1.05rem;
    font-weight: 300;
    font-style: italic;
    color: #9a8f85;
    line-height: 2;
    padding: 40px 24px;
    border: 1px solid #e8e0d6;
    border-radius: 16px;
    background: #fff;
    white-space: pre-line;
  }

  .typing-indicator {
    display: flex;
    gap: 5px;
    padding: 18px 22px;
    background: #fff;
    border: 1px solid #e8e0d6;
    border-radius: 16px 16px 16px 2px;
    width: fit-content;
  }
  .dot {
    width: 6px; height: 6px;
    border-radius: 50%;
    background: #c9bfb5;
    animation: pulse 1.4s ease-in-out infinite;
  }
  .dot:nth-child(2) { animation-delay: 0.2s; }
  .dot:nth-child(3) { animation-delay: 0.4s; }
  @keyframes pulse {
    0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
    40% { opacity: 1; transform: scale(1); }
  }

  .input-area {
    position: static;
    width: 100%;
    background: transparent;
    padding: 24px 24px 12px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
  .input-row {
    width: 100%;
    max-width: 560px;
    display: flex;
    gap: 10px;
    align-items: flex-end;
    background: #fff;
    border: 1px solid #ddd5ca;
    border-radius: 24px;
    padding: 10px 10px 10px 18px;
    box-shadow: 0 2px 12px rgba(0,0,0,0.06);
  }
  .input-field {
    flex: 1;
    border: none; outline: none;
    background: transparent;
    font-family: 'Karla', sans-serif;
    font-size: 0.92rem;
    font-weight: 300;
    color: #2a2520;
    resize: none;
    line-height: 1.6;
    max-height: 120px;
    overflow-y: auto;
  }
  .input-field::placeholder { color: #b5aca3; }
  .send-btn {
    width: 36px; height: 36px;
    border-radius: 50%;
    background: #ff7474;
    border: none; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
    transition: background 0.2s, transform 0.1s;
  }
  .send-btn:hover { background: #ff7474; transform: scale(1.05); }
  .send-btn:disabled { background: #ffdcdc; cursor: default; transform: none; }
  .send-btn svg { width: 15px; height: 15px; fill: #fff; }

  .coffee-link {
    display: block;
    text-align: center;
    font-family: 'Karla', sans-serif;
    font-size: 0.75rem;
    font-weight: 400;
    color: #5a5248;
    text-decoration: none;
    margin-bottom: 16px;
    margin-top: 16px;
    letter-spacing: 0.03em;
    transition: color 0.2s;
  }
  .coffee-link:hover { color: #2a2520; }

  .disclaimer {
    text-align: center;
    font-size: 0.68rem;
    font-weight: 300;
    letter-spacing: 0.06em;
    color: #7a726b;
    margin-top: 6px;
    margin-bottom: 0;
    width: 100%;
    max-width: 620px;
  }

  /* ── Intake form ─────────────────────────────────────────── */

  .intake-wrap {
    width: 100%;
    max-width: 620px;
    animation: fadeIn 0.5s ease forwards;
  }

  .intake-card {
    background: #fff;
    border: 1px solid #e8e0d6;
    border-radius: 16px;
    padding: 28px 28px 24px;
    width: 100%;
  }

  .intake-question {
    font-family: 'Cormorant Garamond', serif;
    font-size: 1.08rem;
    font-weight: 300;
    color: #1a1510;
    line-height: 1.7;
    margin-bottom: 20px;
  }

  .intake-question .step-label {
    display: block;
    font-family: 'Karla', sans-serif;
    font-size: 0.62rem;
    font-weight: 400;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: #8a8078;
    margin-bottom: 8px;
  }

  .option-row {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 16px;
  }

  .option-btn {
    font-family: 'Karla', sans-serif;
    font-size: 0.8rem;
    font-weight: 300;
    letter-spacing: 0.04em;
    padding: 7px 16px;
    border-radius: 20px;
    border: 1px solid #d4ccc5;
    background: transparent;
    color: #5a5248;
    cursor: pointer;
    transition: all 0.18s;
  }
  .option-btn:hover { border-color: #9a8f85; color: #2a2520; }
  .option-btn.selected { background: #2a2520; color: #f5f0eb; border-color: #2a2520; }

  .intake-text {
    width: 100%;
    border: 1px solid #d4ccc5;
    border-radius: 12px;
    padding: 10px 14px;
    font-family: 'Karla', sans-serif;
    font-size: 0.88rem;
    font-weight: 300;
    color: #2a2520;
    background: transparent;
    outline: none;
    resize: none;
    line-height: 1.6;
    margin-bottom: 16px;
    transition: border-color 0.2s;
  }
  .intake-text::placeholder { color: #c9bfb5; }
  .intake-text:focus { border-color: #9a8f85; }

  .intake-hint {
    font-family: 'Karla', sans-serif;
    font-size: 0.72rem;
    font-weight: 300;
    color: #8a8078;
    margin-bottom: 14px;
    font-style: italic;
    letter-spacing: 0.02em;
  }

  .intake-nav {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 10px;
    margin-top: 4px;
  }

  .intake-skip {
    font-family: 'Karla', sans-serif;
    font-size: 0.72rem;
    font-weight: 300;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #8a8078;
    background: transparent;
    border: none;
    cursor: pointer;
    padding: 6px 4px;
    transition: color 0.2s;
  }
  .intake-skip:hover { color: #2a2520; }

  .intake-next {
    font-family: 'Karla', sans-serif;
    font-size: 0.75rem;
    font-weight: 400;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    padding: 8px 20px;
    border-radius: 20px;
    border: none;
    background: #2a2520;
    color: #f5f0eb;
    cursor: pointer;
    transition: opacity 0.2s, transform 0.1s;
  }
  .intake-next:hover { opacity: 0.85; transform: scale(1.02); }
  .intake-next:disabled { opacity: 0.35; cursor: default; transform: none; }

  .intake-generate {
    font-family: 'Karla', sans-serif;
    font-size: 0.75rem;
    font-weight: 400;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    padding: 8px 20px;
    border-radius: 20px;
    border: none;
    background: #ff7474;
    color: #fff;
    cursor: pointer;
    transition: opacity 0.2s, transform 0.1s;
  }
  .intake-generate:hover { opacity: 0.88; transform: scale(1.02); }
  .intake-generate:disabled { opacity: 0.35; cursor: default; transform: none; }

  .intake-progress {
    display: flex;
    gap: 5px;
    margin-bottom: 20px;
  }
  .intake-progress-dot {
    width: 5px; height: 5px;
    border-radius: 50%;
    background: #d4ccc5;
    transition: background 0.3s;
  }
  .intake-progress-dot.active { background: #2a2520; }
  .intake-progress-dot.done { background: #9a8f85; }
`;

const SendIcon = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M2 21l21-9L2 3v7l15 2-15 2z"/>
  </svg>
);

// ── Storage helpers ──────────────────────────────────────────────────────────

const todayKey = () => new Date().toISOString().slice(0, 10);

async function getUsage() {
  try {
    const result = localStorage.getItem(STORAGE_KEY);
    if (!result) return { date: todayKey(), count: 0 };
    const data = JSON.parse(result);
    if (data.date !== todayKey()) return { date: todayKey(), count: 0 };
    return data;
  } catch {
    return { date: todayKey(), count: 0 };
  }
}

async function incrementUsage() {
  const usage = await getUsage();
  const updated = { date: todayKey(), count: usage.count + 1 };
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(updated)); } catch {}
  return updated.count;
}

const looksLikePractice = (text) =>
  text.length > 200 && /neuroarts|note|nota|title|título/i.test(text);

// ── Intake form steps ────────────────────────────────────────────────────────

const STEPS = {
  en: [
    {
      id: "time",
      label: "1 of 4",
      question: "How much time do you have?",
      type: "buttons",
      options: ["2 minutes", "5 minutes", "10 minutes"],
      required: true,
    },
    {
      id: "modality",
      label: "2 of 4",
      question: "What would you like to work with?",
      type: "buttons",
      options: ["write", "draw / paint", "photograph", "observe"],
      required: true,
    },
    {
      id: "state",
      label: "3 of 4",
      question: "Current state?",
      type: "text",
      placeholder: "e.g. scattered, tense, curious, open, uncertain…",
      hint: "Optional — leave blank to skip",
      required: false,
    },
    {
      id: "other",
      label: "4 of 4",
      question: "Anything else?",
      type: "text",
      placeholder: "any other preferences or context…",
      hint: "Optional — leave blank to skip",
      required: false,
    },
  ],
  es: [
    {
      id: "time",
      label: "1 de 4",
      question: "¿Cuánto tiempo tienes?",
      type: "buttons",
      options: ["2 minutos", "5 minutos", "10 minutos"],
      required: true,
    },
    {
      id: "modality",
      label: "2 de 4",
      question: "¿Con qué modalidad quieres trabajar?",
      type: "buttons",
      options: ["escribir", "dibujar / pintar", "fotografiar", "observar"],
      required: true,
    },
    {
      id: "state",
      label: "3 de 4",
      question: "¿Estado actual?",
      type: "text",
      placeholder: "ej. disperso, tenso, curioso, abierto, incierto…",
      hint: "Opcional — deja en blanco para omitir",
      required: false,
    },
    {
      id: "other",
      label: "4 de 4",
      question: "¿Algo más?",
      type: "text",
      placeholder: "otras preferencias o contexto…",
      hint: "Opcional — deja en blanco para omitir",
      required: false,
    },
  ],
};

function buildFirstMessage(answers, lang) {
  const a = answers;
  if (lang === "es") {
    const parts = [`Tiempo: ${a.time}`, `Modalidad: ${a.modality}`];
    if (a.state) parts.push(`Estado actual: ${a.state}`);
    if (a.other) parts.push(`Otras preferencias: ${a.other}`);
    return parts.join("\n");
  }
  const parts = [`Time: ${a.time}`, `Modality: ${a.modality}`];
  if (a.state) parts.push(`Current state: ${a.state}`);
  if (a.other) parts.push(`Other preferences: ${a.other}`);
  return parts.join("\n");
}

// ── IntakeForm component ─────────────────────────────────────────────────────

function IntakeForm({ lang, onSubmit }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({ time: "", modality: "", state: "", other: "" });
  const steps = STEPS[lang];
  const current = steps[step];

  const handleSelect = (val) => {
    setAnswers(prev => ({ ...prev, [current.id]: val }));
  };

  const handleText = (e) => {
    setAnswers(prev => ({ ...prev, [current.id]: e.target.value }));
  };

  const canAdvance = current.required ? !!answers[current.id] : true;
  const isLast = step === steps.length - 1;

  const advance = () => {
    if (isLast) {
      onSubmit(answers);
    } else {
      setStep(s => s + 1);
    }
  };

  const skip = () => {
    setAnswers(prev => ({ ...prev, [current.id]: "" }));
    if (isLast) {
      onSubmit({ ...answers, [current.id]: "" });
    } else {
      setStep(s => s + 1);
    }
  };

  return (
    <div className="intake-wrap">
      <div className="intake-progress">
        {steps.map((_, i) => (
          <div
            key={i}
            className={`intake-progress-dot ${i === step ? "active" : i < step ? "done" : ""}`}
          />
        ))}
      </div>

      <div className="intake-card" key={step} style={{ animation: "fadeIn 0.35s ease forwards" }}>
        <div className="intake-question">
          <span className="step-label">{current.label}</span>
          {current.question}
        </div>

        {current.type === "buttons" && (
          <div className="option-row">
            {current.options.map(opt => (
              <button
                key={opt}
                className={`option-btn ${answers[current.id] === opt ? "selected" : ""}`}
                onClick={() => handleSelect(opt)}
              >
                {opt}
              </button>
            ))}
          </div>
        )}

        {current.type === "text" && (
          <>
            {current.hint && <p className="intake-hint">{current.hint}</p>}
            <textarea
              className="intake-text"
              rows={2}
              placeholder={current.placeholder}
              value={answers[current.id]}
              onChange={handleText}
            />
          </>
        )}

        <div className="intake-nav">
          {!current.required && (
            <button className="intake-skip" onClick={skip}>
              {lang === "es" ? "omitir" : "skip"}
            </button>
          )}
          {isLast ? (
            <button
              className="intake-generate"
              onClick={advance}
              disabled={!canAdvance}
            >
              {lang === "es" ? "generar" : "generate"}
            </button>
          ) : (
            <button
              className="intake-next"
              onClick={advance}
              disabled={!canAdvance}
            >
              {lang === "es" ? "siguiente" : "next"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────────────

export default function ArteSoma() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [lang, setLang] = useState("en");
  const [usageCount, setUsageCount] = useState(0);
  const [limitReached, setLimitReached] = useState(false);
  const [ready, setReady] = useState(false);
  // intake = "form" | "done"
  const [intakeState, setIntakeState] = useState("form");
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    const el = document.createElement("style");
    el.textContent = styles;
    document.head.appendChild(el);
    return () => document.head.removeChild(el);
  }, []);

  useEffect(() => {
    getUsage().then(({ count }) => {
      setUsageCount(count);
      const over = count >= MAX_DAILY;
      setLimitReached(over);
      setReady(true);
    });
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleIntakeSubmit = async (answers) => {
    setIntakeState("done");
    const firstMsg = buildFirstMessage(answers, lang);
    const userMsg = { role: "user", content: firstMsg };
    const updated = [userMsg];
    setMessages(updated);

    setLoading(true);
    const langNote = lang === "es"
      ? "The user has selected Spanish. Generate all content in Spanish."
      : "The user has selected English. Generate all content in English.";

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: SYSTEM_PROMPT + `\n\n[${langNote}]`,
          messages: updated.map(m => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await res.json();
      const text = data.content?.map(b => b.text || "").join("") || "";
      setMessages(prev => [...prev, { role: "assistant", content: text }]);

      setTimeout(async () => {
        if (looksLikePractice(text)) {
          const newCount = await incrementUsage();
          setUsageCount(newCount);
          if (newCount >= MAX_DAILY) setLimitReached(true);
        }
      }, 100);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Something went wrong. Please try again." }]);
    }
    setLoading(false);
  };

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading || limitReached) return;

    const userMsg = { role: "user", content: trimmed };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";

    setLoading(true);
    const langNote = lang === "es"
      ? "The user has selected Spanish. Generate all content in Spanish."
      : "The user has selected English. Generate all content in English.";

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: SYSTEM_PROMPT + `\n\n[${langNote}] Important: Do not repeat questions that have already been asked. Proceed directly to generating a practice.`,
          messages: updated.map(m => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await res.json();
      const text = data.content?.map(b => b.text || "").join("") || "";
      setMessages(prev => [...prev, { role: "assistant", content: text }]);

      setTimeout(async () => {
        if (looksLikePractice(text)) {
          const newCount = await incrementUsage();
          setUsageCount(newCount);
          if (newCount >= MAX_DAILY) setLimitReached(true);
        }
      }, 100);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Something went wrong. Please try again." }]);
    }
    setLoading(false);
  };

  const handleReset = () => {
    if (limitReached) return;
    setMessages([]);
    setInput("");
    setIntakeState("form");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  };

  const handleLang = (newLang) => {
    if (newLang === lang || limitReached) return;
    setLang(newLang);
    setMessages([]);
    setInput("");
    setIntakeState("form");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleTextareaChange = (e) => {
    setInput(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
  };

  if (!ready) return null;

  return (
    <div className="app">
      <div className="header">
       
        <p className="header-byline">Micro-Practice Generator - v.02</p>
        <div className="divider" />
      </div>

      <div className="top-controls">
        <button className={`lang-btn ${lang === "en" ? "active" : ""}`} onClick={() => handleLang("en")}>EN</button>
        <button className={`lang-btn ${lang === "es" ? "active" : ""}`} onClick={() => handleLang("es")}>ES</button>
        {intakeState === "done" && !limitReached && (
          <button className="reset-btn" onClick={handleReset}>
            {lang === "es" ? "reiniciar" : "reset"}
          </button>
        )}
      </div>

      <div className="usage-indicator" title={`${usageCount} of ${MAX_DAILY} practices today`}>
        {Array.from({ length: MAX_DAILY }).map((_, i) => (
          <div key={i} className={`usage-dot ${i < usageCount ? "used" : ""}`} />
        ))}
      </div>

      {limitReached ? (
        <div className="limit-notice">{LIMIT_MSG[lang]}</div>
      ) : (
        <>
          {intakeState === "form" && (
            <IntakeForm lang={lang} onSubmit={handleIntakeSubmit} />
          )}

          {intakeState === "done" && (
            <>
              {messages.length > 0 && (
                <p className="intro-note">{INTRO_NOTE[lang]}</p>
              )}
              <div className="chat-window">
                {messages.map((msg, i) => {
                  // hide the raw intake user message
                  if (i === 0 && msg.role === "user") return null;
                  const isNew = i === messages.length - 1 && msg.role === "assistant";
                  return (
                    <div key={msg.content.slice(0, 30) + i} className={`message ${msg.role}`}>
                      <div
                        className="bubble"
                        style={isNew ? {
                          opacity: 0,
                          animation: "fadeSlideIn 1.8s cubic-bezier(0.16, 1, 0.3, 1) forwards"
                        } : {}}
                        dangerouslySetInnerHTML={{
                          __html: msg.content
                            .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
                            .replace(/\*(.+?)\*/g, "<em>$1</em>")
                            .replace(/\n/g, "<br/>")
                        }}
                      />
                    </div>
                  );
                })}
                {loading && (
                  <div className="message assistant">
                    <div className="typing-indicator">
                      <div className="dot" /><div className="dot" /><div className="dot" />
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>

              <div className="input-area">
                <div style={{ width: "100%", maxWidth: "620px", display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <div className="input-row">
                    <textarea
                      ref={textareaRef}
                      className="input-field"
                      placeholder={lang === "es" ? "responde aquí…" : "respond here…"}
                      rows={1}
                      value={input}
                      onChange={handleTextareaChange}
                      onKeyDown={handleKeyDown}
                    />
                    <button
                      className="send-btn"
                      onClick={handleSend}
                      disabled={!input.trim() || loading}
                    >
                      <SendIcon />
                    </button>
                  </div>
                  <a className="coffee-link"
                    href="https://buymeacoffee.com/shawnatavsky"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {lang === "es"
                      ? "Esta herramienta es gratuita. Si te ha sido útil y quieres apoyar el trabajo, un café siempre es bienvenido ☕"
                      : "This tool is free. If it's been useful and you'd like to support the work, a coffee is always welcome ☕"}
                  </a>
                  <p className="disclaimer">
                    {lang === "es"
                      ? "No es consejo terapéutico · Diseñado por Shawna Tavsky · Con technología de Claude (Anthropic)"
                      : "Not therapeutic advice · Designed by Shawna Tavsky · Powered by Claude (Anthropic)"}
                  </p>
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
