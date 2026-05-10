import React, { useState, useRef } from 'react';
import { Athlete, Measurement } from '../types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, UserSquare, Calendar, ChevronRight, Trash2, Plus, Ruler, Dumbbell, Activity, Download, HelpCircle, Camera, Upload } from 'lucide-react';
import { format } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';
import { toast } from 'sonner';
import CoachingTips from './CoachingTips';

interface AthleteDetailProps {
  athlete: Athlete;
  measurements: Measurement[];
  onBack: () => void;
  onAddMeasurement: (m: Omit<Measurement, 'id' | 'athleteId'>) => void;
  onDeleteMeasurement: (id: string) => void;
  onDeleteAthlete: () => void;
  onUpdateAthlete: (updates: Partial<Omit<Athlete, 'id' | 'createdAt'>>) => void;
}

export default function AthleteDetail({
  athlete,
  measurements,
  onBack,
  onAddMeasurement,
  onDeleteMeasurement,
  onDeleteAthlete,
  onUpdateAthlete
}: AthleteDetailProps) {
  const [metricDialogOpen, setMetricDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('File is too large. Please select an image under 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpdateAthlete({ photoUrl: reader.result as string });
        toast.success('Profile photo updated');
      };
      reader.readAsDataURL(file);
    }
  };

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    height: '',
    weight: '',
    wingSpan: '',
    leftBicepCircumference: '',
    rightBicepCircumference: '',
    leftThighCircumference: '',
    rightThighCircumference: ''
  });

  const handleMetricSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddMeasurement({
      date: new Date(formData.date).getTime(),
      height: formData.height ? parseFloat(formData.height) : undefined,
      weight: formData.weight ? parseFloat(formData.weight) : undefined,
      wingSpan: formData.wingSpan ? parseFloat(formData.wingSpan) : undefined,
      leftBicepCircumference: formData.leftBicepCircumference ? parseFloat(formData.leftBicepCircumference) : undefined,
      rightBicepCircumference: formData.rightBicepCircumference ? parseFloat(formData.rightBicepCircumference) : undefined,
      leftThighCircumference: formData.leftThighCircumference ? parseFloat(formData.leftThighCircumference) : undefined,
      rightThighCircumference: formData.rightThighCircumference ? parseFloat(formData.rightThighCircumference) : undefined,
    });
    toast.success('Metrics logged successfully!');
    setMetricDialogOpen(false);
    setFormData({
      date: new Date().toISOString().split('T')[0],
      height: '',
      weight: '',
      wingSpan: '',
      leftBicepCircumference: '',
      rightBicepCircumference: '',
      leftThighCircumference: '',
      rightThighCircumference: ''
    });
  };

  const handleDeleteAthlete = () => {
    onDeleteAthlete();
    toast.success('Profile reset successfully');
  };

  const handleDeleteMeasurement = (id: string) => {
    if (confirm('Are you sure you want to delete this log?')) {
      onDeleteMeasurement(id);
      toast.success('Log deleted');
    }
  };

  const sortedMeasurements = [...measurements].sort((a, b) => a.date - b.date);

  // Prepare chart data
  const chartData = sortedMeasurements.map(m => ({
    dateStr: format(new Date(m.date), 'MMM dd, yy'),
    ...m
  }));

  const latestStats = sortedMeasurements[sortedMeasurements.length - 1] || null;

  const calculateBMI = (weight?: number, height?: number) => {
    if (!weight || !height) return null;
    const heightInMeters = height / 100;
    return (weight / (heightInMeters * heightInMeters)).toFixed(1);
  };

  const calculateApeIndex = (wingSpan?: number, height?: number) => {
    if (!wingSpan || !height) return null;
    return (wingSpan / height).toFixed(2);
  };

  const calculateBSA = (weight?: number, height?: number) => {
    if (!weight || !height) return null;
    return Math.sqrt((height * weight) / 3600).toFixed(2);
  };

  const exportToCSV = () => {
    const headers = [
      'Date', 'Weight (kg)', 'Height (cm)', 'Wing Span (cm)',
      'Left Bicep Circ. (cm)', 'Right Bicep Circ. (cm)',
      'Left Thigh Circ. (cm)', 'Right Thigh Circ. (cm)'
    ];

    const rows = sortedMeasurements.map(m => [
      format(new Date(m.date), 'yyyy-MM-dd'),
      m.weight || '',
      m.height || '',
      m.wingSpan || '',
      m.leftBicepCircumference || '',
      m.rightBicepCircumference || '',
      m.leftThighCircumference || '',
      m.rightThighCircumference || ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `measurements_${athlete.name.replace(/\s+/g, '_').toLowerCase()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const [showInsightsHelp, setShowInsightsHelp] = useState(false);

  return (
    <div className="space-y-6 relative pb-20 sm:pb-0">
      <Dialog open={metricDialogOpen} onOpenChange={setMetricDialogOpen}>
        {/* Mobile Floating Action Button */}
        <div className="sm:hidden fixed bottom-6 right-6 z-20">
          {/* @ts-ignore */}
          <DialogTrigger render={<Button className="h-14 w-14 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg flex items-center justify-center p-0"><Plus className="h-6 w-6" /></Button>} />
        </div>

        <DialogContent className="w-[95vw] sm:max-w-[600px] rounded-2xl p-0 overflow-hidden flex flex-col max-h-[90vh]">
          <DialogHeader className="p-6 border-b border-slate-100 flex-shrink-0">
            <DialogTitle>Log Physical Attributes</DialogTitle>
          </DialogHeader>
          <div className="overflow-y-auto p-6 flex-1">
            <form onSubmit={handleMetricSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-2 col-span-2 sm:col-span-1">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  className="rounded-xl border-slate-200"
                />
              </div>
              
              <div className="col-span-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-4 border-b border-slate-100 pb-2">Basic Measurements</div>
              
              <div className="space-y-2 col-span-2 sm:col-span-1">
                <Label htmlFor="height">Height (cm)</Label>
                <Input
                  id="height" type="number" step="0.1"
                  placeholder="e.g., 185"
                  value={formData.height}
                  onChange={(e) => setFormData({...formData, height: e.target.value})}
                  className="rounded-xl border-slate-200"
                />
              </div>
              <div className="space-y-2 col-span-2 sm:col-span-1">
                <Label htmlFor="weight">Weight (kg)</Label>
                <Input
                  id="weight" type="number" step="0.1"
                  placeholder="e.g., 82"
                  value={formData.weight}
                  onChange={(e) => setFormData({...formData, weight: e.target.value})}
                  className="rounded-xl border-slate-200"
                />
              </div>

              <div className="col-span-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-4 border-b border-slate-100 pb-2">Detailed Attributes</div>

              <div className="space-y-2 col-span-2 sm:col-span-1">
                <Label htmlFor="wingSpan">Wing Span (cm)</Label>
                <Input
                  id="wingSpan" type="number" step="0.1"
                  placeholder="e.g., 190"
                  value={formData.wingSpan}
                  onChange={(e) => setFormData({...formData, wingSpan: e.target.value})}
                  className="rounded-xl border-slate-200"
                />
              </div>
              <div className="space-y-2 col-span-2 sm:col-span-1">
                <Label htmlFor="leftBicepCircumference">Left Bicep Circ. (cm)</Label>
                <Input
                  id="leftBicepCircumference" type="number" step="0.1"
                  placeholder="e.g., 35"
                  value={formData.leftBicepCircumference}
                  onChange={(e) => setFormData({...formData, leftBicepCircumference: e.target.value})}
                  className="rounded-xl border-slate-200"
                />
              </div>
              <div className="space-y-2 col-span-2 sm:col-span-1">
                <Label htmlFor="rightBicepCircumference">Right Bicep Circ. (cm)</Label>
                <Input
                  id="rightBicepCircumference" type="number" step="0.1"
                  placeholder="e.g., 35"
                  value={formData.rightBicepCircumference}
                  onChange={(e) => setFormData({...formData, rightBicepCircumference: e.target.value})}
                  className="rounded-xl border-slate-200"
                />
              </div>
              <div className="space-y-2 col-span-2 sm:col-span-1">
                <Label htmlFor="leftThighCircumference">Left Thigh Circ. (cm)</Label>
                <Input
                  id="leftThighCircumference" type="number" step="0.1"
                  placeholder="e.g., 60"
                  value={formData.leftThighCircumference}
                  onChange={(e) => setFormData({...formData, leftThighCircumference: e.target.value})}
                  className="rounded-xl border-slate-200"
                />
              </div>
              <div className="space-y-2 col-span-2 sm:col-span-1">
                <Label htmlFor="rightThighCircumference">Right Thigh Circ. (cm)</Label>
                <Input
                  id="rightThighCircumference" type="number" step="0.1"
                  placeholder="e.g., 60"
                  value={formData.rightThighCircumference}
                  onChange={(e) => setFormData({...formData, rightThighCircumference: e.target.value})}
                  className="rounded-xl border-slate-200"
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 rounded-xl px-8">
                Save Metrics
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>

      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
          <div 
            className="h-12 w-12 sm:h-16 sm:w-16 bg-indigo-50 text-indigo-600 rounded-xl sm:rounded-2xl flex items-center justify-center border border-indigo-100 flex-shrink-0 overflow-hidden relative group cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            {athlete.photoUrl ? (
              <img src={athlete.photoUrl} alt={athlete.name} className="h-full w-full object-cover" />
            ) : (
              <UserSquare className="h-6 w-6 sm:h-8 sm:w-8" />
            )}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Camera className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
            </div>
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handlePhotoUpload}
              accept="image/*"
              className="hidden"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg sm:text-xl font-bold text-slate-800 underline decoration-indigo-500 underline-offset-4 truncate">{athlete.name}</h1>
            <p className="text-slate-500 mt-0.5 sm:mt-2 flex items-center gap-2 text-xs sm:text-sm italic">
              <Dumbbell className="h-3 w-3 sm:h-4 sm:w-4" /> {athlete.sport}
            </p>
          </div>
        </div>
        
        <div className="flex gap-2 w-full sm:w-auto">
          {/* @ts-ignore */}
          <DialogTrigger render={<Button className="flex-1 sm:flex-none bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-sm h-10 sm:h-11"><Plus className="mr-2 h-4 w-4" /> Log Metrics</Button>} />
          
          <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            {/* @ts-ignore */}
            <DialogTrigger render={<Button variant="outline" className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600 rounded-xl shadow-sm"><Trash2 className="h-4 w-4 mr-2" /> Reset</Button>} />
            <DialogContent className="sm:max-w-[400px] rounded-2xl">
              <DialogHeader>
                <DialogTitle className="text-red-600">Reset Profile</DialogTitle>
              </DialogHeader>
              <p className="text-sm text-slate-600 py-4">
                Are you sure you want to reset your profile and clear all your measurement records? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} className="rounded-xl border-slate-200 hover:bg-slate-50">Cancel</Button>
                <Button variant="destructive" onClick={handleDeleteAthlete} className="rounded-xl">Reset Everything</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      </Dialog>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Current Weight', val: latestStats?.weight ? `${latestStats.weight} kg` : '--' },
          { label: 'Height', val: latestStats?.height ? `${latestStats.height} cm` : '--' },
          { label: 'Wing Span', val: latestStats?.wingSpan ? `${latestStats.wingSpan} cm` : '--' },
          { label: 'Last Updated', val: latestStats ? format(new Date(latestStats.date), 'MMM d, yyyy') : '--' }
        ].map((stat, i) => (
          <Card key={i} className="rounded-2xl border-slate-200 shadow-sm bg-white">
            <CardContent className="p-5">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{stat.label}</div>
              <div className="text-2xl font-bold text-slate-800">{stat.val}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="overview" className="w-full mt-8">
        <TabsList className="bg-slate-100 p-1 rounded-xl mb-6 flex w-full">
          <TabsTrigger value="overview" className="flex-1 rounded-lg text-sm px-2 sm:px-6 font-semibold data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm">Overview</TabsTrigger>
          <TabsTrigger value="history" className="flex-1 rounded-lg text-sm px-2 sm:px-6 font-semibold data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm">History Log</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="flex flex-col gap-6">
              <Card className="rounded-2xl border-slate-200 shadow-sm bg-white">
                <CardHeader className="border-b border-slate-100 pb-4">
                  <CardTitle className="font-bold text-slate-800 text-sm">Weight & Height Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] w-full">
                    {chartData.length > 1 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                          <XAxis dataKey="dateStr" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 'bold' }} dy={10} />
                          <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 'bold' }} dx={-10} domain={['auto', 'auto']} />
                          <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 'bold' }} dx={10} domain={['auto', 'auto']} />
                          <RechartsTooltip 
                            contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                          />
                          <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '12px', fontWeight: 'bold', color: '#64748b' }} />
                          <Line yAxisId="left" type="monotone" name="Weight (kg)" dataKey="weight" stroke="#4f46e5" strokeWidth={3} dot={{ r: 4, fill: '#4f46e5', strokeWidth: 2 }} activeDot={{ r: 6 }} />
                          <Line yAxisId="right" type="monotone" name="Height (cm)" dataKey="height" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981', strokeWidth: 2 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center flex-col text-slate-400">
                        <Activity className="h-12 w-12 mb-2 opacity-50" />
                        <p className="font-medium text-sm">Not enough data for chart.</p>
                        <p className="text-xs mt-1">Log at least 2 measurements.</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <CoachingTips athlete={athlete} measurements={measurements} />

              <Card className="rounded-2xl border-slate-200 shadow-sm bg-indigo-900 text-white overflow-hidden">
                <CardHeader className="border-b border-indigo-800/50 pb-4">
                  <CardTitle className="font-bold text-sm flex items-center gap-2">
                    <Activity className="h-4 w-4" /> Calculated Insights
                  </CardTitle>
                  <CardDescription className="text-indigo-200 text-[10px]">Derived from your latest metrics</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                    <div className="bg-indigo-800/40 p-3 rounded-xl border border-indigo-700/50">
                      <div className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider mb-1 flex items-center justify-between">
                        BMI
                      </div>
                      <div className="text-xl font-bold flex items-baseline gap-1">
                        {calculateBMI(latestStats?.weight, latestStats?.height) || '--'}
                        {calculateBMI(latestStats?.weight, latestStats?.height) && <span className="text-[10px] font-medium text-indigo-300">kg/m²</span>}
                      </div>
                    </div>
                    <div className="bg-indigo-800/40 p-3 rounded-xl border border-indigo-700/50">
                      <div className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider mb-1">Ape Index</div>
                      <div className="text-xl font-bold flex items-baseline gap-1">
                        {calculateApeIndex(latestStats?.wingSpan, latestStats?.height) || '--'}
                        {calculateApeIndex(latestStats?.wingSpan, latestStats?.height) && <span className="text-[10px] font-medium text-indigo-300">ratio</span>}
                      </div>
                    </div>
                    <div className="bg-indigo-800/40 p-3 rounded-xl border border-indigo-700/50">
                      <div className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider mb-1">BSA</div>
                      <div className="text-xl font-bold flex items-baseline gap-1">
                        {calculateBSA(latestStats?.weight, latestStats?.height) || '--'}
                        {calculateBSA(latestStats?.weight, latestStats?.height) && <span className="text-[10px] font-medium text-indigo-300">m²</span>}
                      </div>
                    </div>
                  </div>

                  <div className="bg-indigo-950/50 rounded-xl p-4 border border-indigo-800/30">
                    <button 
                      onClick={() => setShowInsightsHelp(!showInsightsHelp)}
                      className="w-full text-left text-xs font-bold text-indigo-300 uppercase tracking-widest mb-3 flex items-center justify-between"
                    >
                      <span className="flex items-center gap-2">
                        <HelpCircle className="h-3 w-3" /> Understanding these metrics
                      </span>
                      <ChevronRight className={`h-3 w-3 transition-transform sm:hidden ${showInsightsHelp ? 'rotate-90' : ''}`} />
                    </button>
                    
                    <div className={`space-y-3 ${!showInsightsHelp ? 'hidden sm:block' : 'block'}`}>
                      <div>
                        <span className="text-[10px] font-bold text-indigo-200 block mb-0.5">BMI (Body Mass Index)</span>
                        <p className="text-[11px] text-indigo-100/70 leading-relaxed">
                          A standard measure that uses your height and weight to estimate if your weight is in a healthy range.
                        </p>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-indigo-200 block mb-0.5">Ape Index</span>
                        <p className="text-[11px] text-indigo-100/70 leading-relaxed">
                          The ratio of wingspan to height. A ratio &gt; 1.0 (wingspan longer than height) is often advantageous in reach-dependent sports.
                        </p>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-indigo-200 block mb-0.5">BSA (Body Surface Area)</span>
                        <p className="text-[11px] text-indigo-100/70 leading-relaxed">
                          The total surface area of your body. In sports science, it can be a more accurate indicator of metabolic mass than weight alone.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="rounded-2xl border-slate-200 shadow-sm bg-white overflow-hidden h-min">
              <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
                <CardTitle className="font-bold text-slate-800 text-sm">Detailed Measurements</CardTitle>
                <CardDescription className="text-xs text-slate-500 mt-1">Latest extremity data</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {[
                    { label: 'Wing Span', key: 'wingSpan' },
                    { label: 'Left Bicep Circ.', key: 'leftBicepCircumference' },
                    { label: 'Right Bicep Circ.', key: 'rightBicepCircumference' },
                    { label: 'Left Thigh Circ.', key: 'leftThighCircumference' },
                    { label: 'Right Thigh Circ.', key: 'rightThighCircumference' },
                  ].map((stat, i) => (
                    <div key={i} className="flex justify-between items-center p-4 bg-slate-50 border border-slate-100 rounded-xl">
                      <div className="flex items-center text-sm font-semibold text-slate-700">
                        <Ruler className="h-4 w-4 mr-2 text-slate-400" /> {stat.label}
                      </div>
                      <div className="font-bold text-slate-900 border border-slate-200 bg-white px-3 py-1 rounded-md text-sm">
                        {latestStats ? (`${(latestStats as any)[stat.key] || '--'} cm`) : '--'}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="history">
          <div className="flex justify-between items-center mb-4 px-2">
            <h3 className="text-lg font-bold text-slate-800 tracking-tight">Measurement History</h3>
            <Button variant="outline" size="sm" onClick={exportToCSV} className="rounded-lg shadow-sm border-slate-200 h-9">
              <Download className="h-3.5 w-3.5 mr-2" />
              Export
            </Button>
          </div>

          <div className="sm:hidden space-y-4">
            {sortedMeasurements.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500 font-medium text-sm">
                No measurements logged yet.
              </div>
            ) : (
              [...sortedMeasurements].reverse().map((m) => (
                <Card key={m.id} className="rounded-2xl border-slate-200 shadow-sm overflow-hidden bg-white">
                  <CardHeader className="bg-slate-50/50 p-4 border-b border-slate-100 flex flex-row justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-indigo-500" />
                      <span className="font-bold text-slate-800 text-sm whitespace-nowrap">{format(new Date(m.date), 'MMM d, yyyy')}</span>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                      onClick={() => handleDeleteMeasurement(m.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </CardHeader>
                  <CardContent className="p-4 grid grid-cols-2 gap-y-4 gap-x-2">
                    <div className="space-y-1">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Weight</div>
                      <div className="text-sm font-bold text-slate-700">{m.weight ? `${m.weight}kg` : '-'}</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Height</div>
                      <div className="text-sm font-bold text-slate-700">{m.height ? `${m.height}cm` : '-'}</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Wing Span</div>
                      <div className="text-sm font-bold text-slate-700">{m.wingSpan ? `${m.wingSpan}cm` : '-'}</div>
                    </div>
                    <div className="space-y-1 col-span-1">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Bicep (L/R)</div>
                      <div className="text-sm font-bold text-slate-700">
                        {m.leftBicepCircumference || m.rightBicepCircumference ? `${m.leftBicepCircumference || '-'} / ${m.rightBicepCircumference || '-'}` : '-'}
                      </div>
                    </div>
                    <div className="space-y-1 col-span-2">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Thigh (L/R)</div>
                      <div className="text-sm font-bold text-slate-700">
                        {m.leftThighCircumference || m.rightThighCircumference ? `${m.leftThighCircumference || '-'} / ${m.rightThighCircumference || '-'}` : '-'}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          <Card className="hidden sm:block rounded-2xl border-slate-200 shadow-sm overflow-hidden bg-white">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow>
                  <TableHead className="font-bold text-slate-500 text-xs uppercase tracking-wider">Date</TableHead>
                  <TableHead className="font-bold text-slate-500 text-xs uppercase tracking-wider">Weight</TableHead>
                  <TableHead className="font-bold text-slate-500 text-xs uppercase tracking-wider">Height</TableHead>
                  <TableHead className="font-bold text-slate-500 text-xs uppercase tracking-wider">Wing Span</TableHead>
                  <TableHead className="font-bold text-slate-500 text-xs uppercase tracking-wider tooltip" title="Left / Right">Bicep Cir.<br/><span className="text-[10px] lowercase font-normal">(L/R)</span></TableHead>
                  <TableHead className="font-bold text-slate-500 text-xs uppercase tracking-wider tooltip" title="Left / Right">Thigh Cir.<br/><span className="text-[10px] lowercase font-normal">(L/R)</span></TableHead>
                  <TableHead className="text-right font-bold text-slate-500 text-xs uppercase tracking-wider">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedMeasurements.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center text-slate-500 font-medium text-sm">
                      No measurements logged yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  [...sortedMeasurements].reverse().map((m) => (
                    <TableRow key={m.id} className="hover:bg-slate-50/50">
                      <TableCell className="font-bold text-slate-800 text-sm py-4 whitespace-nowrap">{format(new Date(m.date), 'MMM d, yyyy')}</TableCell>
                      <TableCell className="text-slate-600 text-sm py-4 font-medium">{m.weight ? `${m.weight}kg` : '-'}</TableCell>
                      <TableCell className="text-slate-600 text-sm py-4 font-medium">{m.height ? `${m.height}cm` : '-'}</TableCell>
                      <TableCell className="text-slate-600 text-sm py-4 font-medium">{m.wingSpan ? `${m.wingSpan}cm` : '-'}</TableCell>
                      <TableCell className="text-slate-600 text-sm py-4 font-medium">{m.leftBicepCircumference || m.rightBicepCircumference ? `${m.leftBicepCircumference || '-'} / ${m.rightBicepCircumference || '-'}` : '-'}</TableCell>
                      <TableCell className="text-slate-600 text-sm py-4 font-medium">{m.leftThighCircumference || m.rightThighCircumference ? `${m.leftThighCircumference || '-'} / ${m.rightThighCircumference || '-'}` : '-'}</TableCell>
                      <TableCell className="text-right py-4">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                          onClick={() => handleDeleteMeasurement(m.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
