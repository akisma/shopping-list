# Wake Word Detection Plan (Phase 2)

## Overview

Implement always-on wake word detection so users can say "Hey Shoppy" to start a voice command without tapping the mic button.

## Architecture Design

### Frontend Components

#### 1. Wake Word Detection Library

**Option A: Use @picovoice/porcupine-react-native**
- Pros: Purpose-built for wake words, offline, very efficient
- Cons: Requires paid license for production, additional dependency
- Performance: ~1% CPU, <10MB RAM

**Option B: Use Expo AV + Simple Audio Level Detection**
- Pros: Already have dependencies, free
- Cons: Not true wake word detection, less accurate
- Performance: Higher CPU usage, battery drain

**Recommended: Option A (Porcupine)**
- Start with free tier for development
- Upgrade to paid for production if user feedback is positive

#### 2. Background Audio Permission

**iOS Requirements:**
```xml
<!-- Info.plist -->
<key>UIBackgroundModes</key>
<array>
  <key>audio</key>
</array>
<key>NSMicrophoneUsageDescription</key>
<string>Used for voice commands and wake word detection</string>
```

**Android Requirements:**
```xml
<!-- AndroidManifest.xml -->
<uses-permission android:name="android.permission.RECORD_AUDIO" />
<uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
```

#### 3. VoiceListeningContext Updates

Already has `setBackgroundWakeWord()` method - just needs implementation:

```typescript
// In VoiceListeningContext
const [isWakeWordEnabled, setIsWakeWordEnabled] = useState(false);

const setBackgroundWakeWord = useCallback((enabled: boolean) => {
  setIsWakeWordEnabled(enabled);
  if (enabled) {
    setListeningMode('background-wake-word');
    startWakeWordDetection();
  } else {
    setListeningMode('inactive');
    stopWakeWordDetection();
  }
}, []);
```

#### 4. New Hook: use-wake-word-detection.ts

```typescript
interface UseWakeWordDetection {
  isActive: boolean;
  startDetection: () => Promise<void>;
  stopDetection: () => void;
  sensitivity: number;
  setSensitivity: (value: number) => void;
  onWakeWordDetected: () => void;
}

export function useWakeWordDetection(): UseWakeWordDetection {
  const [isActive, setIsActive] = useState(false);
  const [sensitivity, setSensitivity] = useState(0.5); // 0-1
  const porcupineRef = useRef<Porcupine | null>(null);
  
  const startDetection = async () => {
    // Request microphone permission
    // Initialize Porcupine with custom wake word
    // Start audio streaming
    // Listen for wake word detection
  };
  
  const stopDetection = () => {
    // Stop audio streaming
    // Clean up Porcupine
  };
  
  return { isActive, startDetection, stopDetection, sensitivity, setSensitivity };
}
```

#### 5. Settings Screen Updates

Add wake word settings in `app/(tabs)/settings.tsx`:

```typescript
<View style={styles.section}>
  <Text style={styles.sectionTitle}>Wake Word Detection</Text>
  
  <View style={styles.setting}>
    <Text>Enable "Hey Shoppy"</Text>
    <Switch 
      value={wakeWordEnabled}
      onValueChange={toggleWakeWord}
    />
  </View>
  
  {wakeWordEnabled && (
    <>
      <View style={styles.setting}>
        <Text>Sensitivity</Text>
        <Slider
          value={sensitivity}
          onValueChange={setSensitivity}
          minimumValue={0}
          maximumValue={1}
          step={0.1}
        />
      </View>
      
      <View style={styles.setting}>
        <Button 
          title="Test Wake Word"
          onPress={testWakeWord}
        />
      </View>
    </>
  )}
</View>
```

#### 6. VoiceActivationBanner Updates

Already shows wake word message - just needs to be active when enabled:

```typescript
// Current behavior - shows when voice activation toggle is on
// No changes needed, already says "Say 'Hey Shoppy' to start"
```

#### 7. Wake Word Flow Integration

```typescript
// In use-wake-word-detection.ts
const onWakeWordDetected = useCallback(() => {
  // Vibrate to confirm detection
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  
  // Start voice recording automatically
  startRecording();
  
  // Could also trigger TTS: "Yes?"
}, [startRecording]);
```

### Backend Components

**No backend changes needed!** Wake word detection is entirely frontend/device.

Backend already handles voice commands from any source (manual button or auto-triggered).

## Implementation Plan

### Phase 2.1: Basic Wake Word Detection (2-3 hours)

**TDD Steps:**

1. **RED: use-wake-word-detection tests**
   - Test permission request
   - Test detection start/stop
   - Test wake word callback
   - Test sensitivity adjustments

2. **GREEN: Implement use-wake-word-detection**
   - Install @picovoice/porcupine-react-native
   - Implement startDetection()
   - Implement stopDetection()
   - Wire up onWakeWordDetected callback

3. **RED: Context integration tests**
   - Test setBackgroundWakeWord() starts detection
   - Test mode changes correctly
   - Test cleanup on disable

4. **GREEN: Integrate with VoiceListeningContext**
   - Call use-wake-word-detection in context
   - Update setBackgroundWakeWord implementation
   - Handle mode transitions

### Phase 2.2: Settings UI (1 hour)

1. **RED: Settings tests**
   - Test toggle switch
   - Test sensitivity slider
   - Test test button
   - Test persistence (AsyncStorage)

2. **GREEN: Implement settings**
   - Add wake word section
   - Wire up toggle to context
   - Add sensitivity slider
   - Add test button
   - Save settings to AsyncStorage

### Phase 2.3: Visual Feedback (1 hour)

1. **Update VoiceButton visual state**
   - Show subtle indicator when wake word active
   - Different animation when auto-triggered vs manual

2. **Update VoiceActivationBanner**
   - Show "Listening for 'Hey Shoppy'..." when active
   - Pulse animation on banner when in background-wake-word mode

### Phase 2.4: Testing & Refinement (2 hours)

1. **Battery usage testing**
   - Monitor CPU usage over 1 hour
   - Monitor battery drain
   - Optimize if needed

2. **Accuracy testing**
   - Test false positive rate
   - Test true positive rate at various distances
   - Adjust sensitivity defaults

3. **Edge cases**
   - Test with music playing
   - Test in noisy kitchen environment
   - Test with multiple people talking

## Alternative Approaches

### Option B: Server-Side Wake Word Detection

**Pros:**
- No client-side ML library needed
- Can use more sophisticated models
- Easier to update wake word

**Cons:**
- Requires constantly streaming audio to server (privacy concern)
- Higher latency
- Requires internet connection
- Higher backend costs
- Battery drain from constant network usage

**Verdict: Not recommended** - Privacy and battery concerns outweigh benefits

### Option C: Simple Audio Level Trigger

**Implementation:**
```typescript
// Detect when user starts speaking (any speech, not specific word)
if (audioLevel > threshold) {
  startRecording();
}
```

**Pros:**
- Very simple to implement
- No additional libraries

**Cons:**
- Will trigger on any loud noise
- No keyword specificity
- High false positive rate

**Verdict: Fallback option** if Porcupine doesn't work out

## Cost Analysis

### Porcupine Pricing

**Development:**
- Free tier: Perfect for testing

**Production:**
- Need to check current pricing
- Likely $0.10-0.25 per device per month
- Or one-time license fee

**Budget Impact:**
- 100 users: ~$10-25/month
- 1000 users: ~$100-250/month

**Recommendation:** Implement as opt-in feature, monitor adoption before committing to paid tier

## Privacy Considerations

1. **Audio Processing:**
   - All wake word detection happens on-device
   - No audio sent to server until wake word detected
   - After wake word, normal voice command flow (audio sent for transcription)

2. **User Control:**
   - Wake word detection is opt-in
   - Can be disabled anytime in settings
   - Visual indicator always shown when active

3. **Permissions:**
   - Request RECORD_AUDIO permission with clear explanation
   - Respect user denial - fall back to manual button

## Success Metrics

1. **Adoption Rate:**
   - Target: 30%+ of users enable wake word within first week

2. **Accuracy:**
   - Target: <5% false positive rate
   - Target: >90% true positive rate at 2m distance

3. **Performance:**
   - Target: <5% battery drain increase over 8-hour shift
   - Target: <2% CPU usage average

4. **User Satisfaction:**
   - Collect feedback after 1 week of usage
   - Iterate based on complaints (false positives, battery drain, etc.)

## Rollout Plan

1. **Alpha Testing (Week 1):**
   - Enable for internal testers only
   - Collect detailed logs
   - Fix critical bugs

2. **Beta Testing (Week 2):**
   - Enable for 10-20 willing beta users
   - Monitor battery usage
   - Adjust sensitivity based on feedback

3. **Soft Launch (Week 3):**
   - Show in settings as "Experimental Feature"
   - Opt-in only
   - Monitor adoption and issues

4. **Full Launch (Week 4+):**
   - Promote feature to all users
   - Add onboarding tooltip
   - Make default ON for new users (if metrics are good)

## Timeline Estimate

- **Phase 2.1 (Basic Detection):** 2-3 hours
- **Phase 2.2 (Settings UI):** 1 hour
- **Phase 2.3 (Visual Feedback):** 1 hour
- **Phase 2.4 (Testing):** 2 hours
- **Total:** 6-7 hours development time
- **Beta Testing:** 1-2 weeks
- **Iteration:** +2-3 hours based on feedback

**Total to production:** ~2-3 weeks

## Open Questions

1. ✅ Should wake word work when app is backgrounded?
   - **Decision needed:** Probably not v1 - requires foreground service, more complex

2. ✅ What's the custom wake word?
   - **Current:** "Hey Shoppy"
   - **Alternative:** "Hey Chef", "Kitchen Assistant"
   - **Decision:** Stick with "Hey Shoppy" - shorter, distinct

3. ✅ Should we allow user to customize wake word?
   - **Decision:** No for v1 - adds complexity, Porcupine limited to preset words

4. ✅ Battery impact mitigation?
   - **Decision:** Auto-disable after 30 minutes inactivity, user can re-enable

## Related Documentation

- See `VOICE_CLARIFICATION_FLOW.md` for multi-turn conversation architecture
- See Porcupine docs: https://picovoice.ai/docs/porcupine/
- See Expo AV docs: https://docs.expo.dev/versions/latest/sdk/av/
