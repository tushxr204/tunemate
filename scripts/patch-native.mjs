// Lets Google sign-in return to the app: registers the com.tunemate.app:// link on Android and iOS.
// Safe to run more than once.
import { existsSync, readFileSync, writeFileSync } from 'node:fs';

const SCHEME = 'com.tunemate.app';

const manifest = 'android/app/src/main/AndroidManifest.xml';
if (existsSync(manifest)) {
  let xml = readFileSync(manifest, 'utf8');
  if (!xml.includes(`android:scheme="${SCHEME}"`)) {
    const filter = `
            <intent-filter>
                <action android:name="android.intent.action.VIEW" />
                <category android:name="android.intent.category.DEFAULT" />
                <category android:name="android.intent.category.BROWSABLE" />
                <data android:scheme="${SCHEME}" android:host="login-callback" />
            </intent-filter>
`;
    xml = xml.replace('</activity>', filter + '        </activity>');
    writeFileSync(manifest, xml);
    console.log('✅ Android: sign-in link added');
  } else console.log('Android: sign-in link already present');
}

const plist = 'ios/App/App/Info.plist';
if (existsSync(plist)) {
  let p = readFileSync(plist, 'utf8');
  if (!p.includes(`<string>${SCHEME}</string>`)) {
    const types = `	<key>CFBundleURLTypes</key>
	<array>
		<dict>
			<key>CFBundleURLName</key>
			<string>${SCHEME}</string>
			<key>CFBundleURLSchemes</key>
			<array>
				<string>${SCHEME}</string>
			</array>
		</dict>
	</array>
`;
    p = p.replace(/<dict>\n/, '<dict>\n' + types);
    writeFileSync(plist, p);
    console.log('✅ iOS: sign-in link added');
  } else console.log('iOS: sign-in link already present');
}
