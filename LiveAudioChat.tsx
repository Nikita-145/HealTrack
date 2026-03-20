import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Modality, LiveServerMessage } from "@google/genai";
import { Mic, MicOff, Volume2, VolumeX, Loader2 } from 'lucide-react';

export default function LiveAudioChat() {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [transcript, setTranscript] = useState<string[]>([]);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sessionRef = useRef<any>(null);
  const audioQueue = useRef<Int16Array[]>([]);
  const isPlayingRef = useRef(false);

  const startSession = async () => {
    setIsConnecting(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
      
      const session = await ai.live.connect({
        model: "gemini-2.5-flash-native-audio-preview-12-2025",
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: "Zephyr" } },
          },
          systemInstruction: "You are a helpful healthcare assistant for HealTrack. You help people in distress, explain emergency waiting times, and guide them through our reinvented healthcare system. Be calm, empathetic, and professional.",
          inputAudioTranscription: {},
          outputAudioTranscription: {},
        },
        callbacks: {
          onopen: () => {
            setIsConnected(true);
            setIsConnecting(false);
            startAudioCapture();
          },
          onmessage: async (message: LiveServerMessage) => {
            if (message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data) {
              const base64Audio = message.serverContent.modelTurn.parts[0].inlineData.data;
              const binaryString = atob(base64Audio);
              const bytes = new Int16Array(binaryString.length / 2);
              for (let i = 0; i < bytes.length; i++) {
                bytes[i] = (binaryString.charCodeAt(i * 2) & 0xff) | (binaryString.charCodeAt(i * 2 + 1) << 8);
              }
              audioQueue.current.push(bytes);
              if (!isPlayingRef.current) {
                playNextInQueue();
              }
            }

            if (message.serverContent?.modelTurn?.parts?.[0]?.text) {
              setTranscript(prev => [...prev, `Gemini: ${message.serverContent?.modelTurn?.parts?.[0]?.text}`]);
            }
            
            if (message.serverContent?.interrupted) {
              audioQueue.current = [];
              isPlayingRef.current = false;
            }
          },
          onclose: () => {
            stopSession();
          },
          onerror: (error) => {
            console.error("Live API Error:", error);
            stopSession();
          }
        }
      });
      
      sessionRef.current = session;
    } catch (error) {
      console.error("Failed to connect to Live API:", error);
      setIsConnecting(false);
    }
  };

  const startAudioCapture = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      const audioContext = new AudioContext({ sampleRate: 16000 });
      audioContextRef.current = audioContext;
      
      const source = audioContext.createMediaStreamSource(stream);
      const processor = audioContext.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;
      
      processor.onaudioprocess = (e) => {
        if (isMuted) return;
        const inputData = e.inputBuffer.getChannelData(0);
        const pcmData = new Int16Array(inputData.length);
        for (let i = 0; i < inputData.length; i++) {
          pcmData[i] = Math.max(-1, Math.min(1, inputData[i])) * 0x7FFF;
        }
        
        const base64Data = btoa(String.fromCharCode(...new Uint8Array(pcmData.buffer)));
        sessionRef.current?.sendRealtimeInput({
          audio: { data: base64Data, mimeType: 'audio/pcm;rate=16000' }
        });
      };
      
      source.connect(processor);
      processor.connect(audioContext.destination);
    } catch (error) {
      console.error("Error capturing audio:", error);
    }
  };

  const playNextInQueue = async () => {
    if (audioQueue.current.length === 0 || !audioContextRef.current) {
      isPlayingRef.current = false;
      return;
    }
    
    isPlayingRef.current = true;
    const pcmData = audioQueue.current.shift()!;
    const floatData = new Float32Array(pcmData.length);
    for (let i = 0; i < pcmData.length; i++) {
      floatData[i] = pcmData[i] / 0x7FFF;
    }
    
    const buffer = audioContextRef.current.createBuffer(1, floatData.length, 24000);
    buffer.getChannelData(0).set(floatData);
    
    const source = audioContextRef.current.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContextRef.current.destination);
    source.onended = playNextInQueue;
    source.start();
  };

  const stopSession = () => {
    sessionRef.current?.close();
    sessionRef.current = null;
    
    processorRef.current?.disconnect();
    processorRef.current = null;
    
    streamRef.current?.getTracks().forEach(track => track.stop());
    streamRef.current = null;
    
    audioContextRef.current?.close();
    audioContextRef.current = null;
    
    setIsConnected(false);
    setIsConnecting(false);
    audioQueue.current = [];
    isPlayingRef.current = false;
  };

  return (
    <div className="flex flex-col items-center gap-4 p-6 glass-card rounded-2xl max-w-md w-full">
      <div className="flex items-center justify-between w-full">
        <h3 className="text-lg font-semibold font-display text-slate-800">Voice Assistant</h3>
        <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
      </div>
      
      <p className="text-sm text-slate-500 text-center">
        {isConnected ? "Connected. Speak to our healthcare assistant." : "Connect to talk with our AI assistant about your health concerns."}
      </p>

      <div className="flex gap-4">
        {!isConnected ? (
          <button
            onClick={startSession}
            disabled={isConnecting}
            className="flex items-center gap-2 px-6 py-3 bg-brand text-white rounded-full hover:bg-brand-dark transition-colors disabled:opacity-50"
          >
            {isConnecting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Mic className="w-5 h-5" />}
            {isConnecting ? "Connecting..." : "Start Conversation"}
          </button>
        ) : (
          <>
            <button
              onClick={() => setIsMuted(!isMuted)}
              className={`p-4 rounded-full transition-colors ${isMuted ? 'bg-red-100 text-red-600' : 'bg-brand-light text-brand'}`}
            >
              {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
            </button>
            <button
              onClick={stopSession}
              className="px-6 py-3 bg-slate-100 text-slate-600 rounded-full hover:bg-slate-200 transition-colors"
            >
              End Call
            </button>
          </>
        )}
      </div>

      {transcript.length > 0 && (
        <div className="w-full mt-4 max-h-32 overflow-y-auto text-xs text-slate-600 space-y-1 border-t pt-4">
          {transcript.slice(-3).map((t, i) => (
            <p key={i} className="line-clamp-2">{t}</p>
          ))}
        </div>
      )}
    </div>
  );
}
