//InfoModal für beschreibung wie die mahlzeit zzsammenstellung funktioniert.. soll bisschen die logik aus dem backend erläutern.
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function InfoModal({
  isOpen,
  onClose,
}: Readonly<InfoModalProps>) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-100 flex items-center justify-center bg-black/50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 relative mx-4"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <button
              onClick={onClose}
              className="absolute top-3 right-3 text-neutral-500 hover:text-neutral-800"
              aria-label="Schließen"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold text-neutral-800 mb-4">
              Wie funktioniert die Mahlzeiten-Zusammenstellung?
            </h2>
            <div className="text-sm text-neutral-700 space-y-3">
              <p>
                Aus deinem Profil (Gewicht, Ziel, Aktivität) wird dein täglicher
                Kalorien- und Proteinbedarf berechnet. Dieser wird auf mehrere
                Mahlzeiten verteilt – z.B. 40%, 30%, 30%.
              </p>
              <p>
                Für jede dieser Mahlzeiten sucht das System passende Rezepte,
                die sowohl zum Kalorien- als auch zum Proteinanteil passen und
                deiner Ernährungsform entsprechen (z.B. vegan).
              </p>
              <p>
                <strong>1. Fallback:</strong> Falls keine komplette Mahlzeit
                gefunden wird (weil zB. die Kalorienmenge zu hoch war, und es
                dafür kein Rezept gibt..), wird sie in kleinere Teilmahlzeiten
                aufgeteilt (z.B. „Mahlzeit 1a“, „1b“, „1c“), damit das System
                flexibler passende Rezepte kombinieren kann.
              </p>
              <p>
                <strong>2. Fallback:</strong> Wenn selbst für die Teilmahlzeiten
                kein Rezept mit ausreichendem Protein gefunden wird, wird
                zumindest ein Rezept angezeigt, das nur den Kalorienwert erfüllt
                – ohne Proteinziel.
              </p>
              <p>
                Diese Fälle sind im Plan gekennzeichnet, damit du weißt, wo
                eventuell nachgebessert werden sollte.
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
