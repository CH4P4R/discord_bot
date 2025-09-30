module.exports = {
  root: true,
  env: {
    es2022: true,
    node: true
  },
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module"
  },
  plugins: ["@typescript-eslint"],
  extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended", "prettier"],
  ignorePatterns: ["dist", "node_modules"],
  overrides: [
    {
      files: ["**/*.{ts,tsx}"]
    },
    {
      files: ["apps/dashboard/**/*.{ts,tsx,jsx,js}"],
      env: {
        browser: true
      },
      plugins: ["react", "react-hooks", "jsx-a11y"],
      extends: [
        "plugin:react/recommended",
        "plugin:react-hooks/recommended",
        "plugin:jsx-a11y/recommended",
        "prettier"
      ],
      settings: {
        react: {
          version: "detect"
        }
      },
      rules: {
        "react/react-in-jsx-scope": "off"
      }
    }
  ]
};
