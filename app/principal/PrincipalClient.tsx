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
  initialDate: string;
}

export default function PrincipalClient({ schoolId, schoolName, profileName, studentCount, teacherCount, classes, teacherAttendance, initialDate }: PrincipalClientProps) {
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
    <main className="min-h-screen bg-[#F8F9FC] p-4 md:p-8 font-sans text-slate-900">
      <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:justify-between sm:items-center bg-white p-4 md:p-6 rounded-xl border border-gray-200 gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <Building className="text-indigo-600" size={24} />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight leading-tight">{schoolName}</h1>
              <p className="text-sm text-slate-500 font-medium mt-0.5">Principal Dashboard • Welcome, {profileName}</p>
            </div>
          </div>
          <form action="/auth/signout" method="post" className="w-full sm:w-auto">
            <button className="w-full sm:w-auto flex items-center justify-center text-slate-600 hover:text-slate-900 bg-white border border-gray-200 hover:bg-gray-50 font-medium px-4 py-2 rounded-xl transition-colors min-h-[44px] md:min-h-[40px] text-sm">
              <LogOut size={16} className="mr-2" /> Sign Out
            </button>
          </form>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
          <div className="bg-white p-5 md:p-6 rounded-[20px] border border-gray-100 flex items-center shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
            <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center mr-4 flex-shrink-0">
              <Users className="text-amber-500" size={24} />
            </div>
            <div>
              <p className="text-xs md:text-sm text-slate-500 font-medium mb-0.5">Total Students</p>
              <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 leading-none">{studentCount || 0}</h2>
            </div>
          </div>
          <div className="bg-white p-5 md:p-6 rounded-[20px] border border-gray-100 flex items-center shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
            <div className="w-12 h-12 bg-coral-50 bg-[#FFF0EB] rounded-xl flex items-center justify-center mr-4 flex-shrink-0">
              <BookOpen className="text-[#FF7F50]" size={24} />
            </div>
            <div>
              <p className="text-xs md:text-sm text-slate-500 font-medium mb-0.5">Total Teachers</p>
              <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 leading-none">{teacherCount || 0}</h2>
            </div>
          </div>
        </div>

        {/* Segmented Control Tabs */}
        <div className="flex overflow-x-auto scrollbar-hide pb-1 -mb-1">
          <div className="flex p-1.5 bg-slate-100/80 rounded-2xl inline-flex min-w-max">
            <button 
              onClick={() => setActiveTab('classes')} 
              className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-all min-h-[40px] md:min-h-[36px] ${activeTab === 'classes' ? 'bg-white text-indigo-700 shadow-sm border border-gray-200/50' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}
            >
              Class Directory
            </button>
            <button 
              onClick={() => setActiveTab('attendance')} 
              className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-all min-h-[40px] md:min-h-[36px] ${activeTab === 'attendance' ? 'bg-white text-indigo-700 shadow-sm border border-gray-200/50' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}
            >
              Teacher Attendance
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="bg-white rounded-[20px] border border-gray-100 shadow-sm overflow-hidden">
          {activeTab === 'classes' && (
            <>
              <div className="p-4 md:p-6 border-b border-gray-50 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight">Manage Classes</h2>
                  <p className="text-sm text-slate-500 mt-1">View and manage all active classes.</p>
                </div>
                <button onClick={() => setShowAddClass(!showAddClass)} className="flex items-center justify-center text-white bg-indigo-600 hover:bg-indigo-700 px-5 py-2.5 rounded-xl font-bold transition-all duration-200 active:scale-[0.97] min-h-[44px] md:min-h-[40px] text-sm w-full sm:w-auto shadow-sm shadow-indigo-600/20">
                  <Plus size={16} className="mr-2" /> Add Class
                </button>
              </div>

              {showAddClass && (
                <div className="p-4 md:p-6 border-b border-gray-100 bg-slate-50/50">
                  <form onSubmit={handleAddClass} className="flex flex-col sm:flex-row gap-3">
                    <input type="text" placeholder="Class Name (e.g. 6B)" required value={newClass.class_name} onChange={e => setNewClass({...newClass, class_name: e.target.value})} className="flex-1 border border-gray-200 bg-white p-3 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm min-h-[44px] md:min-h-[40px] placeholder-slate-400 font-medium" />
                    <input type="text" placeholder="Teacher Name" required value={newClass.teacher_name} onChange={e => setNewClass({...newClass, teacher_name: e.target.value})} className="flex-1 border border-gray-200 bg-white p-3 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm min-h-[44px] md:min-h-[40px] placeholder-slate-400 font-medium" />
                    <button type="submit" disabled={isSubmitting} className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all duration-200 active:scale-[0.97] min-h-[44px] md:min-h-[40px] text-sm w-full sm:w-auto disabled:opacity-70 shadow-sm shadow-indigo-600/20">
                      {isSubmitting ? 'Saving...' : 'Save'}
                    </button>
                  </form>
                </div>
              )}

              <div className="p-4 md:p-6">
                {(!classes || classes.length === 0) ? (
                  <div className="text-slate-400 text-sm text-center py-16 flex flex-col items-center">
                    <BookOpen size={32} className="mb-3 opacity-20" />
                    <p className="font-medium">No classes added yet.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
                    {classes.map((c, i) => (
                      <Link href={`/principal/class/${c.class_name || c.class_id}`} key={i} className="block group">
                        <div className="border border-gray-100 p-6 rounded-[20px] flex flex-col bg-white hover:-translate-y-1 hover:shadow-lg hover:border-indigo-100 cursor-pointer transition-all duration-300 h-full relative overflow-hidden group-active:scale-[0.97]">
                          <div className="flex justify-between items-start mb-5">
                            <span className="bg-indigo-50 text-indigo-600 font-bold px-3 py-1.5 rounded-lg text-xs tracking-wide">Class {c.class_name || c.class_id}</span>
                          </div>
                          <span className="font-extrabold text-slate-900 text-lg tracking-tight">{c.teacher_name || c.name}</span>
                          <span className="text-sm text-slate-500 mt-1 font-medium">Class Teacher</span>
                          <div className="mt-6 text-sm font-bold text-amber-500 flex items-center group-hover:translate-x-1 transition-transform">
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
              <div className="p-4 md:p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Teacher Attendance</h2>
                  <p className="text-sm text-slate-500 mt-0.5">Select a date to view attendance logs.</p>
                </div>
                <input 
                  type="date" 
                  value={initialDate}
                  onChange={(e) => {
                    router.push(`?date=${e.target.value}`);
                  }}
                  className="border border-gray-200 bg-white rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 text-sm font-medium cursor-pointer min-h-[44px] md:min-h-[40px] w-full sm:w-auto"
                />
              </div>
              <div className="p-4 md:p-6">
                {(!teacherAttendance || teacherAttendance.length === 0) ? (
                  <p className="text-slate-500 text-sm text-center py-12">No teachers marked attendance on {new Date(initialDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}.</p>
                ) : (
                  <ul className="space-y-3 max-w-3xl">
                    {teacherAttendance.map((ta, i) => (
                      <li key={i} className="p-4 border border-gray-200 rounded-xl bg-white flex justify-between items-center hover:border-gray-300 transition-colors">
                        <div>
                          <p className="font-semibold text-slate-900 text-sm">{ta.profiles?.name || 'Unknown Teacher'}</p>
                          <p className="text-xs text-slate-500 mt-0.5">Class {ta.profiles?.class_id || 'N/A'}</p>
                        </div>
                        <span className="bg-emerald-50 text-emerald-700 font-medium px-3 py-1 rounded-lg text-xs border border-emerald-100/50">Present</span>
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
