/**
 * Detox Configuration for Projo App
 * 
 * Configured for React Native/Expo testing on iOS and Android
 */

module.exports = {
 testRunner: {
 args: {
 '$0': 'jest',
 config: 'e2e/jest.config.js'
 },
 jest: {
 setupFilesAfterEnv: ['./e2e/init.js']
 }
 },
 apps: {
 'ios.debug': {
 type: 'ios.app',
 binaryPath: 'ios/build/Build/Products/Debug-iphonesimulator/Projo.app',
 build: 'xcodebuild -workspace ios/Projo.xcworkspace -scheme Projo -configuration Debug -sdk iphonesimulator -derivedDataPath ios/build'
 },
 'ios.release': {
 type: 'ios.app',
 binaryPath: 'ios/build/Build/Products/Release-iphonesimulator/Projo.app',
 build: 'xcodebuild -workspace ios/Projo.xcworkspace -scheme Projo -configuration Release -sdk iphonesimulator -derivedDataPath ios/build'
 },
 'android.debug': {
 type: 'android.apk',
 binaryPath: 'android/app/build/outputs/apk/debug/app-debug.apk',
 build: 'cd android && ./gradlew assembleDebug assembleAndroidTest -DtestBuildType=debug && cd ..',
 reversePorts: [8081, 3000]
 },
 'android.release': {
 type: 'android.apk',
 binaryPath: 'android/app/build/outputs/apk/release/app-release.apk',
 build: 'cd android && ./gradlew assembleRelease assembleAndroidTest -DtestBuildType=release && cd ..'
 },
 // Web configuration for testing
 'web.debug': {
 type: 'web.browser',
 url: 'http://localhost:19006',
 webDriverAgentPort: 8099
 },
 // React Native development build
 'rn.debug': {
 type: 'ios.app',
 bundleId: 'host.exp.exponent'
 }
 },
 devices: {
 simulator: {
 type: 'ios.simulator',
 device: {
 type: 'iPhone 15 Pro'
 }
 },
 attached: {
 type: 'android.attached',
 device: {
 adbName: '.*'
 }
 },
 emulator: {
 type: 'android.emulator',
 device: {
 avdName: 'Pixel_7_API_34'
 }
 },
 genymotion: {
 type: 'android.genycloud',
 device: {
 recipeName: 'Detox_Pixel_API_29'
 }
 }
 },
 configurations: {
 'ios.sim.debug': {
 device: 'simulator',
 app: 'ios.debug'
 },
 'ios.sim.release': {
 device: 'simulator',
 app: 'ios.release'
 },
 'android.emu.debug': {
 device: 'emulator',
 app: 'android.debug'
 },
 'android.emu.release': {
 device: 'emulator',
 app: 'android.release'
 },
 'android.attached.debug': {
 device: 'attached',
 app: 'android.debug'
 },
 'web.debug': {
 device: 'simulator',
 app: 'web.debug'
 },
 'rn.debug': {
 device: 'simulator', 
 app: 'rn.debug'
 }
 },
 behavior: {
 init: {
 reinstallApp: true,
 exposeGlobals: false
 },
 launchApp: 'auto'
 },
 artifacts: {
 rootDir: './e2e/artifacts',
 plugins: {
 log: {
 enabled: true,
 keepOnlyFailedTestsArtifacts: false
 },
 screenshot: {
 enabled: true,
 shouldTakeAutomaticSnapshots: true,
 keepOnlyFailedTestsArtifacts: false,
 takeWhen: {
 testStart: false,
 testDone: true,
 testFailure: true
 }
 },
 video: {
 enabled: true,
 keepOnlyFailedTestsArtifacts: false,
 takeWhen: {
 testStart: false,
 testDone: true,
 testFailure: true
 }
 },
 instruments: {
 enabled: false
 },
 timeline: {
 enabled: false
 },
 uiHierarchy: {
 enabled: false
 }
 }
 },
 logger: {
 level: 'info'
 }
};
