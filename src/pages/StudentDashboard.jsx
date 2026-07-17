import { useEffect, useState } from 'react';
import { API_BASE, handleResponse } from '../utils/api.js';

function StudentDashboard() {
  const student = JSON.parse(localStorage.getItem('student') || 'null');
  const [projectName, setProjectName] = useState('');
  const [githubLink, setGithubLink] = useState('');
  const [deployLink, setDeployLink] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [projectImage, setProjectImage] = useState(null);
  const [studentData, setStudentData] = useState(null);
  const [uiMessage, setUiMessage] = useState(null);

  const loadStudentData = async () => {
    if (!student) return null;
    try {
      const response = await fetch(`${API_BASE}/students/profile/${student.id}`);
      if (response.ok) {
        const result = await response.json();
        setStudentData(result.data);
        return result.data;
      }
    } catch (err) {
      console.error("Profile load crash:", err);
    }
    return null;
  };

  useEffect(() => {
    if (!student) return;
    let lastStatus = null;
    
    const refresh = async () => {
      const latestData = await loadStudentData();
      if (latestData) {
        if (latestData.status === 'Reviewed' && lastStatus !== 'Reviewed') {
          setUiMessage({ type: 'success', text: 'Evaluation complete! Your scores are updated live.' });
        }
        lastStatus = latestData.status;
      }
    };

    refresh();
    const interval = setInterval(refresh, 5000);
    return () => clearInterval(interval);
  }, [student?.id]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setUiMessage(null);
    
    const formData = new FormData();
    formData.append('student_id', student.id);
    formData.append('project_name', projectName);
    formData.append('github_link', githubLink);
    formData.append('deploy_link', deployLink);
    if (profileImage) formData.append('profile_image', profileImage);
    if (projectImage) formData.append('project_image', projectImage);

    try {
      const response = await fetch(`${API_BASE}/students/submit`, {
        method: 'POST',
        body: formData
      });
      const result = await handleResponse(response);
      setUiMessage({ type: 'success', text: result.message });
      setProjectName('');
      setGithubLink('');
      setDeployLink('');
      setProfileImage(null);
      setProjectImage(null);
      await loadStudentData();
    } catch (error) {
      setUiMessage({ type: 'error', text: error.message });
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
      <div className="lg:col-span-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 rounded-2xl shadow-sm">
        <h1 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">Student Workspace</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Welcome back, <span className="font-bold text-slate-800 dark:text-slate-200">{student?.name}</span></p>
        
        {uiMessage && (
          <div className={`mt-4 p-3 rounded-xl border text-xs font-bold ${uiMessage.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900' : 'bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900'}`}>{uiMessage.text}</div>
        )}

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-xs font-bold uppercase text-slate-400 tracking-wider mb-1">Project Assignment Title</label>
            <input value={projectName} onChange={(e) => setProjectName(e.target.value)} placeholder="E.g., BookHub Native Engine" required className="w-full px-4 py-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition" />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-slate-400 tracking-wider mb-1">GitHub Code Link</label>
            <input value={githubLink} onChange={(e) => setGithubLink(e.target.value)} placeholder="https://github.com/..." required className="w-full px-4 py-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition" />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-slate-400 tracking-wider mb-1">Live Application Deploy URL</label>
            <input value={deployLink} onChange={(e) => setDeployLink(e.target.value)} placeholder="https://..." required className="w-full px-4 py-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition" />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-slate-400 tracking-wider mb-1">Student Profile Picture</label>
            <input type="file" onChange={(e) => setProfileImage(e.target.files[0])} accept="image/*" className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-50 dark:file:bg-slate-700 file:text-blue-700 dark:file:text-slate-200 hover:file:bg-blue-100 transition cursor-pointer mt-1" />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-slate-400 tracking-wider mb-1">Project Screenshot Image</label>
            <input type="file" onChange={(e) => setProjectImage(e.target.files[0])} accept="image/*" className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-50 dark:file:bg-slate-700 file:text-blue-700 dark:file:text-slate-200 hover:file:bg-blue-100 transition cursor-pointer mt-1" />
          </div>
          <button type="submit" className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition shadow-md shadow-blue-500/10 active:scale-[0.99] text-sm cursor-pointer">Submit Portfolio</button>
        </form>
      </div>

      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 rounded-2xl shadow-sm">
          <h2 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">Submission Tracking & Assessment Status</h2>
          
          {studentData ? (
            <div className="mt-6 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700/60 pb-4">
                <span className="text-sm font-semibold text-slate-500">Evaluation Phase:</span>
                <span className={`px-3 py-1 text-xs font-black uppercase tracking-wider rounded-full ${studentData.status === 'Reviewed' ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400' : 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 animate-pulse'}`}>
                  {studentData.status || 'Pending'}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-700/40 p-4 rounded-xl text-center">
                  <div className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">UI Scale</div>
                  <div className="text-2xl font-black mt-1 text-slate-900 dark:text-white">{studentData.ui_marks ?? 'N/A'}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">/10</div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-700/40 p-4 rounded-xl text-center">
                  <div className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">Code Quality</div>
                  <div className="text-2xl font-black mt-1 text-slate-900 dark:text-white">{studentData.code_marks ?? 'N/A'}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">/10</div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-700/40 p-4 rounded-xl text-center">
                  <div className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">Completion</div>
                  <div className="text-2xl font-black mt-1 text-slate-900 dark:text-white">{studentData.completion_marks ?? 'N/A'}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">/10</div>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-700/50 p-4 rounded-xl">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Reviewer Suggestions & Feedback</h4>
                <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 italic leading-relaxed">
                  "{studentData.feedback || 'Your assignment bundle is currently queued in the instructor pipeline for portfolio validation review.'}"
                </p>
              </div>

              {(studentData.profile_image || studentData.project_image) && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Uploaded Media Assets</h4>
                  <div className="grid grid-cols-2 gap-4">
                    {studentData.profile_image && (
                      <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-900">
                        <div className="bg-slate-200 dark:bg-slate-800 px-3 py-1 text-[10px] font-bold uppercase text-slate-500 tracking-wide">Avatar Image</div>
                        <img src={`http://localhost:3000/uploads/${studentData.profile_image}`} alt="Profile Avatar" className="w-full h-40 object-cover" />
                      </div>
                    )}
                    {studentData.project_image && (
                      <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-900">
                        <div className="bg-slate-200 dark:bg-slate-800 px-3 py-1 text-[10px] font-bold uppercase text-slate-500 tracking-wide">Screenshot Artifact</div>
                        <img src={`http://localhost:3000/uploads/${studentData.project_image}`} alt="Project Screen" className="w-full h-40 object-cover" />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-4 bg-slate-50 dark:bg-slate-900/40 p-4 border border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
              No project details loaded yet. Complete the submission form on the side pane to kick off the instructor tracking metrics validation flow.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default StudentDashboard;