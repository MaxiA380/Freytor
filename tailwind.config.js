/** @type {import('tailwindcss').Config} */
// Works with both CDN (tailwind.config) and build tools (module.exports)
tailwind.config = {
	prefix: 'tw-',
	important: false,
	content: [
		"**/*.{html,jsx,js}",
		"**/*.js",
		"**/*.html",
	],
	theme: {
		extend: {
			colors: {
				// Brand Colors (primary palette)
				'brand-blue': '#1A5BAB',
				'brand-blue-dark': '#144A8C',
				'brand-blue-light': '#2E7BC9',
				'brand-green': '#3EA344',
				'brand-green-dark': '#2E8A34',
				'brand-green-light': '#4FBD55',
				
				// Semantic Colors
				primary: "#1A5BAB",    // Alias for brand-blue
				secondary: "#64748b",  // Professional gray for text and borders  
				accent: "#3EA344",     // Alias for brand-green
				warning: "#f59e0b",    // Amber for alerts and delays
				danger: "#ef4444"      // Red for critical issues
			}
		},
	},
	plugins: [],
}

