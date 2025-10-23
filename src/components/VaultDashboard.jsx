import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { auth, db } from '../lib/firebase';
import { collection, onSnapshot, orderBy, query, where } from 'firebase/firestore';
import Spline from '@splinetool/react-spline';

export default function VaultDashboard() {
  const [cards, setCards] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    const q = query(collection(db, 'cards'), where('ownerId', '==', uid), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setCards(list);
    });
    return () => unsub();
  }, []);

  const filtered = useMemo(() => {
    const s = search.toLowerCase();
    return cards.filter((c) =>
      (c.fullName || '').toLowerCase().includes(s) ||
      (c.company || '').toLowerCase().includes(s) ||
      (c.tags || []).join(' ').toLowerCase().includes(s)
    );
  }, [cards, search]);

  return (
    <div className="relative min-h-[calc(100vh-64px)]">
      <div className="h-56 w-full overflow-hidden">
        <Spline scene="https://prod.spline.design/qQUip0dJPqrrPryE/scene.splinecode" style={{ width: '100%', height: '100%' }} />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-[#0d0d0d]/40 to-[#0d0d0d]" />
      </div>

      <div className="px-4 -mt-12 relative z-10">
        <div className="mb-4">
          <input
            placeholder="Search by name, company, or tag"
            value={search}
            onChange={(e)=>setSearch(e.target.value)}
            className="w-full rounded-full bg-black/60 border border-slate-500/40 px-4 py-2 text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-white/30"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 pb-24">
          {filtered.map((card) => (
            <Link key={card.id} to={`/card/${card.shareId}`} className="group block">
              <div className="rounded-xl p-4 bg-gradient-to-br from-[#0c0c0c] to-[#151515] border border-slate-300/30 shadow-[0_0_14px_rgba(192,192,192,0.15)] hover:shadow-[0_0_24px_rgba(255,255,255,0.25)] transition">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-10 rounded-md overflow-hidden border border-slate-300/40 bg-black/40">
                    {card.frontUrl ? (
                      <img src={card.frontUrl} alt="front" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full grid place-items-center text-slate-400 text-xs">No Image</div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="text-slate-100 font-semibold">{card.fullName || 'Unnamed'}</div>
                    <div className="text-slate-400 text-sm">{card.company}</div>
                  </div>
                  <div className="text-[10px] text-slate-400">Tap to view</div>
                </div>
              </div>
            </Link>
          ))}

          {filtered.length === 0 && (
            <div className="text-slate-400 text-center py-16">No cards yet. Add your first card from the Add tab.</div>
          )}
        </div>
      </div>
    </div>
  );
}
