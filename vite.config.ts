import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { crx } from '@crxjs/vite-plugin'
import manifest from './manifest.json'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    svelte(),
    crx({ manifest }),
  ],
  build: {
    rollupOptions: {
      input: {
        offscreen: resolve(__dirname, 'src/offscreen.html'),
      },
    },
  },
})
