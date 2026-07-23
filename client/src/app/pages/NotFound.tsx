import { Link } from "react-router";

export function NotFound() {
  return (
    <div className="pt-32 pb-32 min-h-screen bg-background text-foreground flex flex-col items-center justify-center">
      <h1 className="text-[clamp(6rem,15vw,15rem)] font-medium tracking-tighter leading-none mb-8 opacity-10">404</h1>
      <p className="text-xl font-light mb-12 tracking-wide text-center max-w-md px-6">
        The page you are looking for has been moved or no longer exists.
      </p>
      <Link 
        to="/" 
        className="border-b border-foreground text-sm font-medium tracking-widest uppercase pb-1 hover:text-muted-foreground hover:border-muted-foreground transition-all"
      >
        Return Home
      </Link>
    </div>
  );
}
