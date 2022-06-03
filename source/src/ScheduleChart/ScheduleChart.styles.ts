import styled from 'styled-components';

import { Timeline } from './Timeline';
import { TimelineHeaderCell } from './TimelineHeaderCell';

const ScheduleChartContainer = styled.div`
  display: grid;
  grid-template-rows: auto;
  grid-template-columns: minmax(0, 1fr);

  .ant-table td {
    white-space: nowrap;
  }

  .ant-table-cell {
    padding: 0;
    height: 48px;
  }

  .ant-table-tbody > tr.ant-table-row-level-0:hover > td {
    background: white;
  }
`;

const StyledTimeline = styled(Timeline)`
  height: 100%;
`;

const StyledTimelineHeaderCell = styled(TimelineHeaderCell)`
  height: 100%;
`;

export { ScheduleChartContainer, StyledTimeline, StyledTimelineHeaderCell };
