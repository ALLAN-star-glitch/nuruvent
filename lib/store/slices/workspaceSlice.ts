// lib/store/slices/workspaceSlice.ts
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface WorkspaceState {
  activeAccountId: string | null;
  activeTeamId: string | null;
}

const initialState: WorkspaceState = {
  activeAccountId: null,
  activeTeamId: null,
};

const workspaceSlice = createSlice({
  name: 'workspace',
  initialState,
  reducers: {
    setActiveAccount(state, action: PayloadAction<string | null>) {
      if (state.activeAccountId !== action.payload) {
        state.activeAccountId = action.payload;
        state.activeTeamId = null; // invalidate team when account changes
      }
    },
    setActiveTeam(state, action: PayloadAction<string | null>) {
      state.activeTeamId = action.payload;
    },
    clearWorkspace(state) {
      state.activeAccountId = null;
      state.activeTeamId = null;
    },
  },
});

export const { setActiveAccount, setActiveTeam, clearWorkspace } =
  workspaceSlice.actions;
export default workspaceSlice.reducer;