export default function FormElements() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-card border-b border-border px-8 py-4">
        <h1 className="text-foreground text-[24px] font-bold">Form Elements</h1>
        <p className="text-muted-foreground text-[14px] mt-1">Form inputs and controls</p>
      </div>

      {/* Content */}
      <div className="p-8">
        <div className="bg-card rounded-2xl p-6 border border-border max-w-2xl">
          <h3 className="text-foreground text-[18px] font-bold mb-6">Sample Form</h3>
          
          <form className="space-y-5">
            {/* Text Input */}
            <div>
              <label className="block text-muted-foreground text-[13px] font-medium mb-2">
                Full Name
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                placeholder="Enter your name"
              />
            </div>

            {/* Email Input */}
            <div>
              <label className="block text-muted-foreground text-[13px] font-medium mb-2">
                Email Address
              </label>
              <input
                type="email"
                className="w-full px-4 py-3 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                placeholder="Enter your email"
              />
            </div>

            {/* Select */}
            <div>
              <label className="block text-muted-foreground text-[13px] font-medium mb-2">
                Category
              </label>
              <select className="w-full px-4 py-3 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground">
                <option>Select an option</option>
                <option>Option 1</option>
                <option>Option 2</option>
                <option>Option 3</option>
              </select>
            </div>

            {/* Textarea */}
            <div>
              <label className="block text-muted-foreground text-[13px] font-medium mb-2">
                Message
              </label>
              <textarea
                rows={4}
                className="w-full px-4 py-3 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                placeholder="Enter your message"
              ></textarea>
            </div>

            {/* Checkbox */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                className="w-4 h-4 rounded bg-card border-border accent-primary"
              />
              <label className="text-muted-foreground text-[13px]">I agree to the terms and conditions</label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-all shadow-sm"
            >
              Submit Form
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
