'use client';
import { User, CalendarX, BookOpen, CheckCircle2, Megaphone, Stethoscope } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function ParentDashboard({ params }: { params: { studentId: string } }) {
  const [student, setStudent] = useState<any>(null);
  const [logData, setLogData] = useState<any>(null);
  const [isAbsent, setIsAbsent] = useState(false);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [sickReported, setSickReported] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        // Since we are moving to client components to support the sick leave form easily, 
        // we should ideally fetch from an API route. But we can fetch directly from Supabase if we configure the client.
        // For simplicity, let's just make a single API route or split it.
        const res = await fetch(`/api/parent-dashboard?studentId=${params.studentId}`);
        if (res.ok) {
          const data = await res.json();
          setStudent(data.student);
          setLogData(data.logData);
          setIsAbsent(data.isAbsent);
          setAnnouncements(data.announcements);
        }
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    }
    loadData();
  }, [params.studentId]);

  const reportSick = async () => {
    if (!confirm("Are you sure you want to report sick leave for today?")) return;
    const res = await fetch('/api/report-leave', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ student_id: params.studentId, reason: 'Sick Leave', date: new Date().toISOString() })
    });
    if (res.ok) {
      setSickReported(true);
      alert('Leave reported to the class teacher.');
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading Dashboard...</div>;
  if (!student) return <div className="p-8 text-center text-red-500">Student not found</div>;

  const homeworkImg = logData?.homework_base64 || null;

  return (
    <main className="min-h-screen bg-gray-100 p-4 flex flex-col items-center pb-12">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border overflow-hidden mt-6">
        
        {/* Header */}
        <div className="bg-indigo-600 p-6 text-white text-center">
          <div className="bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
            <User size={32} />
          </div>
          <h1 className="text-xl font-bold">{student.name}</h1>
          <p className="text-indigo-100 text-sm">Class {student.class_id} • Roll {student.roll}</p>
        </div>

        <div className="p-6 space-y-6">
          
          {/* Announcements Section */}
          {announcements.length > 0 && (
            <div className="bg-orange-50 border border-orange-200 p-4 rounded-xl">
              <h2 className="text-orange-800 font-bold flex items-center mb-2"><Megaphone className="mr-2" size={20} /> Latest Notice</h2>
              <div className="text-sm text-orange-900">
                <strong>{announcements[0].type}:</strong> {announcements[0].message}
              </div>
            </div>
          )}

          {/* Attendance Status */}
          <div className={`p-4 rounded-xl flex items-center ${isAbsent ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
            {isAbsent ? <CalendarX className="mr-3" /> : <CheckCircle2 className="mr-3" />}
            <div>
              <p className="font-bold">Today&apos;s Status</p>
              <p className="text-sm">{isAbsent ? 'Marked Absent' : 'Present in Class'}</p>
            </div>
          </div>

          {/* Report Sick Button */}
          {!isAbsent && (
            <button 
              onClick={reportSick}
              disabled={sickReported}
              className={`w-full py-3 rounded-xl font-bold flex justify-center items-center ${sickReported ? 'bg-gray-100 text-gray-400 border border-gray-200' : 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100'}`}
            >
              <Stethoscope className="mr-2" size={20} />
              {sickReported ? 'Sick Leave Sent' : 'Report Sick Today'}
            </button>
          )}

          {/* Homework Section */}
          <div>
            <h2 className="text-lg font-bold flex items-center mb-3 text-gray-800">
              <BookOpen className="mr-2 text-indigo-500" /> Today&apos;s Homework
            </h2>
            {homeworkImg ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={homeworkImg} alt="Homework" className="w-full rounded-xl border shadow-sm" />
            ) : (
              <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl p-8 text-center text-gray-500">
                No homework uploaded yet for today.
              </div>
            )}
          </div>
        </div>

      </div>
    </main>
  );
}