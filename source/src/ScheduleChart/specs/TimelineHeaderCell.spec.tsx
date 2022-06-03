import { render } from '@testing-library/react';

import { TimelineHeaderCell } from '../TimelineHeaderCell';
import { TimelineGranularity, TimelineSettings } from '../types';

describe('TimelineHeaderCell Component', () => {
  const defaultTimelineSettings: TimelineSettings = {
    durationInDays: 14,
    durationInWeeks: 2,
    startDate: new Date(2021, 3, 7),
    endDate: new Date(2021, 3, 21),
    relativeCurrentDate: 5,
    relativeCurrentWeek: 1,
    granularity: TimelineGranularity.Weekly,
  };

  it('should render correct title for daily timeline', () => {
    const settings: TimelineSettings = {
      ...defaultTimelineSettings,
      granularity: TimelineGranularity.Daily,
    };

    const { getByText } = render(<TimelineHeaderCell sequentialNumber={7} settings={settings} />);

    expect(getByText('Day 7')).toBeInTheDocument();
  });

  it('should render correct title for weekly timeline', () => {
    const { getByText } = render(
      <TimelineHeaderCell sequentialNumber={5} settings={defaultTimelineSettings} />
    );

    expect(getByText('Week 5')).toBeInTheDocument();
  });

  it('should render current time slot marker for current day', () => {
    const settings: TimelineSettings = {
      ...defaultTimelineSettings,
      granularity: TimelineGranularity.Daily,
    };

    const { getByTestId } = render(<TimelineHeaderCell sequentialNumber={5} settings={settings} />);

    expect(getByTestId('current-time-slot-marker')).toBeInTheDocument();
  });

  it('should render current time slot marker for current week', () => {
    const { getByTestId } = render(
      <TimelineHeaderCell sequentialNumber={1} settings={defaultTimelineSettings} />
    );

    expect(getByTestId('current-time-slot-marker')).toBeInTheDocument();
  });

  it('should not render current time slot marker for not current day', () => {
    const settings: TimelineSettings = {
      ...defaultTimelineSettings,
      granularity: TimelineGranularity.Daily,
    };

    const { queryByTestId } = render(
      <TimelineHeaderCell sequentialNumber={10} settings={settings} />
    );

    expect(queryByTestId('current-time-slot-marker')).not.toBeInTheDocument();
  });

  it('should render not current time slot marker for not current week', () => {
    const { queryByTestId } = render(
      <TimelineHeaderCell sequentialNumber={2} settings={defaultTimelineSettings} />
    );

    expect(queryByTestId('current-time-slot-marker')).not.toBeInTheDocument();
  });
});
