import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { BILLING_PLANS } from './billing.data';
import { BillingCheckoutResult, BillingPlan, BillingPlanId } from './billing.types';
import {
  BillingPaymentReferenceConflictError,
  BillingPlanNotFoundError,
} from './billing.errors';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BillingService {
  public constructor(private readonly prismaService: PrismaService) {}

  public getPlans(): readonly BillingPlan[] {
    return BILLING_PLANS;
  }

  public getPlan(planId: BillingPlanId): BillingPlan {
    const selectedPlan = BILLING_PLANS.find((plan) => plan.id === planId);

    if (!selectedPlan) {
      throw new BillingPlanNotFoundError(planId);
    }

    return selectedPlan;
  }

  public async purchaseCredits(
    userId: string,
    planId: BillingPlanId,
    paymentReference: string
  ): Promise<BillingCheckoutResult> {
    const selectedPlan = this.getPlan(planId);
    const existingPurchase = await this.prismaService.creditPurchase.findFirst({
      where: {
        paymentReference,
      },
      select: {
        userId: true,
        planId: true,
      },
    });

    if (existingPurchase) {
      if (existingPurchase.userId !== userId || existingPurchase.planId !== selectedPlan.id) {
        throw new BillingPaymentReferenceConflictError(paymentReference);
      }

      const currentUser = await this.prismaService.user.findUniqueOrThrow({
        where: {
          id: userId,
        },
        select: {
          credits: true,
        },
      });

      return {
        plan: selectedPlan,
        remainingCredits: currentUser.credits,
        paymentReference,
      };
    }

    try {
      const updatedUser = await this.prismaService.$transaction(async (transactionClient) => {
        await transactionClient.creditPurchase.create({
          data: {
            userId,
            planId: selectedPlan.id,
            planName: selectedPlan.name,
            credits: selectedPlan.credits,
            priceCents: selectedPlan.priceCents,
            status: 'COMPLETED',
            paymentReference,
            completedAt: new Date(),
          },
        });

        return transactionClient.user.update({
          where: {
            id: userId,
          },
          data: {
            credits: {
              increment: selectedPlan.credits,
            },
          },
          select: {
            credits: true,
          },
        });
      });

      return {
        plan: selectedPlan,
        remainingCredits: updatedUser.credits,
        paymentReference,
      };
    } catch (error: unknown) {
      if (!isUniquePaymentReferenceError(error)) {
        throw error;
      }

      const duplicatedPurchase = await this.prismaService.creditPurchase.findFirst({
        where: {
          paymentReference,
        },
        select: {
          userId: true,
          planId: true,
        },
      });

      if (
        !duplicatedPurchase ||
        duplicatedPurchase.userId !== userId ||
        duplicatedPurchase.planId !== selectedPlan.id
      ) {
        throw new BillingPaymentReferenceConflictError(paymentReference);
      }

      const currentUser = await this.prismaService.user.findUniqueOrThrow({
        where: {
          id: userId,
        },
        select: {
          credits: true,
        },
      });

      return {
        plan: selectedPlan,
        remainingCredits: currentUser.credits,
        paymentReference,
      };
    }
  }
}

function isUniquePaymentReferenceError(error: unknown): boolean {
  if (!(error instanceof Prisma.PrismaClientKnownRequestError)) {
    return false;
  }

  return error.code === 'P2002';
}
