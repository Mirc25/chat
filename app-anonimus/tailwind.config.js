/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // ¡Esta línea es CRÍTICA! Asegura que Tailwind escanee tus componentes.
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}