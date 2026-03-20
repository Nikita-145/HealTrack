import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Upload, Video, Loader2, Play, AlertCircle } from 'lucide-react';

export default function VeoGenerator() {
  const [image, setImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const generateVideo = async () => {
    if (!image) return;
    setIsGenerating(true);
    setError(null);
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
      
      let operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: prompt || 'Animate this healthcare scene softly and professionally',
        image: {
          imageBytes: image.split(',')[1],
          mimeType: 'image/png',
        },
        config: {
          numberOfVideos: 1,
          resolution: '720p',
          aspectRatio: '16:9'
        }
      });

      while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 5000));
        operation = await ai.operations.getVideosOperation({ operation: operation });
      }

      const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
      if (downloadLink) {
        const response = await fetch(downloadLink, {
          method: 'GET',
          headers: {
            'x-goog-api-key': process.env.GEMINI_API_KEY || '',
          },
        });
        const blob = await response.blob();
        setVideoUrl(URL.createObjectURL(blob));
      }
    } catch (err: any) {
      console.error("Veo Generation Error:", err);
      setError(err.message || "Failed to generate video. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 p-8 glass-card rounded-3xl max-w-2xl w-full">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-brand-light rounded-lg">
          <Video className="w-6 h-6 text-brand" />
        </div>
        <div>
          <h3 className="text-xl font-bold font-display text-slate-800">Animate Your Health Journey</h3>
          <p className="text-sm text-slate-500 text-pretty">Upload an image of your recovery or health milestone and let AI bring it to life.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div 
            className="relative aspect-video rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center overflow-hidden group hover:border-brand transition-colors cursor-pointer"
            onClick={() => document.getElementById('image-upload')?.click()}
          >
            {image ? (
              <img src={image} alt="Upload" className="w-full h-full object-cover" />
            ) : (
              <>
                <Upload className="w-8 h-8 text-slate-400 group-hover:text-brand transition-colors" />
                <span className="text-sm text-slate-500 mt-2">Upload Image</span>
              </>
            )}
            <input 
              id="image-upload" 
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={handleImageUpload} 
            />
          </div>

          <textarea
            placeholder="Describe how you want to animate it... (e.g., 'Soft sunlight coming through the window')"
            className="w-full p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand focus:border-transparent outline-none text-sm resize-none"
            rows={3}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />

          <button
            onClick={generateVideo}
            disabled={!image || isGenerating}
            className="w-full flex items-center justify-center gap-2 py-4 bg-brand text-white rounded-xl font-semibold hover:bg-brand-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-brand/20"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Generating Video...
              </>
            ) : (
              <>
                <Play className="w-5 h-5" />
                Generate Animation
              </>
            )}
          </button>
        </div>

        <div className="relative aspect-video rounded-2xl bg-slate-900 flex items-center justify-center overflow-hidden">
          {videoUrl ? (
            <video src={videoUrl} controls className="w-full h-full" />
          ) : (
            <div className="text-center p-6">
              <Video className="w-12 h-12 text-slate-700 mx-auto mb-3" />
              <p className="text-slate-500 text-sm">Your generated video will appear here</p>
            </div>
          )}
          
          {isGenerating && (
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm flex flex-col items-center justify-center text-white">
              <Loader2 className="w-10 h-10 animate-spin mb-4" />
              <p className="text-sm font-medium">Bringing your story to life...</p>
              <p className="text-xs text-slate-300 mt-2">This may take a minute</p>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}
    </div>
  );
}
