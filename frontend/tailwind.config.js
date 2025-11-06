/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/**/*.{js,jsx,ts,tsx}"  // Tailwind sẽ quét tất cả file React/TSX
    ],
    theme: {
        extend: {},  // Nơi bạn thêm màu, font, spacing tùy chỉnh
    },
    plugins: [],   // Nơi thêm plugin nếu cần
};
