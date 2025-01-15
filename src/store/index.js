import { configureStore } from '@reduxjs/toolkit';
import presentationReducer from './presentationSlice';

const store = configureStore({
  reducer: {
    presentation: presentationReducer,
  },
  devTools: process.env.NODE_ENV !== 'production', 
});

export default store;
