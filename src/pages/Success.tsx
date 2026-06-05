import { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { CheckCircle, Download, PlusCircle } from 'lucide-react';

export default function Success() {
  const location = useLocation();
  const navigate = useNavigate();
  const [posterDataUrl, setPosterDataUrl] = useState<string | null>(null);

  useEffect(() => {
    if (location.state?.posterDataUrl) {
      setPosterDataUrl(location.state.posterDataUrl);
    } else {
      // If no poster in state, redirect back home
      navigate('/');
    }
  }, [location, navigate]);

  const handleDownload = () => {
    if (!posterDataUrl) return;
    const link = document.createElement('a');
    link.href = posterDataUrl;
    link.download = `Membership_Poster_${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!posterDataUrl) return null;

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-[#f0eee9] p-8 md:p-12 text-center max-w-2xl mx-auto">
      <div className="flex justify-center mb-6">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
          <CheckCircle className="w-12 h-12 text-primary" />
        </div>
      </div>
      
      <h2 className="text-3xl font-serif font-bold text-gray-900 mb-2">Your Poster is Ready!</h2>
      <p className="text-gray-500 mb-8 font-medium">Your membership details have been successfully submitted and your premium poster has been generated.</p>

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
          <span>Generate Another</span>
        </Link>
      </div>
    </div>
  );
}
