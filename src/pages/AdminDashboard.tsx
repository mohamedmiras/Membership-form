import { useState, useEffect } from 'react';
import { getSubmissions, updateSubmissionStatus, deleteSubmission } from '../utils/storage';
import type { Submission } from '../types';
import { Search, CheckCircle, XCircle, Trash2, Eye, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSub, setSelectedSub] = useState<Submission | null>(null);

  const loadSubmissions = async () => {
    const data = await getSubmissions();
    setSubmissions(data.sort((a, b) => b.createdAt - a.createdAt));
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadSubmissions();
  }, []);

  const handleStatusChange = async (id: string, status: 'approved' | 'rejected') => {
    await updateSubmissionStatus(id, status);
    loadSubmissions();
    if (selectedSub?.id === id) {
      setSelectedSub(prev => prev ? { ...prev, status } : null);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this submission?')) {
      await deleteSubmission(id);
      loadSubmissions();
      setSelectedSub(null);
    }
  };

  const handleApproveAll = async () => {
    if (window.confirm('Are you sure you want to approve ALL pending submissions?')) {
      const pendingSubs = submissions.filter(s => s.status === 'pending');
      for (const sub of pendingSubs) {
        await updateSubmissionStatus(sub.id, 'approved');
      }
      loadSubmissions();
      if (selectedSub && selectedSub.status === 'pending') {
        setSelectedSub(prev => prev ? { ...prev, status: 'approved' } : null);
      }
    }
  };

  const filteredSubs = submissions.filter(sub => 
    sub.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    sub.houseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sub.phoneNumber.includes(searchTerm)
  );

  if (!isAuthenticated) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md mx-auto text-center border border-[#f0eee9] mt-20">
        <h2 className="text-2xl font-bold text-primary-dark mb-4">Admin Access Required</h2>
        <p className="text-gray-500 mb-6">Please enter the admin password to view submissions.</p>
        <input 
          type="password" 
          placeholder="Enter password" 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && password === 'admin123') setIsAuthenticated(true); }}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary outline-none mb-4 text-center"
        />
        <button 
          onClick={() => { if (password === 'admin123') setIsAuthenticated(true); else alert('Incorrect password'); }}
          className="w-full py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary-dark transition-colors"
        >
          Login to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-[#f0eee9] w-full max-w-3xl mx-auto my-10">
      
      {/* Header */}
      <div className="p-6 border-b border-gray-200 bg-white">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <Link to="/" className="p-2 -ml-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors">
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <h2 className="text-2xl font-bold font-serif text-primary-dark">Admin Dashboard</h2>
          </div>
          <button 
            onClick={handleApproveAll}
            className="text-sm font-bold bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
          >
            <CheckCircle className="w-5 h-5" /> Approve All Pending
          </button>
        </div>
        <div className="relative">
          <Search className="w-5 h-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search by name, house name..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary outline-none"
          />
        </div>
      </div>

      {/* List View */}
      <div className="flex-1 overflow-y-auto max-h-[70vh]">
        {filteredSubs.length === 0 ? (
          <div className="p-12 text-center text-gray-500 font-medium">
            <Search className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            No submissions found.
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredSubs.map(sub => {
              const isExpanded = selectedSub?.id === sub.id;
              
              return (
                <div key={sub.id} className="flex flex-col">
                  {/* List Item Header (Clickable) */}
                  <div 
                    onClick={() => setSelectedSub(isExpanded ? null : sub)}
                    className={`p-6 cursor-pointer hover:bg-gray-50 transition-colors flex justify-between items-center ${isExpanded ? 'bg-primary bg-opacity-5' : ''}`}
                  >
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-lg font-bold text-gray-900">{sub.fullName}</h3>
                        <span className={`text-xs px-2 py-1 rounded-md font-semibold uppercase tracking-wider ${
                          sub.status === 'approved' ? 'bg-green-100 text-green-700' :
                          sub.status === 'rejected' ? 'bg-red-100 text-red-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {sub.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 font-medium">{sub.houseName}</p>
                      <p className="text-xs text-gray-400 mt-1">{new Date(sub.createdAt).toLocaleString()}</p>
                    </div>
                  </div>

                  {/* Accordion Dropdown Content */}
                  {isExpanded && (
                    <div className="p-6 bg-gray-50 border-t border-gray-100">
                      
                      {/* Action Buttons */}
                      <div className="flex items-center gap-3 mb-6">
                        {sub.status !== 'approved' && (
                          <button 
                            onClick={() => handleStatusChange(sub.id, 'approved')}
                            className="flex-1 py-2 rounded-lg bg-green-500 text-white font-bold hover:bg-green-600 transition-colors flex justify-center items-center gap-2"
                          >
                            <CheckCircle className="w-5 h-5" /> Approve
                          </button>
                        )}
                        {sub.status !== 'rejected' && (
                          <button 
                            onClick={() => handleStatusChange(sub.id, 'rejected')}
                            className="flex-1 py-2 rounded-lg bg-red-500 text-white font-bold hover:bg-red-600 transition-colors flex justify-center items-center gap-2"
                          >
                            <XCircle className="w-5 h-5" /> Reject
                          </button>
                        )}
                        <button 
                          onClick={() => handleDelete(sub.id)}
                          className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 font-bold hover:bg-gray-300 transition-colors flex justify-center items-center gap-2"
                        >
                          <Trash2 className="w-5 h-5" /> Delete
                        </button>
                      </div>

                      {/* Payment Screenshot Only */}
                      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                        <h3 className="font-semibold text-gray-800 flex items-center gap-2 mb-3">
                          <Eye className="w-5 h-5 text-primary" /> Payment Screenshot
                        </h3>
                        <div className="rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                          <img src={sub.paymentScreenshotUrl} alt="Payment" className="max-w-full max-h-[500px] object-contain" />
                        </div>
                      </div>

                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
