export function MobileApp() {
  return (
    <section className="py-16 px-6 bg-[#faf8f3]">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <h2 className="text-4xl lg:text-5xl font-bold leading-tight">
            Never Feel Hungry!<br />
            Download Our Mobile App<br />
            Enjoy Delicious Foods
          </h2>
          
          <p className="text-gray-600">
            Make online reservations, read restaurant reviews from diners, and earn points towards free meals. OpenTable is a real-time online reservation.
          </p>
          
          <div className="flex gap-4">
            <button className="px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 flex items-center gap-2">
              <span className="text-2xl">🍎</span>
              <div className="text-left">
                <div className="text-xs">Download on the</div>
                <div className="font-bold">App Store</div>
              </div>
            </button>
            <button className="px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 flex items-center gap-2">
              <span className="text-2xl">📱</span>
              <div className="text-left">
                <div className="text-xs">GET IT ON</div>
                <div className="font-bold">Google Play</div>
              </div>
            </button>
          </div>
        </div>
        
        <div className="relative">
          <div className="bg-white rounded-3xl p-8 shadow-2xl max-w-sm mx-auto">
            <div className="bg-amber-400 rounded-2xl p-6 mb-4">
              <h3 className="font-bold text-xl mb-2">We Serve The Test You Love</h3>
              <p className="text-sm text-gray-700">Discover delicious foods near you</p>
            </div>
            
            <div className="space-y-4">
              <div className="bg-gray-100 rounded-xl p-4">
                <div className="font-bold mb-2">Special Offers 🎉</div>
                <p className="text-sm text-gray-600">Get 20% off on your first order</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-100 rounded-xl p-4 text-center">
                  <div className="text-3xl mb-2">🍔</div>
                  <div className="text-sm font-medium">Burgers</div>
                </div>
                <div className="bg-gray-100 rounded-xl p-4 text-center">
                  <div className="text-3xl mb-2">🍕</div>
                  <div className="text-sm font-medium">Pizza</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
