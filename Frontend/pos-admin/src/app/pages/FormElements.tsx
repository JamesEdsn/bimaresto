export default function FormElements() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-[#1e1e2d] border-b border-[#2e2e3e] px-8 py-4">
        <h1 className="text-white text-[24px] font-bold">Form Elements</h1>
        <p className="text-gray-400 text-[14px] mt-1">Form inputs and controls</p>
      </div>

      {/* Content */}
      <div className="p-8">
        <div className="bg-[#1e1e2d] rounded-2xl p-6 border border-[#2e2e3e] max-w-2xl">
          <h3 className="text-white text-[18px] font-bold mb-6">Sample Form</h3>
          
          <form className="space-y-5">
            {/* Text Input */}
            <div>
              <label className="block text-gray-300 text-[13px] font-medium mb-2">
                Full Name
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 bg-[#2a2a3a] border border-[#3a3a4a] rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                placeholder="Enter your name"
              />
            </div>

            {/* Email Input */}
            <div>
              <label className="block text-gray-300 text-[13px] font-medium mb-2">
                Email Address
              </label>
              <input
                type="email"
                className="w-full px-4 py-3 bg-[#2a2a3a] border border-[#3a3a4a] rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                placeholder="Enter your email"
              />
            </div>

            {/* Select */}
            <div>
              <label className="block text-gray-300 text-[13px] font-medium mb-2">
                Category
              </label>
              <select className="w-full px-4 py-3 bg-[#2a2a3a] border border-[#3a3a4a] rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white">
                <option>Select an option</option>
                <option>Option 1</option>
                <option>Option 2</option>
                <option>Option 3</option>
              </select>
            </div>

            {/* Textarea */}
            <div>
              <label className="block text-gray-300 text-[13px] font-medium mb-2">
                Message
              </label>
              <textarea
                rows={4}
                className="w-full px-4 py-3 bg-[#2a2a3a] border border-[#3a3a4a] rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                placeholder="Enter your message"
              ></textarea>
            </div>

            {/* Checkbox */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                className="w-4 h-4 rounded bg-[#2a2a3a] border-[#3a3a4a] text-purple-500"
              />
              <label className="text-gray-300 text-[13px]">I agree to the terms and conditions</label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white rounded-lg font-medium hover:shadow-lg transition-all"
            >
              Submit Form
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
