import compareAsc from 'date-fns/compareAsc';
import differenceInCalendarDays from 'date-fns/differenceInCalendarDays';
import differenceInCalendarWeeks from 'date-fns/differenceInCalendarWeeks';
import endOfWeek from 'date-fns/endOfWeek';
import format from 'date-fns/format';
import isSameYear from 'date-fns/isSameYear';
import max from 'date-fns/max';
import min from 'date-fns/min';
import startOfDay from 'date-fns/startOfDay';
import startOfToday from 'date-fns/startOfToday';
import startOfWeek from 'date-fns/startOfWeek';
import compact from 'lodash/compact';
import groupBy from 'lodash/groupBy';
import maxBy from 'lodash/maxBy';
import minBy from 'lodash/minBy';
import some from 'lodash/some';

import { DAILY_GRANULARITY_MAX_LENGTH, WEEK_STARTS_ON } from './constants';

import {
  Activity,
  ActivityExtended,
  BaseStatus,
  GetMostRelevantStatusFunction,
  IsCompletedFunction,
  ScheduleAction,
  ScheduleCheckpoint,
  Task,
  TaskExtended,
  TimelineGranularity,
  TimelineSettings,
} from './types';

function isScheduleEmpty<TStatus extends BaseStatus>(
  activities: ActivityExtended<TStatus>[]
): boolean {
  return !some(activities, ({ tasks }) => tasks.length > 0);
}

function getLatestCompletionDate<TStatus extends BaseStatus>(tasks: Task<TStatus>[]): Date | null {
  let result = null;
  if (tasks.length > 0) {
    result = max(tasks.map((task) => task.endDate));
  }
  return result;
}

function formatTaskDuration(start: Date, end: Date, taskNumber: number | null): string {
  const shortFormat = 'MMM do';
  const longFormat = 'MMM do, y';
  const formattedEnd = format(end, longFormat, { weekStartsOn: WEEK_STARTS_ON });
  let formattedRange = formattedEnd;

  if (compareAsc(start, end) !== 0) {
    const formattedStart = format(start, isSameYear(start, end) ? shortFormat : longFormat, {
      weekStartsOn: WEEK_STARTS_ON,
    });
    formattedRange = `${formattedStart} - ${formattedEnd}`;
  }

  return (taskNumber !== null ? `Task ${taskNumber}: ` : '').concat(formattedRange);
}

function removeMalformedActivities<TStatus extends BaseStatus>(
  activities: Activity<TStatus>[]
): Activity<TStatus>[] {
  const filteredActivities = activities
    .map(
      (activity): Activity<TStatus> => ({
        ...activity,
        tasks: activity.tasks.map(
          (task): Task<TStatus> => ({
            ...task,
            startDate: startOfDay(task.startDate),
            endDate: startOfDay(task.endDate),
          })
        ),
      })
    )
    .map(
      (activity): Activity<TStatus> => ({
        ...activity,
        tasks: activity.tasks.filter((task) => compareAsc(task.startDate, task.endDate) <= 0),
      })
    )
    .map((activity) => (activity.tasks.length > 0 ? activity : undefined));

  return compact(filteredActivities);
}

function calculateTimelineSettings<TStatus extends BaseStatus>(
  activities: ActivityExtended<TStatus>[]
): TimelineSettings {
  const filteredActivities = activities.filter(({ tasks }) => tasks.length > 0);
  let start = min(
    filteredActivities.map(({ tasks }) => min(tasks.map(({ startDate }) => startDate)))
  );
  let end = max(filteredActivities.map(({ tasks }) => max(tasks.map(({ endDate }) => endDate))));

  let granularity = TimelineGranularity.Daily;
  let durationInDays = differenceInCalendarDays(end, start) + 1;
  let durationInWeeks = 1;
  const isWeeklyTimeline = durationInDays > DAILY_GRANULARITY_MAX_LENGTH;

  if (isWeeklyTimeline) {
    granularity = TimelineGranularity.Weekly;
    start = startOfWeek(start, { weekStartsOn: WEEK_STARTS_ON });
    end = startOfDay(endOfWeek(end, { weekStartsOn: WEEK_STARTS_ON }));
    durationInDays = differenceInCalendarDays(end, start) + 1;
    durationInWeeks = differenceInCalendarWeeks(end, start, { weekStartsOn: WEEK_STARTS_ON }) + 1;
  }

  let relativeCurrentDate = null;
  let relativeCurrentWeek = null;
  const currentDate = startOfToday();
  const isCurrentDateOnTimeline =
    compareAsc(currentDate, start) >= 0 && compareAsc(currentDate, end) <= 0;

  if (isCurrentDateOnTimeline) {
    relativeCurrentWeek = 1;
    relativeCurrentDate = differenceInCalendarDays(currentDate, start) + 1;

    if (isWeeklyTimeline) {
      relativeCurrentWeek =
        differenceInCalendarWeeks(currentDate, start, { weekStartsOn: WEEK_STARTS_ON }) + 1;
    }
  }

  return {
    granularity,
    startDate: start,
    endDate: end,
    durationInDays,
    durationInWeeks,
    relativeCurrentDate,
    relativeCurrentWeek,
  };
}

function calculateSchedule<TStatus extends BaseStatus>(
  tasks: Task<TStatus>[],
  start: Date,
  isCompleted: IsCompletedFunction,
  getMostRelevantStatus: GetMostRelevantStatusFunction<TStatus>
): ScheduleAction<TStatus>[] {
  const extendedTasks = tasks
    .map(
      (task): TaskExtended<TStatus> => ({
        index: 0,
        relativeStartDate: differenceInCalendarDays(task.startDate, start) + 1,
        relativeEndDate: differenceInCalendarDays(task.endDate, start) + 1,
        ...task,
      })
    )
    .sort((taskA, taskB) => {
      let compareResult = taskA.relativeStartDate - taskB.relativeStartDate;
      if (compareResult === 0) {
        compareResult = taskA.relativeEndDate - taskB.relativeEndDate;
      }
      return compareResult;
    });

  const taskSpans: TaskExtended<TStatus>[][] = [];
  let currentTaskIndex = 0;
  let currentTaskSpanRelativeEndDate = 0;
  let currentTaskSpan: TaskExtended<TStatus>[] = [];

  for (let i = 0; i < extendedTasks.length; i += 1) {
    if (i > 0 && extendedTasks[i].relativeStartDate > currentTaskSpanRelativeEndDate) {
      currentTaskIndex = 0;
      currentTaskSpanRelativeEndDate = 0;

      taskSpans.push(currentTaskSpan);
      currentTaskSpan = [];
    }

    currentTaskIndex += 1;
    extendedTasks[i].index = currentTaskIndex;

    currentTaskSpan.push(extendedTasks[i]);
    currentTaskSpanRelativeEndDate =
      extendedTasks[i].relativeEndDate > currentTaskSpanRelativeEndDate
        ? extendedTasks[i].relativeEndDate
        : currentTaskSpanRelativeEndDate;
  }

  if (currentTaskSpan.length > 0) {
    taskSpans.push(currentTaskSpan);
  }

  const timeline = taskSpans.map((taskSpan): ScheduleAction<TStatus> => {
    const tasksGroupedByDate = groupBy(taskSpan, (task) =>
      isCompleted(task.status) ? task.relativeEndDate : task.relativeStartDate
    );

    const checkpoints = Object.entries(tasksGroupedByDate).map(
      ([relativeDateString, tasksList]): ScheduleCheckpoint<TStatus> => {
        const activeTasks: TaskExtended<TStatus>[] = [];
        const completedTasks: TaskExtended<TStatus>[] = [];

        tasksList.forEach((task) =>
          isCompleted(task.status) ? completedTasks.push(task) : activeTasks.push(task)
        );

        return {
          activeTasks,
          completedTasks,
          relativeDate: parseInt(relativeDateString, 10),
        };
      }
    );

    return {
      checkpoints,
      status: getMostRelevantStatus(taskSpan.map(({ status }) => status)),
      relativeStartDate: minBy(taskSpan, ({ relativeStartDate }) => relativeStartDate)!
        .relativeStartDate,
      relativeEndDate: maxBy(taskSpan, ({ relativeEndDate }) => relativeEndDate)!.relativeEndDate,
    };
  });

  return timeline;
}

export {
  isScheduleEmpty,
  getLatestCompletionDate,
  formatTaskDuration,
  removeMalformedActivities,
  calculateSchedule,
  calculateTimelineSettings,
};
