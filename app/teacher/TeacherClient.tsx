'use client';
import { useState, useEffect } from 'react';
import StudentList from '@/components/StudentList';
import CameraCapture from '@/components/CameraCapture';
import { CheckCircle2, UserPlus, Megaphone, Send, LogOut, Sparkles, Users, BookOpen, School, Save } from 'lucide-react';

const WhatsAppIcon = ({ size = 16, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.885-9.885 9.885m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
  </svg>
)

interface Student {
  id: string;
  name: string;
  roll: number;
  parent_phone: string;
}

interface TeacherClientProps {
  schoolId: string;
  classId: string;
  teacherName: string;
  schoolName: string;
  isReadOnly?: boolean;
}

export default function TeacherClient({ schoolId, classId, teacherName, schoolName, isReadOnly = false }: TeacherClientProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [absentIds, setAbsentIds] = useState<string[]>([]);
  const [homeworkImage, setHomeworkImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'attendance' | 'students' | 'announcements'>('attendance');

  // New Student Form State
  const [newStudent, setNewStudent] = useState({ name: '', roll: '', parent_phone: '' });
  
  // Announcement State
  const [announcement, setAnnouncement] = useState({ type: 'PTM', message: '' });
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [markedPresent, setMarkedPresent] = useState(false);

  // Calendar State
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isLocked, setIsLocked] = useState(false);

  // Check lock logic: Locked if before the most recent Saturday
  useEffect(() => {
    const date = new Date(selectedDate);
    const now = new Date();
    const lastSaturday = new Date(now);
    const day = now.getDay(); // 0=Sun, 6=Sat
    const daysSinceSaturday = (day + 1) % 7; 
    lastSaturday.setDate(now.getDate() - daysSinceSaturday);
    lastSaturday.setHours(0,0,0,0);
    
    setIsLocked(date < lastSaturday);
  }, [selectedDate]);

  // Fetch students
  useEffect(() => {
    fetch(`/api/students?class_id=${classId}&school_id=${schoolId}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) setStudents(data.students);
      });
  }, [classId, schoolId]);

  // Fetch existing attendance log for the selected date
  useEffect(() => {
    setHomeworkImage(null);
    setAbsentIds([]);
    fetch(`/api/get-log?date=${selectedDate}&class_id=${classId}&school_id=${schoolId}`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.log) {
          if (data.log.homework_base64) setHomeworkImage(data.log.homework_base64);
          if (data.absences) setAbsentIds(data.absences);
        }
      });
  }, [selectedDate, classId, schoolId]);

  const toggleAbsent = (id: string) => {
    if (isLocked || isReadOnly) return;
    setAbsentIds((prev) => prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]);
  };

  const playClickSound = () => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.1);
      gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } catch (e) {
      console.log(e);
    }
  };

  const saveAttendance = async () => {
    playClickSound();
    if (isLocked) {
      alert("This date is locked and cannot be edited.");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/submit-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ absentIds, homeworkImage, date: selectedDate, class_id: classId, school_id: schoolId })
      });
      if (res.ok) {
        alert('Attendance & Homework saved successfully!');
      } else {
        alert('Error saving log.');
      }
    } catch (error) {
      alert('Error saving log.');
    }
    setIsSubmitting(false);
  };

  const notifyParents = () => {
    const absentNames = students.filter(s => absentIds.includes(s.id)).map(s => s.name).join(', ') || 'None';
    const msg = `Good Morning Parents (Class ${classId})!%0A%0AAttendance for ${new Date(selectedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} is marked.%0AAbsentees: ${absentNames}%0A%0AHomework has been uploaded to the Parent Dashboard.`;
    window.open(`https://wa.me/?text=${msg}`, '_blank');
  };

  const addStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/students', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...newStudent, class_id: classId, school_id: schoolId })
    });
    if (res.ok) {
      const data = await res.json();
      setStudents([...students, data.student].sort((a, b) => a.roll - b.roll));
      setNewStudent({ name: '', roll: '', parent_phone: '' });
      alert('Student Added!');
    }
  };

  const sendAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/announcements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...announcement, date: new Date().toISOString(), class_id: classId, school_id: schoolId })
    });
    if (res.ok) {
      const msg = `📢 *Notice: ${announcement.type}*%0A%0A${announcement.message}%0A%0A- On behalf of ${schoolName}%0A${teacherName}, Class Teacher of Class ${classId}`;
      window.open(`https://wa.me/?text=${msg}`, '_blank');
      setAnnouncement({ type: 'PTM', message: '' });
    }
  };

  const generateWithGemini = async () => {
    if (!aiPrompt) return;
    setIsGenerating(true);
    try {
      const res = await fetch('/api/generate-announcement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: aiPrompt })
      });
      const data = await res.json();
      if (data.success) {
        setAnnouncement({ ...announcement, message: data.message });
        setAiPrompt('');
      } else {
        alert(data.error || 'Failed to generate announcement');
      }
    } catch (error) {
      alert('Error generating announcement');
    }
    setIsGenerating(false);
  };

  const markSelfAttendance = async () => {
    const todayStr = new Date().toISOString().split('T')[0];
    const res = await fetch('/api/teacher-attendance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date: todayStr, school_id: schoolId })
    });
    if (res.ok) {
      setMarkedPresent(true);
    } else {
      alert('Error marking attendance');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FC] font-sans text-slate-900 flex justify-center">
      <main className="w-full max-w-3xl bg-white min-h-screen md:min-h-0 md:my-8 md:rounded-xl md:border md:border-gray-200 relative pb-[120px] md:pb-8 flex flex-col">
        
        {/* Header */}
        <header className="border-b border-gray-100 bg-white md:rounded-t-xl overflow-hidden shadow-sm">
          <div className="p-4 md:p-6 flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 bg-[#FAF9F6]/50">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-1 flex items-center">
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-lg flex items-center justify-center mr-3 shadow-sm shadow-indigo-500/20 text-white">
                  <School size={16} />
                </div>
                Class {classId}
              </h1>
              <p className="text-indigo-600 font-bold text-xs uppercase tracking-widest pl-11">{schoolName}</p>
              
              <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex items-center space-x-2 bg-white border border-gray-200 rounded-xl px-3 py-2 shadow-sm">
                  <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Date</span>
                  <input 
                    type="date" 
                    value={selectedDate} 
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="text-sm outline-none bg-transparent text-slate-900 font-bold cursor-pointer"
                  />
                </div>
                {isLocked && <span className="text-xs bg-[#FFF0EB] text-[#FF7F50] px-3 py-2 rounded-xl font-bold border border-[#FFD8CD]">Locked</span>}
              </div>
            </div>
            
            <div className="flex items-center space-x-3 w-full sm:w-auto">
              {!isReadOnly && (
                <button 
                  onClick={markSelfAttendance}
                  disabled={markedPresent}
                  className={`flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-[0.97] flex items-center justify-center min-h-[44px] md:min-h-[40px] ${markedPresent ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default' : 'bg-indigo-50 border border-indigo-100 text-indigo-700 hover:bg-indigo-100'}`}
                >
                  {markedPresent ? (
                    <><CheckCircle2 size={16} className="mr-2" /> Present</>
                  ) : (
                    'Mark Present'
                  )}
                </button>
              )}
              <form action="/auth/signout" method="post" className="flex-none">
                <button 
                  type="submit"
                  className="flex items-center justify-center space-x-2 bg-slate-100 border border-transparent text-slate-600 hover:bg-slate-200 hover:text-slate-800 px-4 py-2.5 rounded-xl transition-all active:scale-[0.97] min-h-[44px] sm:w-auto w-full font-bold"
                >
                  <LogOut size={16} />
                  <span className="text-sm hidden sm:inline">Sign Out</span>
                </button>
              </form>
            </div>
          </div>

          <div className="px-4 md:px-6 py-4 bg-white">
            <div className="flex overflow-x-auto scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
              <div className="flex bg-slate-100/80 p-1.5 rounded-2xl inline-flex min-w-max">
                <button 
                  onClick={() => setActiveTab('attendance')} 
                  className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 min-h-[44px] ${activeTab === 'attendance' ? 'bg-white text-indigo-700 shadow-sm scale-[1.02] border border-gray-200/50' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50 active:scale-[0.97]'}`}
                >
                  <Users size={16} className="inline mr-2" />
                  Attendance
                </button>
                <button 
                  onClick={() => setActiveTab('students')} 
                  className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 min-h-[44px] ${activeTab === 'students' ? 'bg-white text-indigo-700 shadow-sm scale-[1.02] border border-gray-200/50' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50 active:scale-[0.97]'}`}
                >
                  <BookOpen size={16} className="inline mr-2" />
                  Manage Students
                </button>
                <button 
                  onClick={() => setActiveTab('announcements')} 
                  className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 min-h-[44px] ${activeTab === 'announcements' ? 'bg-white text-indigo-700 shadow-sm scale-[1.02] border border-gray-200/50' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50 active:scale-[0.97]'}`}
                >
                  <Megaphone size={16} className="inline mr-2" />
                  Announcements
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 pb-32">
          {activeTab === 'attendance' && (
            <div className="space-y-6 max-w-2xl mx-auto">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-white p-5 rounded-[20px] shadow-sm border border-gray-100 gap-4">
                <div className="flex flex-col flex-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Select Date</label>
                  <input 
                    type="date" 
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-[#FAF9F6] text-slate-900 font-bold min-h-[44px] transition-colors"
                  />
                </div>
                {isLocked && (
                  <div className="bg-[#FFF0EB] text-[#FF7F50] px-4 py-2.5 rounded-xl text-sm font-bold flex items-center border border-[#FFD8CD]">
                    <CheckCircle2 size={16} className="mr-2" /> 
                    Attendance Locked
                  </div>
                )}
              </div>

              <StudentList students={students} absentIds={absentIds} toggleAbsent={toggleAbsent} />
              
              <CameraCapture image={homeworkImage} setImage={setHomeworkImage} />
            </div>
          )}

          {activeTab === 'attendance' && (
            <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-gray-100 p-4 sm:px-8 flex items-center justify-between gap-3 sm:gap-4 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] z-20">
              <button
                onClick={saveAttendance}
                disabled={isSubmitting || isLocked}
                className="flex-1 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold py-3.5 rounded-xl flex items-center justify-center transition-all duration-150 active:translate-y-1 active:border-b-0 disabled:opacity-50 disabled:active:translate-y-0 disabled:active:border-b-4 border-b-4 border-indigo-800 shadow-lg shadow-indigo-600/20 text-sm sm:text-base"
              >
                {isSubmitting ? (
                  'Saving...'
                ) : (
                  <>
                    <Save size={18} className="mr-2" />
                    Save & Update
                  </>
                )}
              </button>

              <button
                onClick={() => { playClickSound(); notifyParents(); }}
                disabled={isSubmitting || isLocked || absentIds.length === 0}
                className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-bold py-3.5 rounded-xl flex items-center justify-center transition-all duration-150 active:translate-y-1 active:border-b-0 disabled:opacity-50 disabled:active:translate-y-0 disabled:active:border-b-4 border-b-4 border-emerald-700 shadow-lg shadow-emerald-500/20 text-sm sm:text-base"
              >
                <WhatsAppIcon className="mr-2 w-5 h-5" />
                Notify Parents
              </button>
            </div>
          )}

          {activeTab === 'students' && (
            <div className="bg-white rounded-[20px] shadow-sm border border-gray-100 overflow-hidden max-w-2xl mx-auto">
              <div className="p-5 md:p-6 border-b border-gray-50 flex justify-between items-center bg-[#FAF9F6]">
                <h2 className="text-lg font-bold text-slate-900">Class Roster</h2>
                <div className="bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg text-sm font-bold tracking-wide">
                  {students.length} Students
                </div>
              </div>
              <div className="p-5 border-b border-gray-100 bg-white">
                <form onSubmit={(e) => { playClickSound(); addStudent(e); }} className="flex flex-col sm:flex-row gap-3">
                  <input type="text" placeholder="Name" value={newStudent.name} onChange={e => setNewStudent({...newStudent, name: e.target.value})} required className="border border-gray-200 rounded-xl px-4 py-2 text-sm flex-1 focus:ring-2 focus:ring-indigo-500 outline-none" />
                  <input type="number" placeholder="Roll No" value={newStudent.roll} onChange={e => setNewStudent({...newStudent, roll: e.target.value})} required className="border border-gray-200 rounded-xl px-4 py-2 text-sm w-full sm:w-24 focus:ring-2 focus:ring-indigo-500 outline-none" />
                  <input type="tel" placeholder="Parent Phone" value={newStudent.parent_phone} onChange={e => setNewStudent({...newStudent, parent_phone: e.target.value})} required className="border border-gray-200 rounded-xl px-4 py-2 text-sm flex-1 focus:ring-2 focus:ring-indigo-500 outline-none" />
                  <button type="submit" className="bg-indigo-600 text-white rounded-xl px-6 py-2 font-bold text-sm border-b-4 border-indigo-800 active:border-b-0 active:translate-y-1 transition-all">Add</button>
                </form>
              </div>
              <ul className="divide-y divide-gray-50">
                {students.map(student => (
                  <li key={student.id} className="p-4 md:p-5 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-[#FFF0EB] rounded-xl flex items-center justify-center text-[#FF7F50] font-black text-sm">
                        {student.roll}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 tracking-tight">{student.name}</p>
                        <p className="text-sm text-slate-500 font-medium">{student.parent_phone}</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {activeTab === 'announcements' && (
            <div className="max-w-2xl mx-auto">
              {error && (
                <div className="bg-[#FFF9F7] text-[#D95B30] p-4 rounded-xl mb-6 text-sm border border-[#FFD8CD] font-bold">
                  {error}
                </div>
              )}
              {success && (
                <div className="bg-emerald-50 text-emerald-700 p-4 rounded-xl mb-6 text-sm border border-emerald-100 font-bold">
                  {success}
                </div>
              )}
              
              <div className="bg-white rounded-[20px] shadow-sm border border-gray-100 overflow-hidden mb-6">
                <div className="bg-gradient-to-r from-amber-500 to-orange-400 p-6 text-white">
                  <div className="flex items-center mb-2">
                    <Megaphone size={24} className="mr-3 text-white/90" />
                    <h2 className="text-xl font-bold tracking-tight">Class Announcement</h2>
                  </div>
                  <p className="text-amber-50 text-sm font-medium">Broadcast a message to all parents in Class {classId}</p>
                </div>
                
                <div className="p-6">
                  <form onSubmit={sendAnnouncement} className="space-y-4">
                    <select value={announcement.type} onChange={e => setAnnouncement({...announcement, type: e.target.value})} className="w-full border border-gray-200 p-3 rounded-xl bg-[#FAF9F6] text-slate-700 font-bold focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-colors">
                      <option value="PTM">Parents Teacher Meeting (PTM)</option>
                      <option value="Holiday">School Holiday</option>
                      <option value="General">General Notice</option>
                    </select>
                    <textarea placeholder="Type your friendly message here..." required rows={5} value={announcement.message} onChange={e => setAnnouncement({...announcement, message: e.target.value})} className="w-full border border-gray-200 p-4 rounded-xl bg-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-colors resize-none text-sm font-medium" />
                    
                    <div className="flex flex-col space-y-2 bg-indigo-50/50 p-4 rounded-xl border border-indigo-100/50">
                      <div className="flex items-center space-x-2">
                        <Sparkles size={16} className="text-indigo-600" />
                        <span className="text-sm font-bold text-indigo-900">AI Assistant</span>
                      </div>
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          placeholder="e.g. remind parents about tomorrow's math test..."
                          value={aiPrompt}
                          onChange={(e) => setAiPrompt(e.target.value)}
                          className="flex-1 border border-indigo-200/60 p-2.5 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 outline-none text-sm transition-colors"
                        />
                        <button
                          type="button"
                          onClick={generateWithGemini}
                          disabled={isGenerating || !aiPrompt}
                          className="bg-indigo-100 hover:bg-indigo-200 text-indigo-700 px-4 py-2.5 rounded-lg font-bold text-sm transition-colors active:scale-[0.97] disabled:opacity-50"
                        >
                          {isGenerating ? '...' : 'Generate'}
                        </button>
                      </div>
                    </div>
                    <button type="submit" onClick={() => playClickSound()} className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-3.5 rounded-xl font-bold text-sm flex items-center justify-center transition-all duration-150 active:translate-y-1 active:border-b-0 border-b-4 border-emerald-700 min-h-[44px] mt-4 shadow-lg shadow-emerald-500/20">
                      <WhatsAppIcon className="mr-2 w-5 h-5" /> 
                      Send via WhatsApp
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
