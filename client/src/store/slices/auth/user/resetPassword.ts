import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { RootState } from "../../../store";
import axios, { AxiosError } from "axios";
import { Default_Error_Message } from "../../../../constants/default_error";
import { BASE_API_URL } from "../../../../constants/base_url";

interface ResetPasswordPayload {
  userId: number;
  newPassword: string;
}

interface ResetPasswordResponse {
  isSuccess: boolean;
  message: string;
}

const initialState = {
  data: {} as ResetPasswordResponse,
  loading: false,
  error: "",
};

export const resetPasswordFn = createAsyncThunk(
  "/users/reset-password",
  async (payload: ResetPasswordPayload, { rejectWithValue, getState }) => {
    try {
      const appState = getState() as RootState;
      const token = appState.loginSlice.data?.token;

      const res = await axios.patch(
        `${BASE_API_URL}/users/reset-password`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
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

export const resetPasswordSlice = createSlice({
  name: "Reset Password Slice",
  initialState,
  reducers: {
    resetResetPasswordState: (state) => {
      state.data = {} as ResetPasswordResponse;
      state.loading = false;
      state.error = "";
    },
  },
  extraReducers: (builder) => {
    builder.addCase(resetPasswordFn.pending, (state) => {
      state.loading = true;
      state.data = {} as ResetPasswordResponse;
      state.error = "";
    });
    builder.addCase(resetPasswordFn.fulfilled, (state, action) => {
      state.data = action.payload;
      state.loading = false;
      state.error = "";
    });
    builder.addCase(resetPasswordFn.rejected, (state, action) => {
      state.data = {} as ResetPasswordResponse;
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});

export const { resetResetPasswordState } = resetPasswordSlice.actions;
export default resetPasswordSlice.reducer;
