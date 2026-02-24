import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { initializeAuth, logout, refreshSession } from '../store/authActions';
import { setUnauthorizedHandler } from '../services/api';

export default function AuthBootstrap() {
  const dispatch = useDispatch();

  useEffect(() => {
    let refreshing = false;
    dispatch(initializeAuth());

    setUnauthorizedHandler(async () => {
      if (refreshing) return;
      refreshing = true;
      try {
        await dispatch(refreshSession());
        return true;
      } catch {
        await dispatch(logout());
        throw new Error('refresh_failed');
      } finally {
        refreshing = false;
      }
    });

    return () => {
      setUnauthorizedHandler(null);
    };
  }, [dispatch]);

  return null;
}
