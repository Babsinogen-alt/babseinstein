# Babseinstein

A study desk for retrieval practice, spacing, and the other methods with real evidence. Cards stay on the device where you study.

## Open it

On a computer or a phone, open this address. It is the app. Nothing has to be installed:

[babsinogen-alt.github.io/babseinstein](https://babsinogen-alt.github.io/babseinstein/)

A laptop cannot install an Android package, so do not download the `.apk` on a computer. On a phone, the same address opens in the browser. In Chrome, the menu has Add to Home screen if you want an icon.

## Android file

The installable package, only for an Android phone, is on the release:

[Babseinstein.apk](https://github.com/Babsinogen-alt/babseinstein/releases/latest/download/Babseinstein.apk)

Open that file on the phone. Android will warn that it did not come from the Play Store. Allow the browser or Files to install unknown apps, then open the file again.

Cards stay on the device where you study. The website and the installed package do not share cards.


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
