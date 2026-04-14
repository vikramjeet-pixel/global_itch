'use client';

import { useState } from 'react';
import { db } from '../../lib/firebase';
import { collection, doc, setDoc } from 'firebase/firestore';
import { parsedProblems } from '../data/problems';

export default function AdminPage() {
  const [passcode, setPasscode] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);

  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [complete, setComplete] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === '2006') {
      setIsUnlocked(true);
    } else {
      alert("Security Breach: Incorrect Access Code.");
      setPasscode('');
    }
  };

  const migrateData = async () => {
    setLoading(true);
    setErrorMsg('');
    let count = 0;
    
    try {
      for (const problem of parsedProblems) {
        // Build slugified ID securely identically to the hooks
        const itchId = problem.title.substring(0, 60).replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
        
        await setDoc(doc(db, 'itches', itchId), {
          ...problem,
          id: itchId,
          last_updated: new Date()
        });
        
        count++;
        setProgress(Math.floor((count / parsedProblems.length) * 100));
      }
      setComplete(true);
    } catch (err: any) {
      console.error("Migration error on", err);
      setErrorMsg(err.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  if (!isUnlocked) {
    return (
      <div className="p-20 text-on-surface min-h-screen bg-black flex flex-col items-center justify-center font-sans">
        <div className="max-w-md w-full bg-[#111] p-10 border border-white/10 rounded-md">
          <h2 className="font-headline text-2xl text-white mb-6 flex items-center justify-center gap-3">
             <span className="material-symbols-outlined text-white/50">lock</span> System Secure
          </h2>
          <form onSubmit={handleUnlock} className="flex flex-col gap-4">
             <input type="password" value={passcode} onChange={e => setPasscode(e.target.value)} className="flex-1 bg-black border border-white/20 p-4 outline-none focus:border-primary text-center tracking-[1em] text-2xl text-white rounded-sm" placeholder="••••" autoFocus />
             <button type="submit" className="bg-white text-black hover:bg-primary transition-colors py-4 font-bold uppercase text-[10px] tracking-widest mt-2 rounded-sm w-full">Bypass Protocol</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="p-20 text-on-surface min-h-screen bg-surface flex flex-col items-start font-sans">
      <h1 className="font-headline text-3xl mb-2">System Migration Console</h1>
      <p className="text-sm text-on-surface-variant mb-10 border-b border-outline-variant/20 pb-4 w-full max-w-2xl">
        Execute script to write local parsedProblems array over to live Firestore `itches` database instances.
      </p>
      
      {!complete ? (
        <button 
          onClick={migrateData} 
          disabled={loading}
          className="bg-primary text-black px-8 py-4 text-sm font-bold tracking-widest uppercase disabled:opacity-50 hover:bg-white transition-colors"
        >
          {loading ? `Migrating... ${progress}%` : 'Migrate Data to Firestore'}
        </button>
      ) : (
        <div className="bg-[#2d862d]/20 text-[#2d862d] border border-[#2d862d]/40 p-6 rounded-sm w-full max-w-md">
          <span className="font-bold text-lg block mb-1">Migration Complete!</span>
          <span className="text-sm">350+ entries successfully written to the database.</span>
        </div>
      )}

      {errorMsg && (
        <div className="mt-8 text-error text-sm font-medium">
          Error caught: {errorMsg}
        </div>
      )}
    </div>
  );
}
