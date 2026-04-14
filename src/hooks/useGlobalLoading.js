import { useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  hideGlobalLoading,
  showGlobalLoading,
} from '../store/globalLoadingSlice';

export function useGlobalLoading() {
  const dispatch = useDispatch();
  const globalLoading = useSelector((state) => state.globalLoading);

  const show = useCallback(
    (message) => {
      dispatch(showGlobalLoading(message ? { message } : undefined));
    },
    [dispatch]
  );

  const hide = useCallback(() => {
    dispatch(hideGlobalLoading());
  }, [dispatch]);

  const withGlobalLoading = useCallback(
    async (task, message) => {
      show(message);
      try {
        return await task();
      } finally {
        hide();
      }
    },
    [show, hide]
  );

  return useMemo(
    () => ({
      ...globalLoading,
      showGlobalLoading: show,
      hideGlobalLoading: hide,
      withGlobalLoading,
    }),
    [globalLoading, show, hide, withGlobalLoading]
  );
}

export default useGlobalLoading;
