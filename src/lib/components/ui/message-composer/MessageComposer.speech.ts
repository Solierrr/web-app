import { useEffect, useEffectEvent, useRef, useState } from "react";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";

export default function useComposerSpeech(enabled: boolean, value: string, onChange: (value: string) => void, language: string, maxLength?: number) {
  const { transcript, listening, resetTranscript, browserSupportsSpeechRecognition, isMicrophoneAvailable } = useSpeechRecognition({
    transcribing: enabled,
  });
  const prefix = useRef<string | null>(null);
  const generation = useRef(0);
  const [starting, setStarting] = useState(false);
  const [failed, setFailed] = useState(false);
  const updateDraft = useEffectEvent((text: string) => onChange(maxLength ? text.slice(0, maxLength) : text));

  useEffect(() => {
    if (enabled && prefix.current !== null && transcript) updateDraft([prefix.current, transcript].filter(Boolean).join(" "));
  }, [transcript, enabled]);

  useEffect(() => {
    if (!enabled) return;
    function stop() {
      generation.current += 1;
      if (prefix.current !== null) void SpeechRecognition.abortListening();
      prefix.current = null;
    }
    function handleVisibility() {
      if (document.hidden) stop();
    }
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      stop();
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [enabled]);

  async function toggle() {
    if (!enabled || starting) return;
    setFailed(false);
    if (listening) {
      try {
        await SpeechRecognition.stopListening();
      } catch {
        setFailed(true);
      }
      return;
    }
    const current = ++generation.current;
    setStarting(true);
    resetTranscript();
    prefix.current = value.trimEnd();
    try {
      await SpeechRecognition.startListening({ language, continuous: false });
      if (generation.current !== current) void SpeechRecognition.abortListening();
    } catch {
      if (generation.current === current) setFailed(true);
    } finally {
      setStarting(false);
    }
  }

  function clear() {
    generation.current += 1;
    prefix.current = null;
    void SpeechRecognition.abortListening();
  }

  return {
    listening: enabled && listening,
    starting: enabled && starting,
    failed,
    supported: browserSupportsSpeechRecognition,
    available: isMicrophoneAvailable,
    toggle,
    clear,
  };
}
