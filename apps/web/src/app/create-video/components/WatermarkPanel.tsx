import { getWatermarkPositionClassName } from '../page.helpers';
import type { WatermarkPanelProps } from './create-video-panels.types';
import { CustomSelect, type CustomSelectOption } from './CustomSelect';
import styles from '../page.module.css';

const watermarkPositionOptions: readonly CustomSelectOption[] = [
  { value: 'top-left', label: 'Top left', meta: 'Upper-left corner' },
  { value: 'top-right', label: 'Top right', meta: 'Upper-right corner' },
  { value: 'bottom-left', label: 'Bottom left', meta: 'Lower-left corner' },
  { value: 'bottom-right', label: 'Bottom right', meta: 'Lower-right corner' },
];

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
          <p className={styles.sectionEyebrow}>Branding</p>
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
        <CustomSelect
          options={watermarkPositionOptions}
          onValueChange={(value) =>
            onWatermarkPositionChange(value as WatermarkPanelProps['watermarkPosition'])
          }
          value={watermarkPosition}
        />
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
