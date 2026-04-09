import { z } from 'zod';
import { BILLING_PLAN_VALUES } from './billing.constants';

export const billingCheckoutSchema = z.object({
  planId: z.enum(BILLING_PLAN_VALUES),
  paymentReference: z.string().uuid(),
});
