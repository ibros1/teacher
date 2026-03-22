import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type {
  iBulkCreatedLessonPayload,
  iBulkCreatedLessonResponse,
} from "../../../types/lesson";
import axios, { AxiosError } from "axios";
import { Default_Error_Message } from "../../../constants/default_error";
import { BASE_API_URL } from "../../../constants/base_url";

const initialState = {
  data: {} as iBulkCreatedLessonResponse,
  loading: false,
  error: "",
};

export const createBulkLessonFn = createAsyncThunk(
  "/lesson/create-bulk",
  async (data: iBulkCreatedLessonPayload, { rejectWithValue }) => {
    try {
      const res = await axios.post(
        `${BASE_API_URL}/courses/lessons/create-bulk`,
        data
      );

      return res.data;
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

export const createBulkLessonSlice = createSlice({
  name: "Create Bulk Lesson Slice",
  initialState,
  reducers: {
    resetBulkLessonState: (state) => {
      state.data = {} as iBulkCreatedLessonResponse;
      state.loading = false;
      state.error = "";
    },
  },
  extraReducers: (builder) => {
    builder.addCase(createBulkLessonFn.pending, (state) => {
      state.loading = true;
      state.data = {} as iBulkCreatedLessonResponse;
      state.error = "";
    });
    builder.addCase(createBulkLessonFn.fulfilled, (state, action) => {
      state.loading = false;
      state.data = action.payload;
      state.error = "";
    });
    builder.addCase(createBulkLessonFn.rejected, (state, action) => {
      state.data = {} as iBulkCreatedLessonResponse;
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});

export const { resetBulkLessonState } = createBulkLessonSlice.actions;
