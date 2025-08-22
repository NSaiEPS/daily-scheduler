import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { dummyData } from "../data";

interface CalendarState {
  selectedDate: string | null;
  modalOpen: boolean;
  data: typeof dummyData;
}

const initialState: CalendarState = {
  selectedDate: null,
  modalOpen: false,
  data: dummyData,
};

const calendarSlice = createSlice({
  name: "calendar",
  initialState,
  reducers: {
    selectDate: (state, action: PayloadAction<string>) => {
      state.selectedDate = action.payload;
      state.modalOpen = !!state.data[action.payload];
    },
    closeModal: (state) => {
      state.modalOpen = false;
    },

    setData: (state, action: PayloadAction<typeof dummyData>) => {
      state.data = action.payload;
    },
  },
});

export const { selectDate, closeModal, setData } = calendarSlice.actions;
export default calendarSlice.reducer;
