'use client';
import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-surface/90 backdrop-blur-md border-b border-outline-variant/10">
      <div className="flex justify-between items-center w-full px-6 md:px-12 py-5 max-w-[1440px] mx-auto">
        <div className="flex items-center gap-12">
          <Link href="/" className="text-2xl font-headline font-normal tracking-tighter text-primary">
            Tripneo
          </Link>
          <div className="hidden lg:flex items-center gap-8 font-label text-sm uppercase tracking-widest font-semibold">
            <Link href="/flights" className="text-secondary border-b border-secondary/20 pb-1">
              Book
            </Link>
            <Link href="#" className="text-primary/70 hover:text-secondary transition-colors duration-300">
              Manage
            </Link>
            <Link href="#" className="text-primary/70 hover:text-secondary transition-colors duration-300">
              Experience
            </Link>
            <Link href="#" className="text-primary/70 hover:text-secondary transition-colors duration-300">
              Loyalty
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <button className="text-[10px] uppercase tracking-[0.2em] text-primary border border-primary/20 px-6 py-2.5 hover:bg-primary hover:text-on-primary transition-all duration-500 font-semibold">
            Inquiry
          </button>
          <span className="material-symbols-outlined text-primary cursor-pointer text-[22px]">
            account_circle
          </span>
        </div>
      </div>
    </nav>
  );
}
