import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { subscriptionApi } from "../services/subscriptionApi";

export const fetchPlans = createAsyncThunk(
  "subscription/fetchPlans",
  async (_, { rejectWithValue }) => {
    try {
      const res = await subscriptionApi.getPlans();
      return res.data.plans;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to load plans"
      );
    }
  }
);

export const fetchMySubscription = createAsyncThunk(
  "subscription/fetchMine",
  async (_, { rejectWithValue }) => {
    try {
      const res = await subscriptionApi.getMySubscription();
      return res.data.subscription;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to load subscription"
      );
    }
  }
);

const initialState = {
  plans: [],
  current: null,
  loading: false,
  error: null,
};

const subscriptionSlice = createSlice({
  name: "subscription",
  initialState,
  reducers: {
    setCurrent: (state, action) => {
      state.current = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPlans.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPlans.fulfilled, (state, action) => {
        state.loading = false;
        state.plans = action.payload;
      })
      .addCase(fetchPlans.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchMySubscription.fulfilled, (state, action) => {
        state.current = action.payload;
      });
  },
});

export const { setCurrent } = subscriptionSlice.actions;
export default subscriptionSlice.reducer;
