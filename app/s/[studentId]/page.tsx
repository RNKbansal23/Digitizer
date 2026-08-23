// Unique link for parents for a specific student
import React from 'react';
import { useRouter } from 'next/router';

export default function StudentPage() {
  const router = useRouter();
  const { studentId } = router.query;

  return (
    <main className="p-6 bg-gradient-to-b from-blue-100 to-white min-h-screen">
      <h1 className="text-3xl font-bold mb-4">Attendance for Student {studentId}</h1>
      {/* Add attendance details here */}
    </main>
  );
}
