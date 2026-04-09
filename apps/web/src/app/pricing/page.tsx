'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import styles from './page.module.css';

interface ApiEnvelope<TData> {
  readonly success: boolean;
  readonly data: TData | null;
  readonly error: string | null;
}

interface CurrentUser {
  readonly email: string;
  readonly credits: number;
}

interface BillingPlan {
  readonly id: 'basic' | 'pro' | 'premium';
  readonly name: string;
  readonly description: string;
  readonly credits: number;
  readonly priceCents: number;
  readonly features: readonly string[];
}

interface BillingCheckoutResult {
  readonly plan: BillingPlan;
  readonly remainingCredits: number;
  readonly paymentReference: string;
}

export default function PricingPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [plans, setPlans] = useState<readonly BillingPlan[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [activePlanId, setActivePlanId] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    const loadData = async (): Promise<void> => {
      const [sessionResponse, plansResponse] = await Promise.all([
        fetch('/api/auth/session', { cache: 'no-store' }),
        fetch('/api/billing/plans', { cache: 'no-store' }),
      ]);

      if (sessionResponse.status === 401 || plansResponse.status === 401) {
        router.push('/login');
        router.refresh();
        return;
      }

      const sessionPayload = (await sessionResponse.json()) as ApiEnvelope<CurrentUser>;
      const plansPayload = (await plansResponse.json()) as ApiEnvelope<readonly BillingPlan[]>;

      if (
        !sessionResponse.ok ||
        !plansResponse.ok ||
        !sessionPayload.success ||
        !sessionPayload.data ||
        !plansPayload.success ||
        !plansPayload.data
      ) {
        throw new Error(sessionPayload.error ?? plansPayload.error ?? 'Failed to load billing page.');
      }

      if (!isActive) {
        return;
      }

      setCurrentUser(sessionPayload.data);
      setPlans(plansPayload.data);
    };

    void loadData().catch((error: unknown) => {
      if (!isActive) {
        return;
      }

      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage('Failed to load billing page.');
      }
    });

    return () => {
      isActive = false;
    };
  }, [router]);

  const handleCheckout = async (planId: BillingPlan['id']): Promise<void> => {
    setActivePlanId(planId);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const paymentReference = crypto.randomUUID();
      const response = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          planId,
          paymentReference,
        }),
      });
      const payload = (await response.json()) as ApiEnvelope<BillingCheckoutResult>;

      if (!response.ok || !payload.success || !payload.data) {
        setErrorMessage(payload.error ?? 'Failed to purchase credits.');
        return;
      }

      const checkoutResult = payload.data;

      setCurrentUser((previousUser) => {
        if (!previousUser) {
          return previousUser;
        }

        return {
          ...previousUser,
          credits: checkoutResult.remainingCredits,
        };
      });
      setSuccessMessage(
        `${checkoutResult.plan.name} completed. ${checkoutResult.plan.credits} credits were added automatically.`
      );
    } catch (error: unknown) {
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage('Failed to purchase credits.');
      }
    } finally {
      setActivePlanId(null);
    }
  };

  return (
    <main className={styles.page}>
      <div className={styles.backdrop} />
      <div className={styles.glowOne} />
      <div className={styles.glowTwo} />

      <div className={styles.shell}>
        <header className={styles.nav}>
          <div className={styles.brandLockup}>
            <span className={styles.brandMark} aria-hidden="true" />
            <div>
              <p className={styles.brandName}>Reevio Studio</p>
              <p className={styles.brandMeta}>Credit checkout</p>
            </div>
          </div>

          <div className={styles.navActions}>
            <Link className={styles.navLink} href="/create-video">
              Back to studio
            </Link>
            <span className={styles.creditsBadge}>
              {currentUser ? `${currentUser.credits} credits available` : 'Loading credits'}
            </span>
          </div>
        </header>

        <section className={styles.hero}>
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>Payment</p>
            <h1 className={styles.title}>Top up credits with a plan that matches your content pace.</h1>
            <p className={styles.subtitle}>
              Choose a credit pack, complete checkout, and your balance updates automatically for
              the next render.
            </p>

            <div className={styles.heroActions}>
              <Link className={styles.primaryAction} href="/create-video">
                Return to create video
              </Link>
              <a className={styles.secondaryAction} href="#plans">
                Compare plans
              </a>
            </div>
          </div>

          <aside className={styles.statusCard}>
            <p className={styles.statusLabel}>Current balance</p>
            <p className={styles.statusValue}>{currentUser ? `${currentUser.credits} credits` : '--'}</p>
            <p className={styles.sectionCopy}>
              Credits unlock new renders immediately after checkout completes.
            </p>
            {successMessage ? <p className={styles.successMessage}>{successMessage}</p> : null}
            {errorMessage ? <p className={styles.errorMessage}>{errorMessage}</p> : null}
          </aside>
        </section>

        <section className={styles.plansSection} id="plans">
          <p className={styles.eyebrow}>Plan comparison</p>
          <h2 className={styles.sectionTitle}>Pick the fastest path back to generating.</h2>
          <p className={styles.sectionCopy}>
            Every plan adds credits instantly after payment, so you can move straight back into the
            studio.
          </p>

          <div className={styles.plansGrid}>
            {plans.map((plan) => (
              <article
                className={`${styles.planCard} ${plan.id === 'pro' ? styles.featured : ''}`}
                key={plan.id}
              >
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
                  onClick={() => handleCheckout(plan.id)}
                  disabled={activePlanId !== null}
                >
                  {activePlanId === plan.id ? 'Processing payment...' : `Buy ${plan.name}`}
                </button>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

function formatPrice(priceCents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(priceCents / 100);
}
