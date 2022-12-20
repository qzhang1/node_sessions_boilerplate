import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

const BFF_BASE_URL = process.env.REACT_APP_BFF_BASE_URL;
const defaultHeaders = {
  Accept: "application/json",
  "Content-Type": "application/json",
};

export const signupUser = createAsyncThunk(
  "users/signupUser",
  async ({ email, password }, thunkAPI) => {
    try {
      const response = await fetch(`${BFF_BASE_URL}/auth/signup`, {
        method: "POST",
        headers: {
          ...defaultHeaders,
        },
        credentials: "include",
        body: JSON.stringify({
          email,
          password,
        }),
      });
      let { error } = await response.json();
      if (response.status !== 201) {
        return thunkAPI.rejectWithValue(error);
      }
      const [profile, err] = await getUserProfile("signupUser");
      if (err) {
        return thunkAPI.rejectWithValue(err.message);
      }
      return profile;
    } catch (err) {
      console.error(`"signupUser": failed with exception: ${err.message}`);
      return thunkAPI.rejectWithValue(err.message);
    }
  }
);

// gets the user profile from the session cookie
async function getUserProfile(caller) {
  try {
    // if previous login successful then this will retrieve user profile info
    const profileRes = await fetch(`${BFF_BASE_URL}/user/me`, {
      method: "GET",
      credentials: "include",
    });
    if (profileRes.status !== 200) {
      let { error } = await profileRes.json();
      return [null, error];
    }
    const profile = await profileRes.json();
    return [profile, null];
  } catch (err) {
    console.error(`"${caller}": failed with exception: ${err.message}`);
    return [null, err];
  }
}

export const loginUser = createAsyncThunk(
  "users/loginUser",
  async ({ email, password }, thunkAPI) => {
    try {
      // submits login creds and if successful gets 200 and HIDDEN session cookie
      const response = await fetch(`${BFF_BASE_URL}/auth/login`, {
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

      const [profile, error] = await getUserProfile("loginUser");
      if (error) {
        return thunkAPI.rejectWithValue(error.message);
      }
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
    isLoggedIn: false,
    isFetching: false,
    isError: false,
    errorMessage: "",
  },
  reducers: {
    // defined later
  },
  extraReducers: {
    [signupUser.fulfilled]: (state, { payload }) => {
      state.profile = payload;
      state.isLoggedIn = true;
      state.isFetching = false;
      state.isError = false;
      state.errorMessage = "";
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
