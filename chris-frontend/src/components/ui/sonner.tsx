import type { ToasterProps } from "sonner";
import { Toaster as Sonner } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="dark"
      closeButton
      toastOptions={{
        classNames: {
          toast:
            "bg-stone-900/80 border-stone-800/90 text-stone-300 backdrop-blur-sm",
          title: "text-stone-200 font-medium tracking-tight",
          description: "text-stone-400",
          icon: "text-[hsl(var(--primary))]",
          closeButton:
            "bg-stone-800/50 hover:bg-stone-700/60 border-stone-700/80 text-stone-400",
        },
      }}
      className="toaster"
      {...props}
    />
  );
};

export { Toaster };
