import React from 'react';
import styled, { css } from 'styled-components';

import { TimelineGranularity, TimelineSettings } from './types';

const Content = styled.div<{ isCurrentTimeSlot: boolean }>`
  padding: 16px;

  ${(props) =>
    props.isCurrentTimeSlot &&
    css`
      padding-bottom: 12px;
    `}
`;

const CurrentTimeSlotMarker = styled.div`
  border-radius: 4px;
  height: 4px;
  background-color: #606d7f;
`;

type Props = {
  className?: string;
  sequentialNumber: number;
  settings: TimelineSettings;
};

const TimelineHeaderCell: React.FC<Props> = React.memo(
  ({ className, sequentialNumber, settings }) => {
    const { granularity, relativeCurrentDate, relativeCurrentWeek } = settings;
    const title = granularity === TimelineGranularity.Daily ? 'Day' : 'Week';
    const isCurrentTimeSlot =
      (granularity === TimelineGranularity.Daily && sequentialNumber === relativeCurrentDate) ||
      (granularity === TimelineGranularity.Weekly && sequentialNumber === relativeCurrentWeek);

    return (
      <div className={className}>
        <Content isCurrentTimeSlot={isCurrentTimeSlot}>
          {title} {sequentialNumber}
        </Content>

        {isCurrentTimeSlot && <CurrentTimeSlotMarker data-testid="current-time-slot-marker" />}
      </div>
    );
  }
);

export { TimelineHeaderCell };
