module.exports = {
	roots: ["<rootDir>/tests"],
	testMatch: ["**/__tests__/**/*.+(ts|tsx|js)", "**/?(*.)+(spec|test).+(ts|tsx|js)"],
	coverageProvider: "v8",
	transform: {
		"^.+\\.(ts|tsx)$": "ts-jest",
	},
};
