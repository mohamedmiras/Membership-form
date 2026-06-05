import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import UserForm from './pages/UserForm';
import Success from './pages/Success';
import AdminDashboard from './pages/AdminDashboard';
import { ShieldCheck } from 'lucide-react';

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FDFBF7] to-[#f4f1e9] flex flex-col font-sans text-[#1F2937]">
      {/* Header */}
      <header className="w-full bg-white shadow-sm border-b border-[#E5E7EB] py-4 px-6 md:px-12 flex justify-between items-center z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-md">
            <span className="text-white font-bold font-serif text-lg">M</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-primary-dark tracking-tight">Tharbiyathul Islam</h1>
            <p className="text-xs text-text-muted uppercase tracking-wider font-semibold">Membership Portal</p>
          </div>
        </div>
        <a href="/admin" className="text-text-muted hover:text-primary transition-colors flex items-center gap-1 text-sm font-medium">
          <ShieldCheck size={16} />
          <span className="hidden sm:inline">Admin</span>
        </a>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex flex-col items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-4xl">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-6 text-center text-sm text-text-muted bg-white border-t border-[#E5E7EB]">
        <p>&copy; {new Date().getFullYear()} Tharbiyathul Islam Madrasa. All rights reserved.</p>
      </footer>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<UserForm />} />
          <Route path="/success" element={<Success />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
