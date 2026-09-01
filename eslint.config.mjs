import nextVitals from "eslint-config-next/core-web-vitals";

export default [
  ...nextVitals,
  {
    ignores: [".next/**", "out/**", "build/**", "next-env.d.ts"],
  },
  {
    rules: {
      // Data-fetch effects intentionally update local loading/error state.
      "react-hooks/set-state-in-effect": "off",
    },
  },
];
