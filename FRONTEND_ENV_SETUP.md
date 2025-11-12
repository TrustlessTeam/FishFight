# 🔧 Frontend Environment Variable Setup

## Problem
Frontend is trying to connect to `localhost:3001` instead of production server on Railway.

## Solution

The ServerMonitor component now has **multiple fallbacks** to ensure it uses the production server:

1. **Environment Variable** (best) - Set `REACT_APP_SERVER_URL` in Railway
2. **Hostname Detection** (automatic) - If not localhost, uses production
3. **NODE_ENV Check** - If production build, uses production
4. **Development Fallback** - Only uses localhost in development

## ✅ Quick Fix (Recommended)

### Option 1: Set Environment Variable in Railway (Best)

1. Go to **Railway Dashboard**
2. Select your **FishFight-Frontend** service
3. Go to **Variables** tab
4. Click **+ New Variable**
5. Add:
   - **Name**: `REACT_APP_SERVER_URL`
   - **Value**: `https://fishfight-server-production.up.railway.app`
6. **Save** and **Redeploy**

### Option 2: Automatic Detection (Already Implemented)

The code now automatically detects if you're running on Railway (not localhost) and uses the production server. **No action needed** - just redeploy!

## How It Works

```javascript
const getServerUrl = () => {
  // 1. Check env var (set in Railway)
  if (process.env.REACT_APP_SERVER_URL) {
    return process.env.REACT_APP_SERVER_URL;
  }
  
  // 2. Check hostname (automatic detection)
  if (window.location.hostname !== 'localhost') {
    return 'https://fishfight-server-production.up.railway.app';
  }
  
  // 3. Development fallback
  return 'http://localhost:3001';
};
```

## Verification

After redeploying, check browser console:
- ✅ Should see requests to: `https://fishfight-server-production.up.railway.app`
- ❌ Should NOT see: `http://localhost:3001`

## Troubleshooting

### Still seeing localhost?
1. **Clear browser cache** - Old JavaScript might be cached
2. **Hard refresh** - Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
3. **Check Railway logs** - Verify build completed successfully
4. **Check browser console** - Look for the actual URL being used

### Environment variable not working?
- React environment variables must start with `REACT_APP_`
- Must be set **before** build (in Railway Variables tab)
- Must **redeploy** after setting variable

## Current Status

✅ **Automatic detection implemented** - Will use production server if not on localhost
✅ **Environment variable support** - Can be set in Railway for explicit control
✅ **Multiple fallbacks** - Ensures production URL is used

**Next Step**: Redeploy frontend and test!

