# 📱 GastOn APK Build Instructions

## 🚀 APK Generation Setup Complete!

All configuration files have been created and the project is ready to build APKs using EAS Build.

## 📋 Prerequisites

### 1. **Add Your Custom Logo**
Before building, add your green calculator logo to the assets directory:

```bash
# Place your logos in mobile/assets/images/
mobile/assets/images/icon.png         # 1024x1024, no transparency 
mobile/assets/images/splash-icon.png  # 1024x1024, transparent background
```

**Logo Requirements:**
- **App Icon**: 1024x1024 pixels, PNG format, no transparency, solid background
- **Splash Icon**: 1024x1024 pixels, PNG format, transparent background
- Both files must be exactly square

### 2. **Expo Account Setup**
Create a free Expo account at [expo.dev](https://expo.dev) if you don't have one.

## 🛠️ Build Commands

### Quick APK Build (Recommended)
```bash
# Navigate to mobile directory
cd mobile

# Build Android APK for testing
npm run build:android:preview
```

### All Available Build Commands
```bash
# Configure EAS Build (run once)
npm run build:configure

# Android Builds
npm run build:android:development  # Development APK with dev client
npm run build:android:preview      # Preview APK for testing
npm run build:android:production   # Production AAB for Google Play

# iOS Builds (requires macOS and Apple Developer account)
npm run build:ios:development
npm run build:ios:preview
npm run build:ios:production

# Build for both platforms
npm run build:all:preview
npm run build:all:production
```

## 📱 Build Profiles

### **Preview Profile** (Recommended for APK)
- **Output**: APK file ready to install
- **API**: Production backend (https://gaston-aq7o.onrender.com)
- **Distribution**: Internal testing
- **Use Case**: Share with testers, install directly

### **Development Profile**
- **Output**: Development APK with dev client
- **API**: Can connect to local or production
- **Features**: Hot reload, debugging tools
- **Use Case**: Active development

### **Production Profile**  
- **Output**: AAB file for Google Play Store
- **API**: Production backend only
- **Optimization**: Fully optimized and signed
- **Use Case**: App store submission

## 🔧 Configuration Files Created

### ✅ `eas.json`
```json
{
  "build": {
    "development": { "developmentClient": true, "buildType": "apk" },
    "preview": { "buildType": "apk", "distribution": "internal" },
    "production": { "buildType": "aab" }
  }
}
```

### ✅ `app.json` 
- App icon configuration: `./assets/images/icon.png`
- Splash screen with expo-splash-screen plugin
- Android package: `com.gaston.expenses`
- iOS bundle: `com.gaston.expenses`

### ✅ `package.json`
- All build scripts added
- EAS CLI and expo-splash-screen dependencies
- expo-dev-client for development builds

## 🚀 Step-by-Step APK Generation

### 1. **First Time Setup**
```bash
# Install EAS CLI globally (optional but recommended)
npm install -g @expo/cli

# Login to your Expo account
npx expo login

# Navigate to mobile directory
cd mobile
```

### 2. **Add Your Logo**
- Save your green calculator logo as `assets/images/icon.png` (1024x1024)
- Save transparent version as `assets/images/splash-icon.png` (1024x1024)

### 3. **Build APK**
```bash
# Build preview APK (most common)
npm run build:android:preview

# Or use EAS CLI directly
npx eas build --platform android --profile preview
```

### 4. **Download APK**
- Build will run on EAS servers (2-5 minutes)
- Download link will be provided in terminal
- APK also available in Expo dashboard

### 5. **Install APK**
- Transfer APK to Android device
- Enable "Install from unknown sources" in Android settings
- Install and test your app!

## 📊 Build Status & Monitoring

### EAS Dashboard
- View builds: [expo.dev/accounts/[username]/projects/gaston-expenses/builds](https://expo.dev)
- Download APKs, view logs, manage builds
- Monitor build progress in real-time

### Local Monitoring
```bash
# Check build status
npx eas build:list

# View specific build
npx eas build:view [build-id]
```

## 🎨 App Configuration

### App Identity
- **Name**: GastOn
- **Package**: com.gaston.expenses  
- **Version**: 1.0.0
- **Orientation**: Portrait only

### API Configuration
- **Development**: Local backend or production
- **Preview/Production**: https://gaston-aq7o.onrender.com

### Theme
- **Primary Background**: #F8FAFC (light gray)
- **Dark Mode Splash**: #1E293B (dark slate)
- **Icon Style**: Green calculator logo

## ⚡ Pro Tips

### Fast Development Workflow
1. Use **preview builds** for testing
2. **Development builds** for active coding
3. **Production builds** only for store submission

### Debugging Build Issues
```bash
# Check build logs
npx eas build:view [build-id] --logs

# Validate configuration
npx expo doctor

# Check for common issues
npm run lint && npm run type-check
```

### Sharing APKs
- Use the download URL from EAS
- Upload to internal testing platforms
- QR codes available in Expo dashboard

## 🔥 Ready to Build!

Your GastOn app is fully configured for APK generation. Simply add your logo files and run:

```bash
npm run build:android:preview
```

The APK will be ready in 2-5 minutes! 🎉

---

## 📚 Additional Resources

- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [App Icon Guidelines](https://docs.expo.dev/develop/user-interface/splash-screen-and-app-icon/)
- [Expo Splash Screen](https://docs.expo.dev/versions/latest/sdk/splash-screen/)
- [APK vs AAB Guide](https://docs.expo.dev/build-reference/apk/)

**¡Tu app GastOn lista para compilar! 🚀**