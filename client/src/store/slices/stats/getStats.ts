import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios, { AxiosError } from "axios";
import { BASE_API_URL } from "../../../constants/base_url";
import { Default_Error_Message } from "../../../constants/default_error";
import type { RootState } from "../../store";

export interface iAdminStats {
  totalRevenue: number;
  thisWeekRevenue: number;
  lastMonthRevenue: number;
  totalLessons: number;
  totalChapters: number;
  totalStudents: number;
  paymentMethods: {
    name: string;
    amount: number;
    count: number;
    percentage: string;
  }[];
}

interface iStatsState {
  data: iAdminStats;
  loading: boolean;
  error: string;
}

const initialState: iStatsState = {
  data: {
    totalRevenue: 0,
    thisWeekRevenue: 0,
    lastMonthRevenue: 0,
    totalLessons: 0,
    totalChapters: 0,
    totalStudents: 0,
    paymentMethods: [],
  } as iAdminStats,
  loading: false,
  error: "",
};

export const getAdminStatsFn = createAsyncThunk(
  "/stats/admin",
  async (_, { rejectWithValue, getState }) => {
    try {
      const appState = getState() as RootState;
      const token = appState.loginSlice.data?.token;

      const response = await axios.get(`${BASE_API_URL}/stats/admin`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });

      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        return rejectWithValue(
          error.response?.data.message || Default_Error_Message
        );
      }
      return rejectWithValue(Default_Error_Message);
    }
  }
);

export const getAdminStatsSlice = createSlice({
  name: "Get Admin Stats Slice",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(getAdminStatsFn.pending, (state) => {
      state.loading = true;
      state.error = "";
    });
    builder.addCase(getAdminStatsFn.fulfilled, (state, action) => {
      state.loading = false;
      state.data = action.payload.data;
      state.error = "";
    });
    builder.addCase(getAdminStatsFn.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});

export default getAdminStatsSlice.reducer;
