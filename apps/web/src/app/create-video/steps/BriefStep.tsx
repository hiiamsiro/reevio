import type { TrendIdea, VideoTemplateDefinition } from '../content-studio';
import { promptPresets } from '../page.constants';
import {
  CollapsibleSection,
  TemplateGalleryPanel,
  TrendIdeasPanel,
} from '../components';
import styles from './BriefStep.module.css';

export interface BriefStepProps {
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
  const activeRewriteVariation =
    rewriteVariations[selectedRewriteIndex] ?? rewriteVariations[0];

  return (
    <>
      <div className={styles.fieldGroup}>
        <label className={styles.label} htmlFor="prompt">
          Creative brief
        </label>
        <textarea
          id="prompt"
          className={styles.textarea}
          value={prompt}
          onChange={(event) => onPromptChange(event.target.value)}
        />
      </div>

      <CollapsibleSection
        eyebrow="Presets"
        title="Starter briefs"
        description="Drop in a launch-ready prompt and adapt it to your product or creator angle."
        defaultOpen={true}
      >
        <section
          className={styles.collapsedGroup}
          aria-labelledby="brief-preset-library-title"
        >
          <div className={styles.collapsedHeader}>
            <p className={styles.collapsedEyebrow}>Starter</p>
            <h3
              className={styles.collapsedTitle}
              id="brief-preset-library-title"
            >
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
        eyebrow="Refine"
        title="Rewrite and direction"
        description="Try alternate pacing, creator tone, and short-form structure before rendering."
        defaultOpen={false}
      >
        <div className={styles.collapsedStack}>
          <section
            className={styles.collapsedGroup}
            aria-labelledby="rewrite-engine-title"
          >
            <div className={styles.collapsedHeader}>
              <p className={styles.collapsedEyebrow}>Rewrite</p>
              <h3 className={styles.collapsedTitle} id="rewrite-engine-title">
                Alternate versions
              </h3>
            </div>
            <section
              className={styles.progressCard}
              aria-labelledby="rewrite-engine-panel-title"
            >
              <div className={styles.toolHeader}>
                <div>
                  <p className={styles.sectionEyebrow}>Brief</p>
                  <h3
                    className={styles.toolTitle}
                    id="rewrite-engine-panel-title"
                  >
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
                      className={`${styles.segmentButton} ${
                        isActive ? styles.segmentButtonActive : ''
                      }`}
                      key={variation}
                      onClick={() => onSelectedRewriteIndexChange(index)}
                      type="button"
                    >
                      V{index + 1}
                    </button>
                  );
                })}
              </div>

              <p className={styles.previewPrompt}>{activeRewriteVariation}</p>
            </section>
          </section>

          <TrendIdeasPanel trendIdeas={trendIdeas} />

          <TemplateGalleryPanel
            onApplyTemplate={onApplyTemplate}
            videoTemplates={videoTemplates}
          />
        </div>
      </CollapsibleSection>
    </>
  );
}
