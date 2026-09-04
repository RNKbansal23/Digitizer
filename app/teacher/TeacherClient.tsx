'use client';
import { useState, useEffect } from 'react';
import StudentList from '@/components/StudentList';
import CameraCapture from '@/components/CameraCapture';
import { CheckCircle2, UserPlus, Megaphone, Send, LogOut, Sparkles } from 'lucide-react';

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

  const saveAttendance = async () => {
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
        <header className="p-4 md:p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-1">Class {classId}</h1>
            <p className="text-indigo-600 font-semibold text-xs uppercase tracking-wider">{schoolName}</p>
            <div className="mt-3 flex items-center space-x-2">
              <span className="text-slate-500 text-sm font-medium">Date</span>
              <input 
                type="date" 
                value={selectedDate} 
                onChange={(e) => setSelectedDate(e.target.value)}
                className="border border-gray-200 rounded-lg p-1.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-slate-900 font-medium cursor-pointer"
              />
              {isLocked && <span className="text-xs bg-red-50 text-red-700 px-2 py-1 rounded-md font-medium border border-red-100/50">Locked</span>}
            </div>
          </div>
          
          <div className="flex items-center space-x-3 w-full sm:w-auto">
            {!isReadOnly && (
              <button 
                onClick={markSelfAttendance}
                disabled={markedPresent}
                className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center justify-center min-h-[44px] md:min-h-[40px] ${markedPresent ? 'bg-emerald-50 text-emerald-700 border border-emerald-100/50 cursor-default' : 'bg-white border border-gray-200 text-slate-700 hover:bg-gray-50'}`}
              >
                {markedPresent ? (
                  <><CheckCircle2 size={16} className="mr-2" /> Present</>
                ) : (
                  'Mark Self Attendance'
                )}
              </button>
            )}
            <form action="/auth/signout" method="post">
              <button className="flex-none text-slate-500 bg-white hover:text-slate-900 hover:bg-gray-50 p-2.5 rounded-xl border border-gray-200 transition-colors min-h-[44px] md:min-h-[40px] flex items-center justify-center">
                <LogOut size={18} />
              </button>
            </form>
          </div>
        </header>

        {/* Tabs */}
        <div className="px-4 md:px-6 pt-4 md:pt-6">
          <div className="flex overflow-x-auto scrollbar-hide pb-2 -mb-2">
            <div className="flex p-1 bg-gray-100/80 rounded-xl inline-flex min-w-max">
              <button onClick={() => setActiveTab('attendance')} className={`px-5 py-2 rounded-lg font-medium text-sm transition-all min-h-[40px] md:min-h-[36px] ${activeTab === 'attendance' ? 'bg-white text-slate-900 shadow-sm border border-gray-200/50' : 'text-slate-500 hover:text-slate-700 hover:bg-gray-200/50'}`}>Attendance</button>
              <button onClick={() => setActiveTab('students')} className={`px-5 py-2 rounded-lg font-medium text-sm transition-all min-h-[40px] md:min-h-[36px] ${activeTab === 'students' ? 'bg-white text-slate-900 shadow-sm border border-gray-200/50' : 'text-slate-500 hover:text-slate-700 hover:bg-gray-200/50'}`}>Manage Students</button>
              <button onClick={() => setActiveTab('announcements')} className={`px-5 py-2 rounded-lg font-medium text-sm transition-all min-h-[40px] md:min-h-[36px] ${activeTab === 'announcements' ? 'bg-white text-slate-900 shadow-sm border border-gray-200/50' : 'text-slate-500 hover:text-slate-700 hover:bg-gray-200/50'}`}>Announcements</button>
            </div>
          </div>
        </div>

        <div className="flex-1 p-4 md:p-6 mt-2">
          {activeTab === 'attendance' && (
            <div className="space-y-6">
              <StudentList students={students} absentIds={absentIds} toggleAbsent={toggleAbsent} />
              
              {!isReadOnly && (
                <>
                  <CameraCapture image={homeworkImage} setImage={setHomeworkImage} />
                  <div className="fixed md:absolute bottom-0 left-0 right-0 p-4 md:p-6 bg-white/90 backdrop-blur-md border-t border-gray-100 flex flex-col sm:flex-row justify-center gap-3 z-20 rounded-b-xl">
                    <button
                      onClick={saveAttendance}
                      disabled={isSubmitting || isLocked}
                      className="w-full sm:w-auto sm:min-w-[140px] flex items-center justify-center bg-indigo-600 text-white py-2.5 px-4 rounded-xl font-medium text-sm disabled:opacity-70 transition-colors hover:bg-indigo-700 min-h-[44px] md:min-h-[40px]"
                    >
                      {isLocked ? 'Locked' : isSubmitting ? 'Saving...' : 'Save & Update'}
                    </button>
                    <button
                      onClick={notifyParents}
                      disabled={isLocked && absentIds.length === 0}
                      className="w-full sm:w-auto sm:min-w-[140px] flex items-center justify-center bg-emerald-600 text-white py-2.5 px-4 rounded-xl font-medium text-sm disabled:opacity-70 transition-colors hover:bg-emerald-700 min-h-[44px] md:min-h-[40px]"
                    >
                      <WhatsAppIcon className="mr-2" /> 
                      Notify Parents
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === 'students' && (
            <div className="space-y-6">
              {!isReadOnly && (
                <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-6">
                  <h2 className="text-base font-semibold mb-4 flex items-center text-slate-900">
                    <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center mr-3">
                      <UserPlus className="text-indigo-600" size={16} />
                    </div>
                    Add New Student
                  </h2>
                  <form onSubmit={addStudent} className="flex flex-col gap-3">
                    <input type="text" placeholder="Student Name" required value={newStudent.name} onChange={e => setNewStudent({...newStudent, name: e.target.value})} className="w-full border border-gray-200 p-2.5 rounded-xl bg-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-colors text-sm min-h-[44px] md:min-h-[40px]" />
                    <div className="flex gap-3">
                      <input type="number" placeholder="Roll No" required value={newStudent.roll} onChange={e => setNewStudent({...newStudent, roll: e.target.value})} className="w-1/3 border border-gray-200 p-2.5 rounded-xl bg-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-colors text-sm min-h-[44px] md:min-h-[40px]" />
                      <input type="tel" placeholder="Parent WhatsApp" required value={newStudent.parent_phone} onChange={e => setNewStudent({...newStudent, parent_phone: e.target.value})} className="w-2/3 border border-gray-200 p-2.5 rounded-xl bg-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-colors text-sm min-h-[44px] md:min-h-[40px]" />
                    </div>
                    <button type="submit" className="w-full bg-indigo-600 text-white py-2.5 rounded-xl font-medium text-sm hover:bg-indigo-700 transition-colors min-h-[44px] md:min-h-[40px] mt-1">Add Student</button>
                  </form>
                </div>
              )}
              
              <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-slate-900 text-base">Enrolled Students</h3>
                  <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md text-xs font-medium">{students.length} Total</span>
                </div>
                <ul className="space-y-2">
                  {students.map(s => (
                    <li key={s.id} className="p-3 border border-gray-100 rounded-lg bg-white flex justify-between items-center hover:border-gray-300 transition-colors">
                      <div className="flex items-center space-x-3">
                        <span className="w-8 h-8 rounded-md bg-gray-50 text-slate-600 flex items-center justify-center font-medium text-xs border border-gray-200">{s.roll}</span>
                        <span className="font-medium text-slate-900 text-sm">{s.name}</span>
                      </div>
                      <span className="text-slate-500 text-xs">+{s.parent_phone}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'announcements' && (
            <div className="space-y-6">
              {isReadOnly ? (
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <p className="text-slate-500 text-sm text-center font-medium">Principals cannot send announcements directly from a class view.</p>
                </div>
              ) : (
                <>
                  {/* AI Assistant Widget */}
                  <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-6 shadow-sm">
                    <h2 className="text-base font-semibold mb-4 flex items-center text-slate-900">
                      <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center mr-3">
                        <Sparkles className="text-indigo-600" size={16} />
                      </div>
                      AI Assistant
                    </h2>
                    <div className="flex flex-col gap-3">
                      <input 
                        type="text" 
                        placeholder="E.g. 'holiday diwali' or 'PTM tomorrow'" 
                        value={aiPrompt}
                        onChange={e => setAiPrompt(e.target.value)}
                        className="w-full border border-gray-200 p-2.5 rounded-xl bg-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-colors text-sm min-h-[44px] md:min-h-[40px]" 
                      />
                      <button 
                        onClick={generateWithGemini}
                        disabled={isGenerating || !aiPrompt}
                        className="w-full bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-50 py-2.5 rounded-xl font-medium text-sm flex items-center justify-center transition-colors disabled:opacity-50 min-h-[44px] md:min-h-[40px]"
                      >
                        {isGenerating ? 'Generating...' : (
                          <>
                            <Sparkles className="mr-2" size={16} /> 
                            Draft with Gemini
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Manual Announcement Form */}
                  <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-6">
                    <h2 className="text-base font-semibold mb-4 flex items-center text-slate-900">
                      <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center mr-3">
                        <Megaphone className="text-slate-600" size={16} />
                      </div>
                      Review & Send
                    </h2>
                    <form onSubmit={sendAnnouncement} className="flex flex-col gap-4">
                      <select value={announcement.type} onChange={e => setAnnouncement({...announcement, type: e.target.value})} className="w-full border border-gray-200 p-2.5 rounded-xl bg-white text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm font-medium min-h-[44px] md:min-h-[40px]">
                        <option value="PTM">Parents Teacher Meeting (PTM)</option>
                        <option value="Holiday">School Holiday</option>
                        <option value="General">General Notice</option>
                      </select>
                      <textarea placeholder="Type your message here..." required rows={5} value={announcement.message} onChange={e => setAnnouncement({...announcement, message: e.target.value})} className="w-full border border-gray-200 p-3 rounded-xl bg-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-colors resize-none text-sm" />
                      <button type="submit" className="w-full bg-emerald-600 text-white py-2.5 rounded-xl font-medium text-sm flex items-center justify-center hover:bg-emerald-700 transition-colors min-h-[44px] md:min-h-[40px] mt-2">
                        <WhatsAppIcon className="mr-2" /> 
                        Send via WhatsApp
                      </button>
                    </form>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
