import { Link } from 'react-router';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6">
      <div className="text-center max-w-lg">
        <h1 className="text-[100px] font-bold leading-none text-primary">404</h1>
        <h2 className="text-foreground text-[26px] font-bold mb-3 mt-4">Page Not Found</h2>
        <p className="text-muted-foreground text-[15px] mb-8">
          The page you are looking for does not exist or has been moved.
        </p>
        <Link
          to="/dashboard"
          className="inline-block px-8 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors shadow-sm"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
