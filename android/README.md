# Lernquest on Google Play

The Play app is a **Trusted Web Activity**: a small Android shell built with
[Bubblewrap](https://github.com/GoogleChromeLabs/bubblewrap) that opens
`https://thezieger.github.io/rogue-adventures/` full screen in Chrome. Saves, offline cache and updates work as in the
installed PWA. A game update is just a push to `main`. A new bundle is only needed when `twa-manifest.json` changes
(name, colours, icons) or when Google raises the required Android version (`targetSdkVersion`) – about once a year: bump
`@bubblewrap/cli` in `.github/workflows/android.yml` and rebuild.

| File | Purpose |
|---|---|
| `twa-manifest.json` | App config. Package `io.github.thezieger.lernquest` – **can never change after the first upload**. |
| `store/icon-512.png`, `store/feature-graphic.png` | Store listing art, from `node tools/make_icons.js` |
| `../docs/screenshots/narrow-*.png` | Phone screenshots for the listing (1080×1920) |
| `../docs/datenschutz.html` | Privacy policy: https://thezieger.github.io/rogue-adventures/datenschutz.html |
| `../.github/workflows/android.yml` | Builds the signed `.aab` (Actions tab → „android-app“ → „Run workflow“) |

## One-time setup

1. **Fill in the controller** in `src/datenschutz.html` („Wer ist verantwortlich?“: name, address, e-mail), then
   `npm run build`. Play and the GDPR both require it.
2. **Create the upload key** (any JDK, or Android Studio's `jbr/bin/keytool`), keep the file and password safe
   (a password manager plus a backup):
   ```bash
   keytool -genkeypair -keystore upload.keystore -alias upload -keyalg RSA -keysize 2048 -validity 10000 -dname "CN=Lernquest"
   base64 -w0 upload.keystore   # macOS: base64 -i upload.keystore
   ```
   Repository → Settings → Secrets and variables → Actions → add `ANDROID_KEYSTORE_BASE64` (the base64 text) and
   `ANDROID_KEYSTORE_PASSWORD`. If the key is lost, Play support can reset the upload key; the app signing key stays
   with Google (Play App Signing).
3. **Play Console account**: https://play.google.com/console – 25 USD, identity check. New personal accounts must run
   a closed test with at least 12 testers for 14 days before production access.
4. **Build**: Actions → „android-app“ → „Run workflow“. Download the artifact; upload `app-release-bundle.aab`.
   The run number is the `versionCode`, the date the version name.
5. **Domain verification (removes the browser bar)**: after the first upload, Play Console → Test and release →
   App integrity → App signing shows a ready „Digital Asset Links JSON“. It must be served at
   **`https://thezieger.github.io/.well-known/assetlinks.json`** – the domain root, not under `/rogue-adventures/`.
   So create the user-site repository **`theZieger/thezieger.github.io`** (Pages from `main`, root), add the file as
   `.well-known/assetlinks.json` and an empty `.nojekyll` (otherwise Jekyll skips dot folders). To also test a
   sideloaded `app-release-signed.apk`, add the upload key's SHA-256 (shown in the workflow run summary) as a second
   fingerprint. Check: https://developers.google.com/digital-asset-links/tools/generator
   (a custom domain later would mean a new `host` here, a new file there and a new bundle).

## Play Console answers

**App content**
- Privacy policy: https://thezieger.github.io/rogue-adventures/datenschutz.html
- Ads: no. In-app purchases: none. App access: everything is available without login.
- Target audience: ages 6–8 and 9–12 → the Families policy applies. No ads SDKs or third-party SDKs are included.
- Content rating (IARC): category „Game“ (or „Education“). Fantasy creatures fight; no blood, no injury, no fear,
  no gambling, no user-to-user communication, no sharing of location or personal data, no purchases.
  The feedback form is one-way to the developer.
- Data safety:
  - Data collected: **yes** – „App activity → Other user-generated content“ (the feedback text from the parents' area and the
    game version). Purpose: „App functionality“ / developer communication. Optional (user decides), not shared with
    third parties for their own use (Google Forms is a service provider).
  - Data encrypted in transit: yes (HTTPS). Deletion: users can ask via the address in the privacy policy.
  - Saves stay on the device only and are not „collected“ in Play's sense.
- Feedback is only offered in the parents' area (five taps on the title) because the message leaves the device.
- Government app / news / health / financial features: no.

**Store listing (de-DE)**
- App name (max 30): `Lernquest: Lernspiel Klasse 3`
- Short description (max 80):
  `Jede Attacke ist eine Aufgabe: Mathe, Luther und Kartoffeln für die 3. Klasse.`
- Full description:
  ```
  Lernquest ist ein Abenteuerspiel für Grundschulkinder ab etwa der 3. Klasse. Auf einer Karte geht es von Kampf zu
  Kampf. Jede Attacke ist eine Aufgabe: Richtig gelöst trifft sie, falsch schlägt der Gegner zurück.

  Drei Fächer:
  • Zahlenquest – Plus und Minus bis 1000, Einmaleins, Zahlenrätsel, Zahlenfolgen und Nachbarzahlen
  • Luthers Weg – Martin Luther und die Reformation
  • Kartoffel-Werkstatt – Pflanzenteile, Anbau, Ernte früher und heute, Kartoffelkäfer

  Die Aufgaben passen sich an: Wer sicher rechnet, bekommt schwerere, wer Fehler macht, leichtere. Falsch
  beantwortete Wissensfragen kommen bald wieder. Jede Aufgabenart wird beim ersten Mal erklärt.

  Für Eltern: Fünfmal auf den Titel tippen öffnet den Elternbereich mit der Trefferquote je Aufgabenart. Dort lassen
  sich Aufgabenarten abschalten.

  Kein Zeitdruck, keine Werbung, keine Käufe, kein Konto. Der Spielstand bleibt auf dem Gerät, das Spiel läuft auch
  offline.
  ```
- Category: Education (or Games → Educational). Tags: Lernspiel, Mathematik, Grundschule.
- Contact e-mail: required and public; consider a dedicated address.
