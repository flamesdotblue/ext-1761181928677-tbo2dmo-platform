import { useState } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';
import { useNavigate } from 'react-router-dom';

export default function QRScanner() {
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const onResult = (text) => {
    try {
      if (!text) return;
      // If URL contains /card/:id, navigate there. Otherwise try to navigate directly.
      const url = new URL(text);
      const parts = url.pathname.split('/').filter(Boolean);
      const shareIdx = parts.indexOf('card');
      if (shareIdx !== -1 && parts[shareIdx + 1]) {
        navigate(`/card/${parts[shareIdx + 1]}`);
      } else {
        // Fallback: if content itself is an id
        navigate(`/card/${text}`);
      }
    } catch {
      // Not a URL, assume ID
      navigate(`/card/${text}`);
    }
  };

  return (
    <div className="px-4 py-4 pb-28">
      <div className="rounded-xl overflow-hidden border border-slate-400/40 bg-black/40">
        <Scanner onResult={(res)=>onResult(res?.[0]?.rawValue || res?.[0]?.rawValue === '' ? res?.[0]?.rawValue : res)} onError={(err)=>setError(err?.message || 'Camera error')} />
      </div>
      {error && <div className="text-red-400 text-sm mt-2">{error}</div>}
      <div className="text-slate-400 text-sm mt-3">Align a CardVault QR within the frame to view details.</div>
    </div>
  );
}
