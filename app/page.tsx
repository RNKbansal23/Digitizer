import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="text-center max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border">
        <h1 className="text-3xl font-bold text-indigo-600 mb-2">School Digitizer</h1>
        <p className="text-gray-500 mb-8">Zero learning curve school management.</p>
        
        <Link 
          href="/teacher" 
          className="flex items-center justify-center w-full bg-indigo-600 text-white py-4 rounded-xl font-semibold text-lg hover:bg-indigo-700 transition"
        >
          Teacher Dashboard <ArrowRight className="ml-2" />
        </Link>
      </div>
    </main>
  );
}