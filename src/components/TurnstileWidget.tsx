import React, { useEffect } from 'react';
import { Turnstile } from '@marsidev/react-turnstile';
import { useSettingsStore } from '../store/settingsStore';

interface TurnstileWidgetProps {
  onVerify: (token: string) => void;
  onError?: () => void;
}

export const TurnstileWidget: React.FC<TurnstileWidgetProps> = ({ onVerify, onError }) => {
  const { settings, fetchSettings } = useSettingsStore();

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  if (!settings?.securitySettings?.turnstileEnabled) {
    return null;
  }

  const siteKey = settings.securitySettings.turnstileSiteKey;

  if (!siteKey) {
    return null;
  }

  return (
    <div className="my-4 flex justify-center">
      <Turnstile
        siteKey={siteKey}
        onSuccess={onVerify}
        onError={onError}
        options={{
          theme: 'light',
        }}
      />
    </div>
  );
};
