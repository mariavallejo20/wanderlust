module.exports = {
    plugins: ["stylelint-scss"],
    extends: [
        "stylelint-config-standard",
        "stylelint-config-standard-scss",
        "stylelint-config-prettier-scss",
    ],
    ignoreFiles: ["coverage/**", "html/**", "dist/**"],
    rules: {
        "selector-pseudo-class-no-unknown": [
            true,
            { ignorePseudoClasses: ["global"] },
        ],
        "at-rule-no-deprecated": [true, { ignoreAtRules: ["apply"] }],
        "at-rule-no-unknown": null,
        "scss/at-rule-no-unknown": [
            true,
            {
                ignoreAtRules: ["tailwind", "apply", "reference", "theme"],
            },
        ],
    },
};
