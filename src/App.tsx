import { useMemo } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useSelector, useDispatch } from "react-redux";

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

  // Build chart data
  const chartData = useMemo(() => {
    if (!selectedDate || !data[selectedDate]) return [];
    return data[selectedDate].map((obj) => {
      const name = Object.keys(obj)[0];
      return { name, value: obj[name] };
    });
  }, [selectedDate, data]);

  // Calendar events
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
      <h2> React Big Calendar with Redux + Bar Graph</h2>

      <Calendar
        localizer={localizer}
        events={events}
        selectable
        views={["month", "week", "day"]}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 600 }}
        onSelectSlot={(slotInfo) => handleSelectDate(slotInfo.start)}
        onSelectEvent={(event) => handleSelectDate(event.start)}
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
