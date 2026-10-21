import { THEME_KEY } from "@/lib/theme-key";

/**
 * Runs in <head> before first paint:
 * - Adds `motion-ok` to <html> when JavaScript is available and the visitor
 *   has not asked for reduced motion. CSS only hides entrance targets under
 *   this class, so without JS (or with reduced motion) everything renders
 *   visible immediately: no flash, no invisible content.
 * - Applies the light / dark theme (saved choice, else the system setting),
 *   so the page never flashes the wrong theme. See lib/theme.ts.
 */
export const PRE_PAINT_SCRIPT = `(function(){var r=document.documentElement;try{if(!window.matchMedia('(prefers-reduced-motion: reduce)').matches){r.classList.add('motion-ok')}}catch(e){}try{var p=localStorage.getItem('${THEME_KEY}');var d=p==='dark'||(p!=='light'&&window.matchMedia('(prefers-color-scheme: dark)').matches);if(d){r.classList.add('dark')}r.style.colorScheme=d?'dark':'light'}catch(e){}})();`;
