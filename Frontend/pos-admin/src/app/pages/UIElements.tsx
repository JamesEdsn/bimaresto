export default function UIElements() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-[#1e1e2d] border-b border-[#2e2e3e] px-8 py-4">
        <h1 className="text-white text-[24px] font-bold">Basic UI Elements</h1>
        <p className="text-gray-400 text-[14px] mt-1">UI components and elements</p>
      </div>

      {/* Content */}
      <div className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Buttons */}
          <div className="bg-[#1e1e2d] rounded-2xl p-6 border border-[#2e2e3e]">
            <h3 className="text-white text-[18px] font-bold mb-4">Buttons</h3>
            <div className="space-y-3">
              <button className="w-full px-4 py-2 bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white rounded-lg">
                Primary Button
              </button>
              <button className="w-full px-4 py-2 bg-[#2a2a3a] text-white rounded-lg border border-[#3a3a4a]">
                Secondary Button
              </button>
              <button className="w-full px-4 py-2 bg-green-500 text-white rounded-lg">
                Success Button
              </button>
            </div>
          </div>

          {/* Cards */}
          <div className="bg-[#1e1e2d] rounded-2xl p-6 border border-[#2e2e3e]">
            <h3 className="text-white text-[18px] font-bold mb-4">Cards</h3>
            <div className="space-y-3">
              <div className="p-4 bg-[#2a2a3a] rounded-lg">
                <p className="text-white text-[14px]">Sample Card Content</p>
              </div>
              <div className="p-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                <p className="text-white text-[14px]">Gradient Card</p>
              </div>
            </div>
          </div>

          {/* Badges */}
          <div className="bg-[#1e1e2d] rounded-2xl p-6 border border-[#2e2e3e]">
            <h3 className="text-white text-[18px] font-bold mb-4">Badges</h3>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-blue-500 text-white text-[12px] rounded-full">Primary</span>
              <span className="px-3 py-1 bg-green-500 text-white text-[12px] rounded-full">Success</span>
              <span className="px-3 py-1 bg-red-500 text-white text-[12px] rounded-full">Danger</span>
              <span className="px-3 py-1 bg-yellow-500 text-white text-[12px] rounded-full">Warning</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
