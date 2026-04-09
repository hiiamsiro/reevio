import { BillingPlan } from './billing.types';

export const BILLING_PLANS: readonly BillingPlan[] = [
  {
    id: 'basic',
    name: 'Basic',
    description: 'For solo creators testing new video hooks and offers.',
    credits: 80,
    priceCents: 1900,
    features: ['80 credits included', 'Best for quick campaign tests', 'Instant credit top-up'],
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'For operators producing ads every week across multiple providers.',
    credits: 220,
    priceCents: 4900,
    features: ['220 credits included', 'Lower effective cost per render', 'Priority for scaling campaigns'],
  },
  {
    id: 'premium',
    name: 'Premium',
    description: 'For teams and agencies that need room for high-volume output.',
    credits: 520,
    priceCents: 9900,
    features: ['520 credits included', 'Strongest value per render', 'Built for larger content pipelines'],
  },
] as const;
