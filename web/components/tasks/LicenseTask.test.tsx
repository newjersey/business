import { useMockUserData } from "@/test/mock/mockUseUserData";
import { act, fireEvent, render, RenderResult, waitForElementToBeRemoved } from "@testing-library/react";
import * as api from "@/lib/api-client/apiClient";
import {
  generateLicenseData,
  generateLicenseStatusItem,
  generateNameAndAddress,
  generateOnboardingData,
  generateTask,
  generateUserData,
} from "@/test/factories";
import { useMockRoadmap } from "@/test/mock/mockUseRoadmap";
import { LicenseTask } from "@/components/tasks/LicenseTask";

jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));
jest.mock("@/lib/data-hooks/useRoadmap", () => ({ useRoadmap: jest.fn() }));
jest.mock("@/lib/api-client/apiClient", () => ({ checkLicenseStatus: jest.fn(), getUserData: jest.fn() }));
const mockApi = api as jest.Mocked<typeof api>;

describe("<LicenseTask />", () => {
  let subject: RenderResult;
  const task = generateTask({});
  const initialUserData = generateUserData({ licenseData: undefined });

  const renderTask = (): RenderResult => render(<LicenseTask task={task} />);

  beforeEach(() => {
    jest.resetAllMocks();
    useMockUserData(initialUserData);
    useMockRoadmap({});
    mockApi.getUserData.mockResolvedValue(initialUserData);
  });

  it("displays status as an uneditable tag with a tooltip", () => {
    useMockUserData({
      taskProgress: {
        [task.id]: "IN_PROGRESS",
      },
    });
    subject = renderTask();

    fireEvent.click(subject.getByTestId("IN_PROGRESS"));
    expect(subject.queryByTestId("NOT_STARTED")).not.toBeInTheDocument();
    expect(subject.getByTestId("automatic-status-info-tooltip")).toBeInTheDocument();
  });

  describe("starting tab", () => {
    it("shows content on first tab", () => {
      subject = renderTask();
      expect(subject.getByText(task.contentMd)).toBeInTheDocument();
    });

    it("starts on application tab when no licenseSearch data and visits status tab by clicking secondary button", () => {
      subject = renderTask();
      expect(subject.queryByTestId("business-name")).not.toBeInTheDocument();

      fireEvent.click(subject.getByTestId("cta-secondary"));
      expect(subject.queryByTestId("business-name")).toBeInTheDocument();
    });

    it("starts on check status form tab when it has form data but incomplete search", () => {
      useMockUserData({
        licenseData: generateLicenseData({
          completedSearch: false,
          nameAndAddress: generateNameAndAddress({
            name: "My Cool Nail Salon",
          }),
        }),
      });

      subject = renderTask();
      expect(getValue("business-name")).toEqual("My Cool Nail Salon");
    });

    it("goes directly to receipt screen and shows data from licenseData when completed search is true", async () => {
      useMockUserData({
        licenseData: generateLicenseData({
          completedSearch: true,
          nameAndAddress: generateNameAndAddress({
            name: "My Cool Nail Salon",
          }),
          status: "ACTIVE",
        }),
      });

      subject = renderTask();

      expect(subject.getByTestId("permit-ACTIVE")).toBeInTheDocument();
      expect(mockApi.checkLicenseStatus).not.toHaveBeenCalled();
    });
  });

  describe("form tab", () => {
    it("fills form values from user data if applicable", () => {
      useMockUserData({
        licenseData: generateLicenseData({
          nameAndAddress: generateNameAndAddress({
            name: "Applebees",
            addressLine1: "123 Main St",
            addressLine2: "Apt 1",
            zipCode: "12345",
          }),
          completedSearch: false,
        }),
      });
      subject = renderTask();

      expect(getValue("business-name")).toEqual("Applebees");
      expect(getValue("address-1")).toEqual("123 Main St");
      expect(getValue("address-2")).toEqual("Apt 1");
      expect(getValue("zipcode")).toEqual("12345");
    });

    it("fills name from user data when no licenseData", () => {
      useMockUserData({
        onboardingData: generateOnboardingData({
          businessName: "Applebees",
        }),
        licenseData: undefined,
      });

      subject = renderTask();
      fireEvent.click(subject.getByTestId("cta-secondary"));

      expect(getValue("business-name")).toEqual("Applebees");
      expect(getValue("address-1")).toEqual("");
      expect(getValue("address-2")).toEqual("");
      expect(getValue("zipcode")).toEqual("");
    });

    it("fills and saves form values and submits license status search with industry", async () => {
      const userData = generateUserData({
        onboardingData: generateOnboardingData({ industry: "home-contractor" }),
      });
      useMockUserData(userData);

      const returnedPromise = Promise.resolve(generateUserData({}));
      mockApi.checkLicenseStatus.mockReturnValue(returnedPromise);
      subject = renderTask();

      fillText("business-name", "My Cool Nail Salon");
      fillText("address-1", "123 Main St");
      fillText("address-2", "Suite 1");
      fillText("zipcode", "12345");

      fireEvent.submit(subject.getByTestId("check-status-submit"));
      await act(() => returnedPromise);

      expect(mockApi.checkLicenseStatus).toHaveBeenCalledWith({
        name: "My Cool Nail Salon",
        addressLine1: "123 Main St",
        addressLine2: "Suite 1",
        zipCode: "12345",
      });
    });

    it("fills and saves form values when failed", async () => {
      const returnedPromise = Promise.reject();
      mockApi.checkLicenseStatus.mockReturnValue(returnedPromise);
      subject = renderTask();

      fireEvent.click(subject.getByTestId("cta-secondary"));
      fillText("business-name", "My Cool Nail Salon");
      fillText("address-1", "123 Main St");
      fillText("address-2", "Suite 1");
      fillText("zipcode", "12345");

      fireEvent.submit(subject.getByTestId("check-status-submit"));
      await act(() => returnedPromise.catch(() => {}));
    });

    it("displays error alert when license status cannot be found", async () => {
      useMockUserData({});
      subject = renderTask();
      expect(subject.queryByTestId("error-alert-not-found")).not.toBeInTheDocument();

      const returnedPromise = Promise.reject(404);
      mockApi.checkLicenseStatus.mockReturnValue(returnedPromise);

      fireEvent.submit(subject.getByTestId("check-status-submit"));
      await act(() => returnedPromise.catch(() => {}));

      expect(subject.queryByTestId("error-alert-not-found")).toBeInTheDocument();
      expect(subject.queryByTestId("error-alert-fields-required")).not.toBeInTheDocument();
    });

    it("displays error alert when some information is missing", async () => {
      useMockUserData({});
      subject = renderTask();
      expect(subject.queryByTestId("error-alert-fields-required")).not.toBeInTheDocument();

      fillText("business-name", "");
      fireEvent.submit(subject.getByTestId("check-status-submit"));

      expect(subject.queryByTestId("error-alert-fields-required")).toBeInTheDocument();
      expect(subject.queryByTestId("error-alert-not-found")).not.toBeInTheDocument();
      expect(mockApi.checkLicenseStatus).not.toHaveBeenCalled();

      fillText("business-name", "something");
      mockApi.checkLicenseStatus.mockResolvedValue(generateUserData({}));
      fireEvent.submit(subject.getByTestId("check-status-submit"));

      await waitForElementToBeRemoved(() => subject.queryByTestId("error-alert-fields-required"));
      expect(mockApi.checkLicenseStatus).toHaveBeenCalled();
    });

    it("displays the loading spinner while request is being made", async () => {
      useMockUserData(generateUserData({}));

      const returnedPromise = Promise.resolve(generateUserData({}));
      mockApi.checkLicenseStatus.mockReturnValue(returnedPromise);
      subject = renderTask();

      fillText("business-name", "My Cool Nail Salon");
      fillText("address-1", "123 Main St");
      fillText("zipcode", "12345");

      expect(subject.queryByTestId("loading-spinner")).not.toBeInTheDocument();

      fireEvent.submit(subject.getByTestId("check-status-submit"));
      expect(subject.queryByTestId("loading-spinner")).toBeInTheDocument();
      await act(() => returnedPromise);

      expect(subject.queryByTestId("loading-spinner")).not.toBeInTheDocument();
    });

    it("displays the loading spinner while failed request is being made", async () => {
      useMockUserData(generateUserData({}));

      const returnedPromise = Promise.reject(404);
      mockApi.checkLicenseStatus.mockReturnValue(returnedPromise);
      subject = renderTask();

      fillText("business-name", "My Cool Nail Salon");
      fillText("address-1", "123 Main St");
      fillText("zipcode", "12345");

      expect(subject.queryByTestId("loading-spinner")).not.toBeInTheDocument();

      fireEvent.submit(subject.getByTestId("check-status-submit"));
      expect(subject.queryByTestId("loading-spinner")).toBeInTheDocument();
      await act(() => returnedPromise.catch(() => {}));

      expect(subject.queryByTestId("loading-spinner")).not.toBeInTheDocument();
    });
  });

  describe("receipt screen", () => {
    it("displays license status results when it is found", async () => {
      useMockUserData({});
      subject = renderTask();

      const returnedPromise = Promise.resolve(
        generateUserData({
          licenseData: generateLicenseData({
            items: [
              generateLicenseStatusItem({ title: "application fee", status: "PENDING" }),
              generateLicenseStatusItem({ title: "board approval", status: "ACTIVE" }),
            ],
          }),
        })
      );
      mockApi.checkLicenseStatus.mockReturnValue(returnedPromise);

      fireEvent.submit(subject.getByTestId("check-status-submit"));
      await act(() => returnedPromise);

      expect(subject.getByText("application fee")).toBeInTheDocument();
      expect(subject.getByText("board approval")).toBeInTheDocument();
      expect(subject.getByTestId("permit-PENDING")).toBeInTheDocument();
      expect(subject.getByTestId("item-PENDING")).toBeInTheDocument();
      expect(subject.getByTestId("item-ACTIVE")).toBeInTheDocument();
    });

    it("displays name and address on receipt screen", async () => {
      useMockUserData({
        licenseData: generateLicenseData({
          completedSearch: true,
          nameAndAddress: generateNameAndAddress({
            name: "My Cool Nail Salon",
            addressLine1: "123 Main St",
            addressLine2: "Suite 1",
            zipCode: "12345",
          }),
        }),
      });

      subject = renderTask();

      expect(subject.getByText("My Cool Nail Salon")).toBeInTheDocument();
      expect(subject.getByText("123 Main St Suite 1, 12345 NJ")).toBeInTheDocument();
    });

    it("edits info on receipt screen", async () => {
      useMockUserData({});
      subject = renderTask();

      fillText("business-name", "Some business");
      const returnedPromise = Promise.resolve(generateUserData({}));
      mockApi.checkLicenseStatus.mockReturnValue(returnedPromise);

      fireEvent.submit(subject.getByTestId("check-status-submit"));
      await act(() => returnedPromise);

      fireEvent.click(subject.getByTestId("edit-button"));
      fillText("business-name", "Some Other Business");
    });
  });

  const fillText = (testid: string, value: string) => {
    fireEvent.change(subject.getByTestId(testid), { target: { value: value } });
  };

  const getValue = (testid: string): string => (subject.getByTestId(testid) as HTMLInputElement)?.value;
});
