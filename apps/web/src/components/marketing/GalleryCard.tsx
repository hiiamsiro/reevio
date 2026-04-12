import Image from 'next/image';
import type { GalleryCardProps } from './marketing.types';
import styles from '@/app/home.module.css';

export function GalleryCard({ item, toneIndex }: GalleryCardProps) {
  return (
    <article className={styles.galleryCard}>
      <div
        className={`${styles.galleryVisual} ${styles[`galleryTone${toneIndex}`]}`}
        data-media-reveal
      >
        <Image
          src={item.imageSrc}
          alt={item.imageAlt}
          fill
          sizes="(max-width: 920px) 100vw, (max-width: 1180px) 50vw, 33vw"
          className={styles.galleryImage}
        />
        <div className={styles.galleryVisualScrim} aria-hidden="true" />
        <div className={styles.galleryVisualGlow} aria-hidden="true" />
        <span className={styles.galleryRatio}>{item.ratio}</span>
      </div>
      <div className={styles.galleryBody}>
        <div className={styles.galleryHeader}>
          <h3>{item.title}</h3>
          <span>{item.duration}</span>
        </div>
        <p>{item.tone}</p>
        <div className={styles.galleryMeta}>
          <span>{item.credits}</span>
          <span>Preview ready</span>
        </div>
      </div>
    </article>
  );
}
