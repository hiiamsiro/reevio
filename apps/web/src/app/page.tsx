import Link from 'next/link';
import {
  GalleryCard,
  MarketingPlanCard,
  WorkflowStepCard,
} from '@/components/marketing';
import type {
  GalleryItem,
  MarketingPlan,
  WorkflowStep,
} from '@/components/marketing/marketing.types';
import styles from './home.module.css';

const galleryItems: readonly GalleryItem[] = [
  {
    title: 'Launch Teaser',
    duration: '12 sec',
    credits: '14 credits',
    tone: 'Hyperreal product glow',
    ratio: '16:9',
  },
  {
    title: 'Creator Ad Cut',
    duration: '18 sec',
    credits: '22 credits',
    tone: 'UGC with kinetic captions',
    ratio: '9:16',
  },
  {
    title: 'Feature Walkthrough',
    duration: '24 sec',
    credits: '28 credits',
    tone: 'Cinematic UI storytelling',
    ratio: '1:1',
  },
];

const styleOptions = [
  'Cinematic neon',
  'Clean product studio',
  'Anime motion poster',
  'Luxury editorial',
  'High-energy UGC',
  'Minimal SaaS explainer',
];

const promptExamples = [
  'Launch a midnight sneaker drop with chrome reflections, dramatic camera moves, and a final flash-sale CTA.',
  'Create a skincare ad with soft glass textures, macro ingredient shots, and calming female narration.',
  'Generate a SaaS promo showing dashboard transformations, bold captions, and a founder-style voiceover.',
];

const workflowSteps: readonly WorkflowStep[] = [
  {
    step: '01',
    title: 'Write one prompt',
    copy: 'Describe the product, audience, and offer. Reevio expands it into scenes, camera moves, and CTA beats.',
  },
  {
    step: '02',
    title: 'Preview multiple styles',
    copy: 'Compare cinematic, UGC, and branded cuts side by side before you spend your final render credits.',
  },
  {
    step: '03',
    title: 'Render and export',
    copy: 'Choose aspect ratio, provider quality, and voice pack. Credits only burn when a render starts.',
  },
];

const pricingPlans: readonly MarketingPlan[] = [
  {
    name: 'Starter',
    price: '$24',
    credits: '80 credits',
    description: 'For rapid ad tests and concept validation.',
    features: ['Up to 8 HD renders', 'Prompt remixing', '3 style presets included'],
  },
  {
    name: 'Studio',
    price: '$79',
    credits: '320 credits',
    description: 'For teams iterating across multiple formats each week.',
    features: ['Priority rendering', 'Brand kit lockups', 'Team review links'],
    featured: true,
  },
  {
    name: 'Scale',
    price: '$199',
    credits: '960 credits',
    description: 'For agencies running ongoing paid media and client delivery.',
    features: ['4K export access', 'Shared credit pools', 'Dedicated onboarding'],
  },
];

export default function HomePage() {
  return (
    <main className={styles.page}>
      <div className={styles.backdrop} />
      <div className={styles.glowOne} />
      <div className={styles.glowTwo} />

      <div className={styles.shell}>
        <header className={styles.nav}>
          <div className={styles.brandLockup}>
            <span className={styles.brandMark} aria-hidden="true" />
            <div>
              <p className={styles.brandName}>Reevio Studio</p>
              <p className={styles.brandMeta}>AI video generation platform</p>
            </div>
          </div>

          <div className={styles.navActions}>
            <a className={styles.navLink} href="#pricing">
              Pricing
            </a>
            <a className={styles.navLink} href="#gallery">
              Gallery
            </a>
            <Link className={styles.secondaryCta} href="/create-video">
              Open app
            </Link>
          </div>
        </header>

        <section className={styles.hero}>
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>Prompt to polished video</p>
            <h1 className={styles.title}>Generate launch-ready AI videos with vibrant style control.</h1>
            <p className={styles.subtitle}>
              Build ads, product teasers, and creator-style edits from one brief. Preview multiple
              cuts, switch aesthetics instantly, and pay with credits only when you render.
            </p>

            <div className={styles.heroActions}>
              <Link className={styles.primaryCta} href="/create-video">
                Start generating
              </Link>
              <a className={styles.ghostCta} href="#examples">
                Explore prompts
              </a>
            </div>

            <dl className={styles.stats}>
              <div className={styles.stat}>
                <dt>Styles ready</dt>
                <dd>24+</dd>
              </div>
              <div className={styles.stat}>
                <dt>First preview</dt>
                <dd>under 45s</dd>
              </div>
              <div className={styles.stat}>
                <dt>Aspect ratios</dt>
                <dd>4 outputs</dd>
              </div>
            </dl>
          </div>

          <div className={styles.heroFrame}>
            <div className={styles.orbit} aria-hidden="true" />
            <div className={styles.console}>
              <div className={styles.consoleTop}>
                <span className={styles.liveBadge}>Live generation</span>
                <span className={styles.consoleMeta}>Queued on Studio tier</span>
              </div>

              <div className={styles.previewCard}>
                <div className={styles.previewVisual}>
                  <div className={styles.previewScreen} />
                  <div className={styles.previewCaption}>
                    <span>Campaign</span>
                    <strong>Spring launch teaser</strong>
                  </div>
                </div>

                <div className={styles.previewInfo}>
                  <p className={styles.promptLabel}>Prompt</p>
                  <p className={styles.promptText}>
                    Create a moody sneaker launch video with chrome lighting, fast macro cuts, and
                    a final 15% off CTA.
                  </p>
                </div>
              </div>

              <div className={styles.consoleGrid}>
                <div className={styles.consoleMetric}>
                  <span>Mode</span>
                  <strong>Cinematic neon</strong>
                </div>
                <div className={styles.consoleMetric}>
                  <span>Aspect</span>
                  <strong>9:16 vertical</strong>
                </div>
                <div className={styles.consoleMetric}>
                  <span>Credits</span>
                  <strong>22 estimated</strong>
                </div>
                <div className={styles.consoleMetric}>
                  <span>Voice</span>
                  <strong>Founder pulse</strong>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.proofStrip} aria-label="Platform proof points">
          <div className={styles.proofCard}>
            <span className={styles.proofValue}>1,240+</span>
            <span className={styles.proofLabel}>videos generated this week</span>
          </div>
          <div className={styles.proofCard}>
            <span className={styles.proofValue}>3.8x</span>
            <span className={styles.proofLabel}>faster concept iteration for launch teams</span>
          </div>
          <div className={styles.proofCard}>
            <span className={styles.proofValue}>94%</span>
            <span className={styles.proofLabel}>of renders shipped after preview approval</span>
          </div>
        </section>

        <section className={styles.section} id="gallery">
          <div className={styles.sectionHeading}>
            <p className={styles.sectionEyebrow}>Generation preview gallery</p>
            <h2>Browse the cuts before you hit render.</h2>
            <p>
              Every concept lands in a structured gallery with credit estimates, aspect ratio, and
              style metadata for quick approvals.
            </p>
          </div>

          <div className={styles.galleryGrid}>
            {galleryItems.map((item, index) => (
              <GalleryCard item={item} key={item.title} toneIndex={index + 1} />
            ))}
          </div>
        </section>

        <section className={styles.duoSection}>
          <div className={styles.detailCard}>
            <div className={styles.sectionHeading}>
              <p className={styles.sectionEyebrow}>Style options</p>
              <h2>Switch visual direction in one tap.</h2>
              <p>
                Pick a branded look, compare tonal variations, then lock your preferred preset for
                future generations.
              </p>
            </div>

            <div className={styles.styleGrid}>
              {styleOptions.map((style) => (
                <button className={styles.styleChip} key={style} type="button">
                  {style}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.detailCard} id="examples">
            <div className={styles.sectionHeading}>
              <p className={styles.sectionEyebrow}>Prompt examples</p>
              <h2>Start with proven creative directions.</h2>
              <p>
                Prompt blocks are built for marketers who need fast hooks, style clarity, and a
                strong offer in every render.
              </p>
            </div>

            <div className={styles.exampleList}>
              {promptExamples.map((example, index) => (
                <article className={styles.exampleCard} key={example}>
                  <span className={styles.exampleIndex}>0{index + 1}</span>
                  <p>{example}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeading}>
            <p className={styles.sectionEyebrow}>Workflow</p>
            <h2>Built for fast creative loops, not messy handoffs.</h2>
          </div>

          <div className={styles.workflowGrid}>
            {workflowSteps.map((item) => (
              <WorkflowStepCard item={item} key={item.step} />
            ))}
          </div>
        </section>

        <section className={styles.pricingSection} id="pricing">
          <div className={styles.sectionHeading}>
            <p className={styles.sectionEyebrow}>Credit-based pricing</p>
            <h2>Buy credits for the output quality you need.</h2>
            <p>
              Credits roll over for active plans and map directly to previewing, rendering, and
              export quality, so your spend stays predictable.
            </p>
          </div>

          <div className={styles.pricingGrid}>
            {pricingPlans.map((plan) => (
              <MarketingPlanCard key={plan.name} plan={plan} />
            ))}
          </div>
        </section>

        <section className={styles.ctaSection}>
          <div>
            <p className={styles.sectionEyebrow}>Launch faster</p>
            <h2>Turn briefs into ad-ready video previews today.</h2>
          </div>
          <Link className={styles.primaryCta} href="/create-video">
            Open Reevio Studio
          </Link>
        </section>
      </div>
    </main>
  );
}
