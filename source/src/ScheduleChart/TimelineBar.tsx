import React, { useMemo } from 'react';
import { Tooltip } from 'antd';
import styled from 'styled-components';

import { BaseStatus, TaskExtended } from './types';
import { TimelineDates } from './TimelineDates';

const Bar = styled.div.attrs(() => ({ 'data-testid': 'timeline-bar' }))<{
  startPosition: number;
  endPosition: number;
  backgroundColor: string;
}>`
  margin: 10px 2px;
  border-radius: 4px;
  background-color: ${(props) => props.backgroundColor};
  grid-area: 1 / ${(props) => props.startPosition} / 2 / ${(props) => props.endPosition};
`;

type Props<TStatus extends BaseStatus> = {
  startDay: number;
  endDay: number;
  color: string;
  task?: TaskExtended<TStatus>;
};

const TimelineBar = React.memo(<TStatus extends BaseStatus>(props: Props<TStatus>) => {
  const { startDay, endDay, color, task } = props;
  const tooltipTitle = useMemo(() => (task ? <TimelineDates tasks={[task]} /> : ''), [task]);

  return (
    <Tooltip title={tooltipTitle} placement="top">
      <Bar startPosition={startDay} endPosition={endDay + 1} backgroundColor={color} />
    </Tooltip>
  );
});

export { TimelineBar };
