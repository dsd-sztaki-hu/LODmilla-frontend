# Development

LODmilla is deployed as a static directory. Node.js is used only for dependency
maintenance and development checks; it is not required by the application at
runtime and no JavaScript bundle is produced.

## Installing maintenance dependencies

Use Node.js 18 or newer and install the exact versions recorded in
`package-lock.json`:

```sh
npm ci
```

Do not edit files listed in `vendor-dependencies.json` directly. Their source is
the installed npm package (or package archive), while the destination is the
browser-ready file committed to this repository.

## Updating browser dependencies

1. Change the dependency version in `package.json`.
2. Update the matching `version`, `source`, and, when appropriate,
   `destination` in `vendor-dependencies.json`.
3. Run `npm install` to update `package-lock.json`.
4. Run `npm run vendor` to copy the declared browser assets into the static
   application.
5. Review both the lockfile and copied assets, then test the application before
   committing them together.

The vendored files remain committed deliberately. The Docker image and any
ordinary HTTP server can therefore serve the checkout directly without running
`npm install` or a build during deployment.

Use the following command in CI or before committing to ensure that installed
packages and committed browser assets have not drifted apart:

```sh
npm run vendor:check
```

The script also checks the installed package version against the vendor
manifest. It fails instead of copying from an unexpected version.

## Current jQuery dependency

jQuery is installed from its normal npm package and pinned in both
`package.json` and `package-lock.json`. Dependabot can therefore identify the
installed version and propose regular version or security updates. Updating the
package alone does not change the static application: run `npm run vendor` and
commit the resulting browser asset as described above.

jQuery 4.0.0 runs without jQuery Migrate. Deprecated APIs reported during the
migration have been replaced rather than retaining the compatibility layer in
production.
