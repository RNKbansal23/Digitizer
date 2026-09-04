'use client';
import { useState } from 'react';
import { Users, BookOpen, LogOut, Building, Plus } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface PrincipalClientProps {
  schoolId: string;
  schoolName: string;
  profileName: string;
  studentCount: number;
  teacherCount: number;
  classes: any[];
  teacherAttendance: any[];
}

export default function PrincipalClient({ schoolId, schoolName, profileName, studentCount, teacherCount, classes, teacherAttendance }: PrincipalClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'classes' | 'attendance'>('classes');
  
  // Add Class Modal State
  const [showAddClass, setShowAddClass] = useState(false);
  const [newClass, setNewClass] = useState({ class_name: '', teacher_name: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddClass = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const res = await fetch('/api/classes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...newClass, school_id: schoolId })
    });
    if (res.ok) {
      setShowAddClass(false);
      setNewClass({ class_name: '', teacher_name: '' });
      router.refresh(); // Refresh server data
    } else {
      alert('Error adding class');
    }
    setIsSubmitting(false);
  };

  return (
    <main className="min-h-screen bg-[#F5F7FF] p-6 font-sans text-gray-800">
      <div className="max-w-4xl mx-auto space-y-6">
        <header className="flex justify-between items-center bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 flex items-center mb-1">
              <div className="bg-indigo-50 p-2 rounded-xl mr-3">
                <Building className="text-indigo-600" size={24} />
              </div>
              {schoolName}
            </h1>
            <p className="text-gray-500 font-medium">Principal Dashboard • Welcome, {profileName}</p>
          </div>
          <form action="/auth/signout" method="post">
            <button className="flex items-center text-red-600 hover:text-red-700 font-bold px-5 py-3 bg-red-50/50 rounded-xl transition-all duration-200 active:scale-[0.97] min-h-[44px]">
              <LogOut size={18} className="mr-2" /> Sign Out
            </button>
          </form>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 flex items-center shadow-sm">
            <div className="bg-indigo-50 p-4 rounded-xl mr-5">
              <Users className="text-indigo-600" size={28} />
            </div>
            <div>
              <p className="text-gray-500 font-semibold mb-1">Total Students</p>
              <h2 className="text-4xl font-black text-gray-900">{studentCount || 0}</h2>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-200 flex items-center shadow-sm">
            <div className="bg-orange-50 p-4 rounded-xl mr-5">
              <BookOpen className="text-orange-600" size={28} />
            </div>
            <div>
              <p className="text-gray-500 font-semibold mb-1">Total Teachers</p>
              <h2 className="text-4xl font-black text-gray-900">{teacherCount || 0}</h2>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-3 mb-4">
          <button onClick={() => setActiveTab('classes')} className={`px-6 py-2.5 rounded-xl font-semibold transition-all duration-200 active:scale-[0.97] border min-h-[44px] ${activeTab === 'classes' ? 'bg-[#4F46E5] text-white border-transparent shadow-sm' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}>Class Directory</button>
          <button onClick={() => setActiveTab('attendance')} className={`px-6 py-2.5 rounded-xl font-semibold transition-all duration-200 active:scale-[0.97] border min-h-[44px] ${activeTab === 'attendance' ? 'bg-[#4F46E5] text-white border-transparent shadow-sm' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}>Teacher Attendance</button>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
          {activeTab === 'classes' && (
            <>
              <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900">Manage Classes</h2>
                <button onClick={() => setShowAddClass(!showAddClass)} className="flex items-center text-indigo-600 bg-indigo-50 px-4 py-2 rounded-xl font-bold hover:bg-indigo-100 transition-all active:scale-[0.97] min-h-[44px]">
                  <Plus size={18} className="mr-1" /> Add Class
                </button>
              </div>

              {showAddClass && (
                <div className="p-6 border-b border-gray-100 bg-indigo-50/30">
                  <form onSubmit={handleAddClass} className="flex gap-4">
                    <input type="text" placeholder="Class Name (e.g. 6B)" required value={newClass.class_name} onChange={e => setNewClass({...newClass, class_name: e.target.value})} className="flex-1 border border-gray-200 p-3.5 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" />
                    <input type="text" placeholder="Teacher Name" required value={newClass.teacher_name} onChange={e => setNewClass({...newClass, teacher_name: e.target.value})} className="flex-1 border border-gray-200 p-3.5 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" />
                    <button type="submit" disabled={isSubmitting} className="bg-indigo-600 text-white px-6 py-3.5 rounded-xl font-bold hover:bg-indigo-700 active:scale-[0.97] min-h-[44px]">
                      {isSubmitting ? 'Adding...' : 'Save'}
                    </button>
                  </form>
                </div>
              )}

              <div className="p-6">
                {(!classes || classes.length === 0) ? (
                  <p className="text-gray-500 text-center py-10 font-medium">No classes added yet.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {classes.map((c, i) => (
                      <Link href={`/principal/class/${c.class_name || c.class_id}`} key={i} className="block group">
                        <div className="border border-gray-200 p-5 rounded-2xl flex flex-col items-start bg-gray-50/50 hover:bg-white hover:border-indigo-200 cursor-pointer transition-all duration-200 active:scale-[0.97] h-full">
                          <span className="bg-indigo-50 text-indigo-700 font-bold px-3.5 py-1.5 rounded-xl text-sm mb-3">Class {c.class_name || c.class_id}</span>
                          <span className="font-bold text-gray-800 text-lg">{c.teacher_name || c.name}</span>
                          <span className="text-sm text-gray-500 mt-1 font-medium">Class Teacher</span>
                          <div className="mt-5 text-sm font-bold text-indigo-600 flex items-center group-hover:translate-x-1 transition-transform">
                            Manage Class &rarr;
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {activeTab === 'attendance' && (
            <>
              <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                <h2 className="text-xl font-bold text-gray-900">Today's Teacher Attendance</h2>
                <p className="text-sm text-gray-500 mt-1">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
              </div>
              <div className="p-6">
                {(!teacherAttendance || teacherAttendance.length === 0) ? (
                  <p className="text-gray-500 text-center py-10 font-medium">No teachers have marked attendance today.</p>
                ) : (
                  <ul className="space-y-3">
                    {teacherAttendance.map((ta, i) => (
                      <li key={i} className="p-4 border border-gray-100 rounded-xl bg-gray-50 flex justify-between items-center">
                        <div>
                          <p className="font-bold text-gray-900">{ta.profiles?.name || 'Unknown Teacher'}</p>
                          <p className="text-sm text-gray-500">Class {ta.profiles?.class_id || 'N/A'}</p>
                        </div>
                        <span className="bg-green-100 text-green-700 font-bold px-4 py-2 rounded-lg text-sm">Present</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
