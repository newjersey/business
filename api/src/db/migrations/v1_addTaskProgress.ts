import { BusinessUser, FormProgress, TaskProgress } from "../../domain/types";
import { BusinessForm } from "../../domain/form";
import { v0UserData } from "./v0_userData";

export interface v1UserData {
  user: BusinessUser;
  formData: BusinessForm;
  formProgress: FormProgress;
  taskProgress: Record<string, TaskProgress>;
  version: number;
}

export const migrate_v0_to_v1 = (v0Data: v0UserData): v1UserData => {
  return {
    ...v0Data,
    taskProgress: {},
    version: 1,
  };
};
