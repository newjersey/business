/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { buildRoadmap } from "./buildRoadmap";
import { Roadmap } from "../types/types";
import { generateOnboardingData } from "../../test/factories";
import axios from "axios";
import { getTaskById } from "../getTaskById";

jest.mock("axios");
const mockAxios = axios as jest.Mocked<typeof axios>;

describe("buildRoadmap", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    mockAxios.get.mockImplementation(async (url: string) => {
      const segments = url.split("/");
      const id = segments[segments.length - 1];
      return Promise.resolve({ data: await getTaskById(id) });
    });
  });

  const getTasksByStepId = (roadmap: Roadmap, id: string): string[] => {
    return roadmap.steps.find((it) => it.id === id)!.tasks.map((it) => it.id);
  };

  it("loads a generic roadmap when no industry data present", async () => {
    const onboardingData = generateOnboardingData({
      industry: "generic",
    });
    expect((await buildRoadmap(onboardingData)).type).toEqual("generic");
  });

  it("orders tasks by weight", async () => {
    const onboardingData = generateOnboardingData({ industry: "home-contractor" });
    const roadmap = await buildRoadmap(onboardingData);
    const dueDiligenceTasks = getTasksByStepId(roadmap, "due-diligence");
    expect(dueDiligenceTasks).toEqual([
      "identify-potential-lease", // weight: 1
      "check-site-requirements", // weight: 2
      "research-insurance-needs", // weight: 10
    ]);
  });

  it("removes step 5 if it has no tasks", async () => {
    const onboardingData = generateOnboardingData({
      industry: "generic",
      legalStructure: undefined,
    });
    const roadmap = await buildRoadmap(onboardingData);
    expect(roadmap.steps).toHaveLength(4);
    expect(roadmap.steps.find((step) => step.id === "inspection-requirements")).toBeUndefined();
  });

  describe("restaurant", () => {
    let roadmap: Roadmap;
    beforeEach(async () => {
      const onboardingData = generateOnboardingData({ industry: "restaurant" });
      roadmap = await buildRoadmap(onboardingData);
    });

    it("adds restaurant specific tasks", () => {
      expect(roadmap.type).toEqual("restaurant");
      expect(getTasksByStepId(roadmap, "lease-and-permits")).toContain("floor-plan-approval-doh");
      expect(getTasksByStepId(roadmap, "lease-and-permits")).toContain("food-safety-course");
    });

    it("adds physical location tasks", () => {
      expect(getTasksByStepId(roadmap, "due-diligence")).toContain("identify-potential-lease");
      expect(getTasksByStepId(roadmap, "due-diligence")).toContain("check-site-requirements");
      expect(getTasksByStepId(roadmap, "lease-and-permits")).toContain("sign-lease");
      expect(getTasksByStepId(roadmap, "lease-and-permits")).toContain("certificate-of-occupancy");
      expect(getTasksByStepId(roadmap, "lease-and-permits")).toContain("fire-permit");
      expect(getTasksByStepId(roadmap, "lease-and-permits")).toContain("mercantile-license");
    });
  });

  describe("e-commerce", () => {
    let roadmap: Roadmap;
    beforeEach(async () => {
      const onboardingData = generateOnboardingData({ industry: "e-commerce" });
      roadmap = await buildRoadmap(onboardingData);
    });

    it("adds e-commerce specific type", () => {
      expect(roadmap.type).toEqual("e-commerce");
    });
  });

  describe("home contractor", () => {
    let roadmap: Roadmap;
    beforeEach(async () => {
      const onboardingData = generateOnboardingData({ industry: "home-contractor" });
      roadmap = await buildRoadmap(onboardingData);
    });

    it("adds home contractor specific tasks", () => {
      expect(roadmap.type).toEqual("home-contractor");
      expect(getTasksByStepId(roadmap, "lease-and-permits")).toContain("register-consumer-affairs");
    });

    it("adds physical location tasks", () => {
      expect(getTasksByStepId(roadmap, "due-diligence")).toContain("identify-potential-lease");
      expect(getTasksByStepId(roadmap, "due-diligence")).toContain("check-site-requirements");
      expect(getTasksByStepId(roadmap, "lease-and-permits")).toContain("sign-lease");
      expect(getTasksByStepId(roadmap, "lease-and-permits")).toContain("certificate-of-occupancy");
      expect(getTasksByStepId(roadmap, "lease-and-permits")).toContain("fire-permit");
      expect(getTasksByStepId(roadmap, "lease-and-permits")).toContain("mercantile-license");
    });

    it("modifies the text for insurance needs", () => {
      const dueDiligenceStep = roadmap.steps.find((it) => it.id === "due-diligence")!;
      const insuranceNeeds = dueDiligenceStep.tasks.find((it) => it.id === "research-insurance-needs")!;
      expect(insuranceNeeds.contentHtml).toContain("Home contractors need to");
    });
  });

  describe("cosmetology", () => {
    let roadmap: Roadmap;
    beforeEach(async () => {
      const onboardingData = generateOnboardingData({ industry: "cosmetology" });
      roadmap = await buildRoadmap(onboardingData);
    });

    it("adds cosmetology specific tasks", () => {
      expect(roadmap.type).toEqual("cosmetology");
      expect(getTasksByStepId(roadmap, "due-diligence")).toContain("check-site-suitability");
      expect(getTasksByStepId(roadmap, "lease-and-permits")).toContain("apply-for-shop-license");
      expect(getTasksByStepId(roadmap, "lease-and-permits")).toContain("individual-staff-licenses");
      expect(getTasksByStepId(roadmap, "inspection-requirements")).toContain("board-inspection");
    });

    it("adds physical location tasks", () => {
      expect(getTasksByStepId(roadmap, "due-diligence")).toContain("identify-potential-lease");
      expect(getTasksByStepId(roadmap, "due-diligence")).toContain("check-site-requirements");
      expect(getTasksByStepId(roadmap, "lease-and-permits")).toContain("sign-lease");
      expect(getTasksByStepId(roadmap, "lease-and-permits")).toContain("certificate-of-occupancy");
      expect(getTasksByStepId(roadmap, "lease-and-permits")).toContain("fire-permit");
      expect(getTasksByStepId(roadmap, "lease-and-permits")).toContain("mercantile-license");
    });

    it("modifies the text for local site requirements", () => {
      const dueDiligenceStep = roadmap.steps.find((it) => it.id === "due-diligence")!;
      const insuranceNeeds = dueDiligenceStep.tasks.find((it) => it.id === "check-site-requirements")!;
      expect(insuranceNeeds.contentHtml).toContain("Board of Cosmetology");
    });
  });

  describe("business structure", () => {
    it("adds search business name tasks if structure in PublicRecordFiling group", async () => {
      const onboardingData = generateOnboardingData({ legalStructure: "limited-liability-company" });
      const roadmap = await buildRoadmap(onboardingData);
      expect(roadmap?.steps.map((it) => it.name)).toContain("Form & Register Your Business");
      expect(roadmap?.steps[2].tasks.map((it) => it.id)).toContain("search-business-name");
      expect(roadmap?.steps[2].tasks.map((it) => it.id)).not.toContain("register-trade-name");
    });

    it("adds trade name tasks if structure in TradeName group", async () => {
      const onboardingData = generateOnboardingData({ legalStructure: "general-partnership" });
      const roadmap = await buildRoadmap(onboardingData);
      expect(roadmap?.steps.map((it) => it.name)).toContain("Form & Register Your Business");
      expect(roadmap?.steps[2].tasks.map((it) => it.id)).not.toContain("search-business-name");
      expect(roadmap?.steps[2].tasks.map((it) => it.id)).toContain("register-trade-name");
    });
  });
});
