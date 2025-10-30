import { defineConfig  } from 'vite';
import vue from '@vitejs/plugin-vue';
import * as path from 'path';

export default ({mode}) => {
    return defineConfig({
        //    root: path.resolve(__dirname, 'src'),
        base: '/vctoolbox/',
        resolve: {
            alias: {
            '~bootstrap': path.resolve(__dirname, 'node_modules/bootstrap'),
            '@': path.resolve(__dirname, 'src'),
            crypto: path.resolve('src/crypto-browser.ts'),
            'node:crypto': path.resolve('src/crypto-browser.ts'),
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
            include: ['dayjs/plugin/isoWeek'],
            exclude: ['crypto']
        },
        plugins: [
            vue()
        ],
        define: {
            // enable hydration mismatch details in production build
            __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: 'true',
            'process.version': null,
            'process.env': {},
            '_vm._self._c': {},
          }
    });
}

