'use client';

type StreakCounterProps = {
  dailyStreak: number;
};

export function StreakCounter({ dailyStreak }: StreakCounterProps) {
  return (
    <div className="rounded-md border border-zinc-800 bg-zinc-900 p-4">
      <p className="text-zinc-400 text-xs tracking-widest uppercase">Daily Streak</p>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="font-mono text-2xl text-zinc-100">{dailyStreak}</span>
        <span className="font-mono text-sm text-emerald-500">days</span>
      </div>
    </div>
  );
}
