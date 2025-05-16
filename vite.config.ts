import { defineConfig  } from 'vite';
import vue from '@vitejs/plugin-vue';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import * as path from 'path';

export default ({mode}) => {
    return defineConfig({
        //    root: path.resolve(__dirname, 'src'),
        resolve: {
            alias: {
            '~bootstrap': path.resolve(__dirname, 'node_modules/bootstrap'),
            '@': path.resolve(__dirname, 'src')
            },
        },
        build: {
            minify: mode == 'production',
            outDir: './dist',
            emptyOutDir: true
        },
        css: {
            preprocessorOptions: {
                scss: {
                    quietDeps: true,
                    silenceDeprecations: ['legacy-js-api'],
                },
            },
        },
        optimizeDeps: {
            include: ['dayjs/plugin/isoWeek']
        },
        plugins: [
            nodePolyfills(),
            vue()
        ],
        define: {
            // enable hydration mismatch details in production build
            __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: 'true'
          }
    });
}

