import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import axios, { AxiosError } from "axios";
import { BASE_API_URL } from "../../../constants/base_url";
import { Default_Error_Message } from "../../../constants/default_error";
import type { iListedChapters } from "../../../types/chapter";
import type { RootState } from "../../store";

const initialState = {
  data: {} as iListedChapters,
  loading: false,
  error: "",
};

export const listChaptersFn = createAsyncThunk(
  "/courses/chapters/list",
  async (
    data: { page?: number; perPage?: number; limit?: number } = {},
    { rejectWithValue, getState }
  ) => {
    try {
      const appState = getState() as RootState;
      const token = appState.loginSlice.data?.token;

      const limit = data?.limit ?? data?.perPage;
      const response = await axios.get(`${BASE_API_URL}/courses/chapters/list`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        params: {
          page: data?.page,
          limit,
        },
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

export const listChaptersSlice = createSlice({
  name: "List Chapters Slice",
  initialState,
  reducers: {
    createChapterRedu: (state, action) => {
      state.data = action.payload;
      state.loading = false;
      state.error = "";
    },
    updateChapterRedu: (state, action) => {
      state.data = action.payload;
      state.loading = false;
      state.error = "";
    },
    deleteChapterRdu: (state, action) => {
      state.data = action.payload;
      state.loading = false;
      state.error = "";
    },
  },
  extraReducers: (builder) => {
    builder.addCase(listChaptersFn.pending, (state) => {
      state.loading = true;
      state.data = {} as iListedChapters;
      state.error = "";
    });
    builder.addCase(listChaptersFn.fulfilled, (state, action) => {
      state.loading = false;
      state.data = action.payload;
      state.error = "";
    });
    builder.addCase(listChaptersFn.rejected, (state, action) => {
      state.data = {} as iListedChapters;
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});

export const { createChapterRedu, updateChapterRedu, deleteChapterRdu } =
  listChaptersSlice.actions;
