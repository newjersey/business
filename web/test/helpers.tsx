import React, { Dispatch, ReactElement } from "react";
import { AuthAction, AuthState } from "../lib/auth/AuthContext";
import { render, RenderResult } from "@testing-library/react";
import { AuthContext } from "../pages/_app";
import { BusinessUser } from "../lib/types/BusinessUser";
import { UserData } from "../lib/types/UserData";
import { UseUserDataResponse } from "../lib/data/useUserData";
import { generateUserData } from "./factories";

export const renderWithUser = (
  subject: ReactElement,
  user: BusinessUser | undefined,
  dispatch: Dispatch<AuthAction>
): RenderResult => {
  const state: AuthState = { isAuthenticated: !!user, user: user };
  return render(<AuthContext.Provider value={{ state, dispatch }}>{subject}</AuthContext.Provider>);
};

export const createStatefulMock = (initialValue?: UserData) => {
  return (): UseUserDataResponse => {
    const [userData, setUserData] = React.useState<UserData>(initialValue || generateUserData({}));
    return {
      userData: userData,
      update: (data: UserData) => {
        setUserData(data);
        return Promise.resolve();
      },
      isError: false,
      isLoading: false,
    };
  };
};

export const generateUseUserDataResponse = (
  overrides: Partial<UseUserDataResponse>
): UseUserDataResponse => ({
  userData: generateUserData({}),
  update: jest.fn(),
  isError: false,
  isLoading: false,
  ...overrides,
});
