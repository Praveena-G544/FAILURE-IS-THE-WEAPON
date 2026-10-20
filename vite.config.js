// Build (GitHub Pages) is served under /FAILURE-IS-THE-WEAPON/ ; local dev stays at http://localhost:5173/
import {defineConfig} from 'vite';
export default defineConfig(({command})=>({base:command==='build'?'/FAILURE-IS-THE-WEAPON/':'/'}));
