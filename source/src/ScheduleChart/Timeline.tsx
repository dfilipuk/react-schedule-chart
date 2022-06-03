import React, { useMemo } from 'react';
import styled from 'styled-components';

import { TimelineBar } from './TimelineBar';
import { TimelineMarker } from './TimelineMarker';
import { BaseStatus, Configuration, Task, TimelineSettings } from './types';
import { calculateSchedule } from './utils';

const Container = styled.div<{ daysCount: number }>`
  display: grid;
  grid-template-rows: 1fr;
  grid-template-columns: repeat(${(props) => props.daysCount}, 1fr);
`;

const CurrentDayMarker = styled.div<{ position: number }>`
  justify-self: center;
  grid-row: 1 / span 1;
  grid-column: ${(props) => props.position} / span 1;
  border-right: 1px dashed #606d7f;
`;

type Props<TStatus extends BaseStatus> = {
  className?: string;
  configuration: Configuration<TStatus>;
  timelineSettings: TimelineSettings;
  tasks: Task<TStatus>[];
  dataTestId?: string;
};

const Timeline = React.memo(<TStatus extends BaseStatus>(props: Props<TStatus>) => {
  const { className, configuration, timelineSettings, tasks: inputTasks, dataTestId } = props;
  const { colors, isCompleted, getMostRelevantStatus } = configuration;
  const { startDate, relativeCurrentDate, durationInDays } = timelineSettings;

  const scheduleActions = useMemo(
    () => calculateSchedule(inputTasks, startDate, isCompleted, getMostRelevantStatus),
    [inputTasks, startDate]
  );

  return (
    <Container data-testid={dataTestId} className={className} daysCount={durationInDays}>
      {scheduleActions.map(({ status, relativeStartDate, relativeEndDate, checkpoints }) => {
        const singleActiveTask =
          checkpoints.length === 1 &&
          checkpoints[0].activeTasks.length === 1 &&
          checkpoints[0].completedTasks.length === 0;

        return (
          <React.Fragment key={`${relativeStartDate}-${relativeEndDate}`}>
            <TimelineBar
              startDay={relativeStartDate}
              endDay={relativeEndDate}
              color={colors[status].primary}
              task={singleActiveTask ? checkpoints[0].activeTasks[0] : undefined}
            />

            {!singleActiveTask &&
              checkpoints.map((checkpoint, _, arr) => (
                <TimelineMarker
                  key={checkpoint.relativeDate}
                  checkpoint={checkpoint}
                  singleOnTimeline={arr.length === 1}
                  color={colors[status].secondary}
                />
              ))}
          </React.Fragment>
        );
      })}

      {relativeCurrentDate && <CurrentDayMarker position={relativeCurrentDate} />}
    </Container>
  );
});

export { Timeline };
