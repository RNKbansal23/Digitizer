'use client';
import { UserX } from 'lucide-react';

interface StudentListProps {
  students: { id: string; name: string; roll: number; parent_phone: string }[];
  absentIds: string[];
  toggleAbsent: (id: string) => void;
}

export default function StudentList({ students, absentIds, toggleAbsent }: StudentListProps) {
  return (
    <div className="bg-white rounded-[20px] border border-gray-100 p-4 md:p-6 shadow-sm">
      <h2 className="text-lg font-bold mb-5 flex items-center text-slate-900 tracking-tight">
        <div className="w-10 h-10 bg-coral-50 bg-[#FFF0EB] rounded-xl flex items-center justify-center mr-3">
          <UserX className="text-[#FF7F50]" size={18} />
        </div>
        Mark Absentees
      </h2>
      <ul className="space-y-3">
        {students.map((student) => {
          const isAbsent = absentIds.includes(student.id);
          return (
            <li
              key={student.id}
              className={`p-3 md:p-4 rounded-[16px] border flex items-center justify-between transition-colors duration-200 ${
                isAbsent ? 'bg-[#FFF9F7] border-[#FFD8CD]' : 'bg-white border-gray-100 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-4">
                <span className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm border ${isAbsent ? 'bg-[#FFECE5] text-[#FF7F50] border-[#FFD8CD]' : 'bg-slate-50 text-slate-600 border-gray-200'}`}>
                  {student.roll}
                </span>
                <div>
                  <span className={`font-bold block text-base tracking-tight ${isAbsent ? 'text-[#D95B30]' : 'text-slate-900'}`}>{student.name}</span>
                </div>
              </div>
              <button
                onClick={() => toggleAbsent(student.id)}
                className={`w-12 h-12 rounded-[14px] font-black text-lg flex items-center justify-center transition-all duration-200 active:scale-75 ${
                  isAbsent 
                    ? 'bg-[#FF7F50] text-white shadow-lg shadow-coral-500/30 border border-transparent scale-110' 
                    : 'bg-white text-slate-300 border-2 border-gray-100 hover:bg-gray-50 hover:text-slate-500 scale-100'
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