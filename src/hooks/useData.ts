import { useState, useEffect } from 'react';
import { Athlete, Measurement } from '../types';

export function useData() {
  const [athlete, setAthlete] = useState<Athlete | null>(() => {
    try {
      const item = window.localStorage.getItem('my_athlete');
      return item ? JSON.parse(item) : null;
    } catch (error) {
      return null;
    }
  });

  const [measurements, setMeasurements] = useState<Measurement[]>(() => {
    try {
      const item = window.localStorage.getItem('my_measurements');
      return item ? JSON.parse(item) : [];
    } catch (error) {
      return [];
    }
  });

  useEffect(() => {
    if (athlete) {
      window.localStorage.setItem('my_athlete', JSON.stringify(athlete));
    } else {
      window.localStorage.removeItem('my_athlete');
    }
  }, [athlete]);

  useEffect(() => {
    window.localStorage.setItem('my_measurements', JSON.stringify(measurements));
  }, [measurements]);

  const addMeasurement = (measurement: Omit<Measurement, 'id' | 'athleteId'>) => {
    if (!athlete) return;
    const id = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const newMeasurement: Measurement = {
      ...measurement,
      athleteId: athlete.id,
      id,
    };
    setMeasurements((prev) => [...prev, newMeasurement]);
  };

  const saveAthlete = (newAthlete: Omit<Athlete, 'id' | 'createdAt'>) => {
    const id = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    setAthlete({
      ...newAthlete,
      id,
      createdAt: Date.now(),
    });
  };

  const updateAthlete = (updates: Partial<Omit<Athlete, 'id' | 'createdAt'>>) => {
    setAthlete((prev) => prev ? { ...prev, ...updates } : null);
  };

  const clearData = () => {
    setAthlete(null);
    setMeasurements([]);
  };

  const deleteMeasurement = (id: string) => {
    setMeasurements((prev) => prev.filter((m) => m.id !== id));
  };

  return {
    athlete,
    measurements,
    saveAthlete,
    updateAthlete,
    clearData,
    addMeasurement,
    deleteMeasurement,
  };
}

