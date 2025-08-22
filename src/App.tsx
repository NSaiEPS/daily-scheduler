import { useMemo, useState } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import type { View } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useSelector, useDispatch } from "react-redux";
import "./calendar.css";

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
import type { RootState } from "./store";
import { closeModal, selectDate } from "./store/calendarSlice";

const localizer = momentLocalizer(moment);
const fmt = (d: Date) => moment(d).format("DD-MM-YYYY");

export default function App() {
  const dispatch = useDispatch();
  const { data, selectedDate, modalOpen } = useSelector(
    (state: RootState) => state.calendar
  );

  const [date, setDate] = useState(new Date());
  const [view, setView] = useState<View>("month");

  const chartData = useMemo(() => {
    if (!selectedDate || !data[selectedDate]) return [];
    return data[selectedDate].map((obj) => {
      const name = Object.keys(obj)[0];
      return { name, value: obj[name] };
    });
  }, [selectedDate, data]);

  const events = useMemo(() => {
    return Object.keys(data).map((key) => {
      const m = moment(key, "DD-MM-YYYY");
      return {
        title: "Data available",
        start: m.toDate(),
        end: m.toDate(),
        allDay: true,
      };
    });
  }, [data]);

  const handleSelectDate = (date: Date) => {
    dispatch(selectDate(fmt(date)));
    if (!data[fmt(date)]) alert("No data found for the selected date.");
  };

  return (
    <div style={{ minHeight: "100vh", padding: 20 }}>
      <h2>React Big Calendar with Redux + Bar Graph</h2>

      <Calendar
        localizer={localizer}
        events={events}
        selectable
        views={["month", "week", "day"]}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 600 }}
        date={date}
        onNavigate={(newDate) => setDate(newDate)}
        view={view}
        onView={(newView) => setView(newView)}
        onSelectSlot={(slotInfo) => handleSelectDate(slotInfo.start)}
        onSelectEvent={(event) => handleSelectDate(event.start)}
        dayPropGetter={(dateObj) => {
          const formatted = fmt(dateObj);
          if (formatted === selectedDate) {
            return {
              style: {
                backgroundColor: "#1976d2",
                color: "white",
                fontWeight: "bold",
                textAlign: "center",
              },
            };
          }
          return {};
        }}
      />

      <Modal
        open={modalOpen}
        title={`📊 Data for ${selectedDate || ""}`}
        onClose={() => dispatch(closeModal())}
      >
        <div style={{ width: "100%", height: 360 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value" fill="#1976d2" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Modal>
    </div>
  );
}
