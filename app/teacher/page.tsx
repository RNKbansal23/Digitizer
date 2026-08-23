'use client';
import { useState } from 'react';
import StudentList from '@/components/StudentList';
import CameraCapture from '@/components/CameraCapture';
import { CheckCircle2 } from 'lucide-react';

// Mock data (You will replace this with a Supabase fetch call later)
const MOCK_STUDENTS = [
  { id: '1', name: 'Aarav Patel', roll: 1 },
  { id: '2', name: 'Diya Sharma', roll: 2 },
  { id: '3', name: 'Kabir Singh', roll: 3 },
  { id: '4', name: 'Ananya Verma', roll: 4 },
];

export default function TeacherDashboard() {
  const [absentIds, setAbsentIds] = useState<string[]>([]);
  const [homeworkImage, setHomeworkImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleAbsent = (id: string) => {
    setAbsentIds((prev) => prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]);
  };

  const submitLog = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/submit-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ absentIds, homeworkImage, date: new Date().toISOString() })
      });
      if (res.ok) {
        alert('Daily log submitted! WhatsApp messages would be triggered here.');
        setAbsentIds([]);
        setHomeworkImage(null);
      }
    } catch (error) {
      alert('Error submitting log.');
    }
    setIsSubmitting(false);
  };

  return (
    <main className="max-w-md mx-auto p-4 pb-24">
      <header className="mb-6 mt-4">
        <h1 className="text-2xl font-black text-gray-900">Class 5-A</h1>
        <p className="text-gray-500 text-sm">Today&apos;s Date: {new Date().toLocaleDateString()}</p>
      </header>

      <StudentList students={MOCK_STUDENTS} absentIds={absentIds} toggleAbsent={toggleAbsent} />
      <CameraCapture image={homeworkImage} setImage={setHomeworkImage} />

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t flex justify-center z-10">
        <button
          onClick={submitLog}
          disabled={isSubmitting || !homeworkImage}
          className="w-full max-w-md flex items-center justify-center bg-green-600 text-white py-4 rounded-xl font-bold text-lg disabled:opacity-50 disabled:bg-gray-400"
        >
          {isSubmitting ? 'Sending...' : <><CheckCircle2 className="mr-2" /> Submit Daily Log</>}
        </button>
      </div>
    </main>
  );
}