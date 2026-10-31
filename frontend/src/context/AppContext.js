import React, { createContext, useCallback, useEffect, useState, useContext } from 'react';
import { apiRequest } from '../services/api';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [userProfile, setUserProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState(null);

  const request = useCallback((path, options = {}) => apiRequest(path, options), []);

  const updateUserProfile = (profile) => {
    setUserProfile((current) => ({ ...current, ...profile }));
  };

  const refreshUserProfile = useCallback(async () => {
    setProfileLoading(true);
    setProfileError(null);
    try {
      const result = await apiRequest('/skin-profile/profile');
      setUserProfile({
        id: result.id,
        name: result.fullName,
        email: result.email,
        skinProfile: result.skinProfile,
        skinType: result.skinProfile?.skinType || '',
        concerns: result.skinProfile?.currentConcerns || [],
        allergies: result.skinProfile?.allergies || [],
      });
    } catch (error) {
      setProfileError(error.message);
    } finally {
      setProfileLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUserProfile();
  }, [refreshUserProfile]);

  return (
    <AppContext.Provider
      value={{
        userProfile,
        profileLoading,
        profileError,
        request,
        updateUserProfile,
        refreshUserProfile,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);