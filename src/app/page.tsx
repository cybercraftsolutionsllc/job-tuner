import JobEditor from "../components/JobEditor";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 py-4 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold text-blue-600">Job Tuner</h1>
          <span className="text-sm text-gray-500">Conversion & Risk Audit</span>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-grow p-6">
        <div className="max-w-7xl mx-auto h-full">
          <JobEditor />
        </div>
      </div>
    </main>
  );
}