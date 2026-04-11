'use client';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="w-full pt-24 pb-12 bg-white border-t border-outline-variant/10">
      <div className="flex flex-col items-center px-6 md:px-12 max-w-[1440px] mx-auto text-center">
        <div className="text-xl font-headline text-primary mb-12 tracking-tighter">Tripneo</div>
        <div className="flex flex-wrap justify-center gap-x-12 gap-y-6 mb-16">
          <Link href="#" className="font-body text-[10px] uppercase tracking-[0.2em] text-primary/40 hover:text-secondary transition-colors font-bold">
            Destinations
          </Link>
          <Link href="#" className="font-body text-[10px] uppercase tracking-[0.2em] text-primary/40 hover:text-secondary transition-colors font-bold">
            Fleet
          </Link>
          <Link href="#" className="font-body text-[10px] uppercase tracking-[0.2em] text-primary/40 hover:text-secondary transition-colors font-bold">
            Sustainability
          </Link>
          <Link href="#" className="font-body text-[10px] uppercase tracking-[0.2em] text-primary/40 hover:text-secondary transition-colors font-bold">
            Privacy
          </Link>
          <Link href="#" className="font-body text-[10px] uppercase tracking-[0.2em] text-primary/40 hover:text-secondary transition-colors font-bold">
            Terms
          </Link>
        </div>
        <div className="font-body text-[9px] uppercase tracking-[0.3em] text-primary/30 font-medium">
          © 2024 Tripneo Airways. The Digital Concierge.
        </div>
      </div>
    </footer>
  );
}
