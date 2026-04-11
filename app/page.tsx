'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

import { collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { parsedProblems, Anomaly } from './data/problems';
import { logItchInteraction } from '../lib/interactions';

const MetricLabel = ({ title, definition }: { title: string; definition: string }) => (
  <div className="group relative inline-flex items-center gap-1.5 mb-1 cursor-help outline-none" tabIndex={0}>
    <p className="text-[10px] text-black/50 uppercase tracking-widest">{title}</p>
    <div className="w-3 h-3 rounded-full border border-black/20 text-black/40 flex items-center justify-center text-[7px] font-bold group-hover:bg-black group-hover:text-white transition-colors shrink-0">
      i
    </div>
    <div className="absolute bottom-full left-0 mb-2 w-48 p-2.5 bg-black text-white text-[10px] sm:text-[11px] leading-relaxed rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible group-focus:opacity-100 group-focus:visible transition-all duration-200 z-10 pointer-events-none shadow-[0_4px_20px_rgba(0,0,0,0.15)] border border-white/10 font-sans normal-case tracking-normal font-medium">
      {definition}
      <div className="absolute top-full left-3 -mt-px border-4 border-transparent border-t-black"></div>
    </div>
  </div>
);

export default function Home() {
  const [filter, setFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [deepDiveProblem, setDeepDiveProblem] = useState<Anomaly | null>(null);
  const [expandedProblemIndex, setExpandedProblemIndex] = useState<number | null>(null);

  const [problems, setProblems] = useState<Anomaly[]>(parsedProblems);
  const [stats, setStats] = useState<Record<string, number>>({});
  const [hotThreshold, setHotThreshold] = useState<number>(Infinity);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchStatsOnly = async () => {
      try {
        const statsSnap = await getDocs(collection(db, 'itch_stats'));
        
        const statsMap: Record<string, number> = {};
        const clicksArray: number[] = [];
        
        statsSnap.docs.forEach(doc => {
          const clicks = doc.data().click_count || 0;
          statsMap[doc.id] = clicks;
          if (clicks > 0) clicksArray.push(clicks);
        });

        if (clicksArray.length > 0) {
          clicksArray.sort((a, b) => a - b);
          const p90Index = Math.floor(clicksArray.length * 0.9);
          setHotThreshold(Math.max(clicksArray[p90Index] || 1, 1));
        }

        setStats(statsMap);
      } catch (err) {
        console.warn("Firebase stats connection blocked. Reverting to static UI parameters.", err);
      }
    };
    
    // We only attempt fetching the auxiliary trending stats to bypass empty databases
    fetchStatsOnly();
  }, []);

  const filteredProblems = problems.filter(
    (p) => (filter === 'all' || p.continent === filter) &&
           (categoryFilter === 'all' || p.category === categoryFilter)
  );

  const availableCategories = ['all'];
  problems.forEach(p => {
    if (!availableCategories.includes(p.category)) {
      availableCategories.push(p.category);
    }
  });

  return (
    <>
      <header className="w-full sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-outline-variant/20 transition-all duration-300">
        <div className="flex justify-between items-center px-6 py-5 max-w-[1440px] mx-auto">
          <div className="flex items-center group cursor-pointer">
            <span className="font-headline text-2xl font-medium tracking-tight text-on-surface group-hover:text-primary transition-colors">GLOBAL-itch</span>
          </div>
          <div className="flex items-center gap-6">
            <button className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors" aria-label="Search">search</button>
            <button className="material-symbols-outlined text-on-surface hover:text-primary transition-colors" aria-label="Menu">menu</button>
          </div>
        </div>
      </header>

      <main className="flex-grow w-full max-w-6xl mx-auto px-6 pt-16 pb-24">
        
        <section className="mb-24 animate-fade-in">
          <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-on-surface-variant/60 block mb-6">Platform Overview / v.24.2</span>
          
          <h1 className="font-headline text-4xl md:text-6xl font-normal leading-[1.1] mb-8 text-on-surface max-w-4xl">
            We find the fractures.<br className="hidden md:block"/> You build the <span className="italic text-primary">Empire.</span>
          </h1>
          
          <p className="text-base md:text-lg text-on-surface-variant mb-10 leading-relaxed max-w-xl">
            Stop searching for ideas. Great startups are born from painful, billion-dollar problems. We catalog the world&#39;s most severe market inefficiencies, broken systems, and regulatory gaps. Pick your battle, and start building.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 border-l-2 border-outline-variant/30 pl-4 mb-8">
            <p className="text-sm font-medium text-on-surface-variant/80 italic">
              &quot;The bigger the problem, the larger the opportunity.&quot;
            </p>
          </div>

          <div className="flex flex-wrap gap-3 md:gap-4 mt-4">
            <div className="px-4 py-3 border border-black/10 flex items-center gap-4 bg-white hover:bg-black hover:text-white transition-colors cursor-default group">
               <span className="font-headline font-medium text-2xl group-hover:text-primary transition-colors">350+</span>
               <span className="text-[9px] uppercase tracking-widest text-black/50 group-hover:text-white/70 transition-colors">Billion Dollar<br/>Problems Listed</span>
            </div>
            <div className="px-4 py-3 border border-black/10 flex items-center gap-4 bg-white hover:bg-black hover:text-white transition-colors cursor-default group">
               <span className="font-headline font-medium text-2xl group-hover:text-primary transition-colors">10<span className="text-sm">yr</span></span>
               <span className="text-[9px] uppercase tracking-widest text-black/50 group-hover:text-white/70 transition-colors">Business Ideas<br/>Validated for 2026+</span>
            </div>
            <div className="px-4 py-3 border border-black/10 flex items-center gap-4 bg-black text-white cursor-default">
               <span className="font-headline font-medium text-2xl text-primary">AI</span>
               <span className="text-[9px] uppercase tracking-widest text-white/50">Urgency Engine<br/>Powered By Gemini</span>
            </div>
          </div>
        </section>

        <div id="problem-list-section" className="scroll-mt-24">
          
          <div className="flex items-end justify-between border-b border-on-surface/10 pb-4 mb-6">
            <h2 className="font-headline text-2xl text-on-surface">Regional Anomalies</h2>
            <div className="flex items-center gap-2 text-on-surface-variant/60">
              <span className="material-symbols-outlined text-sm">filter_list</span>
              <span className="text-[10px] font-bold uppercase tracking-widest">Filter active</span>
            </div>
          </div>

          <section className="mb-10 animate-fade-in delay-100 sticky top-[80px] z-40 bg-white/95 backdrop-blur-md py-4 border-b border-outline-variant/20 -mx-6 px-6 sm:mx-0 sm:px-0">
            <div className="flex flex-nowrap overflow-x-auto gap-2 pb-2 scrollbar-hide">
              {[
                { id: 'all', label: 'Global Overview' },
                { id: 'north-america', label: 'North America' },
                { id: 'south-america', label: 'South America' },
                { id: 'europe', label: 'Europe' },
                { id: 'asia', label: 'Asia' },
                { id: 'africa', label: 'Africa' },
                { id: 'oceania', label: 'Oceania' },
                { id: 'antarctica', label: 'Antarctica' }
              ].map(f => (
                <button 
                  key={f.id}
                  onClick={() => setFilter(f.id)}
                  className={`filter-btn whitespace-nowrap rounded-full px-5 py-2 text-sm font-medium transition-colors border border-outline-variant/40 hover:bg-surface-container-low ${
                    filter === f.id ? 'bg-[#1a1c1e] text-white border-[#1a1c1e] hover:bg-[#1a1c1e]' : 'text-on-surface'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div className="flex flex-nowrap overflow-x-auto gap-2 mt-4 pt-4 border-t border-outline-variant/10 scrollbar-hide">
              {availableCategories.map(cat => (
                <button 
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`filter-btn whitespace-nowrap rounded-sm px-4 py-1.5 text-xs font-medium transition-colors border border-outline-variant/20 hover:bg-surface-container-low ${
                    categoryFilter === cat ? 'bg-primary/10 text-primary border-primary/20' : 'text-on-surface-variant'
                  }`}
                >
                  {cat === 'all' ? 'All Categories' : cat}
                </button>
              ))}
            </div>
          </section>

          <section className="mt-8" id="problem-list">
            <div className="flex justify-between items-center text-[10px] text-on-surface-variant uppercase font-bold tracking-widest pb-4 mb-2 border-b border-outline-variant/40 px-2">
              <span>Itches</span>
              <div className="flex items-center gap-6 justify-end text-right">
                <span>Industry</span>
                <span className="w-4 invisible">+</span>
              </div>
            </div>

            {filteredProblems.map((problem, index) => {
              const isExpanded = expandedProblemIndex === index;
              const itchId = problem.title.substring(0, 60).replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
              const itchClicks = stats[itchId] || 0;
              const isHot = itchClicks >= hotThreshold && itchClicks > 0;

              return (
                <div key={index} className="border-b border-outline-variant/20">
                  <div 
                    onClick={() => {
                      const willExpand = !isExpanded;
                      setExpandedProblemIndex(willExpand ? index : null);
                      if (willExpand) {
                        const itchId = problem.title.substring(0, 60).replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
                        logItchInteraction(itchId, 'ACCORDION_OPEN');
                      }
                    }}
                    className="problem-visible py-5 hover:bg-surface-container-low transition-colors duration-300 cursor-pointer group flex items-center justify-between w-full gap-4 px-2"
                  >
                    <h2 className="font-headline text-sm md:text-base font-normal text-on-surface/90 group-hover:text-primary transition-colors flex-1 pr-4 truncate sm:whitespace-normal flex items-center gap-3">
                      <span>{problem.title}</span>
                      {isHot && (
                        <span className="hidden md:flex px-1.5 py-0.5 rounded border border-indigo-500/30 text-indigo-400 text-[8px] uppercase tracking-widest font-bold items-center shrink-0">
                          Trending
                        </span>
                      )}
                    </h2>
                    
                    <div className="flex items-center gap-6 text-xs md:text-sm text-on-surface-variant whitespace-nowrap ml-auto justify-end">
                      <span className="text-right">{problem.badgeText}</span>
                      <span className="text-xl font-light opacity-60 group-hover:opacity-100 group-hover:text-primary transition-colors leading-none w-4 text-center">
                        {isExpanded ? '✕' : '+'}
                      </span>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="bg-white text-black p-6 md:p-8 animate-fade-in relative mx-2 mb-4 mt-2">
                      <p className="text-sm leading-relaxed mb-10 opacity-80 max-w-5xl">{problem.description}</p>
                      
                      <div className="grid grid-cols-2 gap-y-8 max-w-xl">
                        <div>
                          <MetricLabel title="Severity Score" definition="The immediate economic or operational pain caused by the anomaly, scaled 1-10." />
                          <p className="font-headline text-lg">{problem.severityScore || '-'}</p>
                        </div>
                        <div>
                          <MetricLabel title="TAM Score" definition="Total Addressable Market. The financial scale of the opportunity if solved (1-10)." />
                          <p className="font-headline text-lg">{problem.tamScore || '-'}</p>
                        </div>
                        <div>
                          <MetricLabel title="Whitespace Score" definition="The lack of existing competition or robust solutions targeting this specific problem (1-10)." />
                          <p className="font-headline text-lg">{problem.whitespaceScore || '-'}</p>
                        </div>
                        <div>
                          <MetricLabel title="Frequency Score" definition="How often the problem critically occurs for the target user demographic (1-10)." />
                          <p className="font-headline text-lg">{problem.frequencyScore || '-'}</p>
                        </div>
                        <div>
                          <MetricLabel title="Itch Score" definition="The algorithmic calculation representing the ultimate Founder Urgency rating out of 10." />
                          <div className="flex items-center gap-3">
                            <p className="font-headline text-lg">{problem.itchScore || '-'}</p>
                            {isHot && (
                              <motion.div
                                initial={{ opacity: 0.8, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ repeat: Infinity, repeatType: "reverse", duration: 1.5 }}
                                className="px-2 py-0.5 rounded text-[9px] font-bold tracking-widest uppercase text-white bg-gradient-to-r from-indigo-500 to-purple-600 shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                              >
                                HOT
                              </motion.div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeepDiveProblem(problem);
                          const itchId = problem.title.substring(0, 60).replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
                          logItchInteraction(itchId, 'DEEP_DIVE_CLICK');
                        }}
                        className="mt-8 md:mt-0 md:absolute md:bottom-8 md:right-8 text-black border border-black/20 hover:bg-black hover:text-white transition-colors px-6 py-3 text-xs uppercase tracking-widest font-bold flex items-center justify-center gap-2 w-full md:w-auto"
                      >
                        Deep Dive
                        <span className="material-symbols-outlined text-sm">arrow_forward</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}

            {loading && (
              <div className="py-20 flex justify-center animate-fade-in">
                <div className="w-8 h-8 rounded-full border-t-2 border-r-2 border-primary animate-spin"></div>
              </div>
            )}

            {!loading && filteredProblems.length === 0 && (
              <div className="py-20 text-center animate-fade-in">
                  <span className="material-symbols-outlined text-5xl text-outline-variant mb-4 font-light">search_off</span>
                  <h3 className="font-headline text-2xl text-on-surface mb-2">No anomalies tracked</h3>
                  <p className="text-sm text-on-surface-variant">We currently have no major systemic risks logged for this region.</p>
              </div>
            )}

          </section>
        </div>

        <section className="mt-40 pt-16 border-t border-outline-variant/20 max-w-2xl mx-auto">
          <span className="text-[10px] font-bold uppercase tracking-widest text-primary mb-2 block">Direct Input</span>
          <h2 className="font-headline text-3xl md:text-4xl mb-4 text-on-surface">Submit an Itch or Idea</h2>
          <p className="text-sm text-on-surface-variant mb-8">
            Have you noticed an emergent systemic risk or industrial anomaly? Share your observations to be cataloged by our curators.
          </p>
          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
            <div className="flex flex-col gap-2">
              <label htmlFor="name" className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Your Name / ID</label>
              <input type="text" id="name" className="border border-outline-variant/40 bg-surface-container-low p-3 rounded-sm focus:outline-none focus:border-primary transition-colors w-full text-sm" placeholder="Anonymous Entity" />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="idea" className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Observation Details</label>
              <textarea id="idea" rows={4} className="border border-outline-variant/40 bg-surface-container-low p-3 rounded-sm focus:outline-none focus:border-primary transition-colors w-full resize-none text-sm" placeholder="Describe the anomaly or systemic itch..."></textarea>
            </div>
            <button type="submit" className="bg-on-surface text-white px-8 py-4 text-sm font-medium hover:bg-primary transition-colors rounded-sm flex items-center justify-center gap-2 group w-full sm:w-max mt-4">
              Submit Record
              <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </button>
          </form>
        </section>
      </main>

      {deepDiveProblem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={() => setDeepDiveProblem(null)}>
          <div className="bg-surface border border-outline-variant/30 rounded-md p-8 max-w-md w-full shadow-2xl relative animate-fade-in" onClick={e => e.stopPropagation()}>
            <button 
              onClick={() => setDeepDiveProblem(null)} 
              className="absolute top-4 right-4 text-on-surface-variant hover:text-on-surface transition-colors"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
            <h3 className="font-headline text-xl text-on-surface mb-2 pr-6 border-b border-outline-variant/20 pb-4">
              <span className="block text-[10px] text-on-surface-variant uppercase tracking-widest mb-2 font-bold">Anomaly Selected</span>
              <span className="italic">&quot;{deepDiveProblem.title}&quot;</span>
            </h3>

            <div className="mt-8">
              <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-3 block">Consult AI Consensus</span>
            
            <div className="space-y-3">
              {[
                { name: 'ChatGPT', urlBase: 'https://chatgpt.com/?q=', slug: 'openai' },
                { name: 'Claude', urlBase: 'https://claude.ai/new?q=', slug: 'anthropic' },
                { name: 'Gemini', urlBase: 'https://gemini.google.com/app?q=', slug: 'googlegemini' },
                { name: 'Perplexity', urlBase: 'https://www.perplexity.ai/?q=', slug: 'perplexity' },
                { name: 'Grok', urlBase: 'https://grok.com/?q=', slug: 'x' }
              ].map(ai => {
                const prompt = `Give me more information about "${deepDiveProblem.title}": ${deepDiveProblem.description}`;
                const url = `${ai.urlBase}${encodeURIComponent(prompt)}`;
                return (
                  <a 
                    key={ai.name}
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between p-3 rounded-md border border-outline-variant/40 hover:border-primary hover:bg-primary/5 transition-all text-sm font-medium text-on-surface group"
                  >
                    <div className="flex items-center gap-3">
                      <img src={`https://cdn.simpleicons.org/${ai.slug}/44474e`} alt={`${ai.name} icon`} className="w-5 h-5 group-hover:hidden" />
                      <img src={`https://cdn.simpleicons.org/${ai.slug}`} alt={`${ai.name} brand`} className="w-5 h-5 hidden group-hover:block" />
                      {ai.name}
                    </div>
                    <span className="material-symbols-outlined text-sm opacity-0 group-hover:opacity-100 transition-opacity text-primary">open_in_new</span>
                  </a>
                );
              })}
            </div>
            <p className="text-[10px] text-center text-on-surface-variant/50 mt-6 uppercase tracking-widest font-bold">Opens in new tab</p>
            </div>
          </div>
        </div>
      )}

      <footer className="w-full bg-surface-container-low border-t border-outline-variant/10 py-16 px-6 mt-10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between gap-12">
          <div>
            <span className="font-headline text-xl font-medium text-on-surface">Problem Radar</span>
            <p className="text-xs text-on-surface-variant mt-2 opacity-60 max-w-[200px] leading-relaxed">
              &copy; 2024 Analytical Archive System. Curating complexity for clarity.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-12">
            <nav className="flex flex-col gap-4">
              <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Product</span>
              <Link className="text-sm text-on-surface-variant hover:text-primary transition-colors" href="#">Documentation</Link>
              <Link className="text-sm text-on-surface-variant hover:text-primary transition-colors" href="#">API Access</Link>
            </nav>
            <nav className="flex flex-col gap-4">
              <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Legal</span>
              <Link className="text-sm text-on-surface-variant hover:text-primary transition-colors" href="#">Privacy Policy</Link>
              <Link className="text-sm text-on-surface-variant hover:text-primary transition-colors" href="#">Terms of Service</Link>
            </nav>
          </div>
        </div>
      </footer>

      <nav className="md:hidden sticky bottom-0 w-full bg-white/90 backdrop-blur-md border-t border-outline-variant/20 px-8 py-4 flex justify-between items-center z-50">
        <button className="flex flex-col items-center gap-1 text-primary transition-transform active:scale-95">
          <span className="material-symbols-outlined">adjust</span>
          <span className="text-[9px] font-bold uppercase tracking-tighter">Discovery</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-on-surface-variant opacity-60 hover:opacity-100 transition-all active:scale-95">
          <span className="material-symbols-outlined">data_exploration</span>
          <span className="text-[9px] font-bold uppercase tracking-tighter">Insights</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-on-surface-variant opacity-60 hover:opacity-100 transition-all active:scale-95">
          <span className="material-symbols-outlined">tactic</span>
          <span className="text-[9px] font-bold uppercase tracking-tighter">Strategy</span>
        </button>
      </nav>
    </>
  );
}
