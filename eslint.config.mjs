import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // Marketing copy uses natural apostrophes and quotes; HTML entities hurt readability.
      "react/no-unescaped-entities": "off",
    },
  },
  {
    // Routes and the product name live in lib/routes.ts and lib/brand.ts. Literals elsewhere
    // drift out of sync (that is how the header, menus and redirects disagreed before).
    files: ["app/**/*.{ts,tsx}", "components/**/*.{ts,tsx}", "features/**/*.{ts,tsx}", "lib/**/*.{ts,tsx}", "hooks/**/*.{ts,tsx}"],
    ignores: ["lib/routes.ts", "lib/brand.ts", "app/api/**"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector:
            "Literal[value=/^\\/(dashboard|login|signup|start|templates|pricing|how-it-works|help|admin|demo|e|forgot-password|reset-password|auth|search)(\\/|\\?|#|$)/]:not(TSLiteralType > Literal)",
          message: "Use ROUTES / routes from @/lib/routes instead of a path literal.",
        },
        {
          selector: "TemplateElement[value.raw=/^\\/(dashboard|login|signup|start|templates|pricing|how-it-works|help|admin|demo|e|forgot-password|reset-password|auth|search)(\\/|\\?|#|$)/]",
          message: "Use routes.* from @/lib/routes instead of building a path by hand.",
        },
        {
          selector: "Literal[value=/\\bMirth\\b/], JSXText[value=/\\bMirth\\b/]",
          message: "Use BRAND from @/lib/brand for the product name.",
        },
      ],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
