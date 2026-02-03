import { useState, useEffect, useRef, type FC, type ChangeEvent } from 'react';
import styles from './RangeFilter.module.scss';

interface RangeFilterProps {
  min: number;
  max: number;
  minValue: number;
  maxValue: number;
  onChange: (min: number, max: number) => void;
}

const RangeFilter: FC<RangeFilterProps> = ({
  min,
  max,
  minValue,
  maxValue,
  onChange
}) => {
  const [localMinVal, setLocalMinVal] = useState(minValue);
  const [localMaxVal, setLocalMaxVal] = useState(maxValue);
  const minValRef = useRef(minValue);
  const maxValRef = useRef(maxValue);
  const range = useRef<HTMLDivElement>(null);

  // обновление локальных значений при изменении внешних minValue и maxValue
  useEffect(() => {
    if (minValue !== minValRef.current) {
      minValRef.current = minValue;
      setLocalMinVal(minValue);
    }
  }, [minValue]);

  useEffect(() => {
    if (maxValue !== maxValRef.current) {
      maxValRef.current = maxValue;
      setLocalMaxVal(maxValue);
    }
  }, [maxValue]);

  // обновление процента заполнения фона между ползунками
  useEffect(() => {
    const minPercent = ((localMinVal - min) / (max - min)) * 100;
    const maxPercent = ((localMaxVal - min) / (max - min)) * 100;
    
    if (range.current) {
      range.current.style.left = `${minPercent}%`;
      range.current.style.width = `${maxPercent - minPercent}%`;
    }
  }, [min, max, localMinVal, localMaxVal]);

  const handleMinChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = Number(event.target.value);
    minValRef.current = value;
    setLocalMinVal(value);
    onChange(value, maxValRef.current);
  };

  const handleMaxChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = Number(event.target.value);
    maxValRef.current = value;
    setLocalMaxVal(value);
    onChange(minValRef.current, value);
  };

  return (
    <div className={styles.rangeContainer}>
      <div className={styles.inputsContainer}>
        <input
          type="number"
          value={localMinVal}
          onChange={handleMinChange}
          className={styles.minInput}
          min={min}
          max={max}
        />
        <input
          type="number"
          value={localMaxVal}
          onChange={handleMaxChange}
          className={styles.maxInput}
          min={min}
          max={max}
        />
      </div>
      
      <div className={styles.sliderContainer}>
        <input
          type="range"
          min={min}
          max={max}
          value={localMinVal}
          onChange={handleMinChange}
          className={`${styles.thumb} ${styles.thumbLeft}`}
        />
        <input
          type="range"
          min={min}
          max={max}
          value={localMaxVal}
          onChange={handleMaxChange}
          className={`${styles.thumb} ${styles.thumbRight}`}
        />
        
        <div className={styles.slider}>
          <div ref={range} className={styles.range}></div>
          <div className={styles.track}></div>
        </div>
      </div>
    </div>
  );
};

export default RangeFilter;