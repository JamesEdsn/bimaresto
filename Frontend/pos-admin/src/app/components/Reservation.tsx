import { ImageWithFallback } from './figma/ImageWithFallback';

export function Reservation() {
  return (
    <section className="py-16 px-6 bg-white">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <h2 className="text-4xl lg:text-5xl font-bold leading-tight">
            Do You Have Any Dinner<br />Plan Today? Reserve<br />Your Table
          </h2>
          
          <p className="text-gray-600">
            Make online reservations, read restaurant reviews from diners, and earn points towards free meals. OpenTable is a real-time online reservation network.
          </p>
          
          <button className="px-8 py-3 bg-amber-400 hover:bg-amber-500 rounded-full font-medium">
            Make Reservation
          </button>
        </div>
        
        <div className="relative">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1542627501-cadbb5b43ad7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb3JvY2NhbiUyMHRhZ2luZSUyMGRpc2h8ZW58MXx8fHwxNzcyNDM4Mjg3fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
            alt="Delicious dinner"
            className="w-full h-auto rounded-full max-w-md mx-auto"
          />
        </div>
      </div>
    </section>
  );
}
