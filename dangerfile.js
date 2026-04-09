import { danger, warn, fail } from "danger";

const hasAppChanges = danger.git.modified_files.some((file) => file.includes("src"));
const hasChangelog = danger.git.modified_files.includes("CHANGELOG.md");
const isDeclaredTrivial = (danger.github.pr.title + danger.github.pr.body).includes("#trivial") || !hasAppChanges;
const lintConfigFiles = ["eslint.config.mjs"];

if (danger.github.pr.title.includes("[WIP]")) {
    warn("PR is classed as Work in Progress");
} else {
    if (!hasChangelog && !isDeclaredTrivial) {
        warn("Please add a changelog entry for your changes.");
    }
    if (danger.github.pr.body.length < 3) {
        warn("Please add a detailed summary in the description.");
    }
    if (lintConfigFiles.some((file) => danger.git.modified_files.includes(file))) {
        warn("Changes were made to the ESLint config. Please ensure that you have notified the team to change the existing ESLint rule.");
    }
}
