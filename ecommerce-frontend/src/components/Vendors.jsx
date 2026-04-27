import { motion } from "framer-motion";

const vendors = [
  { id: 1, name: "Elite Electronics", rating: 4.9, icon: "⚡" },
  { id: 2, name: "Fashion Hub", rating: 4.8, icon: "👗" },
  { id: 3, name: "Home Decors", rating: 4.7, icon: "🏠" },
];

export default function Vendors() {
  return (
    <section className="py-24 px-10 relative overflow-hidden">
      <h2 className="text-4xl font-black mb-16 text-center text-white">
        Top{" "}
        <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Trusted
        </span>{" "}
        Vendors
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
        {vendors.map((v) => (
          <motion.div
            key={v.id}
            whileHover={{ y: -5, scale: 1.05 }}
            className="group relative p-8 bg-white/10 backdrop-blur-lg border border-white/10 rounded-3xl overflow-hidden shadow-2xl transition-all duration-300"
          >
            {/* Hover Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="relative z-10 text-center">
              <div className="text-5xl mb-4 grayscale group-hover:grayscale-0 transition duration-500">{v.icon}</div>
              <h3 className="text-2xl font-bold text-white mb-2">{v.name}</h3>
              <div className="flex justify-center items-center gap-1 text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className={`w-5 h-5 ${i < Math.floor(v.rating) ? 'fill-current' : 'text-gray-600'}`} viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
                <span className="text-white ml-2 text-sm font-semibold">{v.rating}</span>
              </div>
            </div>
            
            {/* Animated Border Line */}
            <div className="absolute bottom-0 left-0 w-0 h-1 bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500 group-hover:w-full" />
          </motion.div>
        ))}
      </div>
    </section>
  );
}