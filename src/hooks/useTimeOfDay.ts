'use client';

import { useState, useEffect } from 'react';

export type TimeOfDay = 'morning' | 'day' | 'evening' | 'night';

export function useTimeOfDay() {
  const [hour, setHour] = useState(() => new Date().getHours());

  useEffect(() => {
    const interval = setInterval(() => {
      setHour(new Date().getHours());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const timeOfDay: TimeOfDay =
    hour >= 6 && hour < 9 ? 'morning' :
    hour >= 9 && hour < 18 ? 'day' :
    hour >= 18 && hour < 21 ? 'evening' : 'night';

  // Opacity overlay for building darkness
  const darknessOpacity =
    timeOfDay === 'night' ? 0.4 :
    timeOfDay === 'evening' ? 0.15 :
    timeOfDay === 'morning' ? 0.05 : 0;

  // Which floors have lights on at night (Capital team works late)
  const litFloors = new Set([10, 2, 4]); // Chairman, Capital, ICT

  return { hour, timeOfDay, darknessOpacity, litFloors };
}
