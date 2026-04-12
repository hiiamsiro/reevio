import type { ViralScoreAnalysis } from '../content-studio';
import {
  BulkGenerationPanel,
  CollapsibleSection,
  type CustomSelectOption,
  CustomSelect,
} from '../components';
import type { BulkJobItem, ProviderDefinition } from '../page.types';
import type { ChangeEvent } from 'react';
import { toPriceTierLabel } from '../page.helpers';
import styles from './SetupStep.module.css';

export interface SetupStepProps {
  readonly providers: readonly ProviderDefinition[];
  readonly selectedProvider: ProviderDefinition | null;
  readonly provider: string;
  readonly onProviderChange: (value: string) => void;
  readonly aspectRatio: string;
  readonly onAspectRatioChange: (value: string) => void;
  readonly hasEnoughCredits: boolean;
  readonly isLowCredit: boolean;
  readonly currentUserCredits: number | null;
  readonly bulkInput: string;
  readonly onBulkInputChange: (value: string) => void;
  readonly onBulkFileUpload: (event: ChangeEvent<HTMLInputElement>) => Promise<void>;
  readonly onGenerateBulk: () => Promise<void>;
  readonly isBulkGenerating: boolean;
  readonly onRetryFailedBulkJobs: () => void;
  readonly bulkJobs: readonly BulkJobItem[];
  readonly onRetryBulkJob: (bulkJobId: string) => Promise<void>;
  readonly bulkErrorMessage: string | null;
  readonly viralScoreAnalysis: ViralScoreAnalysis;
}

export function SetupStep({
  providers,
  selectedProvider,
  provider,
  onProviderChange,
  aspectRatio,
  onAspectRatioChange,
  hasEnoughCredits,
  isLowCredit,
  currentUserCredits,
  bulkInput,
  onBulkInputChange,
  onBulkFileUpload,
  onGenerateBulk,
  isBulkGenerating,
  onRetryFailedBulkJobs,
  bulkJobs,
  onRetryBulkJob,
  bulkErrorMessage,
  viralScoreAnalysis,
}: SetupStepProps) {
  const providerOptions: readonly CustomSelectOption[] = providers.map((providerDefinition) => ({
    value: providerDefinition.name,
    label: providerDefinition.label,
    meta: `${toPriceTierLabel(providerDefinition.priceTier)} · ${providerDefinition.creditCost} credits`,
  }));

  const aspectRatioOptions: readonly CustomSelectOption[] = [
    { value: '9:16', label: '9:16', meta: 'Vertical short-form' },
    { value: '16:9', label: '16:9', meta: 'Landscape wide' },
    { value: '1:1', label: '1:1', meta: 'Square social post' },
    { value: '4:5', label: '4:5', meta: 'Portrait feed' },
  ];

  return (
    <>
      <BulkGenerationPanel
        bulkInput={bulkInput}
        bulkJobs={bulkJobs}
        errorMessage={bulkErrorMessage}
        isBulkGenerating={isBulkGenerating}
        onBulkFileUpload={onBulkFileUpload}
        onBulkInputChange={onBulkInputChange}
        onGenerateBulk={onGenerateBulk}
        onRetryBulkJob={onRetryBulkJob}
        onRetryFailedBulkJobs={onRetryFailedBulkJobs}
      />

      <div className={styles.fieldRow}>
        <div className={styles.fieldGroup}>
          <label className={styles.label} htmlFor="provider">
            Provider
          </label>
          <CustomSelect
            id="provider"
            options={providerOptions}
            value={provider}
            onValueChange={onProviderChange}
            disabled={providers.length === 0}
          />

          {selectedProvider ? (
            <div className={styles.providerMeta}>
              <span className={styles.metaBadge}>
                {toPriceTierLabel(selectedProvider.priceTier)}
              </span>
              <span className={styles.metaBadge}>{selectedProvider.status}</span>
            </div>
          ) : null}
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.label} htmlFor="aspectRatio">
            Aspect ratio
          </label>
          <CustomSelect
            id="aspectRatio"
            options={aspectRatioOptions}
            value={aspectRatio}
            onValueChange={onAspectRatioChange}
          />
        </div>
      </div>

      {selectedProvider ? (
        <div className={styles.providerCard}>
          <div>
            <p className={styles.providerLabel}>Provider profile</p>
            <h3>{selectedProvider.label}</h3>
          </div>
          <p>
            {selectedProvider.description} This render costs {selectedProvider.creditCost}{' '}
            credits.
          </p>
        </div>
      ) : null}

      {selectedProvider && currentUserCredits !== null ? (
        <div className={styles.providerCard}>
          <div>
            <p className={styles.providerLabel}>Credit status</p>
            <h3>{hasEnoughCredits ? 'Ready to generate' : 'Insufficient credits'}</h3>
          </div>
          <p>
            {hasEnoughCredits
              ? isLowCredit
                ? `You have ${currentUserCredits} credits left, so you are close to your threshold for ${selectedProvider.label}. Open Buy credits when you need a top-up.`
                : `You have ${currentUserCredits} credits available for this ${selectedProvider.creditCost}-credit render.`
              : `You need ${selectedProvider.creditCost} credits but only have ${currentUserCredits}. Failed final renders refund automatically, and you can top up from Buy credits.`}
          </p>
        </div>
      ) : null}

      <CollapsibleSection
        eyebrow="Advanced"
        title="Viral score"
        description="A quick read on hook strength, emotion, and pacing before you render."
        defaultOpen={true}
      >
        <div className={styles.scoreGrid}>
          <div className={styles.heroMetric}>
            <span>Hook</span>
            <strong>{viralScoreAnalysis.score}/100</strong>
          </div>
          <div className={styles.heroMetric}>
            <span>Emotion</span>
            <strong>{viralScoreAnalysis.emotion}</strong>
          </div>
          <div className={styles.heroMetric}>
            <span>Length</span>
            <strong>{viralScoreAnalysis.length}</strong>
          </div>
        </div>
      </CollapsibleSection>
    </>
  );
}
