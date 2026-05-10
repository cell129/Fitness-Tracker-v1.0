/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { useData } from './hooks/useData';
import { Toaster } from '@/components/ui/sonner';
import { UserSquare } from 'lucide-react';
import AthleteDetail from './components/AthleteDetail';
import Onboarding from './components/Onboarding';

export default function App() {
  const {
    athlete,
    measurements,
    saveAthlete,
    updateAthlete,
    clearData,
    addMeasurement,
    deleteMeasurement
  } = useData();

  if (!athlete) {
    return <Onboarding onComplete={saveAthlete} />;
  }

  return (
    <div className="flex h-screen w-full bg-slate-50 text-slate-900 font-sans overflow-hidden">
      {/* Sidebar / Nav */}
      <aside className="w-64 bg-white border-r border-slate-200 flex-col hidden sm:flex">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">F</div>
            <span className="text-lg font-bold tracking-tight text-slate-800">Fitness Tracker</span>
          </div>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2">
          <button
            className="w-full flex items-center justify-start gap-3 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-md font-medium text-sm"
          >
            <div className="w-5 h-5 rounded-full overflow-hidden bg-white flex-shrink-0">
              {athlete.photoUrl ? (
                <img src={athlete.photoUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <UserSquare className="w-full h-full p-0.5" />
              )}
            </div>
            My Profile
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <header className="sm:hidden sticky top-0 z-10 h-14 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center text-white text-sm font-bold">F</div>
            <span className="text-base font-bold tracking-tight text-slate-800">Fitness Tracker</span>
          </div>
          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 overflow-hidden">
            {athlete.photoUrl ? (
              <img src={athlete.photoUrl} alt="Me" className="w-full h-full object-cover" />
            ) : (
              <UserSquare className="w-4 h-4" />
            )}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-50/50">
          <div className="max-w-4xl mx-auto pb-12 sm:pb-0">
            <AthleteDetail 
              athlete={athlete}
              measurements={measurements}
              onBack={() => {}}
              onAddMeasurement={addMeasurement}
              onDeleteMeasurement={deleteMeasurement}
              onDeleteAthlete={clearData}
              onUpdateAthlete={updateAthlete}
            />
          </div>
        </div>
      </main>
      <Toaster />
    </div>
  );
}
