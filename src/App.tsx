import { useMemo, useState, useCallback } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import type { SlotInfo } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";

import Modal from "./components/Modal";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

// Define event shape for the calendar
interface CalendarEvent {
  title: string;
  start: Date;
  end: Date;
  allDay?: boolean;
}

const localizer = momentLocalizer(moment);

const fmt = (d: Date): string => moment(d).format("DD-MM-YYYY");

// Chart data row type
interface ChartRow {
  name: string;
  value: number;
}

const dummyData: DummyData = {
  "01-09-2025": [{ user_1: 1 }, { user_2: 2 }, { user_3: 3 }, { user_4: 4 }],
  "02-09-2025": [{ user_1: 3 }, { user_2: 6 }, { user_3: 2 }, { user_4: 5 }],
  "03-09-2025": [{ user_1: 5 }, { user_2: 2 }, { user_3: 7 }, { user_4: 1 }],
};

// Build chart data from dummyData shape
const buildChartData = (dateKey: string): ChartRow[] => {
  const rows = dummyData[dateKey] || [];
  return rows.map((obj) => {
    const name = Object.keys(obj)[0];
    return { name, value: obj[name] as number };
  });
};

// Dummy data type
type DummyData = Record<string, Array<Record<string, number>>>;

export default function App() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalDateKey, setModalDateKey] = useState<string | null>(null);

  // Convert dummyData keys -> events so calendar shows markers
  const events: CalendarEvent[] = useMemo(() => {
    return Object.keys(dummyData).map((key) => {
      const m = moment(key, "DD-MM-YYYY");
      const date = m.toDate();
      return {
        title: "Data available",
        start: date,
        end: date,
        allDay: true,
      };
    });
  }, []);

  // Does a date have data?
  const hasData = useCallback((date: Date) => !!dummyData[fmt(date)], []);

  // Open chart modal if data exists, else alert
  const openForDate = useCallback((date: Date) => {
    setSelectedDate(date);
    const key = fmt(date);
    if (dummyData[key]) {
      setModalDateKey(key);
      setModalOpen(true);
    } else {
      setModalDateKey(null);
      setModalOpen(false);
      alert("No data found for the selected date.");
    }
  }, []);

  // Click on empty slot
  const handleSelectSlot = useCallback(
    (slotInfo: SlotInfo) => {
      openForDate(slotInfo.start as Date);
    },
    [openForDate]
  );

  // Click on an event
  const handleSelectEvent = useCallback(
    (event: CalendarEvent) => {
      openForDate(event.start);
    },
    [openForDate]
  );

  // Highlighting dates
  const dayPropGetter = useCallback(
    (date: Date) => {
      const isSelected =
        selectedDate && moment(date).isSame(moment(selectedDate), "day");
      const withData = hasData(date);

      const base: { style: React.CSSProperties; className: string } = {
        style: { transition: "background .15s ease" },
        className: "",
      };

      if (withData) {
        base.style.background =
          "linear-gradient(180deg, rgba(25,118,210,0.08), rgba(25,118,210,0.0))";
      }

      if (isSelected) {
        base.style.outline = "2px solid #1976d2";
        base.style.boxShadow = "inset 0 0 0 9999px rgba(25,118,210,0.12)";
        base.style.borderRadius = 8;
      }

      return base;
    },
    [selectedDate, hasData]
  );

  const eventPropGetter = useCallback(() => {
    return {
      style: {
        backgroundColor: "#1976d2",
        borderRadius: "8px",
        border: "none",
        color: "white",
        padding: "2px 6px",
      },
    };
  }, []);

  const chartData: ChartRow[] = useMemo(
    () => (modalDateKey ? buildChartData(modalDateKey) : []),
    [modalDateKey]
  );

  return (
    <div style={{ minHeight: "100vh", padding: 20 }}>
      <h2 style={{ marginBottom: 12 }}>📅 React Big Calendar with Bar Graph</h2>
      <p style={{ marginTop: 0, color: "#555" }}>
        Click any date. Dates with data are softly tinted. The selected date is
        outlined.
      </p>

      <Calendar
        localizer={localizer}
        events={events}
        selectable
        views={["month", "week", "day"]}
        startAccessor="start"
        endAccessor="end"
        style={{
          height: 600,
          background: "#fff",
          borderRadius: 12,
          padding: 8,
        }}
        onSelectSlot={handleSelectSlot}
        onSelectEvent={handleSelectEvent}
        dayPropGetter={dayPropGetter}
        eventPropGetter={eventPropGetter}
        popup
      />

      <Modal
        open={modalOpen}
        title={`📊 Data for ${modalDateKey || ""}`}
        onClose={() => setModalOpen(false)}
      >
        <div style={{ width: "100%", height: 360 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Modal>
    </div>
  );
}
