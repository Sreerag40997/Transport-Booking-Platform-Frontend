import Footer from '@/components/layout/Footer';

export default function BusLayout({ children }) {
  return (
    <>
      <div className="flex-grow">
        {children}
      </div>
      <Footer />
    </>
  );
}
