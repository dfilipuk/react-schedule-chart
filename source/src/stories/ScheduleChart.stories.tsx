import addDays from 'date-fns/addDays';
import endOfWeek from 'date-fns/endOfWeek';
import startOfToday from 'date-fns/startOfToday';
import startOfWeek from 'date-fns/startOfWeek';
import subDays from 'date-fns/subDays';
import maxBy from 'lodash/maxBy';
import { Story } from '@storybook/react';

import { Configuration, ScheduleChart, ScheduleChartProps, WEEK_STARTS_ON } from '../ScheduleChart';

enum TaskStatus {
  Open = 'Open',
  InProgress = 'InProgress',
  Closed = 'Closed',
}

const TASK_STATUS_PRIORITY: { [key in TaskStatus]: number } = {
  Closed: 0,
  Open: 1,
  InProgress: 2,
};

const today = startOfToday();
const startOfCurrentWeek = startOfWeek(today, { weekStartsOn: WEEK_STARTS_ON });
const endOfCurrentWeek = endOfWeek(today, { weekStartsOn: WEEK_STARTS_ON });

const configuration: Configuration<TaskStatus> = {
  colors: {
    InProgress: { primary: 'Gold', secondary: 'GoldenRod' },
    Open: { primary: 'LimeGreen', secondary: 'ForestGreen' },
    Closed: { primary: 'MediumVioletRed', secondary: 'Purple' },
  },
  isCompleted: (status: TaskStatus) => status === TaskStatus.Closed,
  getMostRelevantStatus: (statuses: TaskStatus[]) =>
    maxBy(statuses, (status) => TASK_STATUS_PRIORITY[status])!,
};

const dailyScheduleChartProps: ScheduleChartProps<TaskStatus> = {
  configuration,
  activities: [
    {
      id: 1,
      title: 'Grooming',
      tasks: [
        {
          status: TaskStatus.Closed,
          startDate: subDays(today, 3),
          endDate: subDays(today, 2),
        },
      ],
    },
    {
      id: 2,
      title: 'Estimations',
      tasks: [
        {
          status: TaskStatus.Open,
          startDate: addDays(today, 1),
          endDate: addDays(today, 2),
        },
      ],
    },
    {
      id: 3,
      title: 'Development',
      tasks: [
        {
          status: TaskStatus.Closed,
          startDate: subDays(today, 2),
          endDate: subDays(today, 2),
        },
        {
          status: TaskStatus.InProgress,
          startDate: subDays(today, 1),
          endDate: addDays(today, 2),
        },
        {
          status: TaskStatus.Open,
          startDate: addDays(today, 3),
          endDate: addDays(today, 3),
        },
      ],
    },
    {
      id: 4,
      title: 'Code Review',
      tasks: [
        {
          status: TaskStatus.InProgress,
          startDate: subDays(today, 2),
          endDate: addDays(today, 1),
        },
        {
          status: TaskStatus.Open,
          startDate: addDays(today, 1),
          endDate: addDays(today, 1),
        },
      ],
    },
    {
      id: 5,
      title: 'Testing',
      tasks: [
        {
          status: TaskStatus.Closed,
          startDate: subDays(today, 3),
          endDate: subDays(today, 3),
        },
        {
          status: TaskStatus.Closed,
          startDate: subDays(today, 1),
          endDate: subDays(today, 1),
        },
        {
          status: TaskStatus.InProgress,
          startDate: today,
          endDate: addDays(today, 1),
        },
        {
          status: TaskStatus.Open,
          startDate: addDays(today, 3),
          endDate: addDays(today, 3),
        },
      ],
    },
    {
      id: 6,
      title: 'Deployment',
      tasks: [
        {
          status: TaskStatus.Closed,
          startDate: subDays(today, 3),
          endDate: subDays(today, 1),
        },
        {
          status: TaskStatus.InProgress,
          startDate: subDays(today, 2),
          endDate: addDays(today, 2),
        },
      ],
    },
    {
      id: 7,
      title: 'Demo',
      tasks: [
        {
          status: TaskStatus.Open,
          startDate: addDays(today, 1),
          endDate: addDays(today, 2),
        },
      ],
    },
  ],
};

const weeklyScheduleChartProps: ScheduleChartProps<TaskStatus> = {
  configuration,
  activities: [
    {
      id: 1,
      title: 'Grooming',
      tasks: [
        {
          status: TaskStatus.Closed,
          startDate: subDays(startOfCurrentWeek, 12),
          endDate: subDays(startOfCurrentWeek, 12),
        },
        {
          status: TaskStatus.Open,
          startDate: addDays(endOfCurrentWeek, 6),
          endDate: addDays(endOfCurrentWeek, 11),
        },
      ],
    },
    {
      id: 2,
      title: 'Estimations',
      tasks: [
        {
          status: TaskStatus.Closed,
          startDate: subDays(startOfCurrentWeek, 10),
          endDate: addDays(startOfCurrentWeek, 2),
        },
        {
          status: TaskStatus.InProgress,
          startDate: subDays(endOfCurrentWeek, 1),
          endDate: addDays(endOfCurrentWeek, 2),
        },
      ],
    },
    {
      id: 3,
      title: 'Development',
      tasks: [
        {
          status: TaskStatus.Closed,
          startDate: subDays(startOfCurrentWeek, 5),
          endDate: subDays(startOfCurrentWeek, 5),
        },
        {
          status: TaskStatus.Closed,
          startDate: subDays(startOfCurrentWeek, 7),
          endDate: subDays(startOfCurrentWeek, 2),
        },
        {
          status: TaskStatus.Closed,
          startDate: subDays(startOfCurrentWeek, 11),
          endDate: startOfCurrentWeek,
        },
        {
          status: TaskStatus.InProgress,
          startDate: addDays(startOfCurrentWeek, 1),
          endDate: addDays(startOfCurrentWeek, 4),
        },
        {
          status: TaskStatus.InProgress,
          startDate: addDays(startOfCurrentWeek, 4),
          endDate: addDays(endOfCurrentWeek, 1),
        },
        {
          status: TaskStatus.Open,
          startDate: addDays(endOfCurrentWeek, 10),
          endDate: addDays(endOfCurrentWeek, 10),
        },
        {
          status: TaskStatus.Open,
          startDate: addDays(endOfCurrentWeek, 10),
          endDate: addDays(endOfCurrentWeek, 10),
        },
      ],
    },
    {
      id: 4,
      title: 'Code Review',
      tasks: [
        {
          status: TaskStatus.Closed,
          startDate: subDays(startOfCurrentWeek, 8),
          endDate: subDays(startOfCurrentWeek, 3),
        },
        {
          status: TaskStatus.Open,
          startDate: addDays(startOfCurrentWeek, 2),
          endDate: addDays(endOfCurrentWeek, 13),
        },
        {
          status: TaskStatus.Open,
          startDate: addDays(endOfCurrentWeek, 4),
          endDate: addDays(endOfCurrentWeek, 4),
        },
        {
          status: TaskStatus.Open,
          startDate: subDays(startOfCurrentWeek, 6),
          endDate: addDays(startOfCurrentWeek, 4),
        },
        {
          status: TaskStatus.Closed,
          startDate: subDays(startOfCurrentWeek, 2),
          endDate: addDays(endOfCurrentWeek, 2),
        },
      ],
    },
    {
      id: 5,
      title: 'Testing',
      tasks: [
        {
          status: TaskStatus.Closed,
          startDate: subDays(startOfCurrentWeek, 7),
          endDate: subDays(startOfCurrentWeek, 7),
        },
        {
          status: TaskStatus.Closed,
          startDate: subDays(startOfCurrentWeek, 7),
          endDate: subDays(startOfCurrentWeek, 7),
        },
        {
          status: TaskStatus.InProgress,
          startDate: subDays(startOfCurrentWeek, 2),
          endDate: subDays(endOfCurrentWeek, 1),
        },
        {
          status: TaskStatus.InProgress,
          startDate: subDays(endOfCurrentWeek, 2),
          endDate: addDays(endOfCurrentWeek, 10),
        },
      ],
    },
    {
      id: 6,
      title: 'Deployment',
      tasks: [
        {
          status: TaskStatus.Closed,
          startDate: subDays(startOfCurrentWeek, 13),
          endDate: subDays(startOfCurrentWeek, 9),
        },
        {
          status: TaskStatus.Closed,
          startDate: subDays(startOfCurrentWeek, 11),
          endDate: subDays(startOfCurrentWeek, 9),
        },
        {
          status: TaskStatus.Closed,
          startDate: subDays(startOfCurrentWeek, 7),
          endDate: addDays(startOfCurrentWeek, 2),
        },
        {
          status: TaskStatus.InProgress,
          startDate: addDays(startOfCurrentWeek, 2),
          endDate: addDays(endOfCurrentWeek, 5),
        },
        {
          status: TaskStatus.Open,
          startDate: addDays(endOfCurrentWeek, 8),
          endDate: addDays(endOfCurrentWeek, 9),
        },
        {
          status: TaskStatus.Open,
          startDate: addDays(endOfCurrentWeek, 8),
          endDate: addDays(endOfCurrentWeek, 12),
        },
      ],
    },
    {
      id: 7,
      title: 'Demo',
      tasks: [
        {
          status: TaskStatus.Closed,
          startDate: subDays(startOfCurrentWeek, 6),
          endDate: startOfCurrentWeek,
        },
      ],
    },
  ],
};

const Template: Story<ScheduleChartProps<TaskStatus>> = (args) => <ScheduleChart {...args} />;

const Daily = Template.bind({});
const Weekly = Template.bind({});

Daily.args = dailyScheduleChartProps;
Weekly.args = weeklyScheduleChartProps;

export { Daily, Weekly };
export default {
  title: 'Schedule Chart',
  component: ScheduleChart,
};
