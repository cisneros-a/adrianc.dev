// Shared by the root layout (built ahead of time) and the theme toggle (browser),
// so this file has no "use client" marker.

export const THEME_KEY = "todo-plus:theme";

/**
 * Runs in <head> before the page is drawn, so a saved choice applies with no flash (TD12).
 * Kept as a plain string because it runs before React loads.
 */
export const THEME_SCRIPT = `(function(){try{var t=localStorage.getItem("${THEME_KEY}");if(t==="light"||t==="dark")document.documentElement.setAttribute("data-theme",t)}catch(e){}})()`;
