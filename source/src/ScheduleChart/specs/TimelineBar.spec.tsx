import { fireEvent, render, waitFor } from '@testing-library/react';

import { TimelineBar } from '../TimelineBar';
import { TaskExtended } from '../types';
import * as utils from '../utils';
import { TaskStatus } from './config';

describe('TimelineBar Component', () => {
  beforeEach(() => jest.restoreAllMocks());

  it('should render task dates in tooltip when task specified', async () => {
    const task: TaskExtended<TaskStatus> = {
      index: 5,
      startDate: new Date(2021, 3, 15),
      endDate: new Date(2021, 3, 27),
      relativeStartDate: 3,
      relativeEndDate: 42,
      status: TaskStatus.InProgress,
    };

    const formatTaskDuration = jest
      .spyOn(utils, 'formatTaskDuration')
      .mockImplementation(() => 'date');

    const { getByTestId, getByText, queryByText } = render(
      <TimelineBar startDay={1} endDay={2} color="red" task={task} />
    );

    expect(queryByText('date')).not.toBeInTheDocument();

    fireEvent.mouseEnter(getByTestId('timeline-bar'));

    await waitFor(() => expect(getByText('date')).toBeInTheDocument());
    expect(formatTaskDuration).toBeCalledWith(task.startDate, task.endDate, null);
  });

  it('should not render task dates in tooltip when no task specified', async () => {
    const formatTaskDuration = jest
      .spyOn(utils, 'formatTaskDuration')
      .mockImplementation(() => 'date');

    const { getByTestId, getByText, queryByText } = render(
      <TimelineBar startDay={1} endDay={2} color="red" />
    );

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
  });
});
