import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AuthGate from './components/AuthGate';
import VaultDashboard from './components/VaultDashboard';
import AddCardForm from './components/AddCardForm';
import QRScanner from './components/QRScanner';
import ProfilePage from './components/ProfilePage';
import CardViewer from './components/CardViewer';
import BottomNav from './components/BottomNav';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gradient-to-b from-[#0d0d0d] to-[#1a1a1a] text-white">
        <AuthGate>
          <header className="sticky top-0 z-10 bg-black/40 backdrop-blur-xl border-b border-slate-500/30">
            <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
              <div className="text-sm text-slate-300">CARDVAULT</div>
              <div className="text-[10px] text-slate-400">Futuristic • Silver • Minimal</div>
            </div>
          </header>

          <main className="max-w-md mx-auto">
            <Routes>
              <Route path="/" element={<VaultDashboard />} />
              <Route path="/add" element={<AddCardForm />} />
              <Route path="/scan" element={<QRScanner />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/card/:id" element={<CardViewer />} />
            </Routes>
          </main>

          <BottomNav />
        </AuthGate>
      </div>
    </BrowserRouter>
  );
}
