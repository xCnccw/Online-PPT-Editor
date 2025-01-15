import { configureStore } from '@reduxjs/toolkit';
import presentationReducer from './presentationSlice';

// for test Redux store
export const createTestStore = (preloadedState = {}) => {
  return configureStore({
    reducer: {
      presentation: presentationReducer,
    },
    preloadedState,
  });
};
