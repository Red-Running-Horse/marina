# Repository Privacy & Access Guide

## Overview

This document explains how to ensure the FindYourMythos project remains private and accessible only to authorized users and AI agents.

## Current Repository Status

- **Repository**: Red-Running-Horse/marina
- **Visibility**: Should be set to Private
- **FindYourMythos**: Located in `/FindYourMythos` subdirectory

## Ensuring Repository Privacy

### GitHub Repository Settings

1. **Navigate to Repository Settings**
   - Go to: https://github.com/Red-Running-Horse/marina/settings

2. **Check Visibility**
   - Scroll to the "Danger Zone" section at the bottom
   - Look for "Change repository visibility"
   - Ensure it shows "This repository is currently **private**"

3. **If Repository is Public**
   - Click "Change visibility"
   - Select "Make private"
   - Confirm the action

### Access Control

#### For AI Agents

To grant AI agents access to this private repository:

1. **Personal Access Tokens (PATs)**
   - Create a PAT at: https://github.com/settings/tokens
   - Select scopes: `repo` (full control of private repositories)
   - Provide the token to authorized AI agents
   - **Important**: Keep tokens secure and rotate them regularly

2. **Deploy Keys** (Read-only or read-write)
   - Go to: https://github.com/Red-Running-Horse/marina/settings/keys
   - Click "Add deploy key"
   - Paste the public SSH key
   - Choose access level (read-only or read-write)

3. **GitHub Apps** (for automated agents)
   - Go to: https://github.com/settings/apps
   - Create a new GitHub App
   - Grant repository permissions
   - Install the app on this repository

#### For Collaborators

To add human collaborators:

1. Go to: https://github.com/Red-Running-Horse/marina/settings/access
2. Click "Add people"
3. Enter GitHub username or email
4. Choose permission level:
   - **Read**: View and clone only
   - **Write**: Push changes
   - **Admin**: Full access including settings

## Security Best Practices

### 1. Token Management
- ✅ Use tokens with minimal required scopes
- ✅ Set expiration dates on tokens
- ✅ Rotate tokens regularly
- ✅ Revoke unused tokens immediately
- ❌ Never commit tokens to the repository
- ❌ Never share tokens via insecure channels

### 2. SSH Keys
- ✅ Use strong SSH keys (ED25519 or RSA 4096-bit)
- ✅ Add passphrase protection
- ✅ Use different keys for different machines
- ❌ Don't reuse keys across services

### 3. Code Security
- ✅ Review all pull requests before merging
- ✅ Enable branch protection rules
- ✅ Require code reviews for sensitive changes
- ✅ Use `.gitignore` to exclude sensitive files

### 4. Data Privacy
- ✅ Keep user data encrypted at rest
- ✅ Don't commit personal information
- ✅ Use environment variables for secrets
- ✅ Generated reports are excluded by `.gitignore`

## Sensitive Data Protection

The following files are automatically excluded from version control:

### FindYourMythos Directory
- `findyourmythos_report_*.txt` - Generated reports
- `.venv/` - Python virtual environments
- `__pycache__/` - Python cache files
- `*.pyc` - Compiled Python files
- Local test data directories

### Marina Directory
- `node_modules/` - Dependencies
- `.env` files - Environment variables
- Build artifacts
- Cache files

## Verifying Privacy Settings

### Check Repository Visibility
```bash
# Using GitHub CLI
gh repo view Red-Running-Horse/marina --json isPrivate

# Should return: {"isPrivate": true}
```

### Check Remote URL
```bash
cd /path/to/marina
git remote -v

# Should show:
# origin  https://github.com/Red-Running-Horse/marina (fetch)
# origin  https://github.com/Red-Running-Horse/marina (push)
```

### Verify .gitignore is Working
```bash
# Check ignored files
git status --ignored

# Report files should be listed as ignored
```

## Troubleshooting

### Issue: Repository Appears Public
1. Go to repository settings
2. Change visibility to private
3. Confirm the action
4. Refresh the repository page

### Issue: Can't Access Private Repository
1. Verify you have the correct permissions
2. Check if using the correct authentication method (PAT or SSH)
3. Ensure PAT has `repo` scope
4. Try regenerating the PAT

### Issue: Sensitive File Committed
1. Remove from repository: `git rm --cached <file>`
2. Add to `.gitignore`
3. Commit the changes
4. If already pushed, consider using `git filter-branch` or BFG Repo-Cleaner

## AI Agent Access Instructions

To grant an AI agent access to this repository:

1. **Generate PAT** (if not already done)
   ```
   Visit: https://github.com/settings/tokens
   Click: "Generate new token (classic)"
   Select: repo scope
   Copy: The generated token
   ```

2. **Provide Token to Agent**
   - Share the token securely
   - Include the repository URL: `https://github.com/Red-Running-Horse/marina`

3. **Agent Usage**
   ```bash
   git clone https://<TOKEN>@github.com/Red-Running-Horse/marina
   cd marina/FindYourMythos
   python3 main.py
   ```

## Monitoring Access

### Review Access Logs
- Go to: https://github.com/Red-Running-Horse/marina/settings/security_log
- Monitor for unexpected access patterns
- Review token usage

### Audit Collaborators
- Regularly review: https://github.com/Red-Running-Horse/marina/settings/access
- Remove inactive collaborators
- Update permissions as needed

## Questions?

For additional security concerns or access issues:
1. Check GitHub documentation: https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/managing-repository-settings
2. Contact repository owner: Red-Running-Horse
3. Review GitHub security best practices: https://docs.github.com/en/code-security

---

**Last Updated**: March 20, 2026
**Maintained By**: Repository Owner
