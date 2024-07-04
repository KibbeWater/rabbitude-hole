import { type Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";

export default {
    content: ["./src/**/*.tsx"],
    theme: {
        extend: {
            fontFamily: {
                sans: ["var(--font-geist-sans)", ...fontFamily.sans],
                grotesk: ["PowerGrotesk", ...fontFamily.sans],
            },
            colors: {
                accent: "rgb(255, 84, 0)",
            },
        },
    },
    plugins: [],
} satisfies Config;
