import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import {resolve} from 'path';
import path from 'path';
import babel from '@rollup/plugin-babel';
import alias from '@rollup/plugin-alias';
import commonjs from '@rollup/plugin-commonjs';

import * as reactObj from 'react';
import * as reactDomObj from 'react-dom';

const projectRootDir = path.resolve(__dirname);

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    commonjs({
      namedExports: {
        react: Object.keys(reactObj),
        'react-dom': Object.keys(reactDomObj),
      },
    }),
    alias({
      entries: [
        {
          find: 'shared',
          replacement: resolve(projectRootDir, 'shared', 'src')
        }
      ],
    }),
    babel({
      babelHelpers: 'bundled',
      babelrc: false,
      configFile: false,
      exclude: '/**/node_modules/**',
      extensions: ['jsx', 'js', 'ts', 'tsx', 'mjs'],
      plugins: ['@babel/plugin-transform-flow-strip-types'],
      presets: ['@babel/preset-react'],
    }),
    react(),
  ],
  build: {
    outDir: 'build',
    rollupOptions: {
      input: {
        main: new URL('./index.html', import.meta.url).pathname,
      },
    },
    commonjsOptions: {include: []},
    minify: 'terser',
    terserOptions: {
      compress: {
        toplevel: true,
      }
    },
  },
});
