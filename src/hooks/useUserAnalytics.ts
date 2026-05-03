'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useGamificationContext } from '@/context/GamificationContext';

export type ExerciseLog = {
  id: string;
  exercise_type: string;
  xp_earned: number;
  created_at: string;
};

export type AnalyticsSummary = {
  totalXp: number;
  byExercise: Record<string, number>;
};

export function useUserAnalytics() {
  const { lastSyncTime } = useGamificationContext();
  const [logs, setLogs] = useState<ExerciseLog[]>([]);
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from('exercise_logs')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        setLogs(data || []);

        const sum: AnalyticsSummary = {
          totalXp: 0,
          byExercise: {},
        };

        data?.forEach((log) => {
          sum.totalXp += log.xp_earned;
          sum.byExercise[log.exercise_type] = (sum.byExercise[log.exercise_type] || 0) + log.xp_earned;
        });

        setSummary(sum);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }

    fetchAnalytics();
  }, [lastSyncTime]);

  return { logs, summary, loading, error };
}
