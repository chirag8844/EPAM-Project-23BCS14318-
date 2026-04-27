import { motion } from "framer-motion";

const Contact = () => {
  return (
    <div
      className="text-white min-h-screen relative overflow-hidden flex flex-col justify-center py-20"
      style={{
        backgroundImage: "url('/images/bg.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md -z-10" />

      <div className="max-w-4xl mx-auto px-6 relative z-10 w-full mt-10">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex flex-col justify-center text-center"
        >
          <h1 className="text-5xl md:text-6xl font-black mb-6 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            Contact Us
          </h1>

          <p className="!text-white text-lg mb-12 font-light leading-relaxed">
            Have a question, feedback, or need help with your order? Our support
            team is here for you. Reach out to us anytime.
          </p>

          <div className="space-y-10">
            <div className="flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-2xl">
                📍
              </div>
              <div>
                <h4 className="text-xl font-bold">Our Address</h4>
                <p className="text-gray-400 mt-1">
                  123 MultiVendor, Tech City, Mohali, Punjab 160059
                </p>
              </div>
            </div>

            <div className="flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-2xl">
                ✉️
              </div>
              <div>
                <h4 className="text-xl font-bold">Email Us</h4>
                <p className="text-gray-400 mt-1">
                  support@multivendor.com
                </p>
              </div>
            </div>

            <div className="flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-full bg-pink-500/20 text-pink-400 flex items-center justify-center text-2xl">
                📞
              </div>
              <div>
                <h4 className="text-xl font-bold">Call Us</h4>
                <p className="text-gray-400 mt-1">
                  +91 9350404710
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Contact;