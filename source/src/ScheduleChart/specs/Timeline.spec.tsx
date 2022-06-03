import 'jest-styled-components';

import { fireEvent, render, waitFor } from '@testing-library/react';

import { Timeline } from '../Timeline';
import { Task, TimelineGranularity, TimelineSettings } from '../types';
import * as utils from '../utils';
import { CONFIGURATION, TaskStatus } from './config';

const DEFAULT_SETTINGS: TimelineSettings = {
  granularity: TimelineGranularity.Weekly,
  durationInDays: 14,
  durationInWeeks: 2,
  startDate: new Date(2021, 5, 1),
  endDate: new Date(2021, 5, 14),
  relativeCurrentDate: null,
  relativeCurrentWeek: 2,
};

const renderTimeline = (tasks: Task<TaskStatus>[], settings: TimelineSettings = DEFAULT_SETTINGS) =>
  render(<Timeline tasks={tasks} timelineSettings={settings} configuration={CONFIGURATION} />);

describe('Timeline Component Snapshot', () => {
  it('should render current day marker if current day within timeline', () => {
    const settings: TimelineSettings = {
      ...DEFAULT_SETTINGS,
      relativeCurrentDate: 9,
    };

    const { container } = renderTimeline([], settings);

    expect(container).toMatchSnapshot();
  });

  it('should not render current day marker if current day not within timeline', () => {
    const settings: TimelineSettings = {
      ...DEFAULT_SETTINGS,
      relativeCurrentDate: null,
    };

    const { container } = renderTimeline([], settings);

    expect(container).toMatchSnapshot();
  });

  it('should render single active multiday task', () => {
    const tasks: Task<TaskStatus>[] = [
      {
        status: TaskStatus.Open,
        startDate: new Date(2021, 5, 3),
        endDate: new Date(2021, 5, 10),
      },
    ];

    const { container } = renderTimeline(tasks);

    expect(container).toMatchSnapshot();
  });

  it('should render single active one day task', () => {
    const tasks: Task<TaskStatus>[] = [
      {
        status: TaskStatus.InProgress,
        startDate: new Date(2021, 5, 7),
        endDate: new Date(2021, 5, 7),
      },
    ];

    const { container } = renderTimeline(tasks);

    expect(container).toMatchSnapshot();
  });

  it('should render single completed multiday task', () => {
    const tasks: Task<TaskStatus>[] = [
      {
        status: TaskStatus.Closed,
        startDate: new Date(2021, 5, 10),
        endDate: new Date(2021, 5, 14),
      },
    ];

    const { container } = renderTimeline(tasks);

    expect(container).toMatchSnapshot();
  });

  it('should render single completed one day task', () => {
    const tasks: Task<TaskStatus>[] = [
      {
        status: TaskStatus.Closed,
        startDate: new Date(2021, 5, 1),
        endDate: new Date(2021, 5, 1),
      },
    ];

    const { container } = renderTimeline(tasks);

    expect(container).toMatchSnapshot();
  });

  it('should render several not intersecting tasks', () => {
    const tasks: Task<TaskStatus>[] = [
      {
        status: TaskStatus.Closed,
        startDate: new Date(2021, 5, 1),
        endDate: new Date(2021, 5, 3),
      },
      {
        status: TaskStatus.InProgress,
        startDate: new Date(2021, 5, 4),
        endDate: new Date(2021, 5, 7),
      },
      {
        status: TaskStatus.Open,
        startDate: new Date(2021, 5, 10),
        endDate: new Date(2021, 5, 12),
      },
    ];

    const { container } = renderTimeline(tasks);

    expect(container).toMatchSnapshot();
  });

  it('should render single group of several intersecting tasks', () => {
    const tasks: Task<TaskStatus>[] = [
      {
        status: TaskStatus.InProgress,
        startDate: new Date(2021, 5, 1),
        endDate: new Date(2021, 5, 14),
      },
      {
        status: TaskStatus.Closed,
        startDate: new Date(2021, 5, 1),
        endDate: new Date(2021, 5, 3),
      },
      {
        status: TaskStatus.InProgress,
        startDate: new Date(2021, 5, 4),
        endDate: new Date(2021, 5, 7),
      },
      {
        status: TaskStatus.Open,
        startDate: new Date(2021, 5, 10),
        endDate: new Date(2021, 5, 12),
      },
    ];

    const { container } = renderTimeline(tasks);

    expect(container).toMatchSnapshot();
  });

  it('should render several groups of several intersecting tasks', () => {
    const tasks: Task<TaskStatus>[] = [
      {
        status: TaskStatus.Closed,
        startDate: new Date(2021, 5, 1),
        endDate: new Date(2021, 5, 3),
      },
      {
        status: TaskStatus.InProgress,
        startDate: new Date(2021, 5, 2),
        endDate: new Date(2021, 5, 5),
      },
      {
        status: TaskStatus.Closed,
        startDate: new Date(2021, 5, 7),
        endDate: new Date(2021, 5, 11),
      },
      {
        status: TaskStatus.Open,
        startDate: new Date(2021, 5, 9),
        endDate: new Date(2021, 5, 12),
      },
    ];

    const { container } = renderTimeline(tasks);

    expect(container).toMatchSnapshot();
  });

  it('should render several tasks which start on single day', () => {
    const tasks: Task<TaskStatus>[] = [
      {
        status: TaskStatus.InProgress,
        startDate: new Date(2021, 5, 5),
        endDate: new Date(2021, 5, 10),
      },
      {
        status: TaskStatus.InProgress,
        startDate: new Date(2021, 5, 5),
        endDate: new Date(2021, 5, 7),
      },
      {
        status: TaskStatus.InProgress,
        startDate: new Date(2021, 5, 5),
        endDate: new Date(2021, 5, 12),
      },
    ];

    const { container } = renderTimeline(tasks);

    expect(container).toMatchSnapshot();
  });

  it('should render several tasks which complete on single day', () => {
    const tasks: Task<TaskStatus>[] = [
      {
        status: TaskStatus.Closed,
        startDate: new Date(2021, 5, 5),
        endDate: new Date(2021, 5, 12),
      },
      {
        status: TaskStatus.Closed,
        startDate: new Date(2021, 5, 7),
        endDate: new Date(2021, 5, 12),
      },
      {
        status: TaskStatus.Closed,
        startDate: new Date(2021, 5, 10),
        endDate: new Date(2021, 5, 12),
      },
    ];

    const { container } = renderTimeline(tasks);

    expect(container).toMatchSnapshot();
  });

  it('should render several tasks which start and complete on single day', () => {
    const tasks: Task<TaskStatus>[] = [
      {
        status: TaskStatus.Closed,
        startDate: new Date(2021, 5, 3),
        endDate: new Date(2021, 5, 8),
      },
      {
        status: TaskStatus.Closed,
        startDate: new Date(2021, 5, 5),
        endDate: new Date(2021, 5, 8),
      },
      {
        status: TaskStatus.InProgress,
        startDate: new Date(2021, 5, 8),
        endDate: new Date(2021, 5, 8),
      },
      {
        status: TaskStatus.InProgress,
        startDate: new Date(2021, 5, 8),
        endDate: new Date(2021, 5, 11),
      },
    ];

    const { container } = renderTimeline(tasks);

    expect(container).toMatchSnapshot();
  });
});

describe('Timeline Component', () => {
  beforeEach(() => jest.restoreAllMocks());

  it('should render tooltip with numbered dates on hover of task end marker if it is not single marker on timeline bar', async () => {
    const tasks: Task<TaskStatus>[] = [
      {
        status: TaskStatus.Closed,
        startDate: new Date(2021, 3, 2),
        endDate: new Date(2021, 3, 11),
      },
      {
        status: TaskStatus.InProgress,
        startDate: new Date(2021, 3, 4),
        endDate: new Date(2021, 3, 8),
      },
    ];
    const formatTaskDuration = jest
      .spyOn(utils, 'formatTaskDuration')
      .mockImplementation(() => 'date');

    const { getByTestId, getByText, queryByText } = renderTimeline(tasks);

    expect(queryByText('date')).not.toBeInTheDocument();

    fireEvent.mouseEnter(getByTestId('timeline-end-marker'));
    await waitFor(() => expect(getByText('date')).toBeInTheDocument());
    expect(formatTaskDuration).toHaveBeenCalledWith(tasks[0].startDate, tasks[0].endDate, 1);
  });

  it('should render tooltip with not numbered dates on hover of task end marker if it is single marker on timeline bar', async () => {
    const tasks: Task<TaskStatus>[] = [
      {
        status: TaskStatus.Closed,
        startDate: new Date(2021, 3, 2),
        endDate: new Date(2021, 3, 11),
      },
    ];
    const formatTaskDuration = jest
      .spyOn(utils, 'formatTaskDuration')
      .mockImplementation(() => 'date');

    const { getByTestId, getByText, queryByText } = renderTimeline(tasks);

    expect(queryByText('date')).not.toBeInTheDocument();

    fireEvent.mouseEnter(getByTestId('timeline-end-marker'));
    await waitFor(() => expect(getByText('date')).toBeInTheDocument());
    expect(formatTaskDuration).toHaveBeenCalledWith(tasks[0].startDate, tasks[0].endDate, null);
  });

  it('should render tooltip on timeline bar hover if it contains single active task', async () => {
    const tasks: Task<TaskStatus>[] = [
      {
        status: TaskStatus.Open,
        startDate: new Date(2021, 3, 2),
        endDate: new Date(2021, 3, 11),
      },
    ];
    jest.spyOn(utils, 'formatTaskDuration').mockImplementation(() => 'date');

    const { getByTestId, getByText, queryByText } = renderTimeline(tasks);

    expect(queryByText('date')).not.toBeInTheDocument();

    fireEvent.mouseEnter(getByTestId('timeline-bar'));
    await waitFor(() => expect(getByText('date')).toBeInTheDocument());
  });

  test.each([
    {
      tasks: [
        {
          status: TaskStatus.InProgress,
          startDate: new Date(2021, 5, 3),
          endDate: new Date(2021, 5, 10),
        },
        {
          status: TaskStatus.InProgress,
          startDate: new Date(2021, 5, 5),
          endDate: new Date(2021, 5, 7),
        },
      ],
    },
    {
      tasks: [
        {
          status: TaskStatus.InProgress,
          startDate: new Date(2021, 5, 3),
          endDate: new Date(2021, 5, 10),
        },
        {
          status: TaskStatus.InProgress,
          startDate: new Date(2021, 5, 3),
          endDate: new Date(2021, 5, 7),
        },
      ],
    },
    {
      tasks: [
        {
          status: TaskStatus.Closed,
          startDate: new Date(2021, 5, 3),
          endDate: new Date(2021, 5, 7),
        },
        {
          status: TaskStatus.InProgress,
          startDate: new Date(2021, 5, 7),
          endDate: new Date(2021, 5, 10),
        },
      ],
    },
  ])(
    "should not render tooltip on timeline bar hover if it doesn't contain single active task: %o",
    async ({ tasks }) => {
      const formatTaskDuration = jest
        .spyOn(utils, 'formatTaskDuration')
        .mockImplementation(() => 'date');

      const { getByTestId, getByText, queryByText } = renderTimeline(tasks);

      expect(queryByText('date')).not.toBeInTheDocument();

      fireEvent.mouseEnter(getByTestId('timeline-bar'));
      let tooltipExists = true;
      try {
        await waitFor(() => expect(getByText('date')).toBeInTheDocument());
      } catch {
        tooltipExists = false;
      }

      expect(tooltipExists).toBeFalsy();
      expect(formatTaskDuration).not.toBeCalled();
    }
  );
});
