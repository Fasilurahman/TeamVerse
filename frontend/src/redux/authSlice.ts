import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";

interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "team-lead" | "employee";
  profilePic?: string;
  teamId?: string | null;
  isBlocked: boolean;
  phone?: string | null;
  location?: string | null;
  company?: string | null;
  status: "active" | "inactive";
}

interface AuthState {
  token: string | null;
  user: User | null;
}

const initialState: AuthState = {
  token: null,
  user: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuth(state, action: PayloadAction<{ token: string; user: User }>) {
      console.log(action.payload.user,'user user user')
      state.token = action.payload.token || null;
      state.user = action.payload.user;
    },
    clearToken(state) {
      state.token = null;
      state.user = null;
    },
    setProfile(state, action: PayloadAction<{ user: User }>) {
      state.user = action.payload.user;
    },
  },
});

export const { setAuth, clearToken, setProfile } = authSlice.actions;

const persistConfig = {
  key: "auth",
  storage,
  whitelist: ["token", "user"],
};
export default persistReducer(persistConfig, authSlice.reducer);
