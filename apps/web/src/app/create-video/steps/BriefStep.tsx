import {
  createHookOptions,
  createCtaText,
  createRewriteVariations,
  createTrendIdeas,
  createVideoTemplates,
  type CtaType,
  type HookOption,
  type TrendIdea,
  type VideoTemplateDefinition,
} from '../content-studio';
import { INITIAL_HOOK_SOURCE, INITIAL_PROMPT, promptPresets } from '../page.constants';
import {
  CtaEnginePanel,
  CollapsibleSection,
  HookGeneratorPanel,
  TrendIdeasPanel,
  TemplateGalleryPanel,
} from '../components';
import styles from './BriefStep.module.css';

export interface BriefStepProps {
  readonly hookSource: string;
  readonly onHookSourceChange: (value: string) => void;
  readonly onUseCurrentBrief: () => void;
  readonly onGenerateHooks: () => void;
  readonly selectedHook: HookOption | null;
  readonly hookOptions: readonly HookOption[];
  readonly selectedHookId: string | null;
  readonly copiedHookId: string | null;
  readonly onCopyHook: (hook: HookOption) => void;
  readonly onSelectHook: (hookId: string) => void;
  readonly hookErrorMessage: string | null;
  readonly ctaType: CtaType;
  readonly ctaSeed: number;
  readonly ctaText: string;
  readonly onCtaTextChange: (value: string) => void;
  readonly onRegenerateCta: () => void;
  readonly onSelectCtaType: (type: CtaType) => void;
  readonly prompt: string;
  readonly onPromptChange: (value: string) => void;
  readonly rewriteVariations: readonly string[];
  readonly selectedRewriteIndex: number;
  readonly onSelectedRewriteIndexChange: (index: number) => void;
  readonly onApplyRewriteVariation: () => void;
  readonly trendIdeas: readonly TrendIdea[];
  readonly videoTemplates: readonly VideoTemplateDefinition[];
  readonly onApplyTemplate: (templatePrompt: string) => void;
}

export function BriefStep({
  hookSource,
  onHookSourceChange,
  onUseCurrentBrief,
  onGenerateHooks,
  selectedHook,
  hookOptions,
  selectedHookId,
  copiedHookId,
  onCopyHook,
  onSelectHook,
  hookErrorMessage,
  ctaType,
  ctaSeed,
  ctaText,
  onCtaTextChange,
  onRegenerateCta,
  onSelectCtaType,
  prompt,
  onPromptChange,
  rewriteVariations,
  selectedRewriteIndex,
  onSelectedRewriteIndexChange,
  onApplyRewriteVariation,
  trendIdeas,
  videoTemplates,
  onApplyTemplate,
}: BriefStepProps) {
  const activeRewriteVariation = rewriteVariations[selectedRewriteIndex] ?? rewriteVariations[0];

  return (
    <>
      <div className={styles.fieldGroup}>
        <label className={styles.label} htmlFor="prompt">
          Prompt
        </label>
        <textarea
          id="prompt"
          className={styles.textarea}
          value={prompt}
          onChange={(event) => onPromptChange(event.target.value)}
        />
      </div>

      <CollapsibleSection
        eyebrow="Prompt"
        title="Presets"
        description="Quick starter briefs you can drop into the prompt, then customize."
        defaultOpen={false}
      >
        <section className={styles.collapsedGroup} aria-labelledby="brief-preset-library-title">
          <div className={styles.collapsedHeader}>
            <p className={styles.collapsedEyebrow}>Optional</p>
            <h3 className={styles.collapsedTitle} id="brief-preset-library-title">
              Prompt presets
            </h3>
          </div>
          <div className={styles.presetGrid}>
            {promptPresets.map((preset, index) => (
              <button
                className={styles.presetCard}
                key={preset.id}
                onClick={() => onPromptChange(preset.prompt)}
                type="button"
              >
                <span className={styles.presetIndex}>0{index + 1}</span>
                <span className={styles.presetTitle}>{preset.title}</span>
                <span className={styles.presetPreview}>{preset.preview}</span>
              </button>
            ))}
          </div>
        </section>
      </CollapsibleSection>

      <CollapsibleSection
        eyebrow="Creative"
        title="Hook & CTA helpers"
        description="Generate opening angles and calls to action from your current brief."
        defaultOpen={false}
      >
        <div className={styles.collapsedStack}>
          <section className={styles.collapsedGroup} aria-labelledby="brief-hook-generator-title">
            <div className={styles.collapsedHeader}>
              <p className={styles.collapsedEyebrow}>Optional</p>
              <h3 className={styles.collapsedTitle} id="brief-hook-generator-title">
                Hook generator
              </h3>
            </div>
            <HookGeneratorPanel
              copiedHookId={copiedHookId}
              errorMessage={hookErrorMessage}
              hookOptions={hookOptions}
              hookSource={hookSource}
              onCopyHook={onCopyHook}
              onGenerateHooks={onGenerateHooks}
              onHookSourceChange={onHookSourceChange}
              onSelectHook={onSelectHook}
              onUseCurrentBrief={onUseCurrentBrief}
              selectedHook={selectedHook}
              selectedHookId={selectedHookId}
            />
          </section>

          <section className={styles.collapsedGroup} aria-labelledby="brief-cta-engine-title">
            <div className={styles.collapsedHeader}>
              <p className={styles.collapsedEyebrow}>Optional</p>
              <h3 className={styles.collapsedTitle} id="brief-cta-engine-title">
                CTA helper
              </h3>
            </div>
            <CtaEnginePanel
              ctaText={ctaText}
              ctaType={ctaType}
              onCtaTextChange={onCtaTextChange}
              onRegenerateCta={onRegenerateCta}
              onSelectCtaType={onSelectCtaType}
            />
          </section>
        </div>
      </CollapsibleSection>

      <CollapsibleSection
        eyebrow="Advanced"
        title="Rewrite, ideas & templates"
        description="Explore alternate phrasing, trending directions, and ready-made prompt structures."
        defaultOpen={false}
      >
        <div className={styles.collapsedStack}>
          <section className={styles.collapsedGroup} aria-labelledby="rewrite-engine-title">
            <div className={styles.collapsedHeader}>
              <p className={styles.collapsedEyebrow}>Advanced</p>
              <h3 className={styles.collapsedTitle} id="rewrite-engine-title">
                Rewrite engine
              </h3>
            </div>
            <section className={styles.toolPanel} aria-labelledby="rewrite-engine-panel-title">
              <div className={styles.toolHeader}>
                <div>
                  <p className={styles.sectionEyebrow}>Brief</p>
                  <h3 className={styles.toolTitle} id="rewrite-engine-panel-title">
                    Rewrite engine
                  </h3>
                </div>
                <button
                  className={styles.secondaryButton}
                  onClick={onApplyRewriteVariation}
                  type="button"
                >
                  Use selected version
                </button>
              </div>

              <div className={styles.segmentGroup}>
                {rewriteVariations.map((variation, index) => {
                  const isActive = index === selectedRewriteIndex;

                  return (
                    <button
                      aria-pressed={isActive}
                      className={`${styles.segmentButton} ${isActive ? styles.segmentButtonActive : ''}`}
                      key={variation}
                      onClick={() => onSelectedRewriteIndexChange(index)}
                      type="button"
                    >
                      V{index + 1}
                    </button>
                  );
                })}
              </div>

              <div className={styles.progressCard}>
                <p className={styles.previewPrompt}>{activeRewriteVariation}</p>
              </div>
            </section>
          </section>

          <section className={styles.collapsedGroup} aria-labelledby="brief-trending-ideas-title">
            <div className={styles.collapsedHeader}>
              <p className={styles.collapsedEyebrow}>Advanced</p>
              <h3 className={styles.collapsedTitle} id="brief-trending-ideas-title">
                Trending ideas
              </h3>
            </div>
            <TrendIdeasPanel trendIdeas={trendIdeas} />
          </section>

          <section className={styles.collapsedGroup} aria-labelledby="brief-template-gallery-title">
            <div className={styles.collapsedHeader}>
              <p className={styles.collapsedEyebrow}>Optional</p>
              <h3 className={styles.collapsedTitle} id="brief-template-gallery-title">
                Template gallery
              </h3>
            </div>
            <TemplateGalleryPanel
              onApplyTemplate={onApplyTemplate}
              videoTemplates={videoTemplates}
            />
          </section>
        </div>
      </CollapsibleSection>
    </>
  );
}
