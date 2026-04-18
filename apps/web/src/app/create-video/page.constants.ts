export interface PromptPresetDefinition {
  readonly id: string;
  readonly title: string;
  readonly preview: string;
  readonly prompt: string;
}

export const promptPresets: readonly PromptPresetDefinition[] = [
  {
    id: 'ai-breaking-news',
    title: 'AI Breaking News',
    preview:
      'Huge headline, fast hook, bold typography, and premium social-news pacing.',
    prompt:
      'Create a premium 9:16 short-form AI news video about a major new AI update. Open in the first second with the biggest claim in huge bold Vietnamese typography. Use a clean editorial social-news style with strong hierarchy, one central hero visual, kinetic text, short punchy phrases, and smooth zoom-ins. Keep the layout minimal and premium, with lots of negative space, polished shadows, and crisp transitions. Make the video feel like a breaking AI update that is easy to understand, highly shareable, and visually designed for TikTok, Reels, and Shorts.',
  },
  {
    id: 'ai-tool-launch',
    title: 'AI Tool Launch',
    preview:
      'Product-first launch frame, UI mockups, rounded panels, and sleek reveal motion.',
    prompt:
      'Create a sleek 9:16 launch video for a new AI product or feature. Use a bright editorial product-announcement look with a warm ivory background, black typography, red accent highlights, premium rounded borders, and a large centered product UI frame. Show the tool with subtle zoom-ins, floating labels, sharp interface callouts, and elegant motion design. Use giant Vietnamese headline text, short emphasized phrases, and a polished product reveal sequence so the video feels like a premium TikTok announcement from an AI news channel.',
  },
  {
    id: 'ai-research-breakthrough',
    title: 'AI Research Breakthrough',
    preview:
      'Dark tech mood, glowing accents, giant numbers, and benchmark-driven storytelling.',
    prompt:
      'Create a 9:16 Vietnamese AI research explainer with a dark futuristic tech-news aesthetic. Use a deep navy background, glowing cyan and magenta accents, minimal layout, giant central headline text, and dramatic numeric emphasis for benchmarks, percentages, and version names. Show one strong visual per scene, such as a research graphic, concept interface, or abstract AI system diagram. Use kinetic typography, smooth scale changes, neon-accent labels, and premium motion graphics to make the breakthrough feel important, modern, and instantly understandable.',
  },
  {
    id: 'ai-workflow-explainer',
    title: 'AI Workflow Explainer',
    preview:
      'Screen-led pain-to-payoff story with clean callouts, crisp captions, and clear before-after.',
    prompt:
      'Create a 9:16 short-form AI workflow explainer in Vietnamese. Start with one painful old workflow moment, then reveal the better AI-assisted system immediately after. Use clean editorial layouts, a strong central interface mockup, floating panels, animated UI highlights, cursor movement, short caption bursts, and smooth camera push-ins. Keep the story simple: old way, new way, one key advantage, one proof point, and a polished final takeaway. Make the visual language feel premium, modern, and optimized for short-form social video.',
  },
] as const;

export const styleModes = [
  'AI breaking news',
  'Tool launch',
  'Research glow',
  'Workflow explainer',
] as const;

export const workflowNotes = [
  'Credits are reserved before a render starts.',
  'Failed final renders refund automatically.',
  'Voiceover and subtitles appear when the pipeline finishes.',
] as const;

export const INITIAL_PROMPT =
  'Create a premium 9:16 Vietnamese AI news video with a huge opening headline, one strong central hero visual, clean editorial layout, kinetic typography, smooth zoom-ins, polished rounded panels, premium shadows, and a strong final takeaway frame designed for TikTok, Reels, and Shorts.';
