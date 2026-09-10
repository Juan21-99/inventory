import * as Dialog from "@radix-ui/react-dialog";
import { motion, AnimatePresence } from "framer-motion";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  isDraggable?: boolean;
}

export default function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  isDraggable = true,
}: Readonly<ModalProps>) {
  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <AnimatePresence>
        {isOpen && (
          <Dialog.Portal forceMount>
            {/* Overlay */}
            <Dialog.Overlay asChild>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-[2px] z-50"
              />
            </Dialog.Overlay>

            {/* Content */}
            <Dialog.Content asChild>
              <motion.div
                initial={
                  isDraggable ? { y: "100%" } : { opacity: 0, scale: 0.95 }
                }
                animate={isDraggable ? { y: 0 } : { opacity: 1, scale: 1 }}
                exit={isDraggable ? { y: "100%" } : { opacity: 0, scale: 0.95 }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                {...(isDraggable && {
                  drag: "y",
                  dragConstraints: { top: 0 },
                  dragElastic: 0.2,
                  onDragEnd: (_, info) => {
                    if (info.offset.y > 100) {
                      onClose();
                    }
                  },
                })}
                className={`fixed left-[50%] z-[60] grid w-full sm:w-[90%] max-w-lg translate-x-[-50%] gap-5 border-white/10 bg-stone-950 p-6 shadow-2xl shadow-black/80 outline-none max-h-[90vh] overflow-y-auto scrollbar-hide ${
                  isDraggable
                    ? "bottom-0 sm:bottom-auto sm:top-[50%] sm:translate-y-[-50%] border-t sm:border sm:rounded-[2rem] rounded-t-[2rem] sm:touch-auto"
                    : "top-[50%] translate-y-[-50%] border rounded-[2rem] shadow-amber-500/5"
                }`}
              >
                {/* Drag Handle for Mobile */}
                {isDraggable && (
                  <div className="w-10 h-1 bg-stone-800 rounded-full mx-auto mb-1 sm:hidden shrink-0" />
                )}

                <div className="flex flex-col space-y-1.5 text-center sm:text-left pt-1">
                  <Dialog.Title
                    className={`text-xl font-black leading-none tracking-tighter text-white uppercase ${!title && "sr-only"}`}
                  >
                    {title || "Modal Title"}
                  </Dialog.Title>
                  <Dialog.Description
                    className={`text-xs font-medium text-stone-500 leading-none ${!description && "sr-only"}`}
                  >
                    {description || "Modal description content"}
                  </Dialog.Description>
                </div>

                <div className="py-1">{children}</div>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}
