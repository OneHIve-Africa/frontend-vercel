import React from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Props = {
  popupModal: boolean;
  setPopupModal: (val: boolean) => void;
  children: React.ReactNode;
  outClickCancel?: boolean;
};

const Modal: React.FC<Props> = ({
  popupModal,
  setPopupModal,
  outClickCancel = false,
  children,
}) => {
  const handleBackgroundClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && outClickCancel) {
      setPopupModal(false);
    }
  };

  return (
    <AnimatePresence>
      {popupModal && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={handleBackgroundClick}
          role="dialog"
          aria-modal="true"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white rounded-[13px] w-fit p-6 shadow-lg relative"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <button
              onClick={() => setPopupModal(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 cursor-pointer"
              aria-label="Close modal"
            >
              <X />
            </button>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Modal;
