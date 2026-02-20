import React, { useEffect } from 'react';
import { useSettingsStore } from '../store/SettingsStore';
import { UserSettings } from '@/v1/api/types';

const Toggle: React.FC<{ 
  label: string; 
  description: string; 
  isChecked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled: boolean;
}> = ({ label, description, isChecked, onChange, disabled }) => (
  <div className="flex items-center justify-between py-4 border-b border-gray-200">
    <div>
      <h3 className="font-semibold text-gray-800">{label}</h3>
      <p className="text-sm text-gray-500">{description}</p>
    </div>
    <label className="relative inline-flex items-center cursor-pointer">
      <input 
        type="checkbox" 
        className="sr-only peer" 
        checked={isChecked}
        onChange={onChange}
        disabled={disabled}
      />
      <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-green-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
    </label>
  </div>
);

const NotificationPreferences: React.FC = () => {
  const { settings, isLoading, fetchSettings, updateSettings } = useSettingsStore();

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleToggle = (key: keyof UserSettings) => {
    if (settings) {
      updateSettings({ [key]: !settings[key] });
    }
  };

  const preferences: { key: keyof UserSettings; label: string; description: string }[] = [
    { key: 'payout_updates', label: 'Payout Updates', description: 'Get notified when your earnings arrive.' },
    { key: 'hive_activity_alerts', label: 'Hive Activity Alerts', description: 'Stay in the loop with your hive’s progress.' },
    { key: 'environmental_impact_reports', label: 'Environmental Impact Reports', description: 'See the difference your investment makes.' },
    { key: 'new_investment_opportunities', label: 'New Investment Opportunities', description: 'Be the first to know about new packages.' },
  ];

  if (isLoading && !settings) {
    return <div>Loading preferences...</div>;
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-6">Notification Preferences</h2>
      <div className="space-y-4">
        {preferences.map((pref) => (
          <Toggle 
            key={pref.key} 
            label={pref.label} 
            description={pref.description} 
            isChecked={settings?.[pref.key] ?? false}
            onChange={() => handleToggle(pref.key)}
            disabled={isLoading}
          />
        ))}
      </div>
    </div>
  );
};

export default NotificationPreferences;
