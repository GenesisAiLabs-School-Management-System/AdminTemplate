import { useContext } from 'react';
import { UserSettingsContext } from '../context/SettingContext.js';

// Hook to use the user settings

export const useUserSettings = () => {
    const context = useContext(UserSettingsContext);
    if (context === undefined) {
        throw new Error('useUserSettings must be used within a UserSettingsProvider');
    }
    return context;
};
