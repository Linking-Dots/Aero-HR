import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.jsx',
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ['Figtree', ...defaultTheme.fontFamily.sans],
            },
        },
    },

    plugins: [forms],
};


const withMT = require("@material-tailwind/react/utils/withMT");

module.exports = withMT({
    content: [],
    theme: {
        extend: {},
    },
    plugins: [],
});

const flowbite = require("flowbite-react/tailwind");

/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        // ...
        flowbite.content(),
    ],
    plugins: [
        // ...
        flowbite.plugin(),
    ],
};
