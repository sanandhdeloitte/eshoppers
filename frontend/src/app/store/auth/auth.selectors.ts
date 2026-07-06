import { authFeature } from './auth.reducer';
import { createSelector } from '@ngrx/store';

export const {
  selectUser,
  selectToken,
  selectLoading: selectAuthLoading,
  selectError:   selectAuthError,
  selectSessionRestored
} = authFeature;

export const selectIsLoggedIn = createSelector(
  selectUser, (user) => !!user
);
