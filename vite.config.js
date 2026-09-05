import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import { cloudflare } from '@cloudflare/vite-plugin';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [cloudflare()],
  environments: {
    client: {
      build: {
        rollupOptions: {
          input: {
            index: path.resolve(__dirname, 'index.html'),
            animalsWidget: path.resolve(__dirname, 'animals-widget.html'),
            animalDetail: path.resolve(__dirname, 'animal-detail.html'),
          },
        },
      },
    },
  },
});
