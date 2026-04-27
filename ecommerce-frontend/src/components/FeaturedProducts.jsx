import { motion } from "framer-motion";

const items = [
  { id: 1, name: "Premium Smartphone", price: "₹84,999", img: "https://images.macrumors.com/t/q6mJocI2RjijaF8CV_NbzwIrFv0=/2500x0/filters:no_upscale()/article-new/2025/07/iPhone-17-Pro-Dark-Blue-and-Orange.jpg" },
  { id: 2, name: "Luxury Workstation", price: "₹1,25,000", img: "https://cdn.mos.cms.futurecdn.net/pCXX9UGDmE5UJJHM5a8ei4.jpg" },
  { id: 3, name: "Designer Collection", price: "₹5,499", img: "https://hips.hearstapps.com/hmg-prod/images/hoka-zinal-13085-1643565794.jpg" },
  { id: 4, name: "Smart Wearable", price: "₹12,999", img: "https://i.pinimg.com/736x/0c/e8/29/0ce8299f7b1c845d575f949b244ea238.jpg" },
];

export default function FeaturedProducts() {
  return (
    <section className="py-24 px-10">
      <h2 className="text-4xl font-black mb-16 text-center text-white tracking-tight">
        <span className="bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
          Featured
        </span>{" "}
        Collections
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {items.map((product) => (
          <motion.div
            key={product.id}
            whileHover={{ y: -10, scale: 1.02 }}
            className="group bg-white/10 backdrop-blur-xl border border-white/20 p-5 rounded-3xl shadow-2xl hover:shadow-cyan-500/20 transition-all duration-300"
          >
            <div className="relative overflow-hidden rounded-2xl aspect-square mb-5">
              <img
                src={product.img}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            
            <h3 className="text-xl font-bold text-white mb-2">{product.name}</h3>
            <div className="flex justify-between items-center">
              <p className="text-2xl font-black text-emerald-400">{product.price}</p>
              <button className="p-2 bg-white/10 rounded-full border border-white/20 text-white hover:bg-emerald-400 hover:text-black transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}