import { useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { logout, requestOtp, verifyOtp } from '../store/authActions';

export function useAuth() {
  const dispatch = useDispatch();
  const auth = useSelector((state) => state.auth);

  return useMemo(
    () => ({
      ...auth,
      isAuthenticated: Boolean(auth.token),
      requestOtp: (phone) => dispatch(requestOtp(phone)),
      verifyOtp: (phone, code) => dispatch(verifyOtp(phone, code)),
      logout: () => dispatch(logout()),
    }),
    [auth, dispatch]
  );
}

export default useAuth;
