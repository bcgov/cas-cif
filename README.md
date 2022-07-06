# Climate Action Secretariat - CleanBC Industry Fund

![Lifecycle:Maturing](https://img.shields.io/badge/Lifecycle-Maturing-007EC6)

## Documentation

- [Developer and Application Documentation](./docs/README.md)

## Release Process

Before releasing our application to our `test` and `prod` environments, an essential step is to add a tag to our sqitch plan, to identify which database mutations are released to prod and should be immutable.

Additionally, to facilitate identification of the changes that are released and communication around them, we want to:

- bump the version number, following [semantic versioning](https://semver.org/)
- generate a change log, based on the commit messages using the [conventional commits](https://www.conventionalcommits.org/en/v1.0.0/) format

To make this process easy, we use [`release-it`](https://github.com/release-it/release-it).

When you're ready to make a release, apply the following steps:

1. create a `chore/release` branch
1. run `make release` and follow the prompts
1. create a pull request
1. once the pull request is approved and merged, and all required checks on the merge commit have passed, fast-forward the `main` branch

If you want to override the version number, which is automatically determined based on the conventional commit messages being relased, you can do so by passing a parameter to the `release-it` command, e.g.

```
yarn release-it 1.0.0-rc.1
```

### Sqitch migrations guardrails

As mentioned above, the critical part of the release process is to tag the sqitch plan. While tagging the sqitch plan in itself doesn't change the behaviour of our migrations scripts, it is allows us to know which changes are deployed to prod (or about to be deployed), and therefore should be considered immutable.

We developed some guardrails (i.e. GitHub actions) to:

- ensure that changes that are part of a release are immutable: [immutable-sqitch-change.yml}(.github/workflows/immutable-sqitch-change.yml)
- ensure that the sqitch plan ends with a tag on the `main` branch, preventing deployments if it is not the case. Our release command automatically sets this tag: [pre-release.yml](.github/workflows/pre-release.yml)
