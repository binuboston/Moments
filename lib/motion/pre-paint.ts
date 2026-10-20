/**
 * Runs in <head> before first paint. Adds `motion-ok` to <html> when JavaScript
 * is available and the visitor has not asked for reduced motion. CSS only hides
 * entrance targets under this class, so without JS (or with reduced motion)
 * everything renders visible immediately: no flash, no invisible content.
 */
export const PRE_PAINT_SCRIPT = `(function(){try{if(!window.matchMedia('(prefers-reduced-motion: reduce)').matches){document.documentElement.classList.add('motion-ok')}}catch(e){}})();`;
