import { createClient } from '@/utils/supabase/server';
import { Users, BookOpen, LogOut, Building } from 'lucide-react';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function PrincipalDashboard() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('school_id, name, schools(name)')
    .eq('id', user.id)
    .single();

  if (!profile || !profile.school_id) {
    return <div>Profile error</div>;
  }

  const schoolData = Array.isArray(profile.schools) ? profile.schools[0] : profile.schools;
  const schoolName = schoolData?.name || 'School';

  // Fetch school stats
  const { count: studentCount } = await supabase
    .from('students')
    .select('*', { count: 'exact', head: true })
    .eq('school_id', profile.school_id);

  const { count: teacherCount } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('school_id', profile.school_id)
    .eq('role', 'teacher');

  const { data: classes } = await supabase
    .from('profiles')
    .select('class_id, name')
    .eq('school_id', profile.school_id)
    .eq('role', 'teacher')
    .order('class_id');

  return (
    <main className="min-h-screen bg-[#F5F7FF] p-6 font-sans text-gray-800">
      <div className="max-w-4xl mx-auto space-y-6">
        <header className="flex justify-between items-center bg-white p-6 rounded-2xl border border-gray-200">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 flex items-center mb-1">
              <div className="bg-indigo-50 p-2 rounded-xl mr-3">
                <Building className="text-indigo-600" size={24} />
              </div>
              {schoolName}
            </h1>
            <p className="text-gray-500 font-medium">Principal Dashboard • Welcome, {profile.name}</p>
          </div>
          <form action="/auth/signout" method="post">
            <button className="flex items-center text-red-600 hover:text-red-700 font-bold px-5 py-3 bg-red-50/50 rounded-xl transition-all duration-200 active:scale-[0.97] min-h-[44px]">
              <LogOut size={18} className="mr-2" /> Sign Out
            </button>
          </form>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Stats Cards */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 flex items-center transition-all duration-200 hover:border-indigo-100">
            <div className="bg-indigo-50 p-4 rounded-xl mr-5">
              <Users className="text-indigo-600" size={28} />
            </div>
            <div>
              <p className="text-gray-500 font-semibold mb-1">Total Students</p>
              <h2 className="text-4xl font-black text-gray-900">{studentCount || 0}</h2>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-200 flex items-center transition-all duration-200 hover:border-orange-100">
            <div className="bg-orange-50 p-4 rounded-xl mr-5">
              <BookOpen className="text-orange-600" size={28} />
            </div>
            <div>
              <p className="text-gray-500 font-semibold mb-1">Total Teachers</p>
              <h2 className="text-4xl font-black text-gray-900">{teacherCount || 0}</h2>
            </div>
          </div>
        </div>

        {/* Classes Directory */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-gray-50/50">
            <h2 className="text-xl font-bold text-gray-900">Class Directory</h2>
          </div>
          <div className="p-6">
            {(!classes || classes.length === 0) ? (
              <p className="text-gray-500 text-center py-10 font-medium">No classes or teachers assigned yet.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {classes.map((c, i) => (
                  <Link href={`/principal/class/${c.class_id}`} key={i} className="block group">
                    <div className="border border-gray-200 p-5 rounded-2xl flex flex-col items-start bg-gray-50/50 hover:bg-white hover:border-indigo-200 cursor-pointer transition-all duration-200 active:scale-[0.97] h-full min-h-[44px]">
                      <span className="bg-indigo-50 text-indigo-700 font-bold px-3.5 py-1.5 rounded-xl text-sm mb-3">Class {c.class_id}</span>
                      <span className="font-bold text-gray-800 text-lg">{c.name}</span>
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
        </div>
      </div>
    </main>
  );
}
