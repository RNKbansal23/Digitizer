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
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <header className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border">
          <div>
            <h1 className="text-2xl font-black text-gray-900 flex items-center">
              <Building className="mr-2 text-indigo-600" />
              {schoolName} - Principal Dashboard
            </h1>
            <p className="text-gray-500">Welcome, {profile.name}</p>
          </div>
          <form action="/auth/signout" method="post">
            <button className="flex items-center text-red-600 hover:text-red-800 font-medium px-4 py-2 bg-red-50 rounded-lg">
              <LogOut size={18} className="mr-2" /> Sign Out
            </button>
          </form>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Stats Cards */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border flex items-center">
            <div className="bg-indigo-50 p-4 rounded-xl mr-4">
              <Users className="text-indigo-600" size={32} />
            </div>
            <div>
              <p className="text-gray-500 font-medium">Total Students</p>
              <h2 className="text-3xl font-black text-gray-900">{studentCount || 0}</h2>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border flex items-center">
            <div className="bg-orange-50 p-4 rounded-xl mr-4">
              <BookOpen className="text-orange-600" size={32} />
            </div>
            <div>
              <p className="text-gray-500 font-medium">Total Teachers</p>
              <h2 className="text-3xl font-black text-gray-900">{teacherCount || 0}</h2>
            </div>
          </div>
        </div>

        {/* Classes Directory */}
        <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
          <div className="p-6 border-b bg-gray-50">
            <h2 className="text-lg font-bold text-gray-900">Class Directory</h2>
          </div>
          <div className="p-6">
            {(!classes || classes.length === 0) ? (
              <p className="text-gray-500 text-center py-8">No classes or teachers assigned yet.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {classes.map((c, i) => (
                  <Link href={`/principal/class/${c.class_id}`} key={i} className="block">
                    <div className="border p-4 rounded-xl flex flex-col items-start bg-white hover:border-indigo-500 hover:shadow-md cursor-pointer transition-all h-full">
                      <span className="bg-indigo-100 text-indigo-800 font-bold px-3 py-1 rounded-full text-sm mb-2">Class {c.class_id}</span>
                      <span className="font-medium text-gray-800">{c.name}</span>
                      <span className="text-xs text-gray-500 mt-1">Class Teacher</span>
                      <div className="mt-4 text-sm font-semibold text-indigo-600 flex items-center">
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
