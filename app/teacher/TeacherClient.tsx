'use client';
import { useState, useEffect } from 'react';
import StudentList from '@/components/StudentList';
import CameraCapture from '@/components/CameraCapture';
import { CheckCircle2, UserPlus, Megaphone, Send, LogOut } from 'lucide-react';

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

  return (
    <div className="min-h-screen bg-gray-50/50 py-8 px-4">
      <main className="max-w-2xl mx-auto p-8 bg-white shadow-xl shadow-indigo-100/50 rounded-[2rem] border border-gray-100 pb-28">
        <header className="mb-8 mt-2 flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Class {classId}</h1>
          <p className="text-indigo-600 font-bold text-sm">{schoolName}</p>
          <p className="text-gray-500 text-sm">Today: {new Date().toLocaleDateString()}</p>
        </div>
        <form action="/auth/signout" method="post">
          <button className="text-red-500 bg-red-50 p-2 rounded-full hover:bg-red-100 transition-colors">
            <LogOut size={20} />
          </button>
        </form>
      </header>

      {/* Tabs */}
      <div className="flex space-x-2 mb-6 overflow-x-auto pb-2">
        <button onClick={() => setActiveTab('attendance')} className={`px-4 py-2 rounded-full whitespace-nowrap ${activeTab === 'attendance' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'}`}>Attendance</button>
        <button onClick={() => setActiveTab('students')} className={`px-4 py-2 rounded-full whitespace-nowrap ${activeTab === 'students' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'}`}>Manage Students</button>
        <button onClick={() => setActiveTab('announcements')} className={`px-4 py-2 rounded-full whitespace-nowrap ${activeTab === 'announcements' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'}`}>Announcements</button>
      </div>

      {activeTab === 'attendance' && (
        <>
          <StudentList students={students} absentIds={absentIds} toggleAbsent={toggleAbsent} />
          <CameraCapture image={homeworkImage} setImage={setHomeworkImage} />

          <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t flex justify-center z-10">
            <button
              onClick={submitLog}
              disabled={isSubmitting || !homeworkImage}
              className="w-full max-w-md flex items-center justify-center bg-green-600 text-white py-4 rounded-xl font-bold text-lg disabled:opacity-50 disabled:bg-gray-400"
            >
              {isSubmitting ? 'Sending...' : <><CheckCircle2 className="mr-2" /> Notify Parents</>}
            </button>
          </div>
        </>
      )}

      {activeTab === 'students' && (
        <div className="bg-white rounded-xl shadow-sm border p-4">
          <h2 className="text-lg font-bold mb-4 flex items-center"><UserPlus className="mr-2 text-indigo-500" /> Add New Student</h2>
          <form onSubmit={addStudent} className="space-y-4">
            <input type="text" placeholder="Student Name" required value={newStudent.name} onChange={e => setNewStudent({...newStudent, name: e.target.value})} className="w-full border p-3 rounded-lg bg-gray-50" />
            <input type="number" placeholder="Roll Number" required value={newStudent.roll} onChange={e => setNewStudent({...newStudent, roll: e.target.value})} className="w-full border p-3 rounded-lg bg-gray-50" />
            <input type="tel" placeholder="Parent WhatsApp Number (e.g. 919876543210)" required value={newStudent.parent_phone} onChange={e => setNewStudent({...newStudent, parent_phone: e.target.value})} className="w-full border p-3 rounded-lg bg-gray-50" />
            <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold">Add Student</button>
          </form>
          
          <div className="mt-8">
            <h3 className="font-bold mb-3 text-gray-700">Enrolled Students ({students.length})</h3>
            <ul className="space-y-2">
              {students.map(s => (
                <li key={s.id} className="p-3 border rounded-lg bg-gray-50 flex justify-between">
                  <span>{s.roll}. {s.name}</span>
                  <span className="text-gray-500 text-sm">+{s.parent_phone}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {activeTab === 'announcements' && (
        <div className="bg-white rounded-xl shadow-sm border p-4">
          <h2 className="text-lg font-bold mb-4 flex items-center"><Megaphone className="mr-2 text-orange-500" /> Send Announcement</h2>
          <form onSubmit={sendAnnouncement} className="space-y-4">
            <select value={announcement.type} onChange={e => setAnnouncement({...announcement, type: e.target.value})} className="w-full border p-3 rounded-lg bg-gray-50 font-semibold">
              <option value="PTM">Parents Teacher Meeting (PTM)</option>
              <option value="Holiday">School Holiday</option>
              <option value="General">General Notice</option>
            </select>
            <textarea placeholder="Type your message here..." required rows={4} value={announcement.message} onChange={e => setAnnouncement({...announcement, message: e.target.value})} className="w-full border p-3 rounded-lg bg-gray-50 resize-none" />
            <button type="submit" className="w-full bg-green-600 text-white py-3 rounded-lg font-bold flex items-center justify-center">
              <Send className="mr-2" size={20} /> Send via WhatsApp
            </button>
          </form>
        </div>
      )}
      </main>
    </div>
  );
}
