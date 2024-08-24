import { defineConfig } from 'vite'
import kaioken from "vite-plugin-kaioken"
import dts from 'vite-plugin-dts';

export default defineConfig({
  build: {
    minify: false,
    lib: {
      entry: ['./lib/main.tsx'],
      name: 'inertia-kaioken',
      fileName: (extension, name) => extension === 'es'  ? `${name}.js` : `${name}.${extension}.js`,
    },

    rollupOptions: {
      external: ['kaioken', 'kaioken/utils', '@inertiajs/core'],
      output: {
        globals: {
          "kaioken": 'Kaioken',
          "kaioken/utils": 'Kaioken',
        },
      },
    },
  },
  plugins: [kaioken(), dts({
    rollupTypes: false,
    exclude: ['vite.config.ts']
  })]
})
