'use client';
import { createContext, useContext, useState, ReactNode } from 'react';

// Define the available exercises
export type ExerciseType = 'MENU' | 'HAND_OPEN_CLOSE' | 'WRIST_ROTATION';

interface SessionContextType {
  activeExercise: ExerciseType;
  setActiveExercise: (exercise: ExerciseType) => void;
  globalScore: number;
  setGlobalScore: (score: number) => void;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [activeExercise, setActiveExercise] = useState<ExerciseType>('MENU');
  const [globalScore, setGlobalScore] = useState(0);

  return (
    <SessionContext.Provider value={{ activeExercise, setActiveExercise, globalScore, setGlobalScore }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) throw new Error('useSession must be used within SessionProvider');
  return context;
}