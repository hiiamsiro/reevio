import { BadRequestException, Body, Controller, Get, NotFoundException, Post } from '@nestjs/common';
import { CurrentUser } from '../auth/auth.decorator';
import { AuthenticatedUser } from '../auth/auth.types';
import {
  BillingPaymentReferenceConflictError,
  BillingPlanNotFoundError,
} from './billing.errors';
import { billingCheckoutSchema } from './billing.schemas';
import { BillingService } from './billing.service';
import { BillingCheckoutResult, BillingPlan } from './billing.types';

interface BillingEnvelope<TData> {
  readonly success: true;
  readonly data: TData;
  readonly error: null;
}

@Controller('billing')
export class BillingController {
  public constructor(private readonly billingService: BillingService) {}

  @Get('plans')
  public getPlans(): BillingEnvelope<readonly BillingPlan[]> {
    return {
      success: true,
      data: this.billingService.getPlans(),
      error: null,
    };
  }

  @Post('checkout')
  public async checkout(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: unknown
  ): Promise<BillingEnvelope<BillingCheckoutResult>> {
    const parsedBody = billingCheckoutSchema.safeParse(body);

    if (!parsedBody.success) {
      throw new BadRequestException(parsedBody.error.flatten());
    }

    try {
      const checkoutResult = await this.billingService.purchaseCredits(
        user.id,
        parsedBody.data.planId,
        parsedBody.data.paymentReference
      );

      return {
        success: true,
        data: checkoutResult,
        error: null,
      };
    } catch (error: unknown) {
      if (error instanceof BillingPlanNotFoundError) {
        throw new NotFoundException(error.message);
      }

      if (error instanceof BillingPaymentReferenceConflictError) {
        throw new BadRequestException(error.message);
      }

      throw error;
    }
  }
}
