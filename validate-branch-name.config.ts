export default {
    pattern:
        "^(origin|master|main|develop){1}$|^(feature|bugfix|fix|hotfix|release)/.+$",
    errorMsg:
        "Branch name must be main, master, develop, or follow the pattern: feature|bugfix|fix|hotfix|release/<description>",
};
