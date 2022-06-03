import React, { useMemo } from 'react';
import { Table } from 'antd';
import { ColumnsType, ColumnType } from 'antd/lib/table';
import format from 'date-fns/format';
import range from 'lodash/range';

import {
  Activity,
  ActivityExtended,
  BaseStatus,
  Configuration,
  TimelineGranularity,
} from './types';

import {
  calculateTimelineSettings,
  getLatestCompletionDate,
  isScheduleEmpty,
  removeMalformedActivities,
} from './utils';

import {
  ScheduleChartContainer,
  StyledTimeline,
  StyledTimelineHeaderCell,
} from './ScheduleChart.styles';

type ScheduleChartProps<TStatus extends BaseStatus> = {
  className?: string;
  activities: Activity<TStatus>[];
  configuration: Configuration<TStatus>;
  dataTestId?: string;
};

const ScheduleChart = React.memo(
  <TStatus extends BaseStatus>(props: ScheduleChartProps<TStatus>) => {
    const { className, activities, configuration, dataTestId } = props;

    const schedule = useMemo(
      () =>
        removeMalformedActivities(activities).map(
          (activity): ActivityExtended<TStatus> => ({
            ...activity,
            latestCompletionDate: getLatestCompletionDate(activity.tasks),
          })
        ),
      [activities]
    );

    const settings = useMemo(
      () => (isScheduleEmpty(schedule) ? null : calculateTimelineSettings(schedule)),
      [schedule]
    );

    const columns = useMemo((): ColumnsType<ActivityExtended<TStatus>> => {
      let timelineColumns: ColumnsType<ActivityExtended<TStatus>> = [
        {
          title: 'Timeline',
          width: '100%',
          align: 'center',
        },
      ];

      if (settings) {
        const count =
          settings.granularity === TimelineGranularity.Daily
            ? settings.durationInDays
            : settings.durationInWeeks;

        timelineColumns = range(1, count + 1).map(
          (i): ColumnType<ActivityExtended<TStatus>> => ({
            title: <StyledTimelineHeaderCell sequentialNumber={i} settings={settings} />,
            width: 170,
            align: 'center',
            render: (_: any, { id, tasks }) =>
              i === 1
                ? {
                    props: { colSpan: count },
                    children: (
                      <StyledTimeline
                        tasks={tasks}
                        configuration={configuration}
                        timelineSettings={settings}
                        dataTestId={`timeline-${id}`}
                      />
                    ),
                  }
                : { props: { colSpan: 0 } },
          })
        );
      }

      return [
        {
          title: 'Activities',
          dataIndex: 'title',
          fixed: 'left',
          width: 120,
          align: 'center',
          render: (value: string) => value,
        },
        ...timelineColumns,
        {
          title: 'End Date',
          dataIndex: 'latestCompletionDate',
          fixed: 'right',
          width: 120,
          align: 'center',
          render: (value: Date) => (value ? format(value, 'MMM d, y') : null),
        },
      ];
    }, [settings]);

    return (
      <ScheduleChartContainer className={className} data-testid={dataTestId}>
        <Table
          dataSource={schedule}
          columns={columns}
          rowKey="id"
          scroll={{ x: 'max-content' }}
          pagination={false}
        />
      </ScheduleChartContainer>
    );
  }
);

export { ScheduleChart };
export type { ScheduleChartProps };
