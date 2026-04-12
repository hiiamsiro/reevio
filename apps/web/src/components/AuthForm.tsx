'use client';

import type { ApiResponse, AuthSession } from '@reevio/types';
import Link from 'next/link';
import { Jost, Playfair_Display } from 'next/font/google';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import styles from './auth-form.module.css';

const authDisplay = Playfair_Display({
  subsets: ['latin'],
  variable: '--landing-font-display',
});

const authBody = Jost({
  subsets: ['latin'],
  variable: '--landing-font-body',
});

type BrowserAuthSession = Pick<AuthSession, 'expiresAt'> & {
  readonly user: Pick<AuthSession['user'], 'email'>;
};

interface AuthFormProps {
  readonly mode: 'login' | 'register';
}

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitLabel = mode === 'login' ? 'Log in' : 'Create account';
  const heading = mode === 'login' ? 'Welcome back to Reevio Studio' : 'Create your Reevio Studio account';
  const helperCopy =
    mode === 'login'
      ? 'Log in to continue generating videos inside your secured workspace.'
      : 'Register with email and password to unlock your video generation workspace.';
  const alternateHref = mode === 'login' ? '/register' : '/login';
  const alternateLabel = mode === 'login' ? 'Need an account? Register' : 'Already have an account? Log in';

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/auth/${mode}`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });
      const payload = (await response.json()) as ApiResponse<BrowserAuthSession>;

      if (!response.ok || !payload.success) {
        setErrorMessage(payload.error ?? 'Authentication failed.');
        return;
      }

      router.push('/create-video');
      router.refresh();
    } catch (error: unknown) {
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage('Authentication failed.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className={`${styles.page} ${authDisplay.variable} ${authBody.variable}`}>
      <div className={styles.backdrop} />
      <div className={styles.gridLines} />
      <div className={styles.glowOne} />
      <div className={styles.glowTwo} />

      <section className={styles.panel}>
        <div className={styles.brandLockup}>
          <span className={styles.brandMark} aria-hidden="true" />
          <div>
            <p className={styles.brandName}>Reevio Studio</p>
            <p className={styles.brandMeta}>Secure video generation workspace</p>
          </div>
        </div>

        <div className={styles.copyBlock}>
          <p className={styles.eyebrow}>{mode === 'login' ? 'Login' : 'Register'}</p>
          <h1 className={styles.title}>{heading}</h1>
          <p className={styles.subtitle}>{helperCopy}</p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor="email">
              Email
            </label>
            <input
              id="email"
              className={styles.input}
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor="password">
              Password
            </label>
            <input
              id="password"
              className={styles.input}
              type="password"
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              minLength={8}
              required
            />
          </div>

          {errorMessage ? <p className={styles.error}>{errorMessage}</p> : null}

          <button className={styles.submit} type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Please wait...' : submitLabel}
          </button>
        </form>

        <Link className={styles.link} href={alternateHref}>
          {alternateLabel}
        </Link>
      </section>
    </main>
  );
}
