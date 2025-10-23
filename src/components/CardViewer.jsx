import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { auth, db } from '../lib/firebase';
import { collection, getDocs, query, where, addDoc } from 'firebase/firestore';

export default function CardViewer() {
  const { id } = useParams();
  const [card, setCard] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      const q = query(collection(db, 'cards'), where('shareId', '==', id));
      const snap = await getDocs(q);
      if (!snap.empty) {
        setCard({ id: snap.docs[0].id, ...snap.docs[0].data() });
      }
    };
    load();
  }, [id]);

  const saveToMyVault = async () => {
    if (!auth.currentUser || !card) return;
    setSaving(true);
    try {
      const payload = {
        ...card,
        ownerId: auth.currentUser.uid,
        createdAt: Date.now(),
        // keep same shareId for convenience
      };
      delete payload.id;
      await addDoc(collection(db, 'cards'), payload);
    } finally {
      setSaving(false);
    }
  };

  if (!card) {
    return (
      <div className="px-4 py-6 pb-28 text-slate-300">Loading...</div>
    );
  }

  return (
    <div className="px-4 py-6 pb-28">
      <div className="rounded-xl p-4 bg-gradient-to-br from-[#0c0c0c] to-[#151515] border border-slate-300/30 shadow-[0_0_14px_rgba(192,192,192,0.15)]">
        <div className="flex items-start gap-4">
          <div className="w-24 h-16 rounded-md overflow-hidden border border-slate-300/40 bg-black/40">
            {card.frontUrl ? (
              <img src={card.frontUrl} alt="front" className="w-full h-full object-cover" />
            ) : null}
          </div>
          <div className="flex-1">
            <div className="text-slate-100 text-lg font-semibold">{card.fullName}</div>
            <div className="text-slate-400">{card.jobTitle}{card.jobTitle && card.company ? ' • ' : ''}{card.company}</div>
            <div className="text-slate-400 text-sm mt-2 break-words">
              {card.email && <div>{card.email}</div>}
              {card.phone && <div>{card.phone}</div>}
              {card.website && <div><a className="underline" href={card.website} target="_blank" rel="noreferrer">{card.website}</a></div>}
              {card.socials && <div>{card.socials}</div>}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
          {card.frontUrl && (
            <div className="rounded-md overflow-hidden border border-slate-400/40">
              <img src={card.frontUrl} alt="front" className="w-full h-full object-cover" />
            </div>
          )}
          {card.backUrl && (
            <div className="rounded-md overflow-hidden border border-slate-400/40">
              <img src={card.backUrl} alt="back" className="w-full h-full object-cover" />
            </div>
          )}
        </div>
      </div>

      {auth.currentUser && (
        <button onClick={saveToMyVault} disabled={saving} className="mt-4 w-full py-3 rounded-md border border-slate-300/60 text-slate-100 hover:shadow-[0_0_18px_rgba(255,255,255,0.35)] transition disabled:opacity-50">
          {saving ? 'Saving...' : 'Save to My Vault'}
        </button>
      )}
    </div>
  );
}
