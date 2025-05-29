// frontend/tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // Scanne tous les fichiers JS/JSX/TS/TSX dans src/
    "./public/index.html"        // Scanne aussi votre index.html public
  ],
  theme: {
    extend: {
      colors: { // Optionnel : Étendre avec les couleurs de votre thème si besoin
        'green': { // Exemple pour la couleur principale de AgriTunisie
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e', // Vert principal
          600: '#16a34a', // Vert plus foncé
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052e16',
        },
        // Vous pouvez ajouter d'autres couleurs ici (ex: 'coral', 'gold' de votre palette)
      },
      fontFamily: { // Optionnel : Si vous utilisez une police spécifique comme Inter
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}