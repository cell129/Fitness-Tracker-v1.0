import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, RefreshCcw } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import { Athlete, Measurement } from '../types';
import Markdown from 'react-markdown';

interface CoachingTipsProps {
  athlete: Athlete;
  measurements: Measurement[];
}

export default function CoachingTips({ athlete, measurements }: CoachingTipsProps) {
  const [tips, setTips] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateTips = async () => {
    setLoading(true);
    setError(null);
    try {
      const ai = new GoogleGenAI({ apiKey: (process as any).env.GEMINI_API_KEY });
      const prompt = `
        You are an expert sports coach. Give 3 short, personalized, actionable coaching tips for an athlete named ${athlete.name} who plays ${athlete.sport}. 
        Here is their latest measurement data (weight is in kg, all other distance/circumference metrics are in cm): ${JSON.stringify(measurements.slice(-1)[0]) || 'No recent data'}.
        Previous measurements: ${measurements.length > 1 ? JSON.stringify(measurements.slice(0, -1)) : 'None'}.
        
        Keep the response strictly to 3 concise bullet points. No conversational filler.
      `;
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt
      });

      setTips(response.text);
    } catch (err: any) {
      console.error('Generating tips failed', err);
      setError('Failed to generate tips. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (measurements.length > 0 && !tips && !loading && !error) {
      generateTips();
    }
  }, [measurements.length]);

  return (
    <Card className="rounded-2xl border-slate-200 shadow-sm bg-indigo-50/30 mt-6">
      <CardHeader className="border-b border-indigo-100 pb-4 flex flex-row items-center justify-between">
        <div>
           <CardTitle className="font-bold text-indigo-900 text-sm flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-indigo-600" /> AI Insights & Coaching Tips
          </CardTitle>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={generateTips} 
          disabled={loading}
          className="h-8 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-100/50"
        >
          <RefreshCcw className={`h-3.5 w-3.5 mr-1 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Generating...' : 'Refresh'}
        </Button>
      </CardHeader>
      <CardContent className="pt-4">
        {loading && !tips ? (
          <div className="animate-pulse flex flex-col space-y-3">
            <div className="h-4 bg-indigo-100 rounded w-3/4"></div>
            <div className="h-4 bg-indigo-100 rounded w-5/6"></div>
            <div className="h-4 bg-indigo-100 rounded w-2/3"></div>
          </div>
        ) : error ? (
          <div className="text-sm text-red-500">{error}</div>
        ) : tips ? (
          <div className="text-sm text-slate-700 space-y-2 leading-relaxed prose prose-sm max-w-none prose-p:my-1 prose-indigo">
            <Markdown>{tips}</Markdown>
          </div>
        ) : (
          <div className="text-sm text-slate-500 text-center py-4">No data to generate insights yet.</div>
        )}
      </CardContent>
    </Card>
  );
}
