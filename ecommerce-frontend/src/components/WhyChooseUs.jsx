import { motion } from "framer-motion";

const features = [
  { icon: "🚀", title: "Fast", desc: "Global shipping in record time", color: "from-blue-400 to-cyan-400" },
  { icon: "🛡️", title: "Secure", desc: "Military-grade payment protection", color: "from-purple-400 to-indigo-400" },
  { icon: "💎", title: "Reliable", desc: "Top-rated sellers & quality checks", color: "from-pink-400 to-rose-400" },
];

export default function WhyChooseUs() {
  return (
    <section className="py-24 px-10 text-center">
      <h2 className="text-4xl font-black mb-16 text-white tracking-widest uppercase">
        Why Choose Us
      </h2>

      <div className="flex flex-wrap justify-center gap-12">
        {features.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.2 }}
            className="flex flex-col items-center max-w-[200px]"
          >
            <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${item.color} flex items-center justify-center text-4xl shadow-lg shadow-white/5 mb-6 transform transition-transform hover:scale-110`}>
              {item.icon}
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">{item.title}</h3>
            <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}