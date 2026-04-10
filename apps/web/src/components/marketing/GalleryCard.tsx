import type { GalleryCardProps } from './marketing.types';
import styles from '@/app/home.module.css';

export function GalleryCard({ item, toneIndex }: GalleryCardProps) {
  return (
    <article className={styles.galleryCard}>
      <div className={`${styles.galleryVisual} ${styles[`galleryTone${toneIndex}`]}`}>
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
