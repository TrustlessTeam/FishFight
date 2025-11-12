# 🔗 Frontend-Backend Connection Guide

## Current Issues

1. **ServerMonitor connecting to localhost** instead of production server
2. **Route `/console` not matching** - React Router issue
3. **CORS errors** - Backend needs to allow frontend origin

## ✅ Fixes Applied

### 1. ServerMonitor URL Updated
- Now uses production URL: `https://fishfight-server-production.up.railway.app`
- Falls back to localhost only in development
- Checks multiple environment variables

### 2. Routes Added
- `/server` - Server Monitor Console
- `/admin` - Server Monitor Console (alias)
- `/console` - Server Monitor Console (alias)

## 🔧 Railway Environment Variables Needed

**For Frontend (FishFight-Frontend service):**

```bash
REACT_APP_SERVER_URL=https://fishfight-server-production.up.railway.app
# OR
REACT_APP_METADATA_SERVER_URL=https://fishfight-server-production.up.railway.app
```

**Set in Railway:**
1. Go to your **FishFight-Frontend** service
2. **Variables** tab
3. Add: `REACT_APP_SERVER_URL` = `https://fishfight-server-production.up.railway.app`
4. Redeploy frontend

## 🔒 Backend CORS Configuration

The backend already has CORS enabled, but make sure it allows your frontend domain:

**Current CORS config:**
```javascript
res.header('Access-Control-Allow-Origin', '*');  // Allows all origins
```

This should work, but if you want to restrict it:

**In Railway Backend Variables:**
```bash
ALLOWED_ORIGINS=https://fishfight-3d-production.up.railway.app
```

Then update `src/server.js` to use this:
```javascript
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['*'];
res.header('Access-Control-Allow-Origin', 
  allowedOrigins.includes('*') ? '*' : req.headers.origin);
```

## 🧪 Testing Connection

### Test Backend Directly:
```bash
curl https://fishfight-server-production.up.railway.app/health
```

Should return:
```json
{
  "status": "ok" or "degraded",
  "service": "FishFight Metadata Server",
  ...
}
```

### Test from Frontend:
1. Deploy frontend with `REACT_APP_SERVER_URL` set
2. Visit: `https://your-frontend.com/server`
3. Should see server health status

## 📋 Checklist

- [ ] Set `REACT_APP_SERVER_URL` in Railway frontend variables
- [ ] Redeploy frontend
- [ ] Verify backend is running: `curl https://fishfight-server-production.up.railway.app/health`
- [ ] Test `/server` route in frontend
- [ ] Check browser console for CORS errors

## 🐛 Troubleshooting

### Still seeing localhost:3001?
- Environment variable not set in Railway
- Frontend not rebuilt after setting variable
- Clear browser cache

### Route not matching?
- Make sure you're using the correct path: `/server`, `/admin`, or `/console`
- Check browser console for React Router errors
- Verify routes are outside UnityWindow wrapper

### CORS errors?
- Backend CORS is set to `*` (allows all)
- Check backend logs for CORS errors
- Verify backend is actually running

