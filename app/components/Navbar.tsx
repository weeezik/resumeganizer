import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="flex items-center justify-between bg-white rounded-xl mt-6 mx-8 px-8 py-4 shadow-sm">
      <Link href="/landing" className="text-2xl font-medium text-gray-900 hover:underline">Resumeganizer</Link>
      <div className="flex gap-8 text-lg font-normal text-gray-900">
        <Link href="/resumes" className="hover:underline">Resumes</Link>
        <Link href="/auth" className="hover:underline">Login/Signup</Link>
      </div>
    </nav>
  );
} 