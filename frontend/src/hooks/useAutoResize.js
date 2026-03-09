import { useEffect } from "react";

/**
 * Hook de redimensionnement automatique d'un textarea
 * Ajuste la hauteur de l'élément à son contenu à chaque saisie
 * @param {React.RefObject<HTMLTextAreaElement>} ref - Référence vers le textarea à redimensionner
 */
export function useAutoResize(ref) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    function resize() {
      // Remet à "auto" pour recalculer correctement scrollHeight
      el.style.height = "auto";
      el.style.height = el.scrollHeight + "px";
    }

    el.addEventListener("input", resize);
    // Applique le redimensionnement initial au montage
    resize();
    return () => el.removeEventListener("input", resize);
  }, [ref]);
}
