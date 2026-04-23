'use client';
import { useSession } from '@/context/SessionContext';
import HandOpenClose from '@/components/exercises/HandOpenClose';

export default function Dashboard() {
  const { activeExercise, setActiveExercise, globalScore } = useSession();

  return (
    <main className="flex min-h-screen flex-col items-center bg-slate-950 p-8 md:p-12 text-white">
      
      {/* Header Area */}
      <div className="w-full max-w-4xl flex justify-between items-center mb-12 border-b border-slate-800 pb-6">
        <h1 className="text-3xl font-bold text-zinc-100 tracking-tight">
          Hand Rehab using Auditory Feedback
        </h1>
        <div className="flex items-center gap-3 bg-slate-900 px-4 py-2 rounded-full border border-slate-800">
          <span className="text-sm text-slate-400 uppercase tracking-wide">Total Score</span>
          <span className="text-xl font-bold text-amber-400">{globalScore}</span>
        </div>
      </div>

      {/* Dynamic Rendering Area */}
      {activeExercise === 'MENU' && (
        <div className="w-full max-w-4xl animate-in slide-in-from-bottom-4 duration-500">
          <h2 className="text-xl text-slate-300 mb-6 font-medium">Select Today's Routine</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Active Module */}
            <button 
              onClick={() => setActiveExercise('HAND_OPEN_CLOSE')}
              className="group flex flex-col items-start p-6 bg-slate-900 border border-slate-800 hover:border-blue-500 hover:bg-slate-800/80 rounded-2xl transition-all text-left shadow-lg"
            >
              <div className="w-12 h-12 bg-blue-900/50 text-blue-400 rounded-lg flex items-center justify-center mb-4 text-2xl group-hover:scale-110 transition-transform">
                🖐
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Hand Extension</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Focuses on finger mobility and palm stretching. Uses audio-filtered feedback.
              </p>
            </button>

            {/* Locked/Future Module Placeholder */}
            <button 
              disabled
              className="flex flex-col items-start p-6 bg-slate-900/50 border border-slate-800/50 rounded-2xl text-left opacity-60 cursor-not-allowed"
            >
              <div className="w-12 h-12 bg-slate-800 text-slate-500 rounded-lg flex items-center justify-center mb-4 text-2xl">
                🔄
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Wrist Rotation</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Coming soon. Focuses on pronation and supination of the forearm.
              </p>
            </button>

          </div>
        </div>
      )}

      {/* Render the specific exercise component if selected */}
      {activeExercise === 'HAND_OPEN_CLOSE' && <HandOpenClose />}

    </main>
  );
}