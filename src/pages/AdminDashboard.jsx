import { useEffect, useState } from 'react';
import { API_BASE, handleResponse } from '../utils/api.js';

const STUDENTS_PER_PAGE = 2;

function AdminDashboard() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [metrics, setMetrics] = useState({
    total_students: 0,
    total_reviewed: 0,
    average_ui: 0,
    average_code: 0,
    average_completion: 0,
  });
  const [uiMessage, setUiMessage] = useState(null);
  const [reviewForms, setReviewForms] = useState({});
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  const loadStudents = async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const response = await fetch(
        `${API_BASE}/admin/students?search=${encodeURIComponent(search)}&page=${page}&limit=${STUDENTS_PER_PAGE}`
      );
      const result = await handleResponse(response);
      setStudents(result.data.students || []);
      setTotal(result.data.total || 0);
    } catch (error) {
      setFetchError(error.message || 'Unable to pull student records.');
      setStudents([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  const loadMetrics = async () => {
    try {
      const response = await fetch(`${API_BASE}/admin/metrics`);
      if (response.ok) {
        const result = await response.json();
        const mData = result.data;
        setMetrics({
          total_students: mData.total_students ?? 0,
          total_reviewed: mData.total_reviewed ?? 0,
          average_ui: mData.average_ui ?? 0,
          average_code: mData.average_code ?? 0,
          average_completion: mData.average_completion ?? 0,
        });
      }
    } catch (error) {
      console.error('Failed to load metrics:', error);
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / STUDENTS_PER_PAGE));

  useEffect(() => {
    loadStudents();
  }, [search, page]);

  useEffect(() => {
    loadMetrics();
    const interval = setInterval(loadMetrics, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const handleReview = async (studentId) => {
    const form = reviewForms[studentId];
    if (!form) return;

    const ui_marks = parseInt(form.ui_marks || '0', 10);
    const code_marks = parseInt(form.code_marks || '0', 10);
    const completion_marks = parseInt(form.completion_marks || '0', 10);
    const feedback = form.feedback || '';

    if (
      Number.isNaN(ui_marks) || ui_marks < 0 || ui_marks > 10 ||
      Number.isNaN(code_marks) || code_marks < 0 || code_marks > 10 ||
      Number.isNaN(completion_marks) || completion_marks < 0 || completion_marks > 10 ||
      !feedback.trim()
    ) {
      setUiMessage({ type: 'error', text: 'All marks must sit between 0 and 10, and feedback text is required.' });
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/admin/review/${studentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ui_marks, code_marks, completion_marks, feedback })
      });
      const result = await handleResponse(response);
      setUiMessage({ type: 'success', text: result.message });
      loadStudents();
      loadMetrics();
      setReviewForms(prev => ({ ...prev, [studentId]: { ...prev[studentId], showForm: false } }));
    } catch (err) {
      setUiMessage({ type: 'error', text: err.message || 'Could not save metrics review changes.' });
    }
  };

  const toggleReviewForm = (studentId, student) => {
    setReviewForms(prev => ({
      ...prev,
      [studentId]: {
        showForm: !prev[studentId]?.showForm,
        ui_marks: prev[studentId]?.ui_marks ?? student.ui_marks ?? '',
        code_marks: prev[studentId]?.code_marks ?? student.code_marks ?? '',
        completion_marks: prev[studentId]?.completion_marks ?? student.completion_marks ?? '',
        feedback: prev[studentId]?.feedback ?? student.feedback ?? ''
      }
    }));
  };

  const updateReviewForm = (studentId, field, value) => {
    setReviewForms(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], [field]: value }
    }));
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-200 dark:border-slate-800 pb-6 gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Instructor Console</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Audit submissions, grade development metrics, and post feedback updates live.</p>
        </div>
        <div className="w-full md:w-80">
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search students by name..."
            className="w-full px-4 py-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
        </div>
      </div>

      {uiMessage && (
        <div className={`p-3 rounded-xl border text-sm font-semibold ${uiMessage.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900' : 'bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900'}`}>{uiMessage.text}</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="md:col-span-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 rounded-2xl shadow-sm flex flex-col justify-between">
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Operational Summary</h2>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-700/60">
              <span className="text-xs text-slate-400 font-medium">Total Accounts</span>
              <div className="text-3xl font-black text-slate-900 dark:text-white mt-1">{metrics.total_students}</div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-700/60">
              <span className="text-xs text-slate-400 font-medium">Evaluations Finished</span>
              <div className="text-3xl font-black text-slate-900 dark:text-white mt-1">{metrics.total_reviewed}</div>
            </div>
          </div>
        </div>

        <div className="md:col-span-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 rounded-2xl shadow-sm">
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider">System Grading Averages</h2>
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl text-center border border-slate-100 dark:border-slate-700/60">
              <span className="text-xs text-slate-400 font-medium uppercase tracking-wide">Avg UI</span>
              <div className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">{metrics.average_ui > 0 ? `${metrics.average_ui}/10` : 'N/A'}</div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl text-center border border-slate-100 dark:border-slate-700/60">
              <span className="text-xs text-slate-400 font-medium uppercase tracking-wide">Avg Code</span>
              <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">{metrics.average_code > 0 ? `${metrics.average_code}/10` : 'N/A'}</div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl text-center border border-slate-100 dark:border-slate-700/60">
              <span className="text-xs text-slate-400 font-medium uppercase tracking-wide">Avg Progress</span>
              <div className="text-2xl font-black text-violet-600 dark:text-violet-400 mt-1">{metrics.average_completion > 0 ? `${metrics.average_completion}/10` : 'N/A'}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm p-6">
        <h2 className="text-lg font-black tracking-tight text-slate-900 dark:text-white mb-4">Student Submissions Queue</h2>
        
        {loading ? (
          <p className="text-sm text-slate-400 py-6 text-center animate-pulse">Loading queue registry...</p>
        ) : fetchError ? (
          <p className="text-sm text-rose-500 py-6 text-center font-semibold">{fetchError}</p>
        ) : students.length === 0 ? (
          <p className="text-sm text-slate-400 py-8 text-center border border-dashed border-slate-200 dark:border-slate-700 rounded-xl">No active portfolio submissions match your search query filters.</p>
        ) : (
          <div className="space-y-6">
            {students.map((student) => {
              const form = reviewForms[student.id] || {};
              return (
                <div key={student.id} className="border border-slate-100 dark:border-slate-700/80 rounded-2xl p-5 hover:border-slate-200 dark:hover:border-slate-600 transition duration-150 bg-slate-50/40 dark:bg-slate-900/10">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <strong className="text-base font-bold text-slate-900 dark:text-white">{student.name}</strong>
                        <span className={`px-2 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-md ${student.status === 'Reviewed' ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400' : 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400'}`}>
                          {student.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 font-medium">{student.email}</p>
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mt-2">Project: <span className="text-blue-600 dark:text-blue-400">{student.project_name || 'No submission artifacts yet'}</span></p>
                    </div>
                    
                    <div className="flex items-center gap-3 self-end sm:self-start">
                      {student.status === 'Reviewed' && <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">✓ Audited</span>}
                      <button
                        onClick={() => toggleReviewForm(student.id, student)}
                        className={`px-4 py-2 text-xs font-bold rounded-xl border shadow-sm transition cursor-pointer ${student.status === 'Reviewed' ? 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50' : 'bg-blue-600 border-blue-600 text-white hover:bg-blue-700 shadow-blue-500/10'}`}
                      >
                        {student.status === 'Reviewed' ? 'Edit Grades' : 'Evaluate'}
                      </button>
                    </div>
                  </div>

                  {(student.profile_image || student.project_image) && (
                    <div className="flex items-center gap-4 mt-4 overflow-x-auto pb-2">
                      {student.profile_image && (
                        <div className="flex-shrink-0 w-24 h-16 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                          <img src={`http://localhost:3000/uploads/${student.profile_image}`} alt="Avatar" className="w-full h-full object-cover" />
                        </div>
                      )}
                      {student.project_image && (
                        <div className="flex-shrink-0 w-24 h-16 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                          <img src={`http://localhost:3000/uploads/${student.project_image}`} alt="Screenshot" className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 bg-white dark:bg-slate-800 p-4 border border-slate-100 dark:border-slate-700/60 rounded-xl text-xs text-slate-500 dark:text-slate-400">
                    <div className="space-y-1">
                      <p><span className="font-bold uppercase text-[10px] tracking-wider text-slate-400 mr-1">Code Repo:</span> {student.github_link ? <a href={student.github_link} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">{student.github_link}</a> : 'N/A'}</p>
                      <p><span className="font-bold uppercase text-[10px] tracking-wider text-slate-400 mr-1">App URL:</span> {student.deploy_link ? <a href={student.deploy_link} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">{student.deploy_link}</a> : 'N/A'}</p>
                    </div>
                    <div className="space-y-1">
                      <p><span className="font-bold uppercase text-[10px] tracking-wider text-slate-400 mr-1">Scores Summary:</span> UI: <span className="font-bold text-slate-800 dark:text-slate-200">{student.ui_marks ?? 'N/A'}</span> | Code: <span className="font-bold text-slate-800 dark:text-slate-200">{student.code_marks ?? 'N/A'}</span> | Progress: <span className="font-bold text-slate-800 dark:text-slate-200">{student.completion_marks ?? 'N/A'}</span></p>
                      <p className="italic"><span className="font-bold uppercase not-italic text-[10px] tracking-wider text-slate-400 mr-1">Instructor Note:</span> "{student.feedback || 'No review remarks filed.'}"</p>
                    </div>
                  </div>

                  {form.showForm && (
                    <div className="mt-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 transition-all animate-fadeIn">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Portfolio Assessment Metric Input</h3>
                      <form onSubmit={(e) => { e.preventDefault(); handleReview(student.id); }} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <input type="number" min="0" max="10" placeholder="UI Design Marks (/10)" value={form.ui_marks || ''} onChange={(e) => updateReviewForm(student.id, 'ui_marks', e.target.value)} required className="px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                          <input type="number" min="0" max="10" placeholder="Code Quality Marks (/10)" value={form.code_marks || ''} onChange={(e) => updateReviewForm(student.id, 'code_marks', e.target.value)} required className="px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                          <input type="number" min="0" max="10" placeholder="Completion Marks (/10)" value={form.completion_marks || ''} onChange={(e) => updateReviewForm(student.id, 'completion_marks', e.target.value)} required className="px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <textarea placeholder="Write descriptive student performance feedback remarks..." value={form.feedback || ''} onChange={(e) => updateReviewForm(student.id, 'feedback', e.target.value)} required className="w-full h-24 p-3 text-sm border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
                        <div className="flex justify-end">
                          <button type="submit" className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md transition cursor-pointer">Submit Assessment</button>
                        </div>
                      </form>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-100 dark:border-slate-700/60">
          <button
            disabled={page <= 1 || loading}
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 transition cursor-pointer"
          >
            Previous
          </button>
          <span className="text-xs font-bold text-slate-400">Page {page} of {totalPages}</span>
          <button
            disabled={page >= totalPages || loading}
            onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
            className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 transition cursor-pointer"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;