// Compartido por el layout (servidor) y el selector de tema (cliente).

export const CLAVE_TEMA = "ypri:tema";
export const CONSULTA_OSCURO = "(prefers-color-scheme: dark)";

/**
 * Script que corre antes de pintar la página: aplica la clase "dark" según la
 * preferencia guardada o la del sistema, para que no haya un destello claro.
 */
export const SCRIPT_TEMA = `(function(){try{var t=localStorage.getItem("${CLAVE_TEMA}")||"sistema";var o=t==="oscuro"||(t==="sistema"&&matchMedia("${CONSULTA_OSCURO}").matches);document.documentElement.classList.toggle("dark",o)}catch(e){}})();`;
