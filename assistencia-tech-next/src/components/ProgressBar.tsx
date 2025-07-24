'use client';

import React from 'react';
import styles from './Progressbar.module.css';

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

export default function ProgressBar({ currentStep, totalSteps }: ProgressBarProps) {
  const progressPercentage = (currentStep / totalSteps) * 100;

  return (
    <div className={styles.progressBarContainer}>
      <div 
        className={styles.progressBarFill} 
        style={{ width: `${progressPercentage}%` }} 
      />
    </div>
  );
}