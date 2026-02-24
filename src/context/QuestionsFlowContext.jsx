import React, { createContext, useState, useCallback } from 'react';

export const QuestionsFlowContext = createContext();

export function QuestionsFlowProvider({ children }) {
  const [questionsData, setQuestionsData] = useState({
    clients: null,
    experience: null,
    goal: null,
    mei: null,
  });

  const updateQuestionsData = useCallback((key, value) => {
    setQuestionsData((prev) => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  const resetQuestionsData = useCallback(() => {
    setQuestionsData({
      clients: null,
      experience: null,
      goal: null,
      mei: null,
    });
  }, []);

  return (
    <QuestionsFlowContext.Provider value={{ questionsData, updateQuestionsData, resetQuestionsData }}>
      {children}
    </QuestionsFlowContext.Provider>
  );
}

export function useQuestionsFlow() {
  const context = React.useContext(QuestionsFlowContext);
  if (!context) {
    throw new Error('useQuestionsFlow must be used within QuestionsFlowProvider');
  }
  return context;
}
