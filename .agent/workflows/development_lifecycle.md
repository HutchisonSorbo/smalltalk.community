---
description: Standard Development Lifecycle Workflow
---

# Development Lifecycle

This workflow outlines the mandatory process for developing, testing, and merging features.

1. **Develop Locally**
    * Develop and test features in `localhost` until they work.
    * Verify functionality with browser tests or manual verification where applicable.

2. **Push to Feature Branch**
    * Create a feature branch (e.g., `feature/xyz` or `fix/abc`).
    * Push changes to the remote repository.
    * Allow Vercel to create a preview deployment.

3. **Validate in Preview**
    * Perform final validation in the Vercel preview environment.
    * Ensure the build succeeds and the app runs in a production-like environment.

4. **Iterate**
    * If issues appear in preview that were not present locally:
        * Fix them locally.
        * Push updates to the feature branch.
        * Re-validate in the new preview deployment.

5. **Merge to Main**
    * **Condition:** Preview must validate successfully.
    * **Condition:** Explicit user approval must be granted.
    * Only then merge the feature branch into `main`.
