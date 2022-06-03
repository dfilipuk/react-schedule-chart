import { render } from '@testing-library/react';

import { TimelineDates } from '../TimelineDates';
import { TaskExtended } from '../types';
import * as utils from '../utils';
import { TaskStatus } from './config';

describe('TimelineDates Component', () => {
  beforeEach(() => jest.restoreAllMocks());

  const tasks: TaskExtended<TaskStatus>[] = [
    {
      index: 1,
      startDate: new Date(2021, 9, 12),
      endDate: new Date(2021, 10, 5),
      status: TaskStatus.Closed,
      relativeStartDate: 3,
      relativeEndDate: 38,
    },
    {
      index: 2,
      startDate: new Date(2021, 9, 12),
      endDate: new Date(2020, 10, 5),
      status: TaskStatus.Closed,
      relativeStartDate: 3,
      relativeEndDate: 38,
    },
  ];

  it('should render dates without prefix', () => {
    const formatTaskDuration = jest
      .spyOn(utils, 'formatTaskDuration')
      .mockImplementation(() => 'date');

    const { getByText } = render(<TimelineDates tasks={[tasks[0]]} />);

    expect(getByText('date')).toBeInTheDocument();
    expect(formatTaskDuration).toBeCalledWith(tasks[0].startDate, tasks[0].endDate, null);
  });

  it('should render dates with prefix', () => {
    const formatTaskDuration = jest
      .spyOn(utils, 'formatTaskDuration')
      .mockImplementation((_1, _2, value) => `date ${value}`);

    const { getByText } = render(<TimelineDates showPrefix tasks={tasks} />);

    expect(getByText('date 1')).toBeInTheDocument();
    expect(getByText('date 2')).toBeInTheDocument();
    expect(formatTaskDuration).toBeCalledWith(tasks[0].startDate, tasks[0].endDate, tasks[0].index);
  });
});
