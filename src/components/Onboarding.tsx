import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Camera, Upload } from 'lucide-react';

export default function Onboarding({ onComplete }: { onComplete: (data: { name: string, sport: string, photoUrl?: string }) => void }) {
  const [name, setName] = useState('');
  const [sport, setSport] = useState('');
  const [photoUrl, setPhotoUrl] = useState<string | undefined>(undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('File is too large. Please select an image under 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && sport) {
      onComplete({ name, sport, photoUrl });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md rounded-2xl border-slate-200 shadow-sm bg-white">
        <CardHeader className="border-b border-slate-100 pb-4 text-center">
          <div className="mx-auto w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl mb-4">F</div>
          <CardTitle className="text-2xl font-bold tracking-tight text-slate-800">Welcome to Fitness Tracker</CardTitle>
          <CardDescription className="text-slate-500 mt-2">Set up your athlete profile to get started.</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="flex flex-col items-center mb-6">
              <div 
                className="relative group cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="w-24 h-24 rounded-full border-2 border-dashed border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden group-hover:border-indigo-300 transition-colors">
                  {photoUrl ? (
                    <img src={photoUrl} alt="Profile preview" className="w-full h-full object-cover" />
                  ) : (
                    <Camera className="w-8 h-8 text-slate-300 group-hover:text-indigo-400 transition-colors" />
                  )}
                </div>
                <div className="absolute bottom-0 right-0 bg-indigo-600 text-white p-1.5 rounded-full shadow-md border-2 border-white">
                  <Upload className="w-3 h-3" />
                </div>
              </div>
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
              <span className="text-[10px] uppercase font-bold text-slate-400 mt-3 tracking-wider">Profile Photo</span>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name" className="text-xs font-bold text-slate-500 uppercase tracking-wider">Your Name</Label>
              <Input id="name" required value={name} onChange={e => setName(e.target.value)} className="rounded-xl border-slate-200 focus:ring-indigo-500" placeholder="e.g. Marcus Thorne" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sport" className="text-xs font-bold text-slate-500 uppercase tracking-wider">Primary Sport</Label>
              <Input id="sport" required value={sport} onChange={e => setSport(e.target.value)} className="rounded-xl border-slate-200 focus:ring-indigo-500" placeholder="e.g. Basketball" />
            </div>
            <div className="pt-2">
              <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-6 text-md font-semibold shadow-sm">Create Profile</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
