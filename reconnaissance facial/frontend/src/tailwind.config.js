module.exports = {
  content: [
    "./src/**/*.{html,js,jsx}", // Tailwind scanne ces fichiers pour les classes utilisées
  ],
  theme: {
    extend: {
      colors: {
        // Ajoutez vos couleurs personnalisées ici
        'custom-blue': '#1E3A8A', // Un bleu foncé
        'custom-purple': '#6B21A8', // Un violet foncé
      },
      fontFamily: {
        sans: ['Helvetica', 'Arial', 'sans-serif'], // Police personnalisée
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),     // Plugin pour styliser les formulaires
    require('@tailwindcss/typography'), // Plugin pour une meilleure typographie
  ],
  purge: {
    enabled: process.env.NODE_ENV === 'production', // Active la purge uniquement en production
    content: [
      "./src/**/*.{html,js,jsx}", // Fichiers à scanner pour la purge
    ],
  },
};