/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        appbg: '#05070e',
        panelbg: '#0c101d',
      },
    },
  },
  plugins: [],
};
