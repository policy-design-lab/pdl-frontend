const hasChangelog = danger.git.modified_files.includes("CHANGELOG.md");
const isTrivial = (danger.github.pr.body + danger.github.pr.title).includes(
  "#trivial"
);
const has_app_changes = !git.modified_files.grep(/src/).empty

//Make sure we add changelog
if (!hasChangelog && !isTrivial) {
  warn("Please add a changelog entry for your changes.");
}

//Mainly to encourage writing up some reasoning about the PR, rather than just leaving a title
if (github.pr_body.length < 3) {
    warn('Please add a detailed summary in the description.') 
}

//Temporary disable this since tasks like create new page may include more than 500 lines of code
// if (git.lines_of_code > 500) {
//     warn('This PR is too big! Consider breaking it down into smaller PRs.') 
// }

//Make it more obvious that a PR is a work in progress and shouldn't be merged yet
if (github.pr_title.includes('[WIP]')) {
    warn('PR is classed as Work in Progress') 
}

//Let people say that this isn't worth a CHANGELOG entry in the PR if they choose
declared_trivial = (github.pr_title + github.pr_body).includes('#trivial') || !has_app_changes
if (!git.modified_files.include?('CHANGELOG.md') && !declared_trivial){
  raise(
    'Please include a CHANGELOG entry. You can find it at [CHANGELOG.md](https://github.com/policy-design-lab/pdl-frontend/blob/develop/CHANGELOG.md).',
    sticky: false
  )
}

//Detect .eslintrc changes and set warnings
if (git.modified_files.include?('.eslintrc')) {
    warn('Changes were made to .eslintrc. Please ensure that the you have notified team to change the existing ESLine rule.')
}

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
