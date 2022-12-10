import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

export const signupUser = createAsyncThunk(
  "users/signupUser",
  async ({ email, password }, thunkAPI) => {
    try {
      const response = await fetch("http://localhost:4004/api/auth/signup", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          email,
          password,
        }),
      });
      let { message, error } = await response.json();

      if (response.status === 201 || response.status === 400) {
        return message;
      } else {
        return thunkAPI.rejectWithValue(error);
      }
    } catch (err) {
      console.error(`"signupUser": failed with exception: ${err.message}`);
      return thunkAPI.rejectWithValue(err.message);
    }
  }
);

export const loginUser = createAsyncThunk(
  "users/loginUser",
  async ({ email, password }, thunkAPI) => {
    try {
      // submits login creds and if successful gets 200 and HIDDEN session cookie
      const response = await fetch("http://localhost:4004/api/auth/login", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          email,
          password,
        }),
      });
      if (response.status !== 200) {
        let { error } = await response.json();
        return thunkAPI.rejectWithValue(error);
      }
      // if previous login successful then this will retrieve user profile info
      const profileRes = await fetch("http://localhost:4004/api/user/me", {
        method: "GET",
        credentials: "include",
      });
      if (profileRes.status !== 200) {
        let { error } = await response.json();
        return thunkAPI.rejectWithValue(error);
      }
      const profile = await profileRes.json();
      return profile;
    } catch (err) {
      console.error(`"loginUser": failed with exception: ${err.message}`);
      return thunkAPI.rejectWithValue(err.message);
    }
  }
);

export const logoutUser = createAsyncThunk(
  "users/logoutUser",
  async ({}, thunkAPI) => {
    try {
      const response = await fetch("http://localhost:4004/api/auth/logout", {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      if (response.status !== 200) {
        let { error } = await response.json();
        return thunkAPI.rejectWithValue(error);
      }

      return {};
    } catch (err) {
      console.error(`"logoutUser": failed with exception: ${err.message}`);
      return thunkAPI.rejectWithValue(err.message);
    }
  }
);

export const fetchUserProfile = createAsyncThunk(
  "users/fetchUserProfile",
  async ({}, thunkAPI) => {
    // if previous login successful then this will retrieve user profile info
    const profileRes = await fetch("http://localhost:4004/api/user/me", {
      method: "GET",
      credentials: "include",
    });
    if (profileRes.status !== 200) {
      let { error } = await profileRes.json();
      return thunkAPI.rejectWithValue(error);
    }
    const profile = await profileRes.json();
    return profile;
  }
);

export const userSlice = createSlice({
  name: "user",
  initialState: {
    profile: {},
    isLoggedIn: true,
    isFetching: false,
    isError: false,
    errorMessage: "",
  },
  reducers: {
    // defined later
  },
  extraReducers: {
    [signupUser.fulfilled]: (state, {}) => {
      state.isFetching = false;
    },
    [signupUser.pending]: (state) => {
      state.isFetching = true;
    },
    [signupUser.rejected]: (state, { payload }) => {
      state.isFetching = false;
      state.isError = true;
      state.errorMessage = payload;
    },
    [loginUser.pending]: (state) => {
      state.isFetching = true;
    },
    [loginUser.fulfilled]: (state, { payload }) => {
      state.profile = payload;
      state.isLoggedIn = true;
      state.isFetching = false;
      state.isError = false;
      state.errorMessage = "";
    },
    [loginUser.rejected]: (state, { payload }) => {
      state.isFetching = false;
      state.isError = true;
      state.errorMessage = payload;
    },
    [logoutUser.pending]: (state) => {
      state.isFetching = true;
    },
    [logoutUser.fulfilled]: (state, { payload }) => {
      state.profile = payload;
      state.isLoggedIn = false;
      state.isFetching = false;
      state.isError = false;
      state.errorMessage = "";
    },
    [logoutUser.rejected]: (state, { payload }) => {
      state.isFetching = false;
      state.isError = true;
      state.errorMessage = payload;
    },
    [fetchUserProfile.pending]: (state) => {
      state.isFetching = true;
    },
    [fetchUserProfile.fulfilled]: (state, { payload }) => {
      state.profile = payload;
      state.isLoggedIn = true;
      state.isFetching = false;
      state.isError = false;
      state.errorMessage = "";
    },
    [fetchUserProfile.rejected]: (state, { payload }) => {
      state.isFetching = false;
      state.isLoggedIn = false;
      state.isError = true;
      state.errorMessage = payload;
    },
  },
});

export const profileSelector = (state) => state.user.profile;
export const userSelector = (state) => state.user;
export default userSlice.reducer;
