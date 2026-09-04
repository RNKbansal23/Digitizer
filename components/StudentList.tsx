'use client';
import { UserX } from 'lucide-react';

interface StudentListProps {
  students: { id: string; name: string; roll: number; parent_phone: string }[];
  absentIds: string[];
  toggleAbsent: (id: string) => void;
}

export default function StudentList({ students, absentIds, toggleAbsent }: StudentListProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-6 shadow-sm">
      <h2 className="text-base font-semibold mb-4 flex items-center text-slate-900">
        <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center mr-3">
          <UserX className="text-red-600" size={16} />
        </div>
        Mark Absentees
      </h2>
      <ul className="space-y-2">
        {students.map((student) => {
          const isAbsent = absentIds.includes(student.id);
          return (
            <li
              key={student.id}
              className={`p-3 rounded-xl border flex items-center justify-between transition-colors ${
                isAbsent ? 'bg-red-50/50 border-red-200' : 'bg-white border-gray-100 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-3">
                <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-medium text-xs border ${isAbsent ? 'bg-red-100 text-red-700 border-red-200' : 'bg-gray-50 text-slate-600 border-gray-200'}`}>
                  {student.roll}
                </span>
                <div>
                  <span className={`font-medium block text-sm ${isAbsent ? 'text-red-900' : 'text-slate-900'}`}>{student.name}</span>
                </div>
              </div>
              <button
                onClick={() => toggleAbsent(student.id)}
                className={`w-10 h-10 md:w-9 md:h-9 rounded-lg font-bold text-sm flex items-center justify-center transition-colors min-h-[44px] min-w-[44px] md:min-h-0 md:min-w-0 ${
                  isAbsent 
                    ? 'bg-red-100 text-red-700 border border-red-200' 
                    : 'bg-white text-slate-400 border border-gray-200 hover:bg-gray-50 hover:text-slate-600'
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