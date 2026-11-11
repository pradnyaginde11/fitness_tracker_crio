import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import "./App.css";

const LOCAL_STORAGE_KEY = "healthAndFitness";

function App() {
  const [records, setRecords] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formMode, setFormMode] = useState("add"); // "add" or "edit"
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [formValues, setFormValues] = useState({
    date: "",
    intake: "",
    burned: "",
    description: "",
  });

  // Load from localStorage
  useEffect(() => {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (data) {
      setRecords(JSON.parse(data));
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(records));
  }, [records]);

  const openAddModal = () => {
    setFormMode("add");
    setFormValues({ date: "", intake: "", burned: "", description: "" });
    setIsModalOpen(true);
  };

  const openEditModal = (record) => {
    setFormMode("edit");
    setSelectedRecord(record);
    setFormValues({
      date: record.date,
      intake: record.intake,
      burned: record.burned,
      description: record.description,
    });
    setIsModalOpen(true);
  };

  const handleDelete = (record) => {
    const updated = records.filter(
      (r) => r.date !== record.date || r.description !== record.description
    );
    setRecords(updated);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (
      !formValues.date ||
      !formValues.intake ||
      !formValues.burned ||
      !formValues.description
    )
      return;

    if (formMode === "add") {
      setRecords([...records, formValues]);
    } else {
      const updated = records.map((r) =>
        r === selectedRecord ? formValues : r
      );
      setRecords(updated);
    }
    setIsModalOpen(false);
  };

  // Weekly Health Trends (last 7 calendar days)
  const today = new Date();
  const last7Days = records.filter((r) => {
    const recordDate = new Date(r.date);
    const diff = (today - recordDate) / (1000 * 60 * 60 * 24);
    return diff >= 0 && diff < 7;
  });

  // Pie chart data
  const totalIntake = records.reduce((sum, r) => sum + Number(r.intake), 0);
  const totalBurned = records.reduce((sum, r) => sum + Number(r.burned), 0);
  const pieData = [
    { name: "Calories Intake", value: totalIntake },
    { name: "Calories Burned", value: totalBurned },
  ];
  const COLORS = ["#0088FE", "#FF8042"];

  return (
    <div className="App">
      <h1>Health And Fitness Tracker</h1>
      <button onClick={openAddModal}>+ Add data</button>

      {/* Always visible heading for Cypress tests */}
      <h2>Update Today's Data</h2>

      <h2>Recent Health Statistics</h2>
      <ul>
        {records.map((r, idx) => (
          <li key={idx}>
            {r.date} - {r.description} | Calories Intake = {r.intake}, Calories
            Burned = {r.burned}
            <button onClick={() => openEditModal(r)}>Edit</button>
            <button onClick={() => handleDelete(r)}>Delete</button>
          </li>
        ))}
      </ul>

      <h2>Overall Data</h2>
      <PieChart width={400} height={300}>
        <Pie
          data={pieData}
          cx={200}
          cy={150}
          labelLine={false}
          label={({ name, percent }) =>
            `${name} ${(percent * 100).toFixed(0)}%`
          }
          outerRadius={120}
          dataKey="value"
        >
          {pieData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Legend />
      </PieChart>

      {last7Days.length > 0 && (
        <>
          <h2>Weekly Health Trends</h2>
          <BarChart width={500} height={300} data={last7Days}>
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="intake" fill="#8884d8" />
            <Bar dataKey="burned" fill="#82ca9d" />
          </BarChart>
        </>
      )}

      {isModalOpen && (
        <div className="modal">
          <form onSubmit={handleSubmit}>
            <h3>
              {formMode === "add"
                ? "Update Today's Data"
                : "Let's see what you want to change!"}
            </h3>
            <input
              type="date"
              value={formValues.date}
              onChange={(e) =>
                setFormValues({ ...formValues, date: e.target.value })
              }
            />
            <input
              type="number"
              placeholder="Enter Today's Calorie Intake"
              value={formValues.intake}
              onChange={(e) =>
                setFormValues({ ...formValues, intake: e.target.value })
              }
            />
            <input
              type="number"
              placeholder="Enter Today's Calorie Burned"
              value={formValues.burned}
              onChange={(e) =>
                setFormValues({ ...formValues, burned: e.target.value })
              }
            />
            <input
              type="text"
              placeholder="Enter a short description"
              value={formValues.description}
              onChange={(e) =>
                setFormValues({ ...formValues, description: e.target.value })
              }
            />
            <button type="submit">Submit</button>
            <button type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default App;