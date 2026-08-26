'use client';
import { UserX } from 'lucide-react';

interface StudentListProps {
  students: { id: string; name: string; roll: number; parent_phone: string }[];
  absentIds: string[];
  toggleAbsent: (id: string) => void;
}

export default function StudentList({ students, absentIds, toggleAbsent }: StudentListProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-6">
      <h2 className="text-lg font-bold mb-5 flex items-center text-gray-900">
        <div className="bg-red-50 p-2 rounded-xl mr-3">
          <UserX className="text-red-600" size={20} />
        </div>
        Mark Absentees
      </h2>
      <div className="grid grid-cols-2 gap-3">
        {students.map((student) => {
          const isAbsent = absentIds.includes(student.id);
          return (
            <button
              key={student.id}
              onClick={() => toggleAbsent(student.id)}
              className={`p-4 rounded-xl border text-left flex flex-col transition-all duration-200 active:scale-[0.97] min-h-[44px] ${
                isAbsent ? 'bg-red-50 border-red-300 text-red-700' : 'bg-gray-50/50 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <span className="font-semibold">{student.name}</span>
              <span className="text-xs text-gray-500 mt-1">Roll: {student.roll}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}