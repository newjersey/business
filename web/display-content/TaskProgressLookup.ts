import { TaskProgress } from "../lib/types/types";

export const TaskProgressLookup: Record<TaskProgress, string> = {
  NOT_STARTED: "Not started",
  IN_PROGRESS: "Inprogress",
  COMPLETED: "Completed",
};
