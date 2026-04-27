import { motion } from "framer-motion";

const features = [
  {
    title: "Multiple Sellers",
    desc: "Discover products from various trusted vendors worldwide.",
    icon: "🌍",
  },
  {
    title: "Secure Payments",
    desc: "Your transactions are encrypted and 100% safe.",
    icon: "🔒",
  },
  {
    title: "Product Management",
    desc: "Intuitive dashboards for vendors to manage stock easily.",
    icon: "📦",
  },
];

const About = () => {
  return (
    <div
      className="text-white min-h-screen relative overflow-hidden"
      style={{
        backgroundImage: "url('/images/bg.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      {/* Background Dimmer */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm -z-10" />

      {/* Hero Section */}
      <div className="flex flex-col items-center justify-center pt-32 pb-16 px-4 md:px-8 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl"
        >
          <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            About Us
          </h1>
          <p className="!text-white text-lg mb-12 font-light leading-relaxed">
            Welcome to our premier multi-vendor eCommerce platform. We are
            redefining the digital marketplace by empowering buyers and sellers
            globally. Experience seamless commerce, unmatched product variety,
            and industry-leading security—all in one place.
          </p>
        </motion.div>
      </div>

      {/* Mission & Vision */}
      <div className="max-w-7xl mx-auto px-6 py-12 grid md:grid-cols-2 gap-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="p-10 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl hover:bg-white/10 transition-colors shadow-2xl"
        >
          <div className="w-14 h-14 bg-blue-500/20 text-blue-400 rounded-2xl flex items-center justify-center text-3xl mb-6">
            🎯
          </div>
          <h2 className="text-3xl font-bold mb-4">Our Mission</h2>
          <p className="!text-white text-lg font-light leading-relaxed">
            To democratize eCommerce by providing a robust, scalable, and
            intuitive platform where vendors of all sizes can thrive, and
            customers can seamlessly discover and purchase products with
            complete peace of mind.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="p-10 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl hover:bg-white/10 transition-colors shadow-2xl"
        >
          <div className="w-14 h-14 bg-purple-500/20 text-purple-400 rounded-2xl flex items-center justify-center text-3xl mb-6">
            ✨
          </div>
          <h2 className="text-3xl font-bold mb-4">Our Vision</h2>
          <p className="!text-white text-lg font-light leading-relaxed">
            To become the world's most trusted and innovative multi-vendor
            marketplace, fostering a global community of diverse sellers and
            passionate buyers united by technology and convenience.
          </p>
        </motion.div>
      </div>

      {/* Features & Why Choose Us */}
      <div className="max-w-7xl mx-auto px-6 py-16 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-black mb-4">Why Choose Us</h2>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full"></div>
        </div>

        {/* ✅ Centered Cards */}
        <div className="flex flex-wrap justify-center gap-8">
          {features.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.6,
                delay: 0.2 + idx * 0.1,
              }}
              className="w-full sm:w-[80%] md:w-[45%] lg:w-[30%] bg-black/40 border border-white/10 p-8 rounded-2xl hover:-translate-y-2 transition-transform shadow-xl backdrop-blur-md text-center"
            >
              <div className="text-4xl mb-4">{item.icon}</div>
              <h3 className="text-xl font-bold mb-3">{item.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                {item.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default About;