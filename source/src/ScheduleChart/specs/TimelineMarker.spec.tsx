import { fireEvent, render, waitFor } from '@testing-library/react';

import { TimelineMarker } from '../TimelineMarker';
import { ScheduleCheckpoint } from '../types';
import * as utils from '../utils';
import { TaskStatus } from './config';

describe('TimelineMarker Component', () => {
  beforeEach(() => jest.restoreAllMocks());

  const defaultScheduleCheckpoint: ScheduleCheckpoint<TaskStatus> = {
    relativeDate: 5,
    activeTasks: [
      {
        index: 1,
        startDate: new Date(2021, 9, 12),
        endDate: new Date(2021, 10, 5),
        status: TaskStatus.InProgress,
        relativeStartDate: 3,
        relativeEndDate: 38,
      },
    ],
    completedTasks: [
      {
        index: 2,
        startDate: new Date(2021, 9, 12),
        endDate: new Date(2021, 10, 5),
        status: TaskStatus.Closed,
        relativeStartDate: 3,
        relativeEndDate: 38,
      },
    ],
  };

  it('should render start marker if active tasks exist', () => {
    const { getByTestId, queryByTestId } = render(
      <TimelineMarker checkpoint={defaultScheduleCheckpoint} color="red" />
    );

    expect(getByTestId('timeline-start-marker')).toBeInTheDocument();
    expect(queryByTestId('timeline-end-marker')).not.toBeInTheDocument();
  });

  it('should render end marker if no active tasks exist', () => {
    const checkpoint: ScheduleCheckpoint<TaskStatus> = {
      ...defaultScheduleCheckpoint,
      activeTasks: [],
    };

    const { getByTestId, queryByTestId } = render(
      <TimelineMarker checkpoint={checkpoint} color="red" />
    );

    expect(getByTestId('timeline-end-marker')).toBeInTheDocument();
    expect(queryByTestId('timeline-start-marker')).not.toBeInTheDocument();
  });

  it('should render dates with no prefix in tooltip when single task and single marker on timeline', async () => {
    const checkpoint: ScheduleCheckpoint<TaskStatus> = {
      ...defaultScheduleCheckpoint,
      completedTasks: [],
    };
    const formatTaskDuration = jest
      .spyOn(utils, 'formatTaskDuration')
      .mockImplementation(() => 'date');

    const { getByTestId, getByText, queryByText } = render(
      <TimelineMarker singleOnTimeline checkpoint={checkpoint} color="red" />
    );

    expect(queryByText('date')).not.toBeInTheDocument();

    fireEvent.mouseEnter(getByTestId('timeline-start-marker'));

    await waitFor(() => expect(getByText('date')).toBeInTheDocument());
    expect(formatTaskDuration).toBeCalled();
    expect(formatTaskDuration.mock.calls[0][2]).toBeNull();
  });

  it('should render dates with prefix in tooltip when not single marker on timeline', async () => {
    const checkpoint: ScheduleCheckpoint<TaskStatus> = {
      ...defaultScheduleCheckpoint,
      completedTasks: [],
    };
    const formatTaskDuration = jest
      .spyOn(utils, 'formatTaskDuration')
      .mockImplementation(() => 'date');

    const { getByTestId, getByText, queryByText } = render(
      <TimelineMarker checkpoint={checkpoint} color="red" />
    );

    expect(queryByText('date')).not.toBeInTheDocument();

    fireEvent.mouseEnter(getByTestId('timeline-start-marker'));

    await waitFor(() => expect(getByText('date')).toBeInTheDocument());
    expect(formatTaskDuration).toBeCalled();
    expect(formatTaskDuration.mock.calls[0][2]).toEqual(1);
  });

  it('should render dates with prefix in tooltip when multiple tasks', async () => {
    const formatTaskDuration = jest
      .spyOn(utils, 'formatTaskDuration')
      .mockImplementation((_1, _2, index) => `date ${index}`);

    const { getByTestId, getByText, queryByText } = render(
      <TimelineMarker singleOnTimeline checkpoint={defaultScheduleCheckpoint} color="red" />
    );

    expect(queryByText('date')).not.toBeInTheDocument();

    fireEvent.mouseEnter(getByTestId('timeline-start-marker'));

    await waitFor(() => {
      expect(getByText('date 1')).toBeInTheDocument();
      expect(getByText('date 2')).toBeInTheDocument();
    });
    expect(formatTaskDuration).toBeCalledTimes(2);
    expect(formatTaskDuration.mock.calls[0][2]).toEqual(2);
    expect(formatTaskDuration.mock.calls[1][2]).toEqual(1);
  });
});
