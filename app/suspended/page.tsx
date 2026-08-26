import { AlertOctagon } from 'lucide-react';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export default async function SuspendedPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-sm border text-center">
        <AlertOctagon size={48} className="text-red-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Service Suspended</h1>
        <p className="text-gray-600 mb-8">
          Access to School Saathi for your institution has been temporarily paused. Please contact administration or support for more details.
        </p>
        
        {user && (
          <form action="/auth/signout" method="post">
            <button type="submit" className="text-indigo-600 font-medium hover:underline">
              Sign out
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
