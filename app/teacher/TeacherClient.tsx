'use client';
import { useState, useEffect } from 'react';
import StudentList from '@/components/StudentList';
import CameraCapture from '@/components/CameraCapture';
import { CheckCircle2, UserPlus, Megaphone, Send, LogOut, Sparkles } from 'lucide-react';

const WhatsAppIcon = ({ size = 20, className = "" }) => (
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
}

export default function TeacherClient({ schoolId, classId, teacherName, schoolName }: TeacherClientProps) {
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

  useEffect(() => {
    fetch(`/api/students?class_id=${classId}&school_id=${schoolId}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) setStudents(data.students);
      });
  }, [classId, schoolId]);

  const toggleAbsent = (id: string) => {
    setAbsentIds((prev) => prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]);
  };

  const submitLog = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/submit-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ absentIds, homeworkImage, date: new Date().toISOString(), class_id: classId, school_id: schoolId })
      });
      if (res.ok) {
        const absentNames = students.filter(s => absentIds.includes(s.id)).map(s => s.name).join(', ') || 'None';
        const msg = `Good Morning Parents (Class ${classId})!%0A%0AToday's attendance is marked.%0AAbsentees: ${absentNames}%0A%0AHomework has been uploaded to the Parent Dashboard.`;
        window.open(`https://wa.me/?text=${msg}`, '_blank');
        
        setAbsentIds([]);
        setHomeworkImage(null);
      } else {
        alert('Error submitting log.');
      }
    } catch (error) {
      alert('Error submitting log.');
    }
    setIsSubmitting(false);
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

  return (
    <div className="min-h-screen bg-[#F5F7FF] py-8 px-4 font-sans text-gray-800">
      <main className="max-w-2xl mx-auto p-8 bg-white shadow-sm rounded-2xl border border-gray-200 pb-28 relative">
        <header className="mb-10 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 mb-1">Class {classId}</h1>
            <p className="text-indigo-600 font-bold text-sm uppercase tracking-wider">{schoolName}</p>
            <p className="text-gray-500 text-sm mt-1 font-medium">Today: {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
          </div>
          <form action="/auth/signout" method="post">
            <button className="text-red-500 bg-red-50/50 p-3 rounded-xl border border-transparent hover:border-red-100 hover:bg-red-50 transition-all duration-200 active:scale-[0.97] min-h-[44px]">
              <LogOut size={20} />
            </button>
          </form>
        </header>

        {/* Tabs */}
        <div className="flex space-x-3 mb-10 overflow-x-auto pb-4 scrollbar-hide">
          <button onClick={() => setActiveTab('attendance')} className={`px-6 py-2.5 rounded-xl font-semibold transition-all duration-200 active:scale-[0.97] border min-h-[44px] ${activeTab === 'attendance' ? 'bg-[#4F46E5] text-white border-transparent shadow-sm' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}>Attendance</button>
          <button onClick={() => setActiveTab('students')} className={`px-6 py-2.5 rounded-xl font-semibold transition-all duration-200 active:scale-[0.97] border min-h-[44px] ${activeTab === 'students' ? 'bg-[#4F46E5] text-white border-transparent shadow-sm' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}>Manage Students</button>
          <button onClick={() => setActiveTab('announcements')} className={`px-6 py-2.5 rounded-xl font-semibold transition-all duration-200 active:scale-[0.97] border min-h-[44px] ${activeTab === 'announcements' ? 'bg-[#4F46E5] text-white border-transparent shadow-sm' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}>Announcements</button>
        </div>

        <div className="animate-in fade-in duration-300">
          {activeTab === 'attendance' && (
            <div className="space-y-6">
              <StudentList students={students} absentIds={absentIds} toggleAbsent={toggleAbsent} />
              <CameraCapture image={homeworkImage} setImage={setHomeworkImage} />

              <div className="fixed bottom-0 left-0 right-0 p-6 bg-white/90 backdrop-blur-md border-t border-gray-200 flex justify-center z-20">
                <button
                  onClick={submitLog}
                  disabled={isSubmitting || !homeworkImage}
                  className="w-full max-w-md flex items-center justify-center bg-[#25D366] text-white py-3.5 rounded-xl font-bold text-lg disabled:opacity-70 disabled:transform-none transition-all duration-200 active:scale-[0.97] hover:bg-[#128C7E] min-h-[44px]"
                >
                  {isSubmitting ? 'Sending...' : (
                    <>
                      <WhatsAppIcon className="mr-3" /> 
                      Notify Parents
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'students' && (
            <div className="space-y-8">
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <h2 className="text-xl font-bold mb-6 flex items-center text-gray-900">
                  <div className="bg-indigo-50 p-2 rounded-xl mr-3">
                    <UserPlus className="text-indigo-600" size={20} />
                  </div>
                  Add New Student
                </h2>
                <form onSubmit={addStudent} className="space-y-4">
                  <input type="text" placeholder="Student Name" required value={newStudent.name} onChange={e => setNewStudent({...newStudent, name: e.target.value})} className="w-full border border-gray-200 p-3.5 rounded-xl bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all duration-200 min-h-[44px]" />
                  <input type="number" placeholder="Roll Number" required value={newStudent.roll} onChange={e => setNewStudent({...newStudent, roll: e.target.value})} className="w-full border border-gray-200 p-3.5 rounded-xl bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all duration-200 min-h-[44px]" />
                  <input type="tel" placeholder="Parent WhatsApp (e.g. 919876543210)" required value={newStudent.parent_phone} onChange={e => setNewStudent({...newStudent, parent_phone: e.target.value})} className="w-full border border-gray-200 p-3.5 rounded-xl bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all duration-200 min-h-[44px]" />
                  <button type="submit" className="w-full bg-[#4F46E5] text-white py-3.5 rounded-xl font-bold hover:bg-indigo-700 transition-all duration-200 active:scale-[0.97] min-h-[44px]">Add Student</button>
                </form>
              </div>
              
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <h3 className="font-bold mb-4 text-gray-900 flex justify-between items-center">
                  <span>Enrolled Students</span>
                  <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-lg text-sm">{students.length} Total</span>
                </h3>
                <ul className="space-y-3">
                  {students.map(s => (
                    <li key={s.id} className="p-4 border border-gray-100 rounded-xl bg-gray-50/30 flex justify-between items-center">
                      <div className="flex items-center space-x-4">
                        <span className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-sm border border-indigo-100">{s.roll}</span>
                        <span className="font-semibold text-gray-900">{s.name}</span>
                      </div>
                      <span className="text-gray-500 text-sm">+{s.parent_phone}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'announcements' && (
            <div className="space-y-8">
              {/* AI Assistant Card */}
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100 p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center text-indigo-900">
                  <div className="bg-white p-2 rounded-xl mr-3 shadow-sm border border-indigo-50">
                    <Sparkles className="text-indigo-600" size={20} />
                  </div>
                  AI Assistant
                </h2>
                <div className="space-y-3">
                  <input 
                    type="text" 
                    placeholder="E.g. 'holiday diwali' or 'PTM tomorrow'" 
                    value={aiPrompt}
                    onChange={e => setAiPrompt(e.target.value)}
                    className="w-full border border-indigo-200 p-3.5 rounded-xl bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all duration-200 min-h-[44px]" 
                  />
                  <button 
                    onClick={generateWithGemini}
                    disabled={isGenerating || !aiPrompt}
                    className="w-full bg-[#4F46E5] text-white py-3.5 rounded-xl font-bold flex items-center justify-center hover:bg-indigo-700 transition-all duration-200 active:scale-[0.97] disabled:opacity-70 disabled:transform-none min-h-[44px]"
                  >
                    {isGenerating ? 'Generating...' : (
                      <>
                        <Sparkles className="mr-2" size={18} /> 
                        Draft with Gemini
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Manual Announcement Form */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <h2 className="text-xl font-bold mb-6 flex items-center text-gray-900">
                  <div className="bg-orange-50 p-2 rounded-xl mr-3">
                    <Megaphone className="text-orange-600" size={20} />
                  </div>
                  Review & Send
                </h2>
              <form onSubmit={sendAnnouncement} className="space-y-4">
                <select value={announcement.type} onChange={e => setAnnouncement({...announcement, type: e.target.value})} className="w-full border border-gray-200 p-3.5 rounded-xl bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-orange-500 outline-none font-semibold text-gray-700 transition-all duration-200 cursor-pointer min-h-[44px]">
                  <option value="PTM">Parents Teacher Meeting (PTM)</option>
                  <option value="Holiday">School Holiday</option>
                  <option value="General">General Notice</option>
                </select>
                <textarea placeholder="Type your message here..." required rows={5} value={announcement.message} onChange={e => setAnnouncement({...announcement, message: e.target.value})} className="w-full border border-gray-200 p-3.5 rounded-xl bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-orange-500 outline-none transition-all duration-200 resize-none" />
                <button type="submit" className="w-full bg-[#25D366] text-white py-3.5 rounded-xl font-bold flex items-center justify-center hover:bg-[#128C7E] transition-all duration-200 active:scale-[0.97] min-h-[44px]">
                  <WhatsAppIcon className="mr-3" /> 
                  Send via WhatsApp
                </button>
              </form>
            </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
