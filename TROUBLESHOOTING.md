# TaskMaster - Troubleshooting Guide

## 🚨 Login Page Not Working? Follow These Steps

### Step 1: Run Diagnostic Test
Open: **http://localhost:8080/diagnostic.html**

This will test:
- ✅ JavaScript is enabled
- ✅ DOM manipulation works
- ✅ Event listeners work
- ✅ LocalStorage is accessible
- ✅ Form submission works
- ✅ auth.js file is accessible

**If any tests fail, that's your problem!**

---

## Common Issues & Solutions

### Issue 1: "Nothing happens when I click buttons"

**Possible Causes:**
1. JavaScript is disabled in browser
2. Script files not loading
3. Browser cache showing old version

**Solutions:**
1. Check if JavaScript is enabled (Settings → Content Settings → JavaScript)
2. Open browser console (F12) and check for errors
3. Hard refresh: `Ctrl + Shift + R` (Chrome/Firefox) or `Ctrl + F5`
4. Clear browser cache completely

---

### Issue 2: "Page looks static, no interactions"

**Check This:**
```
1. Open browser console (press F12)
2. Look for these messages:
   ✅ "[Auth] Script loaded!"
   ✅ "[Auth] DOM loaded, initializing..."
   ✅ "[Auth] ✅ All systems ready!"
```

**If you DON'T see these messages:**
- The JavaScript file isn't loading
- Check: Is the server running?
- Try: http://localhost:8080/auth.js directly
- Should download or display the JavaScript file

---

### Issue 3: "JavaScript Status shows 'Loading...'"

This means the script file loaded but didn't execute properly.

**Solution:**
1. Open: http://localhost:8080/diagnostic.html
2. All tests should show green checkmarks
3. Click "Check Auth Script" button
4. Should say "auth.js file exists and is accessible"

---

### Issue 4: "Login button does nothing"

**Debug Steps:**

1. **Open Browser Console (F12)**
2. **Try to login with any email/password**
3. **Look for this message:**
   ```
   [Auth] Login form submitted
   ```

**If you see the message:**
- JavaScript IS working
- Check if you have an account created
- Try creating account first (Sign Up tab)

**If you DON'T see the message:**
- Form event listener not attached
- Reload page with Ctrl + Shift + R
- Check browser console for errors

---

## Quick Fixes

### Fix 1: Clear Everything and Start Fresh
```javascript
// Open browser console (F12) and run:
localStorage.clear();
location.reload();
```

### Fix 2: Create Test Account Manually
```javascript
// Open browser console (F12) and run:
const users = [{ 
  name: 'Test User', 
  email: 'test@test.com', 
  password: '123456' 
}];
localStorage.setItem('tm_users', JSON.stringify(users));
alert('Test account created! Email: test@test.com, Password: 123456');
```

### Fix 3: Check Server is Running
```cmd
# Make sure you see this:
Serving HTTP on :: port 8080 (http://[::]:8080/) ...
```

If not, run:
```cmd
python -m http.server 8080
```

---

## How to Test Properly

### Method 1: Use Diagnostic Page
1. Go to: http://localhost:8080/diagnostic.html
2. All 6 tests should be GREEN ✅
3. Click "Go to Login" button

### Method 2: Use Test Page
1. Go to: http://localhost:8080/test.html
2. Click "Test LocalStorage" - should pass
3. Click "Create Test Account & Login" 
4. Click "Open Login Page"
5. Login with: test@example.com / test123

### Method 3: Manual Test
1. Go to: http://localhost:8080/login.html
2. Look for "✅ JavaScript Active" under TaskMaster logo
3. Click "Sign Up" tab - should switch tabs
4. Try clicking the eye icon on password - should toggle visibility
5. Fill form and submit - should show validation errors if empty

---

## Browser Console Checks

### What You SHOULD See:
```
[Auth] Script loaded!
[Auth] DOM loaded, initializing...
[Auth] All elements found successfully
[Auth] Tab switching enabled
[Auth] Found 4 password toggles
[Auth] Password toggles enabled
[Auth] Login form handler attached
[Auth] Signup form handler attached
[Auth] ✅ All systems ready!
```

### What You Should NOT See:
```
❌ Uncaught ReferenceError
❌ Failed to load resource
❌ ERROR: Tab elements not found
❌ 404 Not Found
```

---

## File Checklist

Make sure these files exist:
- ✅ login.html
- ✅ auth.js
- ✅ auth.css
- ✅ style.css
- ✅ index.html
- ✅ app.js

**Check files exist:**
```cmd
dir *.html *.js *.css
```

---

## Still Not Working?

### Last Resort Solutions:

1. **Download fresh copy**
   - Backup your files
   - Re-download the project
   - Copy back any custom changes

2. **Try different browser**
   - Chrome
   - Firefox
   - Edge
   - NOT Internet Explorer

3. **Check browser version**
   - Update to latest version
   - ES6+ JavaScript required

4. **Disable browser extensions**
   - Some extensions block JavaScript
   - Try incognito/private mode
   - Test with extensions disabled

---

## Success Checklist

When everything works, you should be able to:

- [ ] See "✅ JavaScript Active" on login page
- [ ] Click tabs to switch between Login/Sign Up
- [ ] Click eye icon to show/hide password
- [ ] See red error messages when submitting empty form
- [ ] Create new account successfully
- [ ] Get "Account created!" green success message
- [ ] Auto-switch to Login tab after signup
- [ ] Login with created account
- [ ] Get redirected to index.html after login

---

## Need More Help?

1. Run: http://localhost:8080/diagnostic.html
2. Take screenshot of results
3. Open browser console (F12)
4. Copy any error messages
5. Check which test failed

---

## Quick Reference URLs

| Page | URL |
|------|-----|
| Diagnostic | http://localhost:8080/diagnostic.html |
| Test Page | http://localhost:8080/test.html |
| Login | http://localhost:8080/login.html |
| Main App | http://localhost:8080/index.html |
| Quick Start | http://localhost:8080/QUICK_START.html |

---

**Remember:** The application works 100% client-side with JavaScript. If JavaScript isn't running, nothing will work!
