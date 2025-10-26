# Git Workflow - How to Update GitHub

## The Short Answer

**No, editing locally does NOT automatically update GitHub.** You need to:
1. Edit your code
2. Commit changes
3. Push to GitHub

Then if connected to Netlify, GitHub will auto-deploy!

---

## Step-by-Step: Update Your Code

### 1. Make Your Changes
Edit your files (index.html, script.js, etc.) in your code editor.

### 2. Stage Your Changes
```bash
git add .
```
This adds all changed files to staging.

### 3. Commit Your Changes
```bash
git commit -m "Description of what you changed"
```
Example: `git commit -m "Added mobile compatibility check"`

### 4. Push to GitHub
```bash
git push
```
This uploads your changes to GitHub.

### 5. (Optional) If Connected to Netlify
Netlify will automatically detect the push and deploy the new version!

---

## Complete Example

Let's say you edited `script.js`:

```bash
# 1. Check what changed
git status

# 2. Add all changes
git add .

# 3. Commit with message
git commit -m "Fixed mobile compatibility"

# 4. Push to GitHub
git push
```

**That's it!** Your changes are now on GitHub.

---

## Quick Reference Commands

### View What Changed
```bash
git status              # See changed files
git diff                # See actual changes
```

### Commit Changes
```bash
git add .                          # Stage all changes
git add script.js                  # Stage specific file
git commit -m "Your message"        # Commit changes
git push                           # Push to GitHub
```

### Do It All At Once
```bash
git add . && git commit -m "Updated features" && git push
```

---

## Common Workflow

### Every Time You Make Changes:

1. **Edit** your code locally
2. **Save** your files
3. **Run** these commands:
   ```bash
   git add .
   git commit -m "What you changed"
   git push
   ```
4. **Wait** for Netlify to auto-deploy (if connected)

---

## First Time Setup (If Not Done Yet)

### 1. Initialize Git (if not done)
```bash
git init
```

### 2. Add Remote (if not connected)
```bash
git remote add origin YOUR_GITHUB_REPO_URL
```

### 3. First Push
```bash
git add .
git commit -m "Initial commit"
git branch -M main
git push -u origin main
```

After this, just use `git add . && git commit -m "message" && git push` for updates.

---

## Automatic Deployment to Netlify

If you connected GitHub to Netlify:

1. ✅ You push to GitHub
2. ✅ Netlify detects the push
3. ✅ Netlify automatically builds
4. ✅ Netlify automatically deploys
5. ✅ Your site updates!

**No manual Netlify steps needed!**

---

## Troubleshooting

### Error: "No upstream branch"
```bash
git push -u origin main
```

### Error: "Permission denied"
- Check your GitHub credentials
- You may need to re-authenticate

### Error: "Everything up-to-date"
- No changes to push
- Make sure you saved your files

### Error: "Conflict"
```bash
git pull              # Get latest changes
git add .
git commit -m "Merged changes"
git push
```

---

## One-Liner Updates

### Quick update (edit → save → push):
```bash
git add . && git commit -m "Update" && git push
```

### Update with description:
```bash
git add . && git commit -m "Added new feature" && git push
```

---

## Best Practices

### Good Commit Messages:
```bash
git commit -m "Fixed mobile viewport issue"
git commit -m "Added data export functionality"
git commit -m "Removed broken Google login button"
git commit -m "Improved error handling"
```

### Bad Commit Messages:
```bash
git commit -m "asdf"
git commit -m "stuff"
git commit -m "update"
```

---

## Summary

**To update code on GitHub:**

1. **Edit** your code locally
2. **Save** your files
3. **Run**:
   ```bash
   git add .
   git commit -m "Your commit message"
   git push
   ```

**That's it!** Changes are now on GitHub and (if connected) Netlify will auto-deploy.

**Time to update**: ~2 minutes (1 minute to commit/push, 1 minute for Netlify to deploy)

