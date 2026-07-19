import { Link } from "react-router";
import { MoveLeft } from "lucide-react";

export function NotFound() {
  return (
    <div className="min-h-screen pt-24 pb-16 bg-[#F5F1E8] flex items-center justify-center">
      <div className="container mx-auto px-4 max-w-2xl text-center">
        <h1 className="text-8xl md:text-9xl font-black font-['Playfair_Display'] text-[#C9A961] mb-6">404</h1>
        <h2 className="text-2xl md:text-3xl font-bold uppercase tracking-widest text-[#0A0A0A] mb-4">
          Page Not Found
        </h2>
        <p className="text-gray-500 mb-10 max-w-md mx-auto">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>
        <Link 
          to="/"
          className="inline-flex items-center gap-2 bg-[#0A0A0A] text-white px-8 py-4 text-sm font-bold uppercase tracking-widest hover:bg-[#C9A961] hover:text-[#0A0A0A] transition-colors"
        >
          <MoveLeft className="w-4 h-4" />
          Back to Home
        </Link>
      </div>
    </div>
  );
}
