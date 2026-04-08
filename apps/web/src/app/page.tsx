import Link from 'next/link';
import styles from './home.module.css';

export default function HomePage() {
  return (
    <main className={styles.page}>
      <section className={styles.panel}>
        <p className={styles.eyebrow}>Reevio Studio</p>
        <h1 className={styles.title}>Build affiliate videos from one prompt</h1>
        <p className={styles.subtitle}>
          Generate scripts, scenes, images, voice, and provider-routed renders inside one flow.
        </p>
        <Link className={styles.link} href="/create-video">
          Open create flow
        </Link>
      </section>
    </main>
  );
}
