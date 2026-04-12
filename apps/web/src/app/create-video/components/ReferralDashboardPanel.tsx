import styles from '../page.module.css';

export interface ReferralDashboardPanelProps {
  readonly referralCode: string;
  readonly onCopyReferralCode: () => void;
  readonly referralCredits: number;
}

export function ReferralDashboardPanel({
  referralCode,
  onCopyReferralCode,
  referralCredits,
}: ReferralDashboardPanelProps) {
  return (
    <section className={styles.toolPanel} aria-labelledby="referral-title">
      <div className={styles.toolHeader}>
        <div>
          <p className={styles.sectionEyebrow}>Referral</p>
          <h3 className={styles.toolTitle} id="referral-title">
            Referral dashboard
          </h3>
        </div>
        <button className={styles.ghostButton} onClick={onCopyReferralCode} type="button">
          Copy code
        </button>
      </div>

      <div className={styles.scoreGrid}>
        <div className={styles.heroMetric}>
          <span>Referral code</span>
          <strong>{referralCode}</strong>
        </div>
        <div className={styles.heroMetric}>
          <span>Reward</span>
          <strong>{referralCredits} credits</strong>
        </div>
        <div className={styles.heroMetric}>
          <span>Status</span>
          <strong>Invite friends</strong>
        </div>
      </div>
    </section>
  );
}
