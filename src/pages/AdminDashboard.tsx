import { useState, useEffect } from 'react';
import { getSubmissions, updateSubmissionStatus, deleteSubmission } from '../utils/storage';
import type { Submission } from '../types';
import { Search, CheckCircle, XCircle, Trash2, Eye, Download, Image as ImageIcon } from 'lucide-react';

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSub, setSelectedSub] = useState<Submission | null>(null);

  useEffect(() => {
    loadSubmissions();
  }, []);

  const loadSubmissions = async () => {
    const data = await getSubmissions();
    setSubmissions(data.sort((a, b) => b.createdAt - a.createdAt));
  };

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
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-[#f0eee9] w-full max-w-6xl mx-auto flex flex-col md:flex-row h-[80vh]">
      
      {/* Sidebar / List View */}
      <div className="w-full md:w-1/3 border-r border-gray-200 bg-gray-50 flex flex-col h-full overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-white">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold font-serif text-primary-dark">Dashboard</h2>
            <button 
              onClick={handleApproveAll}
              className="text-xs font-bold bg-green-500 text-white px-3 py-1.5 rounded-lg hover:bg-green-600 transition-colors flex items-center gap-1"
            >
              <CheckCircle className="w-4 h-4" /> Approve All
            </button>
          </div>
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by name, house..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary outline-none"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredSubs.length === 0 ? (
            <div className="p-8 text-center text-gray-500 font-medium">No submissions found.</div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredSubs.map(sub => (
                <div 
                  key={sub.id} 
                  onClick={() => setSelectedSub(sub)}
                  className={`p-4 cursor-pointer hover:bg-primary hover:bg-opacity-5 transition-colors ${selectedSub?.id === sub.id ? 'bg-primary bg-opacity-10 border-l-4 border-primary' : 'border-l-4 border-transparent'}`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-gray-800">{sub.fullName}</h3>
                    <span className={`text-xs px-2 py-1 rounded-full font-semibold uppercase ${
                      sub.status === 'approved' ? 'bg-green-100 text-green-700' :
                      sub.status === 'rejected' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {sub.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">{sub.houseName}</p>
                  <p className="text-xs text-gray-400 mt-2">{new Date(sub.createdAt).toLocaleString()}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Detail View */}
      <div className="w-full md:w-2/3 bg-white flex flex-col h-full overflow-y-auto">
        {selectedSub ? (
          <div className="p-6 md:p-8">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{selectedSub.fullName}</h2>
                <p className="text-gray-500">{selectedSub.houseName} • {selectedSub.phoneNumber || 'No phone'}</p>
              </div>
              <div className="flex space-x-2">
                {selectedSub.status !== 'approved' && (
                  <button 
                    onClick={() => handleStatusChange(selectedSub.id, 'approved')}
                    className="p-2 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
                    title="Approve"
                  >
                    <CheckCircle className="w-6 h-6" />
                  </button>
                )}
                {selectedSub.status !== 'rejected' && (
                  <button 
                    onClick={() => handleStatusChange(selectedSub.id, 'rejected')}
                    className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                    title="Reject"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                )}
                <button 
                  onClick={() => handleDelete(selectedSub.id)}
                  className="p-2 rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-200 transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-8">
              {/* Payment Screenshot */}
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                  <Eye className="w-5 h-5 text-primary" /> Payment Screenshot
                </h3>
                <div className="border rounded-xl overflow-hidden bg-gray-50 h-[500px] flex items-center justify-center">
                  <img src={selectedSub.paymentScreenshotDataUrl} alt="Payment" className="w-full h-full object-contain" />
                </div>
              </div>
            </div>

          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-8 text-center">
            <Search className="w-16 h-16 mb-4 text-gray-300" />
            <p className="text-xl font-medium text-gray-500">Select a submission to view details</p>
          </div>
        )}
      </div>

    </div>
  );
}
