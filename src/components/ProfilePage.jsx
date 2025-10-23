import { useEffect, useState } from 'react';
import { auth, db, storage } from '../lib/firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export default function ProfilePage() {
  const [profile, setProfile] = useState({ name: '', company: '', photoURL: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      const uid = auth.currentUser?.uid;
      if (!uid) return;
      const snap = await getDoc(doc(db, 'users', uid));
      if (snap.exists()) setProfile({ ...{ name: '', company: '', photoURL: '' }, ...snap.data() });
    };
    load();
  }, []);

  const onFile = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const r = ref(storage, `profiles/${auth.currentUser.uid}/${Date.now()}-${f.name}`);
    await uploadBytes(r, f);
    const url = await getDownloadURL(r);
    setProfile((p)=>({ ...p, photoURL: url }));
  };

  const onSave = async () => {
    setSaving(true);
    try {
      const uid = auth.currentUser.uid;
      await setDoc(doc(db, 'users', uid), profile, { merge: true });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="px-4 py-6 pb-28">
      <div className="flex items-center gap-4">
        <label className="relative cursor-pointer">
          <div className="w-16 h-16 rounded-full overflow-hidden border border-slate-300/50 bg-black/50">
            {profile.photoURL ? (
              <img src={profile.photoURL} alt="profile" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full grid place-items-center text-slate-400 text-xs">Photo</div>
            )}
          </div>
          <input type="file" accept="image/*" className="hidden" onChange={onFile} />
        </label>
        <div className="flex-1">
          <div className="text-slate-100 font-semibold">{profile.name || auth.currentUser?.email}</div>
          <div className="text-slate-400 text-sm">{profile.company || '—'}</div>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        <div>
          <label className="block text-slate-300 text-xs mb-1">Name</label>
          <input value={profile.name} onChange={(e)=>setProfile({...profile, name:e.target.value})} className="w-full rounded-md bg-black/50 border border-slate-500/40 px-3 py-2 text-slate-100" />
        </div>
        <div>
          <label className="block text-slate-300 text-xs mb-1">Company</label>
          <input value={profile.company} onChange={(e)=>setProfile({...profile, company:e.target.value})} className="w-full rounded-md bg-black/50 border border-slate-500/40 px-3 py-2 text-slate-100" />
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <button onClick={onSave} disabled={saving} className="py-2 rounded-md border border-slate-300/60 text-slate-100 hover:shadow-[0_0_12px_rgba(255,255,255,0.3)] transition disabled:opacity-50">{saving ? 'Saving...' : 'Save'}</button>
        <button onClick={()=>signOut(auth)} className="py-2 rounded-md border border-red-400/60 text-red-200 hover:shadow-[0_0_12px_rgba(255,80,80,0.35)] transition">Sign Out</button>
      </div>
    </div>
  );
}
