export default function UIElements() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-card border-b border-border px-8 py-4">
        <h1 className="text-foreground text-[24px] font-bold">Basic UI Elements</h1>
        <p className="text-muted-foreground text-[14px] mt-1">UI components and elements</p>
      </div>

      {/* Content */}
      <div className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Buttons */}
          <div className="bg-card rounded-2xl p-6 border border-border">
            <h3 className="text-foreground text-[18px] font-bold mb-4">Buttons</h3>
            <div className="space-y-3">
              <button type="button" className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90">
                Primary Button
              </button>
              <button type="button" className="w-full px-4 py-2 bg-secondary text-secondary-foreground rounded-lg border border-border hover:bg-secondary/80">
                Secondary Button
              </button>
              <button type="button" className="w-full px-4 py-2 bg-brand text-primary-foreground rounded-lg hover:bg-brand/90">
                Success Button
              </button>
            </div>
          </div>

          {/* Cards */}
          <div className="bg-card rounded-2xl p-6 border border-border">
            <h3 className="text-foreground text-[18px] font-bold mb-4">Cards</h3>
            <div className="space-y-3">
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-foreground text-[14px]">Sample Card Content</p>
              </div>
              <div className="p-4 bg-primary rounded-lg">
                <p className="text-primary-foreground text-[14px]">Accent Card</p>
              </div>
            </div>
          </div>

          {/* Badges */}
          <div className="bg-card rounded-2xl p-6 border border-border">
            <h3 className="text-foreground text-[18px] font-bold mb-4">Badges</h3>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-info text-primary-foreground text-[12px] rounded-full">Primary</span>
              <span className="px-3 py-1 bg-brand text-primary-foreground text-[12px] rounded-full">Success</span>
              <span className="px-3 py-1 bg-destructive text-destructive-foreground text-[12px] rounded-full">Danger</span>
              <span className="px-3 py-1 bg-primary text-primary-foreground text-[12px] rounded-full">Warning</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
