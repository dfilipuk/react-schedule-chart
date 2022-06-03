import { render } from '@testing-library/react';

import { ScheduleChart } from '../ScheduleChart';
import { Activity, TimelineGranularity } from '../types';
import * as utils from '../utils';
import { CONFIGURATION, TaskStatus } from './config';

describe('ScheduleChart Component', () => {
  beforeEach(() => jest.restoreAllMocks());

  it('should check for malformed input', () => {
    const data: Activity<TaskStatus>[] = [
      {
        id: 1,
        title: 'title',
        tasks: [
          {
            status: TaskStatus.InProgress,
            startDate: new Date(2021, 5, 11),
            endDate: new Date(2021, 5, 19),
          },
        ],
      },
    ];

    const removeMalformedActivities = jest
      .spyOn(utils, 'removeMalformedActivities')
      .mockImplementation(() => []);
    const isTimelineEmpty = jest.spyOn(utils, 'isScheduleEmpty');

    render(<ScheduleChart activities={data} configuration={CONFIGURATION} />);

    expect(removeMalformedActivities).toBeCalledWith(data);
    expect(isTimelineEmpty).toBeCalledWith([]);
  });

  it('should calculate timeline settings if schedule not empty', () => {
    const data: Activity<TaskStatus>[] = [
      {
        id: 1,
        title: 'title',
        tasks: [
          {
            status: TaskStatus.InProgress,
            startDate: new Date(2021, 5, 10),
            endDate: new Date(2021, 5, 17),
          },
          {
            status: TaskStatus.Closed,
            startDate: new Date(2021, 2, 24),
            endDate: new Date(2021, 2, 25),
          },
        ],
      },
    ];

    const calculateTimelineSettings = jest.spyOn(utils, 'calculateTimelineSettings');

    render(<ScheduleChart activities={data} configuration={CONFIGURATION} />);

    expect(calculateTimelineSettings).toBeCalled();
  });

  it('should not calculate timeline settings if schedule empty', () => {
    const calculateTimelineSettings = jest.spyOn(utils, 'calculateTimelineSettings');

    render(<ScheduleChart activities={[]} configuration={CONFIGURATION} />);

    expect(calculateTimelineSettings).not.toBeCalled();
  });

  it('should render placeholder column if schedule empty', () => {
    const { getByText } = render(<ScheduleChart activities={[]} configuration={CONFIGURATION} />);

    expect(getByText('Timeline')).toBeInTheDocument();
  });

  it('should render column for each day of daily timeline', () => {
    jest.spyOn(utils, 'isScheduleEmpty').mockImplementation(() => false);
    jest.spyOn(utils, 'calculateTimelineSettings').mockImplementation(() => ({
      granularity: TimelineGranularity.Daily,
      durationInDays: 5,
      durationInWeeks: 1,
      startDate: new Date(2021, 4, 1),
      endDate: new Date(2021, 4, 8),
      relativeCurrentDate: null,
      relativeCurrentWeek: null,
    }));

    const { getByText } = render(<ScheduleChart activities={[]} configuration={CONFIGURATION} />);

    expect(getByText('Day 1')).toBeInTheDocument();
    expect(getByText('Day 2')).toBeInTheDocument();
    expect(getByText('Day 3')).toBeInTheDocument();
    expect(getByText('Day 4')).toBeInTheDocument();
    expect(getByText('Day 5')).toBeInTheDocument();
  });

  it('should render column for each week of weekly timeline', () => {
    jest.spyOn(utils, 'isScheduleEmpty').mockImplementation(() => false);
    jest.spyOn(utils, 'calculateTimelineSettings').mockImplementation(() => ({
      granularity: TimelineGranularity.Weekly,
      durationInDays: 21,
      durationInWeeks: 3,
      startDate: new Date(2021, 4, 1),
      endDate: new Date(2021, 4, 8),
      relativeCurrentDate: null,
      relativeCurrentWeek: null,
    }));

    const { getByText } = render(<ScheduleChart activities={[]} configuration={CONFIGURATION} />);

    expect(getByText('Week 1')).toBeInTheDocument();
    expect(getByText('Week 2')).toBeInTheDocument();
    expect(getByText('Week 3')).toBeInTheDocument();
  });

  it('should render timeline for each activity', () => {
    const data: Activity<TaskStatus>[] = [
      {
        id: 1,
        title: 'title',
        tasks: [],
      },
      {
        id: 2,
        title: 'title',
        tasks: [],
      },
      {
        id: 3,
        title: 'title',
        tasks: [],
      },
      {
        id: 4,
        title: 'title',
        tasks: [],
      },
      {
        id: 5,
        title: 'title',
        tasks: [],
      },
    ];

    jest.spyOn(utils, 'removeMalformedActivities').mockImplementation((value) => value);
    jest.spyOn(utils, 'isScheduleEmpty').mockImplementation(() => false);
    jest.spyOn(utils, 'calculateTimelineSettings').mockImplementation(() => ({
      granularity: TimelineGranularity.Daily,
      durationInDays: 4,
      durationInWeeks: 1,
      startDate: new Date(2021, 1, 10),
      endDate: new Date(2021, 1, 12),
      relativeCurrentDate: null,
      relativeCurrentWeek: null,
    }));

    const { getByTestId } = render(
      <ScheduleChart activities={data} configuration={CONFIGURATION} />
    );

    expect(getByTestId('timeline-1')).toBeInTheDocument();
    expect(getByTestId('timeline-2')).toBeInTheDocument();
    expect(getByTestId('timeline-3')).toBeInTheDocument();
    expect(getByTestId('timeline-4')).toBeInTheDocument();
    expect(getByTestId('timeline-5')).toBeInTheDocument();
  });

  it('should render title of each activity', () => {
    const data: Activity<TaskStatus>[] = [
      {
        id: 1,
        title: 'title 1',
        tasks: [],
      },
      {
        id: 2,
        title: 'title 2',
        tasks: [],
      },
    ];

    jest.spyOn(utils, 'removeMalformedActivities').mockImplementation((value) => value);
    jest.spyOn(utils, 'isScheduleEmpty').mockImplementation(() => false);
    jest.spyOn(utils, 'calculateTimelineSettings').mockImplementation(() => ({
      granularity: TimelineGranularity.Daily,
      durationInDays: 6,
      durationInWeeks: 1,
      startDate: new Date(2021, 3, 17),
      endDate: new Date(2021, 4, 12),
      relativeCurrentDate: null,
      relativeCurrentWeek: null,
    }));

    const { getByText } = render(<ScheduleChart activities={data} configuration={CONFIGURATION} />);

    expect(getByText('Activities')).toBeInTheDocument();
    expect(getByText('title 1')).toBeInTheDocument();
    expect(getByText('title 2')).toBeInTheDocument();
  });

  it('should render latest completion date of each activity', () => {
    const data: Activity<TaskStatus>[] = [
      {
        id: 1,
        title: 'title 1',
        tasks: [
          {
            status: TaskStatus.Closed,
            startDate: new Date(2021, 7, 4),
            endDate: new Date(2021, 7, 4),
          },
        ],
      },
      {
        id: 2,
        title: 'title 2',
        tasks: [],
      },
    ];

    jest.spyOn(utils, 'removeMalformedActivities').mockImplementation((value) => value);
    jest.spyOn(utils, 'isScheduleEmpty').mockImplementation(() => false);
    jest.spyOn(utils, 'calculateTimelineSettings').mockImplementation(() => ({
      granularity: TimelineGranularity.Daily,
      durationInDays: 3,
      durationInWeeks: 1,
      startDate: new Date(2021, 2, 2),
      endDate: new Date(2021, 2, 16),
      relativeCurrentDate: null,
      relativeCurrentWeek: null,
    }));

    const { getByText } = render(<ScheduleChart activities={data} configuration={CONFIGURATION} />);

    expect(getByText('End Date')).toBeInTheDocument();
    expect(getByText('Aug 4, 2021')).toBeInTheDocument();
  });
});
