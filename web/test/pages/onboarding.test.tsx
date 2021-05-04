/* eslint-disable @typescript-eslint/no-non-null-assertion */

import {
  act,
  fireEvent,
  render,
  RenderResult,
  waitForElementToBeRemoved,
  within,
} from "@testing-library/react";
import Onboarding from "../../pages/onboarding";
import { useRouter } from "next/router";
import React from "react";
import * as useUserModule from "../../lib/data-hooks/useUserData";
import { generateMunicipality, generateOnboardingData, generateUser, generateUserData } from "../factories";
import { generateUseUserDataResponse } from "../helpers";
import {
  createEmptyOnboardingDisplayContent,
  createEmptyUserData,
  Industry,
  LegalStructure,
} from "../../lib/types/types";

jest.mock("next/router");

jest.mock("../../lib/data-hooks/useUserData", () => ({
  useUserData: jest.fn(),
}));
const mockUseUserData = (useUserModule as jest.Mocked<typeof useUserModule>).useUserData;

describe("onboarding form", () => {
  let subject: RenderResult;
  let mockPush: jest.Mock;
  let mockUpdate: jest.Mock;

  beforeEach(() => {
    jest.resetAllMocks();
    mockPush = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });

    mockUpdate = jest.fn().mockResolvedValue({});
    mockUseUserData.mockReturnValue(
      generateUseUserDataResponse({
        userData: createEmptyUserData(generateUser({})),
        update: mockUpdate,
      })
    );
  });

  it("prefills form from existing user data", async () => {
    const userData = generateUserData({
      onboardingData: generateOnboardingData({
        businessName: "Applebees",
        industry: "cosmetology",
        legalStructure: "b-corporation",
        municipality: generateMunicipality({
          displayName: "Newark",
        }),
      }),
    });

    mockUseUserData.mockReturnValue(
      generateUseUserDataResponse({
        userData,
        update: jest.fn().mockResolvedValue({}),
      })
    );

    subject = render(
      <Onboarding displayContent={createEmptyOnboardingDisplayContent()} municipalities={[]} />
    );
    expect(getBusinessNameValue()).toEqual("Applebees");

    await visitStep2();
    expect(getIndustryValue()).toEqual("cosmetology");

    await visitStep3();
    expect(getLegalStructureValue()).toEqual("b-corporation");

    await visitStep4();
    expect(getMunicipalityValue()).toEqual("Newark");
  });

  it("updates the user data after each form page", async () => {
    const initialUserData = generateUserData({});
    const promise = Promise.resolve();
    const mockUpdate = jest.fn(() => promise);

    mockUseUserData.mockReturnValue(
      generateUseUserDataResponse({
        userData: initialUserData,
        update: mockUpdate,
      })
    );

    const newark = generateMunicipality({ displayName: "Newark" });

    subject = render(
      <Onboarding
        displayContent={createEmptyOnboardingDisplayContent()}
        municipalities={[newark, initialUserData.onboardingData.municipality!]}
      />
    );

    fillText("Business name", "Cool Computers");
    await visitStep2();
    expect(mockUpdate).toHaveBeenLastCalledWith({
      ...initialUserData,
      onboardingData: {
        ...initialUserData.onboardingData,
        businessName: "Cool Computers",
      },
    });

    selectByValue("Industry", "e-commerce");
    await visitStep3();
    expect(mockUpdate).toHaveBeenLastCalledWith({
      ...initialUserData,
      onboardingData: {
        ...initialUserData.onboardingData,
        businessName: "Cool Computers",
        industry: "e-commerce",
      },
    });

    chooseRadio("general-partnership");
    await visitStep4();
    expect(mockUpdate).toHaveBeenLastCalledWith({
      ...initialUserData,
      onboardingData: {
        ...initialUserData.onboardingData,
        businessName: "Cool Computers",
        industry: "e-commerce",
        legalStructure: "general-partnership",
      },
    });

    selectByText("Location", "Newark");
    clickNext();
    await act(() => promise);
    expect(mockUpdate).toHaveBeenLastCalledWith({
      ...initialUserData,
      formProgress: "COMPLETED",
      onboardingData: {
        ...initialUserData.onboardingData,
        businessName: "Cool Computers",
        industry: "e-commerce",
        legalStructure: "general-partnership",
        municipality: newark,
      },
    });
    expect(mockPush).toHaveBeenCalledWith("/roadmap");
  });

  it("is able to go back", async () => {
    subject = render(
      <Onboarding displayContent={createEmptyOnboardingDisplayContent()} municipalities={[]} />
    );

    fillText("Business name", "Cool Computers");
    await visitStep2();
    clickBack();
    expect(subject.queryByLabelText("Business name")).toBeVisible();
  });

  it("displays industry-specific content for home contractors when selected", async () => {
    const displayContent = createEmptyOnboardingDisplayContent();
    displayContent.industry.specificHomeContractorMd = "Learn more about home contractors!";

    subject = render(<Onboarding displayContent={displayContent} municipalities={[]} />);
    await visitStep2();

    expect(subject.queryByText("Learn more about home contractors!")).not.toBeInTheDocument();
    selectByValue("Industry", "home-contractor");
    expect(subject.queryByText("Learn more about home contractors!")).toBeInTheDocument();
  });

  const fillText = (label: string, value: string) => {
    fireEvent.change(subject.getByLabelText(label), { target: { value: value } });
  };

  const selectByValue = (label: string, value: string) => {
    fireEvent.mouseDown(subject.getByLabelText(label));
    const listbox = within(subject.getByRole("listbox"));
    fireEvent.click(listbox.getByTestId(value));
  };

  const selectByText = (label: string, value: string) => {
    fireEvent.mouseDown(subject.getByLabelText(label));
    const listbox = within(subject.getByRole("listbox"));
    fireEvent.click(listbox.getByText(value));
  };

  const chooseRadio = (value: string) => {
    fireEvent.click(subject.getByTestId(value));
  };

  const clickNext = (): void => {
    fireEvent.click(subject.getAllByText("Next")[0]);
  };

  const clickBack = (): void => {
    fireEvent.click(subject.getAllByText("Back")[0]);
  };

  const getBusinessNameValue = (): string =>
    (subject.queryByLabelText("Business name") as HTMLInputElement)?.value;

  const getIndustryValue = (): Industry =>
    (subject.queryByTestId("industry") as HTMLInputElement)?.value as Industry;

  const getLegalStructureValue = (): LegalStructure => {
    const checked = subject.container.querySelector(".Mui-checked input") as HTMLInputElement;
    return checked.value as LegalStructure;
  };

  const getMunicipalityValue = (): string =>
    (subject.queryByTestId("municipality") as HTMLInputElement)?.value;

  const visitStep2 = async () => {
    clickNext();
    await waitForElementToBeRemoved(() => subject.getByText("Step 1 of 4"));
  };

  const visitStep3 = async () => {
    clickNext();
    await waitForElementToBeRemoved(() => subject.getByText("Step 2 of 4"));
  };

  const visitStep4 = async () => {
    clickNext();
    await waitForElementToBeRemoved(() => subject.getByText("Step 3 of 4"));
  };
});
