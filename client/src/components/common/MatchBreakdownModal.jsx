import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { X, Award, CheckCircle2, AlertCircle, Compass, Database, Flame, Utensils } from 'lucide-react';

export default function MatchBreakdownModal({ donationId, isOpen, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && donationId) {
      fetchBreakdown();
    }
  }, [isOpen, donationId]);

  const fetchBreakdown = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/matching/${donationId}`);
      if (res.data.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Failed to load match breakdown:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-scale-up border border-slate-100">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base">Matching Engine Scoring Breakdown</h3>
              <p className="text-xs text-slate-500">Transparent Multi-Factor Allocation Decision Engine</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {loading ? (
            <div className="py-12 text-center text-slate-400 text-sm">
              <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto mb-3" />
              Evaluating candidate shelters & geographic feasibility...
            </div>
          ) : !data ? (
            <div className="text-center py-8 text-slate-500 text-sm">No evaluation data found.</div>
          ) : (
            <>
              {/* Formula & Weights Bar */}
              <div className="bg-emerald-50/60 p-4 rounded-xl border border-emerald-100">
                <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wider mb-2">
                  Configurable Evaluation Weights (Sum = 100%)
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
                  <div className="bg-white p-2 rounded-lg border border-emerald-200">
                    <span className="block text-slate-500">Distance</span>
                    <span className="font-bold text-emerald-700">30%</span>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-emerald-200">
                    <span className="block text-slate-500">Capacity</span>
                    <span className="font-bold text-emerald-700">25%</span>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-emerald-200">
                    <span className="block text-slate-500">Need Level</span>
                    <span className="font-bold text-emerald-700">20%</span>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-emerald-200">
                    <span className="block text-slate-500">Compatibility</span>
                    <span className="font-bold text-emerald-700">15%</span>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-emerald-200">
                    <span className="block text-slate-500">Expiry Safety</span>
                    <span className="font-bold text-emerald-700">10%</span>
                  </div>
                </div>
              </div>

              {/* Candidate Shelters List */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-slate-800">
                  Candidate Shelter Scores ({data.candidates?.length || 0} evaluated)
                </h4>

                {data.candidates?.map((c, idx) => {
                  const isWinner = idx === 0 && c.feasible;

                  return (
                    <div
                      key={c.ngoId}
                      className={`p-4 rounded-xl border transition-all ${
                        isWinner
                          ? 'border-emerald-500 bg-emerald-50/40 shadow-sm'
                          : c.feasible
                          ? 'border-slate-200 bg-white hover:border-slate-300'
                          : 'border-red-200 bg-red-50/30 opacity-75'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-slate-800 text-sm">
                              {c.organizationName}
                            </span>
                            {isWinner && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-600 text-white">
                                Best Fit Match
                              </span>
                            )}
                            {!c.feasible && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                                Infeasible
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">{c.address}</p>
                        </div>
                        <div className="text-right">
                          <span className={`text-xl font-extrabold ${isWinner ? 'text-emerald-700' : 'text-slate-700'}`}>
                            {c.scores.finalScore}
                          </span>
                          <span className="text-xs text-slate-400 block">/ 100</span>
                        </div>
                      </div>

                      {c.feasible ? (
                        <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-slate-600">
                          <div className="flex items-center space-x-1 bg-slate-50 p-2 rounded-lg">
                            <Compass className="w-3.5 h-3.5 text-blue-500" />
                            <span>{c.distance} km away</span>
                          </div>
                          <div className="flex items-center space-x-1 bg-slate-50 p-2 rounded-lg">
                            <Database className="w-3.5 h-3.5 text-emerald-500" />
                            <span>Cap: {c.availableCapacity} meals</span>
                          </div>
                          <div className="flex items-center space-x-1 bg-slate-50 p-2 rounded-lg">
                            <Flame className="w-3.5 h-3.5 text-amber-500" />
                            <span>Need: {c.currentNeeds}</span>
                          </div>
                          <div className="flex items-center space-x-1 bg-slate-50 p-2 rounded-lg">
                            <Utensils className="w-3.5 h-3.5 text-purple-500" />
                            <span>ETA: {c.estimatedTravelMinutes} mins</span>
                          </div>
                        </div>
                      ) : (
                        <div className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded-lg flex items-center space-x-1.5">
                          <AlertCircle className="w-4 h-4 flex-shrink-0" />
                          <span>{c.rejectionReason}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold"
          >
            Close Breakdown
          </button>
        </div>
      </div>
    </div>
  );
}
