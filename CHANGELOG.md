# Changelog

## [0.7.0](https://github.com/coji/zodix/compare/zodix-v0.6.2...zodix-v0.7.0) (2025-11-01)


### Features

* improve dynamic schema support with comprehensive documentation ([35ee1ca](https://github.com/coji/zodix/commit/35ee1cace764b44008b1dfd7d3e4753e66896eaa))
* improve dynamic schema support with flexible type system ([a4edaef](https://github.com/coji/zodix/commit/a4edaefd91f63c815f5aaf3a2562945546e2215b))
* improve dynamic schema support with InferParams type helper and comprehensive docs ([8895f90](https://github.com/coji/zodix/commit/8895f908dccb42a2535ce021471432784d95c51c))

## [0.6.2](https://github.com/coji/zodix/compare/zodix-v0.6.1...zodix-v0.6.2) (2025-11-01)


### Bug Fixes

* exclude CHANGELOG.md from prettier formatting ([76f49e4](https://github.com/coji/zodix/commit/76f49e4155486205fd19160dab7f94c7c427b1f2))
* exclude CHANGELOG.md from prettier formatting ([df649fc](https://github.com/coji/zodix/commit/df649fc99dd0887823d46451e7438ee31e4bd838))

## [0.6.1](https://github.com/coji/zodix/compare/zodix-v0.6.0...zodix-v0.6.1) (2025-11-01)


### Bug Fixes

* improve release workflow quality checks ([b6dc5f6](https://github.com/coji/zodix/commit/b6dc5f680eeae1b11cdf70fd0800cd1b881b4cb5))
* update all Node.js versions to 22 ([43b1887](https://github.com/coji/zodix/commit/43b18878dd78abe2b522efd1e126665144749ae4))
* update release workflow configuration ([855612a](https://github.com/coji/zodix/commit/855612ac864dd7049f80a1969d562980b4a854ee))
* update workflows and sync configurations ([c00ba08](https://github.com/coji/zodix/commit/c00ba08453f60d08b2fc589fccd3d8c9cd3eeb77))

## [0.6.0](https://github.com/coji/zodix/compare/zodix-v0.5.0...zodix-v0.6.0) (2025-11-01)

### Features

- Add Zod v4 support and migrate examples to React Router v7 ([b611d0d](https://github.com/coji/zodix/commit/b611d0d98ee69d57c207342fb7909b3986fddb03))
- implement Zod v3 compatibility with new parsing functions and tests ([bbcb892](https://github.com/coji/zodix/commit/bbcb89223fa1bfdc8ea009b7be2d2fd4f38cade3))
- Implement Zod v4 parsers and schemas ([3db1449](https://github.com/coji/zodix/commit/3db14499e01b6180a7fa2276b72c866591dc1b7e))
- setup automated release workflow with release-please and npm trusted publishing ([ffa6d19](https://github.com/coji/zodix/commit/ffa6d199c0aa1883058a6b56612d74f4db247209))
- setup automated release workflow with release-please and npm trusted publishing ([cd58e63](https://github.com/coji/zodix/commit/cd58e6333e4037df9c6f56f120d49937d5edbc94))
- Support asynchronous schema for and ([#20](https://github.com/coji/zodix/issues/20)) ([a4ca5a9](https://github.com/coji/zodix/commit/a4ca5a9291020d072725b37361d8ddf4fbea26fd))
- Support FormData object entries parsing ([#15](https://github.com/coji/zodix/issues/15)) ([eb255fd](https://github.com/coji/zodix/commit/eb255fd83266df1b90504937b35657b69cf838db))
- Support Zod v4 and update dependencies ([73098d2](https://github.com/coji/zodix/commit/73098d29817e8fb2511db04a3ec7abd1c96653a4))

### Bug Fixes

- change LoaderArgs to DataFunctionArgs to support Remix V2 ([#38](https://github.com/coji/zodix/issues/38)) ([76ddec7](https://github.com/coji/zodix/commit/76ddec7ec1ad5444a6d0ff0c1b42dca5dcc2f0db))
- exclude @remix-run/server-runtime from external deps to reduce bundle size ([#29](https://github.com/coji/zodix/issues/29)) ([515bd9c](https://github.com/coji/zodix/commit/515bd9cd2188a923e1422e6c8a2065d7588f7481))
- **parseForm:** await to handle error and throw responses ([#34](https://github.com/coji/zodix/issues/34)) ([033031b](https://github.com/coji/zodix/commit/033031bc02a81f927f77c4ba79ea7cf0411a329e))
- remove debug log from errorAtPath function in login.tsx ([46a486a](https://github.com/coji/zodix/commit/46a486a6e400a18a8f4169d377676813ec20898c))
- remove debug log from ErrorBoundary component ([781b4af](https://github.com/coji/zodix/commit/781b4af74a29c60035948cd1583c9a5c8f1cbae8))
- remove deprecated version field from pnpm/action-setup in GitHub Actions workflow ([4380d6f](https://github.com/coji/zodix/commit/4380d6f7c934530d26b6e69089745c224743beaa))
- remove unused appDirectory property from react-router configuration ([eedb999](https://github.com/coji/zodix/commit/eedb999a7e5fbd5dc417dece0ca1e6575da791c7))
- remove unused release script from package.json ([6751a85](https://github.com/coji/zodix/commit/6751a85b49229c032631d92657b13abf7e4778cb))
- update @remix-run/server-runtime peer dependency to support remix 2.x ([#40](https://github.com/coji/zodix/issues/40)) ([436ee7a](https://github.com/coji/zodix/commit/436ee7ac7180d8c6c036c2e550c2e3e6f4ea9737))
- update biome.json configuration and remove obsolete react-router-routes documentation ([71735f3](https://github.com/coji/zodix/commit/71735f3bb80df22bd987e97b0ad072ec988b54c4))
- update branch name from master to main in release workflow ([2ac96f0](https://github.com/coji/zodix/commit/2ac96f00b0c17c566f5e24ded2e1d085f6e59d54))
- update branch references from master to main in CI workflow ([8244cfe](https://github.com/coji/zodix/commit/8244cfe48f7b1876f996af3acbb15b8ae6c629c0))
- update branch references from master to main in CI workflow ([94ec83a](https://github.com/coji/zodix/commit/94ec83a60cb5caf6b7fcc59ca5c1e7cf8d746339))
- update copyright year and author in license file ([64a6989](https://github.com/coji/zodix/commit/64a69893a1117366e36690dfe379194b3781c5d3))
- update installation command in examples README to use pnpm ([16d823a](https://github.com/coji/zodix/commit/16d823a387e55d365aacc8074baaea2f45d5a4d4))
- update README for Zodix to reflect correct package name and compatibility with React Router v7 ([df7086a](https://github.com/coji/zodix/commit/df7086ac7fa212b6c5102aa626f3513e45284651))
- update zod peer dependency version range for compatibility ([e1e4d27](https://github.com/coji/zodix/commit/e1e4d27aab0e3b9fb7e0eb789ee39daa0621147f))
