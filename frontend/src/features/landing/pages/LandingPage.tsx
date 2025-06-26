import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import HeroScreen from "../components/HeroScreen";
import HeroCalculator from "../components/HeroCalculator";

export default function LandingPage() {
  const [showCalculator, setShowCalculator] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 overflow-hidden">
      <AnimatePresence mode="wait">
        {!showCalculator ? (
          <motion.div
            key="hero"
            initial={{ x: 0, opacity: 1 }}
            exit={{ x: -1000, opacity: 0 }}
            transition={{ duration: 0.6 }}
          >
            <HeroScreen onStart={() => setShowCalculator(true)} />
          </motion.div>
        ) : (
          <motion.div
            key="calculator"
            initial={{ x: 1000, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <HeroCalculator />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
