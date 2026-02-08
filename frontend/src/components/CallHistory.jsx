import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CallHistory = ({ userId }) => {
  const [calls, setCalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCallHistory();}, [userId]);

  const fetchCallHistory = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/calls/history', {
        headers: {
          Authorization: `Bearer ${token}`
        }
          });

      if (response.data.success) {
        setCalls(response.data.calls);
      }
    } catch (err) {
      console.error('Error fetching call history:', err);
      setError('Failed to load call history');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString();
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const getCallStatusColor = (status) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'ended':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading call history...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">{error}</div>;
  }

  if (calls.length === 0) {
    return <div className="text-center py-8 text-gray-500">No calls yet</div>;
  }

  return (
    <div className="w-full">
      <h3 className="text-xl font-semibold mb-4">Call History</h3>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-3 text-left">Type</th>
              <th className="border p-3 text-left">Caller</th>
              <th className="border p-3 text-left">Receiver</th>
              <th className="border p-3 text-left">Status</th>
              <th className="border p-3 text-left">Duration</th>
              <th className="border p-3 text-left">Date</th>
            </tr>
          </thead>
          <tbody>
            {calls.map((call) => (
              <tr key={call._id} className="border-b hover:bg-gray-50">
                <td className="border p-3">
                  <span className={`px-3 py-1 rounded text-sm font-semibold ${
                    call.callType === 'video' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                        }`}>
                    {call.callType.toUpperCase()}
                  </span>
                </td>
                <td className="border p-3">{call.callerId.name}</td>
                <td className="border p-3">{call.receiverId.name}</td>
                <td className="border p-3">
                  <span className={`px-3 py-1 rounded text-sm font-semibold ${getCallStatusColor(call.status)}`}>
                    {call.status.charAt(0).toUpperCase() + call.status.slice(1)}
                  </span>
                </td>
                <td className="border p-3">
                  {call.duration > 0 ? formatDuration(call.duration) : '-'}
                </td>
                <td className="border p-3">{formatDate(call.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CallHistory;
