'use client';
import React from 'react';
import Lottie from 'lottie-react';
import loadingAnimation from '../../../public/animations/loading.json';

export type ExerciseState = 'IDLE' | 'INITIALIZING' | 'CALIBRATION' | 'RUNNING';

interface ExerciseLayoutProps {
  title: string;
  exerciseState: ExerciseState;
  onInitHardware: () => void;
  onExit: () => void;
  leftPanel: React.ReactNode;
  rightPanel: React.ReactNode;
  children?: React.ReactNode;
}

export function ExerciseLayout({
  title,
  exerciseState,
  onInitHardware,
  onExit,
  leftPanel,
  rightPanel,
  children
}: ExerciseLayoutProps) {
  return (
    <div className="flex flex-col items-center w-full max-w-full mx-auto relative">
      {children}

      {/* Page header */}
      <div className="flex justify-between w-full items-center border-b border-carbonBlack-100 pb-4 mb-8">
        <div className="flex flex-col gap-0.5">
          <span className="text-[11px] uppercase tracking-[0.11em] font-semibold text-carbonBlack-500 font-[var(--font-work-sans)]">
            Hand Rehabilitation
          </span>
          <h2 className="text-2xl font-bold text-carbonBlack-900 tracking-[-0.02em] font-[var(--font-poppins)] leading-tight">
            {title}
          </h2>
        </div>
        <button
          onClick={onExit}
          className="px-4 py-2 bg-white border border-carbonBlack-200 text-carbonBlack-700 rounded-md hover:border-carbonBlack-300 hover:bg-carbonBlack-50 transition-colors text-sm font-medium font-[var(--font-work-sans)]"
        >
          Exit to Menu
        </button>
      </div>

      {/* IDLE state */}
      {exerciseState === 'IDLE' && (
        <div className="w-full max-w-lg mt-8">
          <div className="flex flex-col gap-1 mb-5">
            <span className="text-[11px] uppercase tracking-[0.11em] font-semibold text-carbonBlack-500 font-[var(--font-work-sans)]">
              Step 1
            </span>
            <h3 className="text-lg font-bold text-carbonBlack-900 tracking-[-0.02em] font-[var(--font-poppins)]">
              Equipment Initialisation
            </h3>
          </div>
          <div className="bg-white border border-carbonBlack-200 shadow-[0_1px_4px_rgba(0,0,0,0.06)] rounded-md p-8">
            <p className="text-sm text-carbonBlack-600 leading-relaxed mb-8 font-[var(--font-work-sans)]">
              This module requires access to your webcam. Before continuing, please ensure your hand is visible and well-lit. No video is stored or transmitted.
            </p>
            <button
              onClick={onInitHardware}
              className="w-full rounded-md bg-primary-500 text-white px-6 py-3 font-semibold hover:bg-primary-600 transition-colors text-sm font-[var(--font-work-sans)]"
            >
              Initialise Camera &amp; Audio
            </button>
          </div>
        </div>
      )}

      {/* INITIALIZING state */}
      {exerciseState === 'INITIALIZING' && (
        <div className="w-full max-w-lg mt-8">
          <div className="bg-white border border-carbonBlack-200 shadow-[0_1px_4px_rgba(0,0,0,0.06)] rounded-md p-12 flex flex-col items-center justify-center gap-4">
            <Lottie animationData={loadingAnimation} loop={true} style={{ width: 120, height: 120 }} />
            <div className="flex flex-col items-center gap-1">
              <span className="text-[11px] uppercase tracking-[0.11em] font-semibold text-carbonBlack-500 font-[var(--font-work-sans)]">
                Please Wait
              </span>
              <p className="font-mono text-sm text-carbonBlack-700 font-medium">
                Loading audio and vision models…
              </p>
            </div>
          </div>
        </div>
      )}

      {/* CALIBRATION / RUNNING state */}
      {(exerciseState === 'CALIBRATION' || exerciseState === 'RUNNING') && (
        <div className="w-full flex flex-col gap-8">
          {/* Step label */}
          <div className="flex flex-col gap-1">
            <span className="text-[11px] uppercase tracking-[0.11em] font-semibold text-carbonBlack-500 font-[var(--font-work-sans)]">
              {exerciseState === 'CALIBRATION' ? 'Step 2' : 'Step 3'}
            </span>
            <h3 className="text-lg font-bold text-carbonBlack-900 tracking-[-0.02em] font-[var(--font-poppins)]">
              {exerciseState === 'CALIBRATION' ? 'Baseline Calibration' : 'Live Session'}
            </h3>
          </div>

          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1 flex flex-col gap-4">
              {leftPanel}
            </div>
            <div className="w-full md:w-72 flex flex-col gap-4">
              {rightPanel}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
