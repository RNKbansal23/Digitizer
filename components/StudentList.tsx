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
      <ul className="space-y-3">
        {students.map((student) => {
          const isAbsent = absentIds.includes(student.id);
          return (
            <li
              key={student.id}
              className={`p-4 rounded-xl border flex items-center justify-between transition-all duration-200 ${
                isAbsent ? 'bg-red-50/50 border-red-200' : 'bg-gray-50/50 border-gray-200'
              }`}
            >
              <div className="flex items-center space-x-4">
                <span className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm border ${isAbsent ? 'bg-red-100 text-red-700 border-red-200' : 'bg-gray-200 text-gray-600 border-gray-300'}`}>
                  {student.roll}
                </span>
                <div>
                  <span className={`font-semibold block ${isAbsent ? 'text-red-900' : 'text-gray-900'}`}>{student.name}</span>
                </div>
              </div>
              <button
                onClick={() => toggleAbsent(student.id)}
                className={`w-10 h-10 rounded-xl font-bold text-lg flex items-center justify-center transition-all duration-200 active:scale-[0.95] ${
                  isAbsent 
                    ? 'bg-red-500 text-white shadow-md shadow-red-500/20' 
                    : 'bg-white text-gray-400 border border-gray-200 hover:bg-gray-50 hover:text-gray-600'
                }`}
              >
                A
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}