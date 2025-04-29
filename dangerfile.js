import { danger, warn, fail } from "danger";

const hasAppChanges = danger.git.modified_files.some((file) => file.includes("src"));
const hasChangelog = danger.git.modified_files.includes("CHANGELOG.md");
const isDeclaredTrivial = (danger.github.pr.title + danger.github.pr.body).includes("#trivial") || !hasAppChanges;

if (danger.github.pr.title.includes("[WIP]")) {
    warn("PR is classed as Work in Progress");
} else {
    //Make sure we add changelog
    if (!hasChangelog && !isDeclaredTrivial) {
        warn("Please add a changelog entry for your changes.");
    }
    //Mainly to encourage writing up some reasoning about the PR, rather than just leaving a title
    if (danger.github.pr.body.length < 3) {
        warn("Please add a detailed summary in the description.");
    }
    //Detect .eslintrc changes and set warnings
    if (danger.git.modified_files.includes(".eslintrc")) {
        warn(
            "Changes were made to .eslintrc. Please ensure that you have notified the team to change the existing ESLint rule."
        );
    }
}
//Temporary disable this since tasks like create new page may include more than 500 lines of code
// if (git.lines_of_code > 500) {
//     warn('This PR is too big! Consider breaking it down into smaller PRs.')
// }

// In the future: make sure non-trivial amounts of code changes come with corresponding tests
/*
const has_test_changes = !git.modified_files.grep(/spec/).empty
if (git.lines_of_code > 50 && has_app_changes && !has_test_changes) {
    warn('There are code changes, but no corresponding tests. ' \
       'Please include tests if this PR introduces any modifications in ' \
       'behavior.',
       sticky: false)
}
*/
