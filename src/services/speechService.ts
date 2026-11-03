// Browser Web Speech Recognition & Synthesis Service

interface SpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: (() => void) | null;
  onresult: ((event: SpeechRecognitionEventPayload) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

interface SpeechRecognitionEventPayload {
  resultIndex: number;
  results: {
    length: number;
    [index: number]: {
      isFinal: boolean;
      [index: number]: { transcript: string };
    };
  };
}

// Declare SpeechRecognition interfaces for TypeScript without any
declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognitionInstance;
    webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
  }
}

export interface SpeechRecognitionResultPayload {
  transcript: string;
  isFinal: boolean;
}

export class SpeechService {
  private static recognition: SpeechRecognitionInstance | null = null;
  private static isListening: boolean = false;

  public static isSpeechRecognitionSupported(): boolean {
    return typeof window !== 'undefined' && Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
  }

  public static isSpeechSynthesisSupported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }

  public static startListening(
    onResult: (data: SpeechRecognitionResultPayload) => void,
    onError: (err: string) => void,
    language: 'bn-BD' | 'en-US' = 'bn-BD'
  ): void {
    if (!this.isSpeechRecognitionSupported()) {
      onError('আপনার ব্রাউজারে স্পিচ রিকগনিশন সমর্থন করে না। অনুগ্রহ করে টেক্সট বক্সে লিখুন।');
      return;
    }

    try {
      const SpeechRecognitionConstructor = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognitionConstructor) return;

      this.recognition = new SpeechRecognitionConstructor();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = language;

      this.recognition.onstart = () => {
        this.isListening = true;
      };

      this.recognition.onresult = (event: SpeechRecognitionEventPayload) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        onResult({
          transcript: finalTranscript || interimTranscript,
          isFinal: Boolean(finalTranscript),
        });
      };

      this.recognition.onerror = (event: { error: string }) => {
        console.warn('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
          onError('মাইক্রোফোন পারমিশন প্রয়োজন। ব্রাউজার সেটিংসে পারমিশন দিন।');
        } else if (event.error !== 'no-speech') {
          onError(`স্পিচ ত্রুটি: ${event.error}`);
        }
      };

      this.recognition.onend = () => {
        this.isListening = false;
      };

      this.recognition.start();
    } catch (err: unknown) {
      console.error('Failed to start speech recognition', err);
      const message = err instanceof Error ? err.message : 'ভয়েস সার্ভিস শুরু করা যায়নি';
      onError(message);
    }
  }

  public static stopListening(): void {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch {
        // ignore stop error when already stopped
      }
      this.isListening = false;
    }
  }

  public static speak(text: string, lang: 'bn-BD' | 'en-US' = 'bn-BD', onEnd?: () => void): void {
    if (!this.isSpeechSynthesisSupported()) return;

    window.speechSynthesis.cancel(); // Stop any active speech

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 0.95; // Slightly slower for clarity
    utterance.pitch = 1.0;

    // Try finding a Bengali voice if available
    const voices = window.speechSynthesis.getVoices();
    const bnVoice = voices.find((v) => v.lang.includes('bn') || v.lang.includes('Bengali'));
    if (bnVoice && lang === 'bn-BD') {
      utterance.voice = bnVoice;
    }

    if (onEnd) {
      utterance.onend = onEnd;
    }

    window.speechSynthesis.speak(utterance);
  }

  public static stopSpeaking(): void {
    if (this.isSpeechSynthesisSupported()) {
      window.speechSynthesis.cancel();
    }
  }
}
