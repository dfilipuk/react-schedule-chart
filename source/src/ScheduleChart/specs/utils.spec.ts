import startOfToday from 'date-fns/startOfToday';

import { Activity, ActivityExtended, Task, TimelineGranularity } from '../types';

import {
  calculateSchedule,
  calculateTimelineSettings,
  formatTaskDuration,
  getLatestCompletionDate,
  isScheduleEmpty,
  removeMalformedActivities,
} from '../utils';

import { CONFIGURATION, TaskStatus } from './config';

jest.mock('date-fns/startOfToday', () => ({
  __esModule: true,
  default: jest.fn(),
}));

describe('isScheduleEmpty', () => {
  it('should be empty if there is no activities', () => {
    const result = isScheduleEmpty([]);
    expect(result).toBeTruthy();
  });

  it('should be empty if there are no tasks in activities', () => {
    const data: ActivityExtended<TaskStatus>[] = [
      { id: 1, title: '', latestCompletionDate: null, tasks: [] },
      { id: 2, title: '', latestCompletionDate: null, tasks: [] },
    ];
    const result = isScheduleEmpty(data);
    expect(result).toBeTruthy();
  });

  it('should not be empty if there are tasks in activities', () => {
    const data: ActivityExtended<TaskStatus>[] = [
      { id: 1, title: '', latestCompletionDate: null, tasks: [] },
      {
        id: 2,
        title: '',
        latestCompletionDate: null,
        tasks: [{ status: TaskStatus.Closed, endDate: new Date(), startDate: new Date() }],
      },
    ];
    const result = isScheduleEmpty(data);
    expect(result).toBeFalsy();
  });
});

describe('getLatestCompletionDate', () => {
  it('should be null if there are no tasks', () => {
    const result = getLatestCompletionDate([]);
    expect(result).toBeNull();
  });

  it('should not be null if there are any tasks', () => {
    const data: Task<TaskStatus>[] = [
      { status: TaskStatus.Closed, startDate: new Date(), endDate: new Date(2021, 8, 15) },
      { status: TaskStatus.Closed, startDate: new Date(), endDate: new Date(2021, 11, 27) },
      { status: TaskStatus.Closed, startDate: new Date(), endDate: new Date(2021, 9, 14) },
    ];
    const result = getLatestCompletionDate(data);
    expect(result).toEqual(new Date(2021, 11, 27));
  });
});

describe('formatTaskDuration', () => {
  it('should display single date with year if start date equals end date', () => {
    const result = formatTaskDuration(new Date(2021, 9, 18), new Date(2021, 9, 18), null);
    expect(result).toEqual('Oct 18th, 2021');
  });

  it('should display only end date with year if both dates in the same year', () => {
    const result = formatTaskDuration(new Date(2021, 9, 18), new Date(2021, 10, 25), null);
    expect(result).toEqual('Oct 18th - Nov 25th, 2021');
  });

  it('should display both dates with year if both dates in different years', () => {
    const result = formatTaskDuration(new Date(2019, 3, 9), new Date(2021, 10, 25), null);
    expect(result).toEqual('Apr 9th, 2019 - Nov 25th, 2021');
  });

  it('should display prefix if task number specified', () => {
    const result = formatTaskDuration(new Date(2021, 5, 27), new Date(2021, 8, 13), 5);
    expect(result).toEqual('Task 5: Jun 27th - Sep 13th, 2021');
  });
});

describe('removeMalformedActivities', () => {
  it('should remove task if end date less than start date', () => {
    const data: Activity<TaskStatus>[] = [
      {
        id: 1,
        title: '1',
        tasks: [
          {
            status: TaskStatus.Closed,
            startDate: new Date(2021, 8, 15),
            endDate: new Date(2021, 8, 14),
          },
          {
            status: TaskStatus.InProgress,
            startDate: new Date(2021, 8, 15),
            endDate: new Date(2021, 8, 16),
          },
        ],
      },
    ];
    const result = removeMalformedActivities(data);
    expect(result[0].tasks.length).toEqual(1);
  });

  it("should remove activity if it doesn't have valid tasks", () => {
    const data: Activity<TaskStatus>[] = [
      {
        id: 1,
        title: '1',
        tasks: [
          {
            status: TaskStatus.Closed,
            startDate: new Date(2021, 8, 15),
            endDate: new Date(2021, 8, 14),
          },
        ],
      },
    ];
    const result = removeMalformedActivities(data);
    expect(result.length).toEqual(0);
  });

  it('should consider only date', () => {
    const data: Activity<TaskStatus>[] = [
      {
        id: 1,
        title: '1',
        tasks: [
          {
            status: TaskStatus.Closed,
            startDate: new Date(2021, 8, 15, 10, 25, 10),
            endDate: new Date(2021, 8, 15, 5, 15, 27),
          },
          {
            status: TaskStatus.InProgress,
            startDate: new Date(2021, 8, 15),
            endDate: new Date(2021, 8, 16),
          },
        ],
      },
    ];
    const result = removeMalformedActivities(data);
    expect(result[0].tasks.length).toEqual(2);
  });

  it('should truncate time component of date', () => {
    const data: Activity<TaskStatus>[] = [
      {
        id: 1,
        title: '1',
        tasks: [
          {
            status: TaskStatus.Closed,
            startDate: new Date(2021, 8, 15, 10, 25, 10),
            endDate: new Date(2021, 8, 15, 5, 15, 27),
          },
          {
            status: TaskStatus.InProgress,
            startDate: new Date(2021, 8, 15, 7, 53, 28),
            endDate: new Date(2021, 8, 16, 3, 8, 9),
          },
        ],
      },
    ];
    const result = removeMalformedActivities(data);

    expect(result[0].tasks[0].startDate).toEqual(new Date(2021, 8, 15));
    expect(result[0].tasks[0].endDate).toEqual(new Date(2021, 8, 15));
    expect(result[0].tasks[1].startDate).toEqual(new Date(2021, 8, 15));
    expect(result[0].tasks[1].endDate).toEqual(new Date(2021, 8, 16));
  });
});

describe('calculateTimelineSettings', () => {
  it('should consider timeline as daily if its duration 7 days or less', () => {
    const data: ActivityExtended<TaskStatus>[] = [
      {
        id: 1,
        title: '1',
        latestCompletionDate: null,
        tasks: [
          {
            status: TaskStatus.InProgress,
            startDate: new Date(2020, 8, 7),
            endDate: new Date(2020, 8, 10),
          },
          {
            status: TaskStatus.InProgress,
            startDate: new Date(2020, 8, 6),
            endDate: new Date(2020, 8, 8),
          },
        ],
      },
      {
        id: 2,
        title: '2',
        latestCompletionDate: null,
        tasks: [
          {
            status: TaskStatus.InProgress,
            startDate: new Date(2020, 8, 4),
            endDate: new Date(2020, 8, 5),
          },
        ],
      },
    ];
    const result = calculateTimelineSettings(data);

    expect(result.granularity).toEqual(TimelineGranularity.Daily);
    expect(result.startDate).toEqual(new Date(2020, 8, 4));
    expect(result.endDate).toEqual(new Date(2020, 8, 10));
    expect(result.durationInDays).toEqual(7);
    expect(result.durationInWeeks).toEqual(1);
    expect(result.relativeCurrentDate).toBeNull();
    expect(result.relativeCurrentWeek).toBeNull();
  });

  it('should consider timeline as weekly if its duration 8 days or more', () => {
    const data: ActivityExtended<TaskStatus>[] = [
      {
        id: 1,
        title: '1',
        latestCompletionDate: null,
        tasks: [
          {
            status: TaskStatus.InProgress,
            startDate: new Date(2020, 8, 7),
            endDate: new Date(2020, 8, 10),
          },
          {
            status: TaskStatus.InProgress,
            startDate: new Date(2020, 8, 6),
            endDate: new Date(2020, 8, 8),
          },
        ],
      },
      {
        id: 2,
        title: '2',
        latestCompletionDate: null,
        tasks: [
          {
            status: TaskStatus.InProgress,
            startDate: new Date(2020, 8, 4),
            endDate: new Date(2020, 8, 5),
          },
          {
            status: TaskStatus.InProgress,
            startDate: new Date(2020, 8, 10),
            endDate: new Date(2020, 8, 11),
          },
        ],
      },
    ];
    const result = calculateTimelineSettings(data);

    expect(result.granularity).toEqual(TimelineGranularity.Weekly);
    expect(result.startDate).toEqual(new Date(2020, 7, 31));
    expect(result.endDate).toEqual(new Date(2020, 8, 13));
    expect(result.durationInDays).toEqual(14);
    expect(result.durationInWeeks).toEqual(2);
    expect(result.relativeCurrentDate).toBeNull();
    expect(result.relativeCurrentWeek).toBeNull();
  });

  test.each([
    [new Date(2021, 9, 1), new Date(2021, 9, 1), new Date(2021, 9, 5), 1, 1],
    [new Date(2021, 9, 3), new Date(2021, 9, 1), new Date(2021, 9, 5), 3, 1],
    [new Date(2021, 9, 5), new Date(2021, 9, 1), new Date(2021, 9, 5), 5, 1],
    [new Date(2021, 9, 6), new Date(2021, 9, 1), new Date(2021, 9, 8), 10, 2],
  ])(
    'should consider current date if it is within timeline: %p',
    (
      currentDate: Date,
      taskStart: Date,
      taskEnd: Date,
      expectedRelativeCurrentDate: number,
      expectedRelativeCurrentWeek: number
    ) => {
      (startOfToday as jest.Mock).mockReturnValue(currentDate);

      const data: ActivityExtended<TaskStatus>[] = [
        {
          id: 1,
          title: '1',
          latestCompletionDate: null,
          tasks: [
            {
              status: TaskStatus.InProgress,
              startDate: taskStart,
              endDate: taskEnd,
            },
          ],
        },
      ];
      const result = calculateTimelineSettings(data);

      expect(result.relativeCurrentDate).toEqual(expectedRelativeCurrentDate);
      expect(result.relativeCurrentWeek).toEqual(expectedRelativeCurrentWeek);
    }
  );

  test.each([
    [new Date(2021, 8, 30)],
    [new Date(2021, 9, 6)],
    [new Date(2022, 5, 28)],
    [new Date(2019, 7, 15)],
  ])('should not consider current date if it is not within timeline: %p', (currentDate: Date) => {
    (startOfToday as jest.Mock).mockReturnValue(currentDate);

    const data: ActivityExtended<TaskStatus>[] = [
      {
        id: 1,
        title: '1',
        latestCompletionDate: null,
        tasks: [
          {
            status: TaskStatus.InProgress,
            startDate: new Date(2021, 9, 1),
            endDate: new Date(2021, 9, 5),
          },
        ],
      },
    ];
    const result = calculateTimelineSettings(data);

    expect(result.relativeCurrentDate).toEqual(null);
    expect(result.relativeCurrentWeek).toEqual(null);
  });
});

describe('calculateSchedule', () => {
  it('should not create any elements if no tasks exist', () => {
    const timeline = calculateSchedule(
      [],
      new Date(2021, 9, 1),
      CONFIGURATION.isCompleted,
      CONFIGURATION.getMostRelevantStatus
    );
    expect(timeline.length).toEqual(0);
  });

  it('should split non intersecting tasks', () => {
    const data: Task<TaskStatus>[] = [
      {
        status: TaskStatus.Closed,
        startDate: new Date(2021, 9, 1),
        endDate: new Date(2021, 9, 5),
      },
      {
        status: TaskStatus.InProgress,
        startDate: new Date(2021, 9, 7),
        endDate: new Date(2021, 9, 10),
      },
    ];
    const timeline = calculateSchedule(
      data,
      new Date(2021, 9, 1),
      CONFIGURATION.isCompleted,
      CONFIGURATION.getMostRelevantStatus
    );

    expect(timeline.length).toEqual(2);

    expect(timeline[0].relativeStartDate).toEqual(1);
    expect(timeline[0].relativeEndDate).toEqual(5);
    expect(timeline[1].relativeStartDate).toEqual(7);
    expect(timeline[1].relativeEndDate).toEqual(10);

    expect(timeline[0].checkpoints.length).toEqual(1);
    expect(timeline[1].checkpoints.length).toEqual(1);

    expect(timeline[0].checkpoints[0].relativeDate).toEqual(5);
    expect(timeline[1].checkpoints[0].relativeDate).toEqual(7);

    expect(timeline[0].checkpoints[0].activeTasks.length).toEqual(0);
    expect(timeline[0].checkpoints[0].completedTasks.length).toEqual(1);
    expect(timeline[1].checkpoints[0].activeTasks.length).toEqual(1);
    expect(timeline[1].checkpoints[0].completedTasks.length).toEqual(0);

    expect(timeline[0].checkpoints[0].completedTasks[0].index).toEqual(1);
    expect(timeline[0].checkpoints[0].completedTasks[0].relativeStartDate).toEqual(1);
    expect(timeline[0].checkpoints[0].completedTasks[0].relativeEndDate).toEqual(5);
    expect(timeline[1].checkpoints[0].activeTasks[0].index).toEqual(1);
    expect(timeline[1].checkpoints[0].activeTasks[0].relativeStartDate).toEqual(7);
    expect(timeline[1].checkpoints[0].activeTasks[0].relativeEndDate).toEqual(10);
  });

  it('should join intersecting tasks', () => {
    const data: Task<TaskStatus>[] = [
      {
        status: TaskStatus.InProgress,
        startDate: new Date(2021, 9, 1),
        endDate: new Date(2021, 9, 10),
      },
      {
        status: TaskStatus.Closed,
        startDate: new Date(2021, 9, 2),
        endDate: new Date(2021, 9, 5),
      },
      {
        status: TaskStatus.InProgress,
        startDate: new Date(2021, 9, 7),
        endDate: new Date(2021, 9, 9),
      },
      {
        status: TaskStatus.InProgress,
        startDate: new Date(2021, 9, 8),
        endDate: new Date(2021, 9, 12),
      },
    ];
    const timeline = calculateSchedule(
      data,
      new Date(2021, 9, 1),
      CONFIGURATION.isCompleted,
      CONFIGURATION.getMostRelevantStatus
    );

    expect(timeline.length).toEqual(1);

    expect(timeline[0].relativeStartDate).toEqual(1);
    expect(timeline[0].relativeEndDate).toEqual(12);

    expect(timeline[0].checkpoints.length).toEqual(4);

    expect(timeline[0].checkpoints[0].relativeDate).toEqual(1);
    expect(timeline[0].checkpoints[1].relativeDate).toEqual(5);
    expect(timeline[0].checkpoints[2].relativeDate).toEqual(7);
    expect(timeline[0].checkpoints[3].relativeDate).toEqual(8);

    expect(timeline[0].checkpoints[0].activeTasks.length).toEqual(1);
    expect(timeline[0].checkpoints[0].completedTasks.length).toEqual(0);
    expect(timeline[0].checkpoints[1].activeTasks.length).toEqual(0);
    expect(timeline[0].checkpoints[1].completedTasks.length).toEqual(1);
    expect(timeline[0].checkpoints[2].activeTasks.length).toEqual(1);
    expect(timeline[0].checkpoints[2].completedTasks.length).toEqual(0);
    expect(timeline[0].checkpoints[3].activeTasks.length).toEqual(1);
    expect(timeline[0].checkpoints[3].completedTasks.length).toEqual(0);

    expect(timeline[0].checkpoints[0].activeTasks[0].index).toEqual(1);
    expect(timeline[0].checkpoints[0].activeTasks[0].relativeStartDate).toEqual(1);
    expect(timeline[0].checkpoints[0].activeTasks[0].relativeEndDate).toEqual(10);
    expect(timeline[0].checkpoints[1].completedTasks[0].index).toEqual(2);
    expect(timeline[0].checkpoints[1].completedTasks[0].relativeStartDate).toEqual(2);
    expect(timeline[0].checkpoints[1].completedTasks[0].relativeEndDate).toEqual(5);
    expect(timeline[0].checkpoints[2].activeTasks[0].index).toEqual(3);
    expect(timeline[0].checkpoints[2].activeTasks[0].relativeStartDate).toEqual(7);
    expect(timeline[0].checkpoints[2].activeTasks[0].relativeEndDate).toEqual(9);
    expect(timeline[0].checkpoints[3].activeTasks[0].index).toEqual(4);
    expect(timeline[0].checkpoints[3].activeTasks[0].relativeStartDate).toEqual(8);
    expect(timeline[0].checkpoints[3].activeTasks[0].relativeEndDate).toEqual(12);
  });

  it('should join tasks which start on same day', () => {
    const data: Task<TaskStatus>[] = [
      {
        status: TaskStatus.InProgress,
        startDate: new Date(2021, 9, 1),
        endDate: new Date(2021, 9, 10),
      },
      {
        status: TaskStatus.InProgress,
        startDate: new Date(2021, 9, 1),
        endDate: new Date(2021, 9, 5),
      },
    ];
    const timeline = calculateSchedule(
      data,
      new Date(2021, 9, 1),
      CONFIGURATION.isCompleted,
      CONFIGURATION.getMostRelevantStatus
    );

    expect(timeline.length).toEqual(1);

    expect(timeline[0].relativeStartDate).toEqual(1);
    expect(timeline[0].relativeEndDate).toEqual(10);

    expect(timeline[0].checkpoints.length).toEqual(1);

    expect(timeline[0].checkpoints[0].relativeDate).toEqual(1);

    expect(timeline[0].checkpoints[0].activeTasks.length).toEqual(2);
    expect(timeline[0].checkpoints[0].completedTasks.length).toEqual(0);

    expect(timeline[0].checkpoints[0].activeTasks[0].index).toEqual(1);
    expect(timeline[0].checkpoints[0].activeTasks[0].relativeStartDate).toEqual(1);
    expect(timeline[0].checkpoints[0].activeTasks[0].relativeEndDate).toEqual(5);
    expect(timeline[0].checkpoints[0].activeTasks[1].index).toEqual(2);
    expect(timeline[0].checkpoints[0].activeTasks[1].relativeStartDate).toEqual(1);
    expect(timeline[0].checkpoints[0].activeTasks[1].relativeEndDate).toEqual(10);
  });

  it('should join tasks which complete on same day', () => {
    const data: Task<TaskStatus>[] = [
      {
        status: TaskStatus.Closed,
        startDate: new Date(2021, 9, 1),
        endDate: new Date(2021, 9, 10),
      },
      {
        status: TaskStatus.Closed,
        startDate: new Date(2021, 9, 7),
        endDate: new Date(2021, 9, 10),
      },
    ];
    const timeline = calculateSchedule(
      data,
      new Date(2021, 9, 1),
      CONFIGURATION.isCompleted,
      CONFIGURATION.getMostRelevantStatus
    );

    expect(timeline.length).toEqual(1);

    expect(timeline[0].relativeStartDate).toEqual(1);
    expect(timeline[0].relativeEndDate).toEqual(10);

    expect(timeline[0].checkpoints.length).toEqual(1);

    expect(timeline[0].checkpoints[0].relativeDate).toEqual(10);

    expect(timeline[0].checkpoints[0].activeTasks.length).toEqual(0);
    expect(timeline[0].checkpoints[0].completedTasks.length).toEqual(2);

    expect(timeline[0].checkpoints[0].completedTasks[0].index).toEqual(1);
    expect(timeline[0].checkpoints[0].completedTasks[0].relativeStartDate).toEqual(1);
    expect(timeline[0].checkpoints[0].completedTasks[0].relativeEndDate).toEqual(10);
    expect(timeline[0].checkpoints[0].completedTasks[1].index).toEqual(2);
    expect(timeline[0].checkpoints[0].completedTasks[1].relativeStartDate).toEqual(7);
    expect(timeline[0].checkpoints[0].completedTasks[1].relativeEndDate).toEqual(10);
  });

  it('should join tasks which start and complete on same day', () => {
    const data: Task<TaskStatus>[] = [
      {
        status: TaskStatus.Closed,
        startDate: new Date(2021, 9, 1),
        endDate: new Date(2021, 9, 5),
      },
      {
        status: TaskStatus.InProgress,
        startDate: new Date(2021, 9, 5),
        endDate: new Date(2021, 9, 10),
      },
    ];
    const timeline = calculateSchedule(
      data,
      new Date(2021, 9, 1),
      CONFIGURATION.isCompleted,
      CONFIGURATION.getMostRelevantStatus
    );

    expect(timeline.length).toEqual(1);

    expect(timeline[0].relativeStartDate).toEqual(1);
    expect(timeline[0].relativeEndDate).toEqual(10);

    expect(timeline[0].checkpoints.length).toEqual(1);

    expect(timeline[0].checkpoints[0].relativeDate).toEqual(5);

    expect(timeline[0].checkpoints[0].activeTasks.length).toEqual(1);
    expect(timeline[0].checkpoints[0].completedTasks.length).toEqual(1);

    expect(timeline[0].checkpoints[0].activeTasks[0].index).toEqual(2);
    expect(timeline[0].checkpoints[0].activeTasks[0].relativeStartDate).toEqual(5);
    expect(timeline[0].checkpoints[0].activeTasks[0].relativeEndDate).toEqual(10);
    expect(timeline[0].checkpoints[0].completedTasks[0].index).toEqual(1);
    expect(timeline[0].checkpoints[0].completedTasks[0].relativeStartDate).toEqual(1);
    expect(timeline[0].checkpoints[0].completedTasks[0].relativeEndDate).toEqual(5);
  });
});
