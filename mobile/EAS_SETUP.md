# 🛠️ EAS Project Setup

## ⚠️ Setup Required

The EAS Build needs to create a project first. Follow these steps:

## 🚀 Manual Setup Steps

### 1. **Initialize EAS Project**
```bash
cd mobile
npx eas build:configure
```

When prompted:
- **"Would you like to automatically create an EAS project for @ianmuler/gaston-expenses?"** → Answer **Y** (Yes)

This will:
- Create a new project in your Expo account
- Generate a unique project ID
- Update your app.json with the correct projectId

### 2. **Build APK**
After the project is configured:
```bash
npm run build:android:preview
```

## 🔧 Alternative: Manual Project Creation

If the above doesn't work, you can also:

1. Go to [expo.dev](https://expo.dev)
2. Log in to your account
3. Click "Create Project"
4. Name it "gaston-expenses" 
5. Copy the generated project ID
6. Add it to `app.json`:
   ```json
   "extra": {
     "eas": {
       "projectId": "YOUR_PROJECT_ID_HERE"
     }
   }
   ```

## 📱 Expected Workflow

1. **Configure**: `npx eas build:configure` (one time)
2. **Build**: `npm run build:android:preview` 
3. **Download**: Get APK link from terminal/dashboard
4. **Install**: Transfer to Android device and install

## 🎯 Next Steps

Run the configure command and then you'll be ready to build your APK! 🚀