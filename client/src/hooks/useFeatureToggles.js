import { useMemo } from 'react';
import featureToggles from '../config/featureToggles.json';

export const useFeatureToggles = () => {
  return useMemo(() => {
    // Features are mutually exclusive - only one can be enabled at a time
    const gossipEnabled = featureToggles.enableGossip === true;
    const remindersEnabled = featureToggles.enableReminders === true;
    
    // If both are somehow enabled, prioritize gossip (or could throw error)
    const enableGossip = gossipEnabled;
    const enableReminders = remindersEnabled && !gossipEnabled;
    
    return {
      enableGossip,
      enableReminders,
      hasAnyFeature: enableGossip || enableReminders
    };
  }, []);
};

export default useFeatureToggles;