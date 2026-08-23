'use client';
import { UserX } from 'lucide-react';

interface StudentListProps {
  students: { id: string; name: string; roll: number }[];
  absentIds: string[];
  toggleAbsent: (id: string) => void;
}

export default function StudentList({ students, absentIds, toggleAbsent }: StudentListProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border p-4 mb-6">
      <h2 className="text-lg font-bold mb-4 flex items-center">
        <UserX className="mr-2 text-red-500" /> Mark Absentees
      </h2>
      <div className="grid grid-cols-2 gap-3">
        {students.map((student) => {
          const isAbsent = absentIds.includes(student.id);
          return (
            <button
              key={student.id}
              onClick={() => toggleAbsent(student.id)}
              className={`p-3 rounded-lg border text-left flex flex-col transition-colors ${
                isAbsent ? 'bg-red-50 border-red-500 text-red-700' : 'bg-gray-50 border-gray-200'
              }`}
            >
              <span className="font-semibold">{student.name}</span>
              <span className="text-xs opacity-70">Roll: {student.roll}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}