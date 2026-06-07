import { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { CheckCircle, Download, PlusCircle } from 'lucide-react';

export default function Success() {
  const location = useLocation();
  const navigate = useNavigate();
  const [posterDataUrl] = useState<string | null>(() => {
    // Try to get from router state first
    if (location.state?.posterDataUrl) return location.state.posterDataUrl;
    // Fallback to sessionStorage for page reloads
    return sessionStorage.getItem('posterDataUrl');
  });

  useEffect(() => {
    if (!posterDataUrl) {
      navigate('/');
    }
  }, [posterDataUrl, navigate]);

  const handleDownload = async () => {
    if (!posterDataUrl) return;
    try {
      const response = await fetch(posterDataUrl);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `Membership_Poster_${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setTimeout(() => URL.revokeObjectURL(blobUrl), 100);
    } catch (err) {
      // Direct base64 fallback
      const link = document.createElement('a');
      link.href = posterDataUrl;
      link.download = `Membership_Poster_${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  if (!posterDataUrl) return null;

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-[#f0eee9] p-8 md:p-12 text-center max-w-2xl mx-auto">
      <div className="flex justify-center mb-6">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center animate-success-pop">
          <CheckCircle className="w-12 h-12 text-primary" />
        </div>
      </div>
      
      <h2 className="text-3xl font-serif font-bold text-gray-900 mb-2 animate-slide-up delay-100">Your Poster is Ready!</h2>
      <p className="text-gray-500 mb-8 font-medium animate-slide-up delay-200">Your membership details have been successfully submitted and your premium poster has been generated.</p>

      <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-8 flex justify-center shadow-inner">
        <img 
          src={posterDataUrl} 
          alt="Generated Poster" 
          className="max-h-[60vh] object-contain rounded-lg shadow-md border border-gray-200"
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          onClick={handleDownload}
          className="flex-1 py-4 px-6 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-lg flex items-center justify-center space-x-2 transition-all shadow-lg transform hover:-translate-y-1"
        >
          <Download className="w-5 h-5" />
          <span>Download Poster</span>
        </button>
        
        <Link
          to="/"
          className="flex-1 py-4 px-6 rounded-xl bg-white border-2 border-primary text-primary hover:bg-primary-light hover:bg-opacity-10 font-bold text-lg flex items-center justify-center space-x-2 transition-all shadow-sm"
        >
          <PlusCircle className="w-5 h-5" />
          <span>New Poster</span>
        </Link>
      </div>

      <p className="text-xs text-gray-400 mt-4">
        Tip: If the download button doesn't start, tap and hold (long press) the poster image above and choose "Save Image" or "Download Image".
      </p>

      <div className="mt-8 pt-6 border-t border-gray-100 flex justify-center">
        <Link 
          to="/admin" 
          className="text-primary hover:text-primary-dark font-bold underline underline-offset-4 flex items-center gap-1"
        >
          Go to Admin Dashboard to view your submission →
        </Link>
      </div>
    </div>
  );
}
