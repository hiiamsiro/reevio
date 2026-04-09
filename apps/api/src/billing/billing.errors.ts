export class BillingPlanNotFoundError extends Error {
  public readonly code: string;

  public constructor(planId: string) {
    super(`Billing plan "${planId}" was not found.`);
    this.name = 'BillingPlanNotFoundError';
    this.code = 'BILLING_PLAN_NOT_FOUND';
  }
}

export class BillingPaymentReferenceConflictError extends Error {
  public readonly code: string;

  public constructor(paymentReference: string) {
    super(`Payment reference "${paymentReference}" is already tied to a different purchase.`);
    this.name = 'BillingPaymentReferenceConflictError';
    this.code = 'BILLING_PAYMENT_REFERENCE_CONFLICT';
  }
}
