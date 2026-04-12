import type { KeyboardEvent } from 'react';
import { useEffect, useId, useRef, useState } from 'react';
import styles from './CustomSelect.module.css';

export interface CustomSelectOption {
  readonly value: string;
  readonly label: string;
  readonly meta?: string;
}

export interface CustomSelectProps {
  readonly id?: string;
  readonly value: string;
  readonly options: readonly CustomSelectOption[];
  readonly disabled?: boolean;
  readonly className?: string;
  readonly placeholder?: string;
  readonly onValueChange: (value: string) => void;
}

export function CustomSelect({
  id,
  value,
  options,
  disabled = false,
  className,
  placeholder = 'Select an option',
  onValueChange,
}: CustomSelectProps) {
  const generatedId = useId();
  const triggerId = id ?? `custom-select-${generatedId}`;
  const listboxId = `${triggerId}-listbox`;
  const rootRef = useRef<HTMLDivElement | null>(null);
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const [isOpen, setIsOpen] = useState(false);
  const selectedIndex = options.findIndex((option) => option.value === value);
  const [highlightedIndex, setHighlightedIndex] = useState(selectedIndex >= 0 ? selectedIndex : 0);

  const selectedOption = selectedIndex >= 0 ? options[selectedIndex] : null;

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setHighlightedIndex(selectedIndex >= 0 ? selectedIndex : 0);
  }, [isOpen, selectedIndex]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const frame = requestAnimationFrame(() => {
      optionRefs.current[highlightedIndex]?.focus();
    });

    return () => {
      cancelAnimationFrame(frame);
    };
  }, [highlightedIndex, isOpen]);

  const openMenu = () => {
    if (disabled || options.length === 0) {
      return;
    }

    setIsOpen(true);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  const commitValue = (nextValue: string) => {
    onValueChange(nextValue);
    setIsOpen(false);
  };

  const moveHighlight = (direction: 1 | -1) => {
    if (options.length === 0) {
      return;
    }

    setHighlightedIndex((previousIndex) => {
      const currentIndex = previousIndex >= 0 ? previousIndex : 0;
      const nextIndex = currentIndex + direction;

      if (nextIndex < 0) {
        return options.length - 1;
      }

      if (nextIndex >= options.length) {
        return 0;
      }

      return nextIndex;
    });
  };

  const handleTriggerKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) {
      return;
    }

    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      openMenu();
      setHighlightedIndex(selectedIndex >= 0 ? selectedIndex : 0);
      return;
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setIsOpen((previous) => !previous);
    }
  };

  const handleOptionKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    optionValue: string
  ) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      moveHighlight(1);
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      moveHighlight(-1);
      return;
    }

    if (event.key === 'Home') {
      event.preventDefault();
      setHighlightedIndex(0);
      return;
    }

    if (event.key === 'End') {
      event.preventDefault();
      setHighlightedIndex(options.length - 1);
      return;
    }

    if (event.key === 'Escape' || event.key === 'Tab') {
      closeMenu();
      return;
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      commitValue(optionValue);
    }
  };

  const rootClassName = [
    styles.root,
    isOpen ? styles.rootOpen : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');
  const triggerClassName = [
    styles.trigger,
    isOpen ? styles.triggerOpen : '',
    disabled ? styles.triggerDisabled : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={rootClassName} ref={rootRef}>
      <button
        aria-controls={listboxId}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        className={triggerClassName}
        disabled={disabled}
        id={triggerId}
        onClick={() => {
          if (isOpen) {
            closeMenu();
            return;
          }

          openMenu();
        }}
        onKeyDown={handleTriggerKeyDown}
        type="button"
      >
        <span className={styles.triggerCopy}>
          <span className={styles.value}>{selectedOption?.label ?? placeholder}</span>
          {selectedOption?.meta ? <span className={styles.meta}>{selectedOption.meta}</span> : null}
        </span>
        <span aria-hidden="true" className={styles.chevron} />
      </button>

      {isOpen ? (
        <div className={styles.panel} id={listboxId} role="listbox">
          {options.map((option, index) => {
            const isSelected = option.value === value;
            const isHighlighted = index === highlightedIndex;
            const optionClassName = [
              styles.option,
              isSelected ? styles.optionSelected : '',
              isHighlighted ? styles.optionHighlighted : '',
            ]
              .filter(Boolean)
              .join(' ');

            return (
              <button
                aria-selected={isSelected}
                className={optionClassName}
                key={option.value}
                onClick={() => commitValue(option.value)}
                onKeyDown={(event) => handleOptionKeyDown(event, option.value)}
                onMouseEnter={() => setHighlightedIndex(index)}
                ref={(element) => {
                  optionRefs.current[index] = element;
                }}
                role="option"
                type="button"
              >
                <span className={styles.optionLabel}>{option.label}</span>
                {option.meta ? <span className={styles.optionMeta}>{option.meta}</span> : null}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
