import Link from "next/link";

export default function FAQ() {
  return (
    <main className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Header */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <span className="text-2xl">⚡</span>
            <span className="font-bold text-xl tracking-tight text-blue-700">Job Tuner</span>
          </Link>
          <div className="flex gap-4">
            <Link href="/" className="text-sm font-bold text-slate-600 hover:text-blue-600">
              Back to Editor
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-slate-900 mb-4">Mastering the Job Description</h1>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto">
            Job Tuner uses advanced AI to transform generic requirements into compelling, inclusive, and high-converting job posts.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          
          {/* Feature 1 */}
          <section className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
            <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center text-2xl mb-4">🎨</div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Tone & Voice Engine</h2>
            <p className="text-slate-600 leading-relaxed">
              Recruiting for a bank is different from recruiting for a startup. Use our **Pro Tones** to match your company culture:
            </p>
            <ul className="mt-4 space-y-2 text-sm text-slate-500">
              <li className="flex gap-2"><span>🚀</span> <strong>Startup:</strong> High energy, mission-driven.</li>
              <li className="flex gap-2"><span>👔</span> <strong>Corporate:</strong> Polished, professional, structured.</li>
              <li className="flex gap-2"><span>🤝</span> <strong>Inclusive:</strong> Focus on belonging and culture.</li>
            </ul>
          </section>

          {/* Feature 2 */}
          <section className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
            <div className="bg-emerald-100 w-12 h-12 rounded-lg flex items-center justify-center text-2xl mb-4">⚡</div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">The Credit System</h2>
            <p className="text-slate-600 leading-relaxed">
              We believe in fair pricing. You get **5 Free Credits** to try the AI.
            </p>
            <ul className="mt-4 space-y-2 text-sm text-slate-500">
              <li className="flex gap-2"><span>✨</span> <strong>1 Credit</strong> = 1 Full AI Rewrite or Expansion.</li>
              <li className="flex gap-2"><span>🔄</span> <strong>Free</strong> = Basic "Auto-Tune" (Grammar & Bias Swaps).</li>
              <li className="flex gap-2"><span>💎</span> <strong>Pro Plan</strong> = Unlimited generations & premium tones.</li>
            </ul>
          </section>
        </div>

        <div className="space-y-8">
          <section className="bg-slate-900 text-white p-8 rounded-2xl shadow-lg">
            <h2 className="text-2xl font-bold mb-6">How Scoring Works</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <span className="text-blue-400 font-bold tracking-wider text-xs uppercase block mb-2">SEO Score</span>
                <p className="text-slate-300 text-sm">Checks keyword density and title clarity. Ensures your job appears in Google Jobs searches.</p>
              </div>
              <div>
                <span className="text-amber-400 font-bold tracking-wider text-xs uppercase block mb-2">Readability</span>
                <p className="text-slate-300 text-sm">Flags "walls of text" and self-centered language ("We" vs "You"). Candidates scan JDs in 6 seconds.</p>
              </div>
              <div>
                <span className="text-rose-400 font-bold tracking-wider text-xs uppercase block mb-2">Risk Audit</span>
                <p className="text-slate-300 text-sm">Detects gendered language, ageism, and toxic "hustle culture" signals that create liability.</p>
              </div>
            </div>
          </section>

           {/* Call to Action */}
           <div className="text-center py-12">
            <h3 className="text-2xl font-bold text-slate-900 mb-4">Ready to write your best JD?</h3>
            <Link href="/" className="inline-flex items-center justify-center bg-blue-600 text-white font-bold py-4 px-10 rounded-full hover:bg-blue-700 transition-all transform hover:scale-105 shadow-xl hover:shadow-2xl">
              Go to Editor
            </Link>
          </div>

        </div>
      </div>
    </main>
  );
}