import { createSlice } from '@reduxjs/toolkit';

const initialQuestionsData = {
  clients: null,
  experience: null,
  goal: null,
  mei: null,
};

const questionsFlowSlice = createSlice({
  name: 'questionsFlow',
  initialState: {
    questionsData: initialQuestionsData,
  },
  reducers: {
    updateQuestionsData(state, action) {
      const { key, value } = action.payload;
      state.questionsData[key] = value;
    },
    resetQuestionsData(state) {
      state.questionsData = { ...initialQuestionsData };
    },
  },
});

export const { updateQuestionsData, resetQuestionsData } = questionsFlowSlice.actions;
export default questionsFlowSlice.reducer;
