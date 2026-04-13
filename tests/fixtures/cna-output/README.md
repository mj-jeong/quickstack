# CNA Output Fixtures

These directories are pristine outputs from `create-next-app@latest`,
used by QuickStackTool integration tests to simulate CNA without hitting the
network or running package installation.

Last refreshed: 2026-04-10T05:11:11.727Z

## Fixtures

### next15-app-tailwind
```
npx create-next-app@latest next15-app-tailwind --ts --app --src-dir --tailwind --eslint --no-turbopack --import-alias @/* --use-npm --skip-install
```

### next15-app-no-tailwind
```
npx create-next-app@latest next15-app-no-tailwind --ts --app --src-dir --no-tailwind --eslint --no-turbopack --import-alias @/* --use-npm --skip-install
```


## Regeneration

```bash
pnpm fixtures:refresh
```

The script runs `create-next-app` in a temp directory, strips
`node_modules` and `.git`, and copies the result into this folder.
Review the resulting diff carefully before committing — unexpected changes
usually indicate upstream CNA behavior changes worth investigating.
