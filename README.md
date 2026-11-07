# Babseinstein

A study desk for retrieval practice, spacing, and the other methods with real evidence. Cards stay on the device where you study.

## On a phone

Download the Android package from the release, not from the source files:

[Babseinstein.apk](https://github.com/Babsinogen-alt/babseinstein/releases/latest/download/Babseinstein.apk)

Open that file on the phone. Android will warn that it did not come from the Play Store. Allow the browser or Files to install unknown apps, then open the file again. The app name under the icon is Babseinstein.

Cards in that install stay on the phone. They are not the cards in a browser.

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
