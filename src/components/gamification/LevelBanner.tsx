'use client';

type LevelBannerProps = {
  visible: boolean;
  currentLevel: number;
  dailyStreak: number;
};

export function LevelBanner({ visible, currentLevel, dailyStreak }: LevelBannerProps) {
  return (
    <div
      className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 transform transition-all duration-500 ${
        visible ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0 pointer-events-none'
      }`}
      aria-live="polite"
      aria-atomic="true"
    >
      <div className="rounded-md border border-emerald-500 bg-primary-500 text-brandWhite px-5 py-3 shadow-lg">
        <p className="text-xs tracking-widest font-semibold">LEVEL UP</p>
        <p className="font-mono text-sm mt-1">
          Level {currentLevel} reached
          <span className="text-emerald-500"> + Streak {dailyStreak}</span>
        </p>
      </div>
    </div>
  );
}
