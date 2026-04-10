import type { User } from '@reevio/types';

export type CurrentUser = Pick<User, 'email' | 'credits'>;

export interface BillingPlan {
  readonly id: 'basic' | 'pro' | 'premium';
  readonly name: string;
  readonly description: string;
  readonly credits: number;
  readonly priceCents: number;
  readonly features: readonly string[];
}

export interface BillingCheckoutResult {
  readonly plan: BillingPlan;
  readonly remainingCredits: number;
  readonly paymentReference: string;
}

export interface BillingPlanCardProps {
  readonly plan: BillingPlan;
  readonly isActive: boolean;
  readonly onCheckout: (planId: BillingPlan['id']) => void;
}
