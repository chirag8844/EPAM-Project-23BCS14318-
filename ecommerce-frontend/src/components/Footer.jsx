export default function Footer() {
  return (
    <footer className="py-12 border-t border-white/10 text-center">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-center items-center gap-6 md:gap-12 text-gray-400 text-sm font-medium mb-6">
          <a href="mailto:support@multivendor.com" className="hover:text-white transition-colors">support@multivendor.com</a>
          <a href="tel:+91XXXXXXXXXX" className="hover:text-white transition-colors">+91 XXXXX XXXXX</a>
        </div>
        
        <p className="text-gray-500 text-xs tracking-widest uppercase">
          &copy; 2026 MultiVendor. All rights reserved.
        </p>
      </div>
    </footer>
  );
}