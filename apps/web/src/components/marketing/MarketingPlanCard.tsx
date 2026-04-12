import type { MarketingPlanCardProps } from './marketing.types';
import styles from '@/app/home.module.css';

export function MarketingPlanCard({ plan }: MarketingPlanCardProps) {
  return (
    <article
      className={`${styles.pricingCard} ${plan.featured ? styles.pricingFeatured : ""}`}
    >
      <div className={styles.pricingTop}>
        <div>
          <h3>{plan.name}</h3>
          <p>{plan.description}</p>
        </div>
        {plan.featured ? <span className={styles.planBadge}>Most popular</span> : null}
      </div>
      <p className={styles.price}>{plan.price}</p>
      <p className={styles.credits}>{plan.credits}</p>
      <div className={styles.planDivider} />
      <ul className={styles.featureList}>
        {plan.features.map((feature) => (
          <li key={feature}>{feature}</li>
        ))}
      </ul>
    </article>
  );
}
