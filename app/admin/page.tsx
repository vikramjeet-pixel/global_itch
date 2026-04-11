'use client';

import { useState } from 'react';
import { db } from '../../lib/firebase';
import { collection, doc, setDoc } from 'firebase/firestore';
import { parsedProblems } from '../data/problems';

export default function AdminPage() {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [complete, setComplete] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

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
