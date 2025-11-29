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
            <Link href="/" className="text-sm font-medium text-slate-600 hover:text-blue-600">
              Back to Tool
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-extrabold text-slate-900 mb-2">How to use Job Tuner</h1>
        <p className="text-lg text-slate-500 mb-10">
          A simple guide to writing the perfect Job Description (JD).
        </p>

        <div className="space-y-8">
          
          {/* Section 1 */}
          <section className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
            <h2 className="text-2xl font-bold text-blue-700 mb-4">1. How do I get a "Perfect" Score?</h2>
            <p className="text-slate-600 mb-4 leading-relaxed">
              Our engine checks your text against 3 pillars of a successful job post. To get a score of 100, you need to satisfy all three:
            </p>
            <ul className="space-y-4">
              <li className="flex gap-3">
                <span className="bg-blue-100 text-blue-700 font-bold px-2 py-1 rounded text-xs h-fit mt-1">SEO</span>
                <div>
                  <strong className="block text-slate-800">Can Google find it?</strong>
                  <span className="text-sm text-slate-500">We check if your Job Title is standard (e.g., "Sales Manager" instead of "Sales Ninja") and if the title appears in the first paragraph.</span>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="bg-amber-100 text-amber-700 font-bold px-2 py-1 rounded text-xs h-fit mt-1">READABILITY</span>
                <div>
                  <strong className="block text-slate-800">Is it easy to scan?</strong>
                  <span className="text-sm text-slate-500">Candidates scan JDs in 6 seconds. We flag "Walls of Text" (long paragraphs) and ensure you use bullet points. We also check if you talk about "You" (the candidate) more than "Us" (the company).</span>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="bg-red-100 text-red-700 font-bold px-2 py-1 rounded text-xs h-fit mt-1">RISK</span>
                <div>
                  <strong className="block text-slate-800">Is it legal & inclusive?</strong>
                  <span className="text-sm text-slate-500">We scan for 50+ toxic terms, gendered language (e.g., "Salesman"), and ageism signals (e.g., "Digital Native") that could get your company sued or ignored.</span>
                </div>
              </li>
            </ul>
          </section>

          {/* Section 2 */}
          <section className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Frequently Asked Questions</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-slate-800 mb-2">What does the "Auto-Tune" button do?</h3>
                <p className="text-sm text-slate-600">
                  It automatically replaces bad words with professional ones (e.g., swapping "Ninja" for "Specialist") and fixes formatting issues like missing spaces in bullet points.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-slate-800 mb-2">Why does "Word Count" matter?</h3>
                <p className="text-sm text-slate-600">
                  Data shows that JDs between 300-1000 words get the most applications. Too short, and candidates don't trust it. Too long, and they don't read it.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-slate-800 mb-2">My score is red (High Risk). What should I do?</h3>
                <p className="text-sm text-slate-600">
                  Don't panic. Switch to the <strong>"Audit View"</strong> tab. Click on the highlighted words to see why they were flagged, or click <strong>"Auto-Tune"</strong> to let us fix the basics for you.
                </p>
              </div>
            </div>
          </section>

           {/* Call to Action */}
           <div className="bg-blue-600 p-8 rounded-xl shadow-lg text-center text-white">
            <h3 className="text-xl font-bold mb-2">Ready to fix your JD?</h3>
            <p className="mb-6 text-blue-100">Go back to the editor and paste your text to get started.</p>
            <Link href="/" className="bg-white text-blue-700 font-bold py-3 px-8 rounded-full hover:bg-blue-50 transition-colors">
              Open Editor
            </Link>
          </div>

        </div>
      </div>
    </main>
  );
}