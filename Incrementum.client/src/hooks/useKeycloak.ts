import { useCallback } from 'react';
import { getKeycloakRegistrationUrl } from '../Context/AuthContext';
export const useKeycloak = () => {
  const redirectToRegistration = useCallback(() => {
    window.location.href = getKeycloakRegistrationUrl();
  }, []);

  return {
    redirectToRegistration,
  };
};
