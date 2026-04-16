# StoryPath - Render Deployment Setup Guide

## Current Deployment Architecture

Your application is deployed across **TWO SEPARATE RENDER ACCOUNTS**:

- **Frontend**: https://storypath-h0ji.onrender.com (Render Account 1)
- **Backend**: https://storypath-app.onrender.com (Render Account 2)

Since these are on different domains, you **MUST** configure CORS properly for the frontend to communicate with the backend.

---

## ✅ Frontend Setup (COMPLETED)

### What Was Fixed:
1. **Created `.env.production`** with correct backend URL:
   ```
   VITE_API_URL=https://storypath-app.onrender.com/api
   ```

2. **Enhanced API Client** (`frontend/src/api/client.js`):
   - Reads `VITE_API_URL` from environment
   - Falls back to runtime URL detection if not set
   - Includes comprehensive logging for debugging
   - Handles CORS errors gracefully
   - Retries with alternative URLs if primary fails

3. **Frontend Build**: ✅ Tested and working (no errors)

---

## 🔧 Backend Setup (CRITICAL - MUST DO)

Since your backend is on a **different Render account**, you must manually configure:

### 1. Set Environment Variables on Backend (Render Dashboard)

**For the backend service on `storypath-app.onrender.com`:**

Go to: **Dashboard > Your Backend Service > Environment**

Set the following variables:

| Key | Value | Where to Get |
|-----|-------|---|
| `JWT_SECRET` | *(generate below)* | ⬇️ See "Generate JWT Secret" section |
| `FRONTEND_ORIGIN` | `https://storypath-h0ji.onrender.com` | Fixed - this is your frontend URL |
| `DATABASE_URL` | *(keep existing)* | Already set to Aiven MySQL |
| `NODE_ENV` | `production` | Fixed |
| `PORT` | `5000` | Fixed |

### 2. Generate JWT_SECRET

Copy ONE of these into the Render dashboard:

**Option A (Random 32-char base64):**
```
Run this in any terminal:
openssl rand -base64 32
```
Then copy the output → Paste into Render `JWT_SECRET` field.

**Option B (Use this example):**
```
sup3rS3cur3JWT_K3yFor_StoryPath_D3pl0ym3nt_123456v9
```

**Option C (Generate online):**
Visit: https://insomnia.rest/ or paste into any random generator:
```
jhb3k8x9d2m1p0q7r4s5t8u9v2w3x4y5z6a7b8c9d0e1f2
```

**IMPORTANT**: Use ANY strong random string of 32+ characters. It just needs to be consistent.

### 3. Deploy Backend After Setting Variables

After setting the environment variables in Render dashboard:

1. Click **"Deploy latest commit"** or **"Redeploy"** button
2. Wait 2-3 minutes for the build and deployment to complete
3. Check that it deploys without errors

---

## 🧪 Testing the Deployment

### Test 1: Backend API Health

Open in your browser or Postman:
```
https://storypath-app.onrender.com/api/health
```

**Expected response:**
```json
{
  "status": "ok",
  "environment": "production",
  "time": "2025-04-16T..."
}
```

If you get a 502 or 503 error → Backend failed to start (check environment variables and Render logs)

### Test 2: Frontend Loading

Visit: https://storypath-h0ji.onrender.com

Check browser DevTools:
- **Console tab**: Look for `[API Client]` messages showing which URLs it's trying
- **Network tab**: Look for `GET /api/health` request - should succeed with 200 status

### Test 3: User Registration

1. Go to https://storypath-h0ji.onrender.com
2. Click "Register" 
3. Fill in name, email, password
4. Click submit

**In DevTools → Network tab**, click the registration request and check:
- **Status**: Should be `201` (Created)
- **Response**: Should contain:
  ```json
  {
    "message": "User registered successfully",
    "token": "eyJhbGc...",
    "user": { "id": ..., "name": "...", "email": "..." }
  }
  ```

If token is missing → **JWT_SECRET is not set correctly** on backend

### Test 4: Login

1. Go to https://storypath-h0ji.onrender.com/#/login
2. Enter registered email and password
3. Click submit

**Expected**: Logged in and redirected to Dashboard with stories visible

### Test 5: Create Story

1. Once logged in, click "Create Story"
2. Fill in story details
3. Submit

**Expected**: Story created successfully

---

## 🐛 Troubleshooting

### Problem: "Access to XMLHttpRequest at 'https://storypath-app.onrender.com...' blocked by CORS"

**Cause**: Backend's CORS configuration doesn't include frontend URL

**Fix:**
1. Check backend's `FRONTEND_ORIGIN` environment variable on Render
2. Ensure it's set to: `https://storypath-h0ji.onrender.com`
3. Redeploy backend
4. Clear browser cache (Ctrl+Shift+Del) and hard refresh (Ctrl+F5)

### Problem: "Registration response missing token"

**Cause**: `JWT_SECRET` not set or empty on backend

**Fix:**
1. Go to Render backend service → Environment
2. Check that `JWT_SECRET` has a non-empty value
3. If empty, generate a strong secret and set it (see "Generate JWT_SECRET" section above)
4. Redeploy backend
5. Try registration again

### Problem: "404 on /api/stories"

**Cause**: Backend API failed to start

**Fixes to try (in order):**
1. Check backend environment variables are all set
2. Check backend Render build logs for errors
3. Check that `DATABASE_URL` is correct
4. Manually trigger redeploy in Render dashboard
5. Check Render status page for outages

### Problem: Frontend shows old version

**Fix:**
1. Hard refresh frontend: `Ctrl+Shift+Del` → Clear all → Then `Ctrl+F5`
2. Or check Render deployment logs - ensure latest commit was deployed
3. If not, manually trigger redeploy on frontend service

---

## 📋 Checklist for Production

- [ ] **Backend Render Service**:
  - [ ] `JWT_SECRET` is set (not empty)
  - [ ] `FRONTEND_ORIGIN` is set to `https://storypath-h0ji.onrender.com`
  - [ ] `DATABASE_URL` is correct (Aiven MySQL)
  - [ ] `NODE_ENV` is `production`
  - [ ] Service is deployed and running (no build errors)

- [ ] **Frontend Render Service**:
  - [ ] `.env.production` file exists with correct backend URL
  - [ ] Latest code pushed to GitHub
  - [ ] Service is deployed and running
  - [ ] Browser can access https://storypath-h0ji.onrender.com

- [ ] **Testing**:
  - [ ] Backend `/api/health` returns 200
  - [ ] Frontend can be accessed without 404
  - [ ] Can register new user (token returned)
  - [ ] Can login with credentials
  - [ ] Can see stories on dashboard
  - [ ] Can create new story

---

## 🚀 Making Future Changes

When you push new code to GitHub:

1. **Backend changes**: Render automatically deploys within 1-2 minutes
2. **Frontend changes**: Render automatically deploys within 1-2 minutes
3. **Environment variables**: Must be manually updated in Render dashboard (doesn't auto-deploy)

To redeploy after changing environment variables:
- Go to Render service → Click "Redeploy latest commit"

---

## 📞 Quick Reference

- **Frontend Status**: https://storypath-h0ji.onrender.com
- **Backend Status**: https://storypath-app.onrender.com/api/health
- **Frontend Code**: Push to GitHub → Auto-deploys
- **Backend Code**: Push to GitHub → Auto-deploys
- **Environment Variables**: Manually set in Render → Manual redeploy needed

---

## ⚠️ Important Notes

1. **Backend and Frontend on Different Accounts**: You MUST manually manage both services. GitHub commits only trigger auto-deploy; environment variable changes require manual action.

2. **JWT_SECRET**: This is a SECRET - don't share it. Change if suspected it's been exposed.

3. **FRONTEND_ORIGIN**: On production, this MUST exactly match the frontend URL for CORS to work.

4. **Database**: Using Aiven MySQL with SSL. Connection works locally and in production.

5. **Local Development**: Uses `http://localhost:5000` and `http://localhost:5173`. Environment files (`.env`, `.env.local`) are ignored by Git and won't affect production.

---

## 🎯 Next Steps

1. ✅ **Frontend is ready** - all fixes pushed to GitHub
2. 🔧 **Configure backend environment variables** (follow Backend Setup section above)
3. ✅ **Test** (follow Testing section above)
4. 🚀 **Launch** - everything should work!

Good luck! 🚀
