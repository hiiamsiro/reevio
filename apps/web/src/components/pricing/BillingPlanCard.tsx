import type { BillingPlanCardProps } from '@/app/pricing/page.types';
import styles from '@/app/pricing/page.module.css';

export function BillingPlanCard({ plan, isActive, onCheckout }: BillingPlanCardProps) {
  return (
    <article className={`${styles.planCard} ${plan.id === 'pro' ? styles.featured : ''}`}>
      <div className={styles.planMeta}>
        <div>
          <h3 className={styles.planName}>{plan.name}</h3>
          <p className={styles.planDescription}>{plan.description}</p>
        </div>
        {plan.id === 'pro' ? <span className={styles.planBadge}>Most popular</span> : null}
      </div>

      <p className={styles.price}>{formatPrice(plan.priceCents)}</p>
      <p className={styles.credits}>{plan.credits} credits added</p>

      <ul className={styles.featureList}>
        {plan.features.map((feature) => (
          <li key={feature}>{feature}</li>
        ))}
      </ul>

      <button
        className={styles.planButton}
        type="button"
        onClick={() => onCheckout(plan.id)}
        disabled={isActive}
      >
        {isActive ? 'Processing payment...' : `Buy ${plan.name}`}
      </button>
    </article>
  );
}

function formatPrice(priceCents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(priceCents / 100);
}
