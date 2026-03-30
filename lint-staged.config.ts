import type { Config } from "lint-staged";

const config: Config = {
    "*": ["prettier --write --ignore-unknown"],
    "*.{ts,tsx}": [
        "eslint --flag v10_config_lookup_from_file --fix --max-warnings 60 --no-warn-ignored",
    ],
    "**/*.{ts,tsx}": () => "knip --max-issues 150",
};

export default config;
