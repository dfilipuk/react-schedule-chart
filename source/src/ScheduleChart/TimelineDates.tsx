import React, { useMemo } from 'react';

import { BaseStatus, TaskExtended } from './types';
import { formatTaskDuration } from './utils';

type Props<TStatus extends BaseStatus> = {
  tasks: TaskExtended<TStatus>[];
  showPrefix?: boolean;
};

const TimelineDates = React.memo(<TStatus extends BaseStatus>(props: Props<TStatus>) => {
  const { tasks, showPrefix } = props;

  const dates = useMemo(
    () =>
      tasks.map(({ startDate, endDate, index }) => ({
        key: index,
        title: formatTaskDuration(startDate, endDate, showPrefix ? index : null),
      })),
    [tasks, showPrefix]
  );

  return (
    <div>
      {dates.map(({ key, title }) => (
        <div key={key}>{title}</div>
      ))}
    </div>
  );
});

export { TimelineDates };
