import { useRef, useState } from 'react';
import { auth, db, storage } from '../lib/firebase';
import { addDoc, collection } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import QRCode from 'qrcode';

export default function AddCardForm() {
  const [form, setForm] = useState({
    fullName: '',
    company: '',
    jobTitle: '',
    email: '',
    phone: '',
    website: '',
    socials: '',
  });
  const [frontFile, setFrontFile] = useState(null);
  const [backFile, setBackFile] = useState(null);
  const [frontPreview, setFrontPreview] = useState('');
  const [backPreview, setBackPreview] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const downloadRef = useRef(null);

  const onFile = (e, side) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const url = URL.createObjectURL(f);
    if (side === 'front') {
      setFrontFile(f);
      setFrontPreview(url);
    } else {
      setBackFile(f);
      setBackPreview(url);
    }
  };

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const uploadImage = async (file) => {
    const uid = auth.currentUser.uid;
    const r = ref(storage, `cards/${uid}/${Date.now()}-${file.name}`);
    await uploadBytes(r, file);
    return await getDownloadURL(r);
  };

  const onSave = async (e) => {
    e.preventDefault();
    setMessage('');
    if (!auth.currentUser) return;
    if (!frontFile) {
      setMessage('Please upload the front image of the card.');
      return;
    }
    setSaving(true);
    try {
      const [frontUrl, backUrl] = [frontFile, backFile].map(Boolean).includes(true)
        ? [frontFile ? await uploadImage(frontFile) : '', backFile ? await uploadImage(backFile) : '']
        : ['', ''];

      const shareId = crypto.randomUUID();
      const payload = {
        ...form,
        ownerId: auth.currentUser.uid,
        createdAt: Date.now(),
        frontUrl,
        backUrl,
        shareId,
      };
      const docRef = await addDoc(collection(db, 'cards'), payload);

      const shareUrl = `${window.location.origin}/card/${shareId}`;
      const qrDataUrl = await QRCode.toDataURL(shareUrl, { margin: 1, color: { dark: '#ffffff', light: '#000000' } });

      setMessage('Card saved. QR generated below.');
      // trigger a download for convenience
      setTimeout(() => {
        if (downloadRef.current) {
          const a = document.createElement('a');
          a.href = qrDataUrl;
          a.download = `cardvault-${docRef.id}.png`;
          a.click();
        }
      }, 300);

      // Show inline QR preview
      setQrPreview(qrDataUrl);
    } catch (err) {
      setMessage(err.message);
    } finally {
      setSaving(false);
    }
  };

  const [qrPreview, setQrPreview] = useState('');

  return (
    <div className="px-4 py-4 pb-28">
      <form onSubmit={onSave} className="space-y-4">
        <div className="grid grid-cols-1 gap-3">
          <Field label="Full Name">
            <input name="fullName" value={form.fullName} onChange={onChange} required className="w-full rounded-md bg-black/50 border border-slate-500/40 px-3 py-2 text-slate-100" />
          </Field>
          <Field label="Company / Brand">
            <input name="company" value={form.company} onChange={onChange} className="w-full rounded-md bg-black/50 border border-slate-500/40 px-3 py-2 text-slate-100" />
          </Field>
          <Field label="Job Title">
            <input name="jobTitle" value={form.jobTitle} onChange={onChange} className="w-full rounded-md bg-black/50 border border-slate-500/40 px-3 py-2 text-slate-100" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Email">
              <input type="email" name="email" value={form.email} onChange={onChange} className="w-full rounded-md bg-black/50 border border-slate-500/40 px-3 py-2 text-slate-100" />
            </Field>
            <Field label="Phone">
              <input name="phone" value={form.phone} onChange={onChange} className="w-full rounded-md bg-black/50 border border-slate-500/40 px-3 py-2 text-slate-100" />
            </Field>
          </div>
          <Field label="Website">
            <input name="website" value={form.website} onChange={onChange} className="w-full rounded-md bg-black/50 border border-slate-500/40 px-3 py-2 text-slate-100" />
          </Field>
          <Field label="Socials (comma separated)">
            <input name="socials" value={form.socials} onChange={onChange} className="w-full rounded-md bg-black/50 border border-slate-500/40 px-3 py-2 text-slate-100" />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <UploadBox label="Front Image" onChange={(e)=>onFile(e,'front')} preview={frontPreview} />
          <UploadBox label="Back Image" onChange={(e)=>onFile(e,'back')} preview={backPreview} />
        </div>

        {message && <div className="text-slate-300 text-sm">{message}</div>}

        <button ref={downloadRef} disabled={saving} className="w-full py-3 rounded-md border border-slate-300/60 text-slate-100 hover:shadow-[0_0_18px_rgba(255,255,255,0.35)] transition disabled:opacity-50">
          {saving ? 'Saving...' : 'Save & Generate QR'}
        </button>

        {qrPreview && (
          <div className="mt-4 grid place-items-center">
            <img src={qrPreview} alt="qr" className="w-40 h-40" />
            <div className="text-xs text-slate-400 mt-2">Long-press to save or share</div>
          </div>
        )}
      </form>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-slate-300 text-xs mb-1">{label}</label>
      {children}
    </div>
  );
}

function UploadBox({ label, preview, onChange }) {
  return (
    <label className="block rounded-xl border border-slate-400/40 bg-black/40 p-3 text-center text-slate-300 hover:border-slate-300/70 transition cursor-pointer">
      <div className="text-xs mb-2">{label}</div>
      <div className="aspect-[16/10] w-full rounded-md overflow-hidden bg-black/40">
        {preview ? (
          <img src={preview} alt={label} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full grid place-items-center text-slate-500 text-xs">Tap to upload</div>
        )}
      </div>
      <input type="file" accept="image/*" className="hidden" onChange={onChange} />
    </label>
  );
}
