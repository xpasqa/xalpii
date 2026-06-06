# Audit Notes

Generated during Sprint 0 foundation hardening.

## Backend

Command:

```bash
npm audit
```

Result:

- 23 total vulnerabilities: 3 low, 13 moderate, 7 high.

Production-impacting:

- `@nestjs/core`, `@nestjs/platform-express`, `@nestjs/common`, `@nestjs/config` and their transitive dependencies report runtime-impacting advisories through `body-parser`, `express`, `file-type`, `lodash`, `multer`, and `qs`.

Dev-tooling only:

- `@nestjs/cli`, `@nestjs/schematics`, Angular devkit packages, `glob`, `inquirer`, `tmp`, and `webpack` are used by local build/generation tooling.

Unknown / needs manual review:

- `multer` is pulled by `@nestjs/platform-express`, but Sprint 0 has no upload endpoint yet. Review again before implementing file uploads in Sprint 2.

Notes:

- `npm audit fix --package-lock-only` was attempted.
- Remaining npm-proposed fixes require semver-major Nest package changes.
- `npm audit fix --force` was not run.

## Frontend

Command:

```bash
npm audit
```

Result:

- 2 total vulnerabilities: 2 moderate.

Production-impacting:

- `next` reports a transitive `postcss` advisory. npm did not provide a safe same-major fix.

Dev-tooling only:

- None identified from the current audit output.

Unknown / needs manual review:

- Re-check when a safe Next.js patch is available or when the project chooses a planned framework upgrade.

Notes:

- `npm audit fix --package-lock-only` was attempted.
- npm proposed `next@9.3.3`, which is a breaking downgrade and not appropriate.
- `npm audit fix --force` was not run.
