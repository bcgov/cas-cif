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
1. once the pull request is approved and merged, and all required checks on the merge commit have passed, update your local develop branch and fast-forward the `main` branch using:

```bash
- git checkout main
- git merge develop --ff-only
- git push
```

**_Note_**:make sure no other changes are made to the `develop` branch while the release is in progress.

If you want to override the version number, which is automatically determined based on the conventional commit messages being released, you can do so by passing a parameter to the `release-it` command, e.g.

```bash
yarn release-it 1.0.0-rc.1
```

**Do not rebase release PRs**. If a release PR falls behind the develop branch, a new PR will need to be created. `release-it` relies on tags to make comparisons from one release to another. Rebasing makes the tag created during the release process unreachable by [git describe](https://git-scm.com/docs/git-describe), which is what `release-it` uses to determine the parent tag.

### <u>Sqitch migrations guardrails</u>

As mentioned above, the critical part of the release process is to tag the sqitch plan. While tagging the sqitch plan in itself doesn't change the behaviour of our migrations scripts, it is allows us to know which changes are deployed to prod (or about to be deployed), and therefore should be considered immutable.

We developed some guardrails (i.e. GitHub actions) to:

- ensure that changes that are part of a release are immutable: [immutable-sqitch-change.yml}(.github/workflows/immutable-sqitch-change.yml)
- ensure that the sqitch plan ends with a tag on the `main` branch, preventing deployments if it is not the case. Our release command automatically sets this tag: [pre-release.yml](.github/workflows/pre-release.yml)

### <u>Release to test</u>

Once the release PR is merged and is ready to be used in dev environment, we can deploy the application to the `test` environment by going to shipit and clicking on the `Deploy` button on the latest commit.
Then we need to watch for any possible errors in the logs when deploying the application. Once the application is deployed, we need to move all zenhub issues that were part of the release to the `QA (in-test)` column.

### <u>Release to prod</u>

We can follow the same steps as for the `test` environment, but this time we need to deploy the application to the `prod` environment in shipit. Once the application is deployed, we need to make a release tag in zenhub and assign it to all zenhub issues that were part of the release. We also need to move all zenhub issues that were part of the release to the `closed` column.

test
