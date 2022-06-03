import maxBy from 'lodash/maxBy';

import { Configuration } from '../types';

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

const CONFIGURATION: Configuration<TaskStatus> = {
  colors: {
    InProgress: { primary: 'Gold', secondary: 'GoldenRod' },
    Open: { primary: 'LimeGreen', secondary: 'ForestGreen' },
    Closed: { primary: 'MediumVioletRed', secondary: 'Purple' },
  },
  isCompleted: (status: TaskStatus) => status === TaskStatus.Closed,
  getMostRelevantStatus: (statuses: TaskStatus[]) =>
    maxBy(statuses, (status) => TASK_STATUS_PRIORITY[status])!,
};

export { TaskStatus, CONFIGURATION };
