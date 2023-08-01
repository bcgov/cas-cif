# Hotfix Strategy

In the event that a hotfix needs to be pushed to production ahead of the work currently in develop, these are the steps to follow:

1. Notify the rest of the team that a hotfix is needed
2. Create a hotfix branch directly off of `main`
3. Apply the fix and create a PR with `main` as the target branch
4. Merge the fix to the `main` branch
5. Deploy the latest `main` to the `test` environment
6. Test the fix in the `test` environment. Make sure to create any data needed to ensure the issue will be fixed in `prod`
7. Deploy the hotfix to `prod`
8. Notify the client that the fix has been applied and ask for confirmation that the issue is resolved in `prod`
9. Disable the `Require pull request before merging` protection on the `develop` branch in github
10. Take a screenshot of all the status checks that run on the develop branch then disable the `Require status checks` protection on the `develop` branch in github. Since we will not be merging a PR, there will be no status checks.
11. Enable `Allow Force Pushes` in the branch protections for the `develop` branch in github as the rebase is going to require a force push to the origin.
12. Ensure your local `develop` is up to date and then rebase `develop` on `main` without a PR (`git rebase main` when on the `develop` branch) & push
13. Re-enable the `Require pull request before merging` & `Require status checks` protections on the `develop` branch in github. You will have to manually add all the status checks back. Refer to your screenshot to ensure all the required checks are set.
14. Disable `Allow Force Pushes` in the branch protections.
15. Notify the rest of the dev team that the hotfix is finished & remind them that their in-progress PRs will need rebasing on `develop`
16. Write a postmortem on the issue if deemed necessary (ie: the problem caused downtime, data loss / leak or other significant issues worth documenting)

test change to trigger ci
