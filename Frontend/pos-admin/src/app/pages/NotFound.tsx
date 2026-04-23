export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#141422]">
      <div className="text-center">
        <h1 className="text-[120px] font-bold bg-gradient-to-r from-[#667eea] to-[#764ba2] bg-clip-text text-transparent">
          404
        </h1>
        <h2 className="text-white text-[32px] font-bold mb-4">Page Not Found</h2>
        <p className="text-gray-400 text-[16px] mb-8">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <a
          href="/dashboard"
          className="inline-block px-6 py-3 bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white rounded-lg font-medium hover:shadow-lg transition-all"
        >
          Back to Dashboard
        </a>
      </div>
    </div>
  );
}
