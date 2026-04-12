import {
  createExportFormats,
  type ExportFormatDefinition,
  type ExportFormatId,
  type HashtagSuggestionSet,
  type PostingPreparation,
} from '../content-studio';
import type { WatermarkPosition } from '../page.types';
import {
  CollapsibleSection,
  ExportPanel,
  PostingPreparationPanel,
  HashtagGeneratorPanel,
  TeamModePanel,
  WatermarkPanel,
  StorageCdnPanel,
  MonitoringPanel,
  ReferralDashboardPanel,
  PerformanceAiPanel,
} from '../components';
import { workflowNotes } from '../page.constants';
import styles from './PublishStep.module.css';

export interface PublishStepProps {
  readonly prompt: string;
  readonly selectedHookText: string | null;
  readonly ctaText: string;
  readonly exportFormats: readonly ExportFormatDefinition[];
  readonly selectedExportFormatId: ExportFormatId;
  readonly onSelectExportFormat: (formatId: ExportFormatId) => void;
  readonly onDownloadFormat: (format: ExportFormatDefinition) => void;
  readonly onDownloadAllFormats: () => void;
  readonly postingPreparation: PostingPreparation;
  readonly onRegeneratePostingPreparation: () => void;
  readonly onCopyPostingField: (label: string, value: string) => void;
  readonly onUpdatePostingPreparation: (field: keyof PostingPreparation, value: string) => void;
  readonly postingNotice: string | null;
  readonly hashtagSuggestions: HashtagSuggestionSet;
  readonly onRegenerateHashtags: () => void;
  readonly onCopyHashtags: () => void;
  readonly onUseHashtagsInPosting: () => void;
  readonly hashtagNotice: string | null;
  readonly inviteEmail: string;
  readonly onInviteEmailChange: (value: string) => void;
  readonly inviteRole: 'owner' | 'editor';
  readonly onInviteRoleChange: (role: 'owner' | 'editor') => void;
  readonly onInviteMember: () => void;
  readonly teamMembers: readonly { readonly id: string; readonly email: string; readonly role: 'owner' | 'editor' }[];
  readonly teamNotice: string | null;
  readonly watermarkType: 'text' | 'logo';
  readonly onWatermarkTypeChange: (type: 'text' | 'logo') => void;
  readonly watermarkText: string;
  readonly onWatermarkTextChange: (value: string) => void;
  readonly watermarkPosition: WatermarkPosition;
  readonly onWatermarkPositionChange: (position: WatermarkPosition) => void;
  readonly storageUrl: string;
  readonly onCopyStorageUrl: () => void;
  readonly bulkJobs: readonly { readonly id: string; readonly status: string; readonly errorMessage: string | null }[];
  readonly referralCode: string;
  readonly onCopyReferralCode: () => void;
  readonly referralCredits: number;
  readonly views: string;
  readonly onViewsChange: (value: string) => void;
  readonly likes: string;
  readonly onLikesChange: (value: string) => void;
  readonly watchTime: string;
  readonly onWatchTimeChange: (value: string) => void;
  readonly performanceInsight: { readonly health: string; readonly suggestion: string };
}

export function PublishStep({
  prompt,
  selectedHookText,
  ctaText,
  exportFormats,
  selectedExportFormatId,
  onSelectExportFormat,
  onDownloadFormat,
  onDownloadAllFormats,
  postingPreparation,
  onRegeneratePostingPreparation,
  onCopyPostingField,
  onUpdatePostingPreparation,
  postingNotice,
  hashtagSuggestions,
  onRegenerateHashtags,
  onCopyHashtags,
  onUseHashtagsInPosting,
  hashtagNotice,
  inviteEmail,
  onInviteEmailChange,
  inviteRole,
  onInviteRoleChange,
  onInviteMember,
  teamMembers,
  teamNotice,
  watermarkType,
  onWatermarkTypeChange,
  watermarkText,
  onWatermarkTextChange,
  watermarkPosition,
  onWatermarkPositionChange,
  storageUrl,
  onCopyStorageUrl,
  bulkJobs,
  referralCode,
  onCopyReferralCode,
  referralCredits,
  views,
  onViewsChange,
  likes,
  onLikesChange,
  watchTime,
  onWatchTimeChange,
  performanceInsight,
}: PublishStepProps) {
  const selectedExportFormat =
    exportFormats.find((format) => format.id === selectedExportFormatId) ?? exportFormats[0];

  const monitoringStats = {
    failedJobs: bulkJobs.filter((bulkJob) => bulkJob.status === 'failed').length,
    activeJobs: bulkJobs.filter(
      (bulkJob) => bulkJob.status === 'queued' || bulkJob.status === 'processing'
    ).length,
    latestError: bulkJobs.find((bulkJob) => bulkJob.errorMessage)?.errorMessage ?? 'No recent failures.',
  };

  return (
    <>
      <CollapsibleSection
        eyebrow="Publish"
        title="Distribution, growth, delivery, analytics"
        description="Package the final video for download, posting, team handoff, and performance follow-up."
        defaultOpen={true}
      >
        <div className={styles.sectionGroup}>
          <div>
            <p className={styles.groupEyebrow}>Core</p>
            <h3 className={styles.groupTitle}>Distribution</h3>
          </div>
          <ExportPanel
            exportFormats={exportFormats}
            selectedExportFormat={selectedExportFormat}
            onSelectExportFormat={onSelectExportFormat}
            onDownloadAllFormats={onDownloadAllFormats}
            onDownloadFormat={onDownloadFormat}
          />
          <PostingPreparationPanel
            onCopyPostingField={onCopyPostingField}
            onRegeneratePostingPreparation={onRegeneratePostingPreparation}
            onUpdatePostingPreparation={onUpdatePostingPreparation}
            postingNotice={postingNotice}
            postingPreparation={postingPreparation}
          />
        </div>

        <div className={styles.sectionGroup}>
          <div>
            <p className={styles.groupEyebrow}>Advanced</p>
            <h3 className={styles.groupTitle}>Growth</h3>
          </div>
          <HashtagGeneratorPanel
            hashtagNotice={hashtagNotice}
            hashtagSuggestions={hashtagSuggestions}
            onCopyHashtags={onCopyHashtags}
            onRegenerateHashtags={onRegenerateHashtags}
            onUseHashtagsInPosting={onUseHashtagsInPosting}
          />
          <TeamModePanel
            inviteEmail={inviteEmail}
            inviteRole={inviteRole}
            onInviteEmailChange={onInviteEmailChange}
            onInviteMember={onInviteMember}
            onInviteRoleChange={onInviteRoleChange}
            teamMembers={teamMembers}
            teamNotice={teamNotice}
          />
        </div>

        <div className={styles.sectionGroup}>
          <div>
            <p className={styles.groupEyebrow}>Advanced</p>
            <h3 className={styles.groupTitle}>Delivery</h3>
          </div>
          <WatermarkPanel
            onWatermarkPositionChange={onWatermarkPositionChange}
            onWatermarkTextChange={onWatermarkTextChange}
            onWatermarkTypeChange={onWatermarkTypeChange}
            watermarkPosition={watermarkPosition}
            watermarkText={watermarkText}
            watermarkType={watermarkType}
          />
          <StorageCdnPanel
            storageUrl={storageUrl}
            onCopyStorageUrl={onCopyStorageUrl}
          />
          <MonitoringPanel
            failedJobs={monitoringStats.failedJobs}
            activeJobs={monitoringStats.activeJobs}
            latestError={monitoringStats.latestError}
          />
        </div>

        <div className={styles.sectionGroup}>
          <div>
            <p className={styles.groupEyebrow}>Advanced</p>
            <h3 className={styles.groupTitle}>Analytics</h3>
          </div>
          <ReferralDashboardPanel
            referralCode={referralCode}
            onCopyReferralCode={onCopyReferralCode}
            referralCredits={referralCredits}
          />
          <PerformanceAiPanel
            likes={likes}
            onLikesChange={onLikesChange}
            onViewsChange={onViewsChange}
            onWatchTimeChange={onWatchTimeChange}
            performanceInsight={performanceInsight}
            views={views}
            watchTime={watchTime}
          />
        </div>
      </CollapsibleSection>

      <div className={styles.noteGrid}>
        {workflowNotes.map((note) => (
          <div className={styles.noteCard} key={note}>
            {note}
          </div>
        ))}
      </div>
    </>
  );
}
