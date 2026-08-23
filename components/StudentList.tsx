// StudentList component for marking attendance
import React from 'react';

export default function StudentList({ students, onToggle }) {
  return (
    <ul className="space-y-2">
      {students.map((student) => (
        <li key={student.id} className="flex items-center justify-between p-2 bg-white rounded shadow">
          <span>{student.name}</span>
          <button
            className={`px-3 py-1 rounded ${student.present ? 'bg-green-500' : 'bg-gray-300'} text-white`}
            onClick={() => onToggle(student.id)}
          >
            {student.present ? 'Present' : 'Absent'}
          </button>
        </li>
      ))}
    </ul>
  );
}
