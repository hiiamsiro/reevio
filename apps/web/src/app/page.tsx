import Link from "next/link";
import { Jost, Playfair_Display } from "next/font/google";
import {
  GalleryCard,
  MarketingPlanCard,
  WorkflowStepCard,
} from "@/components/marketing";
import type {
  GalleryItem,
  MarketingPlan,
  WorkflowStep,
} from "@/components/marketing/marketing.types";
import { LandingPageEffects } from "./LandingPageEffects";
import styles from "./home.module.css";

const landingDisplay = Playfair_Display({
  subsets: ["latin"],
  variable: "--landing-font-display",
});

const landingBody = Jost({
  subsets: ["latin"],
  variable: "--landing-font-body",
});

const galleryItems: readonly GalleryItem[] = [
  {
    title: "Launch Teaser",
    duration: "12 sec",
    credits: "14 credits",
    tone: "Hyperreal product glow",
    ratio: "16:9",
    imageSrc: "/landing/images/gallery-sneaker-launch.png",
    imageAlt: "Chrome sneaker campaign frame floating in a dark cinematic studio",
  },
  {
    title: "Creator Ad Cut",
    duration: "18 sec",
    credits: "22 credits",
    tone: "UGC with kinetic captions",
    ratio: "9:16",
    imageSrc: "/landing/images/gallery-skincare-editorial.png",
    imageAlt: "Luxury skincare bottle surrounded by mist and translucent light",
  },
  {
    title: "Feature Walkthrough",
    duration: "24 sec",
    credits: "28 credits",
    tone: "Cinematic UI storytelling",
    ratio: "1:1",
    imageSrc: "/landing/images/gallery-saas-storytelling.png",
    imageAlt: "Futuristic SaaS dashboard panels floating in a premium blue atmosphere",
  },
];

const styleOptions = [
  "Cinematic neon",
  "Clean product studio",
  "Anime motion poster",
  "Luxury editorial",
  "High-energy UGC",
  "Minimal SaaS explainer",
];

const promptExamples = [
  "Launch a midnight sneaker drop with chrome reflections, dramatic camera moves, and a final flash-sale CTA.",
  "Create a skincare ad with soft glass textures, macro ingredient shots, and calming female narration.",
  "Generate a SaaS promo showing dashboard transformations, bold captions, and a founder-style voiceover.",
];

const workflowSteps: readonly WorkflowStep[] = [
  {
    step: "01",
    title: "Write one prompt",
    copy: "Describe the product, audience, and offer. Reevio expands it into scenes, camera moves, and CTA beats.",
  },
  {
    step: "02",
    title: "Preview multiple styles",
    copy: "Compare cinematic, UGC, and branded cuts side by side before you spend your final render credits.",
  },
  {
    step: "03",
    title: "Render and export",
    copy: "Choose aspect ratio, provider quality, and voice pack. Credits only burn when a render starts.",
  },
];

const pricingPlans: readonly MarketingPlan[] = [
  {
    name: "Starter",
    price: "$24",
    credits: "80 credits",
    description: "For rapid ad tests and concept validation.",
    features: [
      "Up to 8 HD renders",
      "Prompt remixing",
      "3 style presets included",
    ],
  },
  {
    name: "Studio",
    price: "$79",
    credits: "320 credits",
    description: "For teams iterating across multiple formats each week.",
    features: ["Priority rendering", "Brand kit lockups", "Team review links"],
    featured: true,
  },
  {
    name: "Scale",
    price: "$199",
    credits: "960 credits",
    description: "For agencies running ongoing paid media and client delivery.",
    features: [
      "4K export access",
      "Shared credit pools",
      "Dedicated onboarding",
    ],
  },
];

const partnerLogos = [
  "Northstar Labs",
  "Arc Commerce",
  "Kinetic Goods",
  "Pulse Mobile",
  "Framewise",
  "Signal House",
];

const storyboardShots = [
  {
    step: "Shot 01",
    title: "Hook Frame",
    copy: "Open with chrome macro footage, fast lens movement, and a high-contrast product silhouette.",
    tag: "Thumbstop intro",
    duration: "0-04s",
  },
  {
    step: "Shot 02",
    title: "Offer Reveal",
    copy: "Snap into the main benefit with caption choreography and a mid-sequence CTA anchor.",
    tag: "Conversion beat",
    duration: "04-10s",
  },
  {
    step: "Shot 03",
    title: "Feature Motion",
    copy: "Blend UI transforms, texture overlays, and motion blur to keep product logic easy to scan.",
    tag: "Benefit proof",
    duration: "10-16s",
  },
  {
    step: "Shot 04",
    title: "Closing Push",
    copy: "Finish with price signal, urgency framing, and a branded end card that feels editorial.",
    tag: "CTA lockup",
    duration: "16-24s",
  },
];

const pipelineSteps = [
  { label: "Prompt expansion", value: "92%", width: "92%" },
  { label: "Scene timing", value: "84%", width: "84%" },
  { label: "Caption pacing", value: "76%", width: "76%" },
  { label: "Brand fit score", value: "95%", width: "95%" },
];

const testimonials = [
  {
    quote:
      "We went from scattered briefs in chat to a polished preview system the team could approve in one pass.",
    name: "Anika Rao",
    role: "Growth lead, Northstar Labs",
    metric: "18 campaigns shipped per week",
  },
  {
    quote:
      "The style switching feels instant. Our creators can test premium, UGC, and product-story versions without restarting the workflow.",
    name: "Mason Lee",
    role: "Creative strategist, Arc Commerce",
    metric: "3.8x faster concept loops",
  },
];

export default function HomePage() {
  return (
    <main
      className={`${styles.page} ${landingDisplay.variable} ${landingBody.variable}`}
    >
      <LandingPageEffects />
      <div className={styles.backdrop} />
      <div className={styles.gridLines} />
      <div className={styles.glowOne} />
      <div className={styles.glowTwo} />

      <div className={styles.shell}>
        <header className={styles.nav} data-reveal-group>
          <div className={styles.brandLockup} data-reveal>
            <span className={styles.brandMark} aria-hidden="true" />
            <div>
              <p className={styles.brandName}>Reevio Studio</p>
              <p className={styles.brandMeta}>AI video generation platform</p>
            </div>
          </div>

          <div className={styles.navActions} data-reveal>
            <a className={styles.navLink} href="#storyboard">
              Storyboard
            </a>
            <a className={styles.navLink} href="#gallery">
              Gallery
            </a>
            <a className={styles.navLink} href="#pricing">
              Pricing
            </a>
            <Link className={styles.secondaryCta} href="/create-video">
              Open app
            </Link>
          </div>

          <details className={styles.mobileNav} data-reveal>
            <summary className={styles.mobileNavToggle}>
              <span className={styles.mobileNavToggleLabel}>Menu</span>
              <span className={styles.mobileNavIcon} aria-hidden="true">
                <span />
                <span />
                <span />
              </span>
            </summary>

            <div className={styles.mobileNavPanel}>
              <a className={styles.mobileNavLink} href="#storyboard">
                Storyboard
              </a>
              <a className={styles.mobileNavLink} href="#gallery">
                Gallery
              </a>
              <a className={styles.mobileNavLink} href="#pricing">
                Pricing
              </a>
              <Link className={styles.mobileNavCta} href="/create-video">
                Open app
              </Link>
            </div>
          </details>
        </header>

        <section className={styles.hero}>
          <div className={styles.heroCopy} data-reveal-group>
            <p className={styles.eyebrow} data-reveal>
              Prompt to polished video
            </p>
            <h1 className={styles.title}>
              <span data-hero-line>Generate launch-ready AI videos</span>
              <span data-hero-line>with motion-built storytelling</span>
              <span data-hero-line>and fast creative approval loops.</span>
            </h1>
            <p className={styles.subtitle} data-reveal>
              Build ads, product teasers, and creator-style edits from one
              brief. Preview cinematic directions, tune pacing, and move from
              prompt to render without losing the energy of the idea.
            </p>

            <div className={styles.heroActions} data-reveal>
              <Link className={styles.primaryCta} href="/create-video">
                Start generating
              </Link>
              <a className={styles.ghostCta} href="#examples">
                Explore prompts
              </a>
            </div>

            <dl className={styles.stats}>
              <div className={styles.stat} data-reveal>
                <dt>Styles ready</dt>
                <dd>24+</dd>
              </div>
              <div className={styles.stat} data-reveal>
                <dt>First preview</dt>
                <dd>under 45s</dd>
              </div>
              <div className={styles.stat} data-reveal>
                <dt>Aspect ratios</dt>
                <dd>4 outputs</dd>
              </div>
            </dl>
          </div>

          <div className={styles.heroFrame} data-parallax="0.12">
            <div className={styles.console}>
              <div className={styles.consoleChrome} aria-hidden="true">
                <span className={styles.consoleDot} />
                <span className={styles.consoleDot} />
                <span className={styles.consoleDot} />
                <p className={styles.consoleChromeLabel}>Studio render queue</p>
              </div>

              <div className={styles.consoleTop}>
                <span className={styles.liveBadge}>Live generation</span>
                <span className={styles.consoleMeta}>
                  Queued on Studio tier
                </span>
              </div>

              <div className={styles.previewCard}>
                <div className={styles.previewVisual}>
                  <div className={styles.previewScreen}>
                    <div
                      className={styles.previewScreenOverlay}
                      aria-hidden="true"
                    />
                    <div className={styles.previewFrameTop}>
                      <span className={styles.previewFrameTag}>
                        Editorial preview
                      </span>
                      <span className={styles.previewFrameMeta}>
                        12s / 9:16
                      </span>
                    </div>
                  </div>

                  <div className={styles.previewCaption}>
                    <span>Campaign preview</span>
                    <strong>Spring launch teaser</strong>
                    <p className={styles.previewCaptionText}>
                      Chrome macro lighting, fast cuts, and a high-intent
                      closing offer.
                    </p>
                  </div>

                  <div className={styles.previewSceneRail} aria-hidden="true">
                    <span className={styles.previewSceneChip}>Hook frame</span>
                    <span className={styles.previewSceneChip}>Offer reveal</span>
                    <span className={styles.previewSceneChip}>Closing CTA</span>
                  </div>

                </div>

                <div className={styles.previewInfo}>
                  <div className={styles.promptCard}>
                    <p className={styles.promptLabel}>Prompt</p>
                    <p className={styles.promptText}>
                      Create a moody sneaker launch video with chrome lighting,
                      fast macro cuts, and a final 15% off CTA.
                    </p>
                  </div>
                </div>
              </div>

              <div className={styles.consoleGrid}>
                <div className={styles.consoleMetric}>
                  <span>Mode</span>
                  <strong>Luxury editorial</strong>
                </div>
                <div className={styles.consoleMetric}>
                  <span>Output</span>
                  <strong>Vertical hero cut</strong>
                </div>
                <div className={styles.consoleMetric}>
                  <span>Approval signal</span>
                  <strong>94% pre-export confidence</strong>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          className={styles.logoSection}
          aria-label="Teams moving faster with Reevio"
        >
          <p className={styles.logoLabel}>
            Used by launch teams shipping ads every week
          </p>
          <div className={styles.logoMarquee}>
            <div className={styles.logoTrack}>
              {partnerLogos.map((logo) => (
                <span className={styles.logoItem} key={logo}>
                  {logo}
                </span>
              ))}
            </div>
            <div className={styles.logoTrack} aria-hidden="true">
              {partnerLogos.map((logo) => (
                <span className={styles.logoItem} key={`${logo}-clone`}>
                  {logo}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section
          className={styles.proofStrip}
          aria-label="Platform proof points"
          data-reveal-group
        >
          <div className={styles.proofCard} data-reveal>
            <span
              className={styles.proofValue}
              data-count-up="1240"
              data-suffix="+"
            >
              1,240+
            </span>
            <span className={styles.proofLabel}>
              videos generated this week
            </span>
          </div>
          <div className={styles.proofCard} data-reveal>
            <span
              className={styles.proofValue}
              data-count-up="3.8"
              data-decimals="1"
              data-suffix="x"
            >
              3.8x
            </span>
            <span className={styles.proofLabel}>
              faster concept iteration for launch teams
            </span>
          </div>
          <div className={styles.proofCard} data-reveal>
            <span
              className={styles.proofValue}
              data-count-up="94"
              data-suffix="%"
            >
              94%
            </span>
            <span className={styles.proofLabel}>
              of renders shipped after preview approval
            </span>
          </div>
        </section>

        <section
          className={`${styles.section} ${styles.storyboardSection}`}
          id="storyboard"
        >
          <div className={styles.sectionHeading} data-reveal-group>
            <p className={styles.sectionEyebrow} data-reveal>
              Storyboard engine
            </p>
            <h2 data-reveal>Shape pacing before you spend the final render.</h2>
            <p data-reveal>
              Reevio turns a single brief into a shot-by-shot structure, then
              keeps style, timing, and CTA rhythm aligned across every format.
            </p>
          </div>

          <div className={styles.storyboardGrid}>
            <div className={styles.shotRail} data-reveal-group>
              {storyboardShots.map((shot) => (
                <article
                  className={styles.shotCard}
                  key={shot.title}
                  data-reveal
                >
                  <span className={styles.shotStep}>{shot.step}</span>
                  <h3>{shot.title}</h3>
                  <p>{shot.copy}</p>
                  <div className={styles.shotFooter}>
                    <span className={styles.shotTag}>{shot.tag}</span>
                    <span className={styles.shotDuration}>{shot.duration}</span>
                  </div>
                </article>
              ))}
            </div>

            <aside className={styles.featurePanel} data-reveal-group>
              <div data-reveal>
                <p className={styles.sectionEyebrow}>Creative diagnostics</p>
                <h3>
                  Every preview ships with a motion-aware confidence readout.
                </h3>
                <p className={styles.panelCopy}>
                  Use it to spot weak sections before a render, then rebalance
                  pacing, captions, or offer timing in a few clicks.
                </p>
              </div>

              <div className={styles.panelList}>
                {pipelineSteps.map((step) => (
                  <div
                    className={styles.panelMetric}
                    key={step.label}
                    data-reveal
                  >
                    <div className={styles.panelMetricTop}>
                      <span>{step.label}</span>
                      <strong>{step.value}</strong>
                    </div>
                    <div className={styles.panelBar}>
                      <div
                        className={styles.panelBarFill}
                        data-bar-fill
                        style={{ width: step.width }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </aside>
          </div>
        </section>

        <section className={styles.section} id="gallery">
          <div className={styles.sectionHeading} data-reveal-group>
            <p className={styles.sectionEyebrow} data-reveal>
              Generation preview gallery
            </p>
            <h2 data-reveal>Browse the cuts before you hit render.</h2>
            <p data-reveal>
              Every concept lands in a structured gallery with credit estimates,
              aspect ratio, and style metadata for quick approvals.
            </p>
          </div>

          <div className={styles.galleryGrid} data-reveal-group>
            {galleryItems.map((item, index) => (
              <div key={item.title} data-reveal>
                <GalleryCard item={item} toneIndex={index + 1} />
              </div>
            ))}
          </div>
        </section>

        <section className={styles.duoSection}>
          <div className={styles.detailCard} data-reveal-group>
            <div className={styles.sectionHeading}>
              <p className={styles.sectionEyebrow} data-reveal>
                Style options
              </p>
              <h2 data-reveal>Switch visual direction in one tap.</h2>
              <p data-reveal>
                Pick a branded look, compare tonal variations, then lock your
                preferred preset for future generations.
              </p>
            </div>

            <div className={styles.styleGrid}>
              {styleOptions.map((style) => (
                <button
                  className={styles.styleChip}
                  key={style}
                  type="button"
                  data-reveal
                >
                  {style}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.detailCard} id="examples" data-reveal-group>
            <div className={styles.sectionHeading}>
              <p className={styles.sectionEyebrow} data-reveal>
                Prompt examples
              </p>
              <h2 data-reveal>Start with proven creative directions.</h2>
              <p data-reveal>
                Prompt blocks are built for marketers who need fast hooks, style
                clarity, and a strong offer in every render.
              </p>
            </div>

            <div className={styles.exampleList}>
              {promptExamples.map((example, index) => (
                <article
                  className={styles.exampleCard}
                  key={example}
                  data-reveal
                >
                  <span className={styles.exampleIndex}>0{index + 1}</span>
                  <p>{example}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeading} data-reveal-group>
            <p className={styles.sectionEyebrow} data-reveal>
              Workflow
            </p>
            <h2 data-reveal>
              Built for fast creative loops, not messy handoffs.
            </h2>
          </div>

          <div className={styles.workflowGrid} data-reveal-group>
            {workflowSteps.map((item) => (
              <div key={item.step} data-reveal>
                <WorkflowStepCard item={item} />
              </div>
            ))}
          </div>
        </section>

        <section className={`${styles.section} ${styles.testimonialSection}`}>
          <div className={styles.sectionHeading} data-reveal-group>
            <p className={styles.sectionEyebrow} data-reveal>
              Social proof
            </p>
            <h2 data-reveal>
              Teams keep the page open because the preview feels alive.
            </h2>
            <p data-reveal>
              The landing experience now mirrors the product promise: richer
              movement, clear proof, and a smoother path from curiosity to
              action.
            </p>
          </div>

          <div className={styles.testimonialGrid}>
            <article className={styles.testimonialLead} data-reveal-group>
              <p className={styles.testimonialQuote} data-reveal>
                "The upgraded landing page finally feels like the product we
                demo. Motion sells the speed without looking heavy."
              </p>
              <div className={styles.testimonialMeta} data-reveal>
                <div>
                  <strong>Priya Malhotra</strong>
                  <span>Performance marketing advisor</span>
                </div>
                <div className={styles.testimonialLeadStat}>
                  <span>Avg. preview decision time</span>
                  <strong>8 minutes</strong>
                </div>
              </div>
            </article>

            <div className={styles.testimonialCards} data-reveal-group>
              {testimonials.map((item) => (
                <article
                  className={styles.testimonialCard}
                  key={item.name}
                  data-reveal
                >
                  <p>{item.quote}</p>
                  <div className={styles.testimonialCardMeta}>
                    <div>
                      <strong>{item.name}</strong>
                      <span>{item.role}</span>
                    </div>
                    <span className={styles.testimonialMetric}>
                      {item.metric}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.pricingSection} id="pricing">
          <div className={styles.sectionHeading} data-reveal-group>
            <p className={styles.sectionEyebrow} data-reveal>
              Credit-based pricing
            </p>
            <h2 data-reveal>Buy credits for the output quality you need.</h2>
            <p data-reveal>
              Credits roll over for active plans and map directly to previewing,
              rendering, and export quality, so your spend stays predictable.
            </p>
          </div>

          <div className={styles.pricingGrid} data-reveal-group>
            {pricingPlans.map((plan) => (
              <div key={plan.name} data-reveal>
                <MarketingPlanCard plan={plan} />
              </div>
            ))}
          </div>
        </section>

        <section className={styles.ctaSection} data-reveal-group>
          <div data-reveal>
            <p className={styles.sectionEyebrow}>Launch faster</p>
            <h2>Turn briefs into ad-ready video previews today.</h2>
          </div>
          <Link className={styles.primaryCta} href="/create-video" data-reveal>
            Open Reevio Studio
          </Link>
        </section>
      </div>
    </main>
  );
}
