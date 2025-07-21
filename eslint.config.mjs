import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  // Add an object for ignore patterns
  {
    // The 'ignores' property is for global ignore patterns in flat config
    ignores: [
      "node_modules/",
      ".next/",
      "lib/generated/", // Based on your error paths
      "prisma/",        // Also based on your error paths, assuming prisma might generate files here
      // Add any other directories or files you want ESLint to ignore
    ],
  },
];

export default eslintConfig;