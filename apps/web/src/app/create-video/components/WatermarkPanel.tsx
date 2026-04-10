import { getWatermarkPositionClassName } from '../page.helpers';
import type { WatermarkPanelProps } from './create-video-panels.types';
import styles from '../page.module.css';

export function WatermarkPanel({
  watermarkType,
  onWatermarkTypeChange,
  watermarkText,
  onWatermarkTextChange,
  watermarkPosition,
  onWatermarkPositionChange,
}: WatermarkPanelProps) {
  return (
    <section className={styles.toolPanel} aria-labelledby="watermark-title">
      <div className={styles.toolHeader}>
        <div>
          <p className={styles.sectionEyebrow}>Phase 36</p>
          <h3 className={styles.toolTitle} id="watermark-title">
            Watermark
          </h3>
        </div>
      </div>

      <div className={styles.segmentGroup}>
        <button
          aria-pressed={watermarkType === 'text'}
          className={`${styles.segmentButton} ${watermarkType === 'text' ? styles.segmentButtonActive : ''}`}
          onClick={() => onWatermarkTypeChange('text')}
          type="button"
        >
          Text
        </button>
        <button
          aria-pressed={watermarkType === 'logo'}
          className={`${styles.segmentButton} ${watermarkType === 'logo' ? styles.segmentButtonActive : ''}`}
          onClick={() => onWatermarkTypeChange('logo')}
          type="button"
        >
          Logo
        </button>
      </div>

      <div className={styles.fieldRow}>
        <input
          className={styles.textInput}
          onChange={(event) => onWatermarkTextChange(event.target.value)}
          value={watermarkText}
        />
        <select
          className={styles.select}
          onChange={(event) => onWatermarkPositionChange(event.target.value as WatermarkPanelProps['watermarkPosition'])}
          value={watermarkPosition}
        >
          <option value="top-left">Top left</option>
          <option value="top-right">Top right</option>
          <option value="bottom-left">Bottom left</option>
          <option value="bottom-right">Bottom right</option>
        </select>
      </div>

      <div className={styles.watermarkPreview}>
        <span
          className={`${styles.watermarkBadge} ${getWatermarkPositionClassName(watermarkPosition, styles)}`}
        >
          {watermarkType === 'logo' ? 'Logo mark' : watermarkText}
        </span>
      </div>
    </section>
  );
}
