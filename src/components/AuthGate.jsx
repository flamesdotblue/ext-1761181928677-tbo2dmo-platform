import { useEffect, useState } from 'react';
import { auth, db } from '../lib/firebase';
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export default function AuthGate({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#0d0d0d] to-[#1a1a1a]">
        <div className="animate-pulse text-slate-200 tracking-[0.3em]">CARDVAULT</div>
      </div>
    );
  }

  if (!user) {
    return <AuthScreen />;
  }

  return children;
}

function AuthScreen() {
  const [mode, setMode] = useState('signin');
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      if (mode === 'signup') {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(cred.user, { displayName: name });
        await setDoc(doc(db, 'users', cred.user.uid), {
          name,
          company,
          photoURL: '',
          createdAt: Date.now(),
        });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0d0d0d] to-[#1a1a1a] text-white">
      <div className="max-w-md mx-auto p-6 pt-16">
        <div className="text-center mb-10">
          <div className="text-3xl font-extrabold tracking-[0.35em] bg-clip-text text-transparent bg-gradient-to-r from-slate-200 via-slate-400 to-slate-200">CARDVAULT</div>
          <div className="text-sm text-slate-300 mt-2">Your Digital Identity, Simplified.</div>
        </div>
        <form onSubmit={onSubmit} className="space-y-4">
          {mode === 'signup' && (
            <>
              <div>
                <label className="block text-slate-300 text-xs mb-1">Full Name</label>
                <input value={name} onChange={(e)=>setName(e.target.value)} required className="w-full rounded-md bg-black/50 border border-slate-500/40 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-white/30" />
              </div>
              <div>
                <label className="block text-slate-300 text-xs mb-1">Company</label>
                <input value={company} onChange={(e)=>setCompany(e.target.value)} className="w-full rounded-md bg-black/50 border border-slate-500/40 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-white/30" />
              </div>
            </>
          )}
          <div>
            <label className="block text-slate-300 text-xs mb-1">Email</label>
            <input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} required className="w-full rounded-md bg-black/50 border border-slate-500/40 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-white/30" />
          </div>
          <div>
            <label className="block text-slate-300 text-xs mb-1">Password</label>
            <input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} required className="w-full rounded-md bg-black/50 border border-slate-500/40 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-white/30" />
          </div>
          {error && <div className="text-red-400 text-xs">{error}</div>}
          <button disabled={busy} className="w-full py-2 rounded-md border border-slate-300/60 text-slate-100 hover:shadow-[0_0_12px_rgba(255,255,255,0.3)] transition disabled:opacity-50">{mode === 'signup' ? 'Create Account' : 'Sign In'}</button>
        </form>
        <div className="text-center text-sm text-slate-400 mt-4">
          {mode === 'signup' ? (
            <button onClick={()=>setMode('signin')} className="underline">Have an account? Sign in</button>
          ) : (
            <button onClick={()=>setMode('signup')} className="underline">New here? Create an account</button>
          )}
        </div>
      </div>
    </div>
  );
}
