import Link from "next/link";
import JobEditor from "../components/JobEditor";
import { SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      {/* Header / Nav */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">⚡</span>
            <span className="font-bold text-xl tracking-tight text-blue-700">Job Tuner</span>
          </div>
          
          <div className="flex items-center gap-6">
            <Link href="/faq" className="text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors">
              How It Works
            </Link>
            
            {/* AUTH BUTTONS */}
            <div className="flex items-center gap-4">
              <SignedOut>
                <SignInButton mode="modal">
                  <button className="text-sm font-bold text-slate-600 hover:text-blue-600">
                    Sign In
                  </button>
                </SignInButton>
              </SignedOut>

              <SignedIn>
                <UserButton />
              </SignedIn>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="bg-blue-700 text-white py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">
            Stop Posting "Generic" Job Descriptions.
          </h1>
          <p className="text-blue-100 text-lg max-w-2xl mx-auto">
            Paste your JD below. We'll scan it for <span className="font-bold text-white">bias</span>, <span className="font-bold text-white">readability</span>, and <span className="font-bold text-white">SEO risks</span> in real-time.
          </p>
        </div>
      </div>

      {/* Main App Area */}
      <div className="flex-grow p-4 sm:p-8 -mt-8">
        <div className="max-w-7xl mx-auto">
          <JobEditor />
        </div>
      </div>

      {/* Footer Instructions */}
      <footer className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-slate-600 text-sm">
        <div>
          <h4 className="font-bold text-slate-900 mb-2">🔍 1. SEO Check</h4>
          <p>We analyze keyword density and title clarity to ensure your job appears in Google Jobs searches.</p>
        </div>
        <div>
          <h4 className="font-bold text-slate-900 mb-2">👁️ 2. Readability</h4>
          <p>We flag "walls of text" and self-centered language ("We" vs "You") that lower conversion rates.</p>
        </div>
        <div>
          <h4 className="font-bold text-slate-900 mb-2">⚖️ 3. Risk Audit</h4>
          <p>We detect gendered language, ageism, and toxic "hustle culture" signals that create liability.</p>
        </div>
      </footer>
    </main>
  );
}