import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { initializeAuth, logout } from '../store/authActions';
import { setUnauthorizedHandler } from '../services/api';

export default function AuthBootstrap() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(initializeAuth());

    setUnauthorizedHandler(() => {
      dispatch(logout());
    });

    return () => {
      setUnauthorizedHandler(null);
    };
  }, [dispatch]);

  return null;
}
