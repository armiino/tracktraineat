import React from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

interface HeroScreenProps {
  readonly onStart: () => void;
}

export default function HeroScreen({ onStart }: HeroScreenProps) {
  return (
    <section className="min-h-screen flex items-center justify-center bg-gradient-to-b from-zinc-100 to-zinc-200 px-4 text-center">
      <div className="w-full max-w-2xl flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          whileHover={{ scale: 1.01 }}
          className="w-full mb-10"
        >
          <img
            src="/hero-image.jpg"
            alt="Hero"
            className="w-full rounded-xl shadow-lg"
          />
        </motion.div>

        <motion.h1
          className="text-4xl sm:text-5xl font-extrabold text-zinc-800 mb-6 leading-tight"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          Track easy. <br />
          Train hard. <br />
          Eat good.
        </motion.h1>

        <motion.p
          className="text-zinc-600 text-lg max-w-xl mb-8 leading-relaxed"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          Dein smarter Einstieg in Sport, Ernährung und Happiness!
        </motion.p>

        <motion.button
          onClick={onStart}
          className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-900 text-white text-lg font-medium px-6 py-3 rounded-xl shadow-md hover:shadow-xl transition-all duration-200"
          whileTap={{ scale: 0.96 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          Starten
          <ArrowRight size={20} />
        </motion.button>
      </div>
    </section>
  );
}
