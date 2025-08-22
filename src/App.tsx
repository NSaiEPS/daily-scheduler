import { useState } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import type { SlotInfo } from "react-big-calendar";
import type { Event as RBCEvent } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";

import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

const localizer = momentLocalizer(moment);

// Data type for Chart
interface ChartData {
  name: string;
  value: number;
}

// Calendar event type
interface MyEvent extends RBCEvent {
  start: Date;
  end: Date;
  title: string;
  allDay: boolean;
}

// Dummy data type
type DummyData = Record<string, Array<Record<string, number>>>;

function App() {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [chartData, setChartData] = useState<ChartData[] | null>(null);

  const dummyData: DummyData = {
    "01-09-2025": [{ user_1: 1 }, { user_2: 2 }, { user_3: 3 }, { user_4: 4 }],
    "02-09-2025": [{ user_1: 3 }, { user_2: 6 }, { user_3: 2 }, { user_4: 5 }],
    "03-09-2025": [{ user_1: 5 }, { user_2: 2 }, { user_3: 7 }, { user_4: 1 }],
  };

  const events: MyEvent[] = Object.keys(dummyData).map((date) => {
    const [day, month, year] = date.split("-");
    return {
      title: "Data Available",
      start: new Date(`${year}-${month}-${day}`),
      end: new Date(`${year}-${month}-${day}`),
      allDay: true,
    };
  });

  const handleSelectSlot = (slotInfo: SlotInfo) => {
    const clickedDate = moment(slotInfo.start).format("DD-MM-YYYY");

    if (dummyData[clickedDate]) {
      const formattedData: ChartData[] = dummyData[clickedDate].map((item) => {
        const key = Object.keys(item)[0];
        return { name: key, value: item[key] };
      });
      setChartData(formattedData);
      setSelectedDate(clickedDate);
    } else {
      alert("No data found for the selected date.");
      setChartData(null);
      setSelectedDate(null);
    }
  };

  return (
    <div style={{ height: "100vh", padding: "20px" }}>
      <h2>📅 React Big Calendar with Bar Graph</h2>

      <Calendar
        localizer={localizer}
        events={events}
        selectable
        startAccessor="start"
        endAccessor="end"
        style={{ height: 500 }}
        onSelectSlot={handleSelectSlot}
        views={["month", "week", "day"]}
      />

      {chartData && (
        <div
          style={{
            marginTop: "20px",
            padding: "20px",
            border: "1px solid #ddd",
            borderRadius: "10px",
          }}
        >
          <h3>📊 Data for {selectedDate}</h3>
          <BarChart width={600} height={300} data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#8884d8" />
          </BarChart>
        </div>
      )}
    </div>
  );
}

export default App;
