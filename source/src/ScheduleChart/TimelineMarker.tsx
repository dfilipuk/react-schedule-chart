import React, { useMemo } from 'react';
import { Tooltip } from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import styled from 'styled-components';

import { BaseStatus, ScheduleCheckpoint } from './types';
import { TimelineDates } from './TimelineDates';

const StartMarker = styled.div.attrs(() => ({ 'data-testid': 'timeline-start-marker' }))<{
  position: number;
  backgroundColor: string;
}>`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  align-self: center;
  justify-self: center;
  grid-row: 1 / span 1;
  grid-column: ${(props) => props.position} / span 1;
  background-color: ${(props) => props.backgroundColor};
`;

const EndMarker = styled.div.attrs(() => ({ 'data-testid': 'timeline-end-marker' }))<{
  position: number;
}>`
  align-self: center;
  justify-self: center;
  grid-row: 1 / span 1;
  grid-column: ${(props) => props.position} / span 1;
`;

type Props<TStatus extends BaseStatus> = {
  checkpoint: ScheduleCheckpoint<TStatus>;
  color: string;
  singleOnTimeline?: boolean;
};

const TimelineMarker = React.memo(<TStatus extends BaseStatus>(props: Props<TStatus>) => {
  const { checkpoint, color, singleOnTimeline } = props;
  const { relativeDate, activeTasks, completedTasks } = checkpoint;

  const tooltipTitle = useMemo(() => {
    const tasks = completedTasks.concat(activeTasks);
    const showPrefix = !singleOnTimeline || tasks.length > 1;

    return <TimelineDates tasks={tasks} showPrefix={showPrefix} />;
  }, [activeTasks, completedTasks, singleOnTimeline]);

  return (
    <Tooltip title={tooltipTitle} placement="top">
      {activeTasks.length === 0 ? (
        <EndMarker position={relativeDate}>
          <FontAwesomeIcon icon={faCheckCircle} size="sm" color={color} />
        </EndMarker>
      ) : (
        <StartMarker position={relativeDate} backgroundColor={color} />
      )}
    </Tooltip>
  );
});

export { TimelineMarker };
