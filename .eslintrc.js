module.exports = {
	root: true,
	parser: "@typescript-eslint/parser",
	plugins: ["@typescript-eslint"],
	extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
	rules: {
		"@typescript-eslint/no-extra-semi": "off",
		"no-mixed-spaces-and-tabs": "off",
		"@typescript-eslint/no-explicit-any": "off",
		indent: ["off", "tab"],
	},
};
