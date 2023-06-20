import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import babel from '@rollup/plugin-babel';
import alias from '@rollup/plugin-alias';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

import * as reactObj from 'react';
import * as reactDomObj from 'react-dom';

const projectRootDir = path.resolve(__dirname);

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
          replacement: path.resolve(projectRootDir, 'lexical', 'shared', 'src')
        }
      ],
    }),
    resolve(),
    babel({
      babelHelpers: 'bundled',
      babelrc: false,
      configFile: false,
      exclude: '/**/node_modules/**',
      extensions: ['jsx', 'js', 'ts', 'tsx', 'mjs'],
      plugins: [
        '@babel/plugin-transform-flow-strip-types',
        [
          require('./lexical/scripts/error-codes/transform-error-messages'),
          {
            noMinify: true,
          },
        ],
      ],
      presets: ['@babel/preset-react'],
    }),
    react(),
  ],
  build: {
    outDir: 'build',
    rollupOptions: {
      input: {
        main: new URL('./index.html', import.meta.url).pathname,
        lexical: new URL('./lexical.html', import.meta.url).pathname,
        tiptap: new URL('./tiptap.html', import.meta.url).pathname,
      },
    },
  },
});
