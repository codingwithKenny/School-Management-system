'use client';

import { Calendar, momentLocalizer, Views } from 'react-big-calendar';
import moment from 'moment';
import { calendarEvents } from '@/lib/data';
import { useState } from 'react';

const localizer = momentLocalizer(moment);

const BigCalendar = () => {
  const [view, setView] = useState(Views.WORK_WEEK);

  const handleOnChangeView = (newView) => {
    setView(newView);
  };

  return (

      <Calendar
        localizer={localizer}
        events={calendarEvents}
        startAccessor="start"
        endAccessor="end"
        views={[Views.WORK_WEEK, Views.DAY]} // Use Views constants
        view={view}
        onView={handleOnChangeView}
        style={{ height: '100%' }}
        min={new Date (2025,1,0,8,0,0)}
        max={new Date (2025,1,0,18,0,0)}
      />
   
  );
};

export default BigCalendar;
