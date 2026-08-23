import { User, CalendarX, BookOpen } from 'lucide-react';
// import { supabase } from '@/lib/supabase'; // Will use this to fetch live data later

export default function ParentDashboard({ params }: { params: { studentId: string } }) {
  // Mock Data: In reality, you'd fetch student status using params.studentId from Supabase
  const isAbsent = false; 
  const studentName = "Aarav Patel";
  const homeworkImg = null; // Normally a URL from your DB

  return (
    <main className="min-h-screen bg-gray-100 p-4 flex flex-col items-center">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border overflow-hidden mt-6">
        
        {/* Header */}
        <div className="bg-indigo-600 p-6 text-white text-center">
          <div className="bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
            <User size={32} />
          </div>
          <h1 className="text-xl font-bold">{studentName}</h1>
          <p className="text-indigo-100 text-sm">Class 5-A</p>
        </div>

        <div className="p-6">
          {/* Attendance Status */}
          <div className={`p-4 rounded-xl mb-6 flex items-center ${isAbsent ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
            <CalendarX className="mr-3" />
            <div>
              <p className="font-bold">Today&apos;s Status</p>
              <p className="text-sm">{isAbsent ? 'Marked Absent' : 'Present in Class'}</p>
            </div>
          </div>

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