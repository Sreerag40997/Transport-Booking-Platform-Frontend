import Footer from '@/components/layout/Footer';

export default function FlightLayout({ children }) {
  return (
    <>
      <div className="flex-grow">
        {children}
      </div>
      <Footer />
    </>
  );
}
