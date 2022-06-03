enum TimelineGranularity {
  Daily,
  Weekly,
}

type BaseStatus = string | number | symbol;

type Task<TStatus extends BaseStatus> = {
  status: TStatus;
  startDate: Date;
  endDate: Date;
};

type TaskExtended<TStatus extends BaseStatus> = {
  index: number;
  status: TStatus;
  startDate: Date;
  endDate: Date;
  relativeStartDate: number;
  relativeEndDate: number;
};

type Activity<TStatus extends BaseStatus> = {
  id: number;
  title: string;
  tasks: Task<TStatus>[];
};

type ActivityExtended<TStatus extends BaseStatus> = {
  id: number;
  title: string;
  tasks: Task<TStatus>[];
  latestCompletionDate: Date | null;
};

type ScheduleCheckpoint<TStatus extends BaseStatus> = {
  relativeDate: number;
  activeTasks: TaskExtended<TStatus>[];
  completedTasks: TaskExtended<TStatus>[];
};

type ScheduleAction<TStatus extends BaseStatus> = {
  status: TStatus;
  relativeStartDate: number;
  relativeEndDate: number;
  checkpoints: ScheduleCheckpoint<TStatus>[];
};

type Colors<TStatus extends BaseStatus> = {
  [key in TStatus]: { primary: string; secondary: string };
};

type Configuration<TStatus extends BaseStatus> = {
  colors: Colors<TStatus>;
  isCompleted: IsCompletedFunction;
  getMostRelevantStatus: GetMostRelevantStatusFunction<TStatus>;
};

type TimelineSettings = {
  granularity: TimelineGranularity;
  startDate: Date;
  endDate: Date;
  durationInDays: number;
  durationInWeeks: number;
  relativeCurrentDate: number | null;
  relativeCurrentWeek: number | null;
};

// https://stackoverflow.com/questions/56505560/how-to-fix-ts2322-could-be-instantiated-with-a-different-subtype-of-constraint
type IsCompletedFunction = (status: any) => boolean;
type GetMostRelevantStatusFunction<TStatus extends BaseStatus> = (statuses: any[]) => TStatus;

export { TimelineGranularity };
export type {
  BaseStatus,
  Task,
  TaskExtended,
  Activity,
  ActivityExtended,
  ScheduleCheckpoint,
  ScheduleAction,
  Colors,
  Configuration,
  TimelineSettings,
  IsCompletedFunction,
  GetMostRelevantStatusFunction,
};
