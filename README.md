# Quire

A study desk for retrieval practice, spacing, and the other methods with real evidence. Cards stay on the device where you study.

## On a phone

The installable Android package is `Quire.apk` (package name `com.babsinogen.quire`). It is a wrapper around this app, not a Play Store listing. Download it, open it, and allow the install if Android asks. Cards in that app are not the cards in a browser preview.

## Run the site

```bash
npm install
npm run dev
```

Then open the address printed in the terminal.

## Rebuild the phone package

```bash
npm run build:wrapper
npx cap sync android
cd android && ./gradlew assembleDebug
```

The debug package is written to `android/app/build/outputs/apk/debug/app-debug.apk`. A Play Store upload is a separate signed bundle and a Play Console account.
