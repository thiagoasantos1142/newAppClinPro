import { useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  resetQuestionsData as resetQuestionsDataAction,
  updateQuestionsData as updateQuestionsDataAction,
} from '../store/questionsFlowSlice';

export function useQuestionsFlow() {
  const dispatch = useDispatch();
  const questionsData = useSelector((state) => state.questionsFlow.questionsData);

  return useMemo(
    () => ({
      questionsData,
      updateQuestionsData: (key, value) => dispatch(updateQuestionsDataAction({ key, value })),
      resetQuestionsData: () => dispatch(resetQuestionsDataAction()),
    }),
    [dispatch, questionsData]
  );
}

export default useQuestionsFlow;
