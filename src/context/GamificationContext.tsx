'use client';

import { createContext, useContext, useCallback, useEffect, useMemo, useState, ReactNode } from 'react';

const STORAGE_KEY = 'physio_gamification_v1';
const XP_LEVEL_DIVISOR = 100;
const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;

export type HistoryEntry = {
  date: string;
  xpEarned: number;
};

export type GamificationState = {
  currentLevel: number;
  currentXP: number;
  dailyStreak: number;
  lastActiveDate: string | null;
  history: HistoryEntry[];
};

export type ChartPoint = {
  date: string;
  label: string;
  xpEarned: number;
  isToday: boolean;
};

const defaultState: GamificationState = {
  currentLevel: 0,
  currentXP: 0,
  dailyStreak: 0,
  lastActiveDate: null,
  history: [],
};

const getTodayISODate = () => new Date().toISOString().split('T')[0];

const toDateOnly = (isoDate: string) => {
  const date = new Date(`${isoDate}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
};

const daysBetween = (fromISO: string, toISO: string) => {
  const from = toDateOnly(fromISO);
  const to = toDateOnly(toISO);
  if (!from || !to) return null;
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.round((to.getTime() - from.getTime()) / msPerDay);
};

const calcTotalXP = (history: HistoryEntry[]) =>
  history.reduce((sum, entry) => sum + entry.xpEarned, 0);

const calcLevelFromTotalXP = (totalXP: number) =>
  Math.floor(Math.sqrt(Math.max(totalXP, 0) / XP_LEVEL_DIVISOR));

const calcXPWithinLevel = (totalXP: number, level: number) => {
  const levelFloor = Math.pow(level, 2) * XP_LEVEL_DIVISOR;
  return Math.max(0, totalXP - levelFloor);
};

interface GamificationContextType extends GamificationState {
  isHydrated: boolean;
  totalXP: number;
  xpToNextLevel: number;
  progressInLevel: number;
  hasLeveledUp: boolean;
  recentXPEarned: number | null;
  addXP: (amount: number) => void;
  checkAndUpdateStreak: () => void;
  getChartData: () => ChartPoint[];
}

const GamificationContext = createContext<GamificationContextType | undefined>(undefined);

export function GamificationProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<GamificationState>(defaultState);
  const [isHydrated, setIsHydrated] = useState(false);
  const [hasLeveledUp, setHasLeveledUp] = useState(false);
  const [recentXPEarned, setRecentXPEarned] = useState<number | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<GamificationState>;
        setState((prev) => ({
          ...prev,
          ...parsed,
          history: Array.isArray(parsed.history) ? parsed.history : prev.history,
        }));
      }
    } catch {
      setState(defaultState);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!isHydrated || typeof window === 'undefined') return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state, isHydrated]);

  const checkAndUpdateStreak = useCallback(() => {
    const today = getTodayISODate();
    setState((prev) => {
      if (!prev.lastActiveDate || prev.lastActiveDate === today) return prev;
      const diff = daysBetween(prev.lastActiveDate, today);
      if (diff === null || diff <= 1) return prev;
      return { ...prev, dailyStreak: 0 };
    });
  }, []);

  const addXP = useCallback((amount: number) => {
    if (amount <= 0) return;
    const today = getTodayISODate();

    setState((prev) => {
      const nextHistory = [...prev.history];
      const todayIdx = nextHistory.findIndex((entry) => entry.date === today);
      if (todayIdx >= 0) {
        nextHistory[todayIdx] = {
          ...nextHistory[todayIdx],
          xpEarned: nextHistory[todayIdx].xpEarned + amount,
        };
      } else {
        nextHistory.push({ date: today, xpEarned: amount });
      }

      const previousLevel = prev.currentLevel;
      const totalXP = calcTotalXP(nextHistory);
      const nextLevel = calcLevelFromTotalXP(totalXP);
      const nextCurrentXP = calcXPWithinLevel(totalXP, nextLevel);

      const diff = prev.lastActiveDate ? daysBetween(prev.lastActiveDate, today) : null;
      const nextStreak =
        prev.lastActiveDate === today
          ? prev.dailyStreak
          : diff === 1 || prev.lastActiveDate === null
            ? Math.max(1, prev.dailyStreak + 1)
            : 1;

      if (nextLevel > previousLevel) {
        setHasLeveledUp(true);
        window.setTimeout(() => setHasLeveledUp(false), 2800);
      } else {
        // Only show XP banner if not leveling up, to avoid overlap
        setRecentXPEarned(amount);
        window.setTimeout(() => setRecentXPEarned(null), 2800);
      }

      return {
        currentLevel: nextLevel,
        currentXP: nextCurrentXP,
        dailyStreak: nextStreak,
        lastActiveDate: today,
        history: nextHistory.slice(-90),
      };
    });
  }, []);

  const getChartData = useCallback((): ChartPoint[] => {
    const today = new Date();
    const dates = Array.from({ length: 7 }, (_, idx) => {
      const d = new Date(today);
      d.setUTCDate(today.getUTCDate() - (6 - idx));
      return d.toISOString().split('T')[0];
    });

    const xpMap = new Map(state.history.map((entry) => [entry.date, entry.xpEarned]));
    const todayISO = getTodayISODate();

    return dates.map((dateISO) => ({
      date: dateISO,
      label: WEEKDAY_LABELS[new Date(`${dateISO}T00:00:00.000Z`).getUTCDay()],
      xpEarned: xpMap.get(dateISO) ?? 0,
      isToday: dateISO === todayISO,
    }));
  }, [state.history]);

  useEffect(() => {
    if (!isHydrated) return;
    checkAndUpdateStreak();
  }, [checkAndUpdateStreak, isHydrated]);

  const totalXP = useMemo(() => calcTotalXP(state.history), [state.history]);
  const nextLevelXP = useMemo(() => Math.pow(state.currentLevel + 1, 2) * XP_LEVEL_DIVISOR, [state.currentLevel]);
  const currentLevelFloorXP = useMemo(() => Math.pow(state.currentLevel, 2) * XP_LEVEL_DIVISOR, [state.currentLevel]);
  const xpToNextLevel = Math.max(0, nextLevelXP - totalXP);
  const progressInLevel = nextLevelXP === currentLevelFloorXP
    ? 0
    : ((totalXP - currentLevelFloorXP) / (nextLevelXP - currentLevelFloorXP)) * 100;

  return (
    <GamificationContext.Provider
      value={{
        ...state,
        isHydrated,
        totalXP,
        xpToNextLevel,
        progressInLevel: Math.max(0, Math.min(100, progressInLevel)),
        hasLeveledUp,
        recentXPEarned,
        addXP,
        checkAndUpdateStreak,
        getChartData,
      }}
    >
      {children}
    </GamificationContext.Provider>
  );
}

export function useGamificationContext() {
  const context = useContext(GamificationContext);
  if (context === undefined) {
    throw new Error('useGamificationContext must be used within a GamificationProvider');
  }
  return context;
}
