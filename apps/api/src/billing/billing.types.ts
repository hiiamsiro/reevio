import { BILLING_PLAN_VALUES } from './billing.constants';

export type BillingPlanId = (typeof BILLING_PLAN_VALUES)[number];

export interface BillingPlan {
  readonly id: BillingPlanId;
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
