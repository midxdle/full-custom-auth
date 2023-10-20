1. `"extends": "./tsconfig.json"`:
   - Indicates that this `tsconfig.json` file extends the configuration from the `tsconfig.json` file located at `./tsconfig.json`. This allows you to inherit settings from another TypeScript configuration file.

2. `"exclude": ["node_modules", "test", "dist", "**/*spec.ts"]`:
   - Lists the files and directories to be excluded from TypeScript compilation.
   - `"**/*spec.ts"`: Uses the glob pattern to exclude any TypeScript files that end with `spec.ts`. These files often contain unit or integration tests and are not meant for compilation into the final build.
