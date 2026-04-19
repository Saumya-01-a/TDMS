import { useMemo, useState } from "react";
import "./instructorGpsTracking.css";

export default function InstructorGpsTracking() {
  const [session, setSession] = useState("today");
  const [editMode, setEditMode] = useState(false);

  const sessions = useMemo(
    () => [
      { value: "today", label: "Today's Session (25/01/2026)" },
      { value: "24", label: "Session (24/01/2026)" },
      { value: "23", label: "Session (23/01/2026)" },
      { value: "22", label: "Session (22/01/2026)" },
    ],
    []
  );

  const history = useMemo(
    () => [
      {
        date: "25/01/2026",
        type: "Van Session",
        instructor: "Current Instructor",
        distance: "15.2 km",
        duration: "1h 25m",
      },
      {
        date: "24/01/2026",
        type: "Bike Session",
        instructor: "Current Instructor",
        distance: "9.8 km",
        duration: "1h 10m",
      },
      {
        date: "23/01/2026",
        type: "Van Session",
        instructor: "Current Instructor",
        distance: "11.5 km",
        duration: "1h 20m",
      },
      {
        date: "22/01/2026",
        type: "Bike Session",
        instructor: "Current Instructor",
        distance: "8.3 km",
        duration: "1h 05m",
      },
      {
        date: "21/01/2026",
        type: "Van Session",
        instructor: "Current Instructor",
        distance: "14.7 km",
        duration: "1h 35m",
      },
    ],
    []
  );

  const handleSaveRoute = () => {
    // Mock save functionality
    alert("Route changes saved successfully!");
    setEditMode(false);
  };

  return (
    <div className="insGps-mainContent">
      <h1 className="insGps-routesTitle">GPS Location Tracking</h1>

      {/* Map Panel */}
      <section className="insGps-routesPanel">
        <div className="insGps-routesPanelHead">
          <div className="insGps-routesPanelLeft">
            <span className="insGps-routesPin">📍</span>
            <div>
              <div className="insGps-routesPanelName">Route Tracking</div>
              <div className="insGps-routesPanelSub">Track your lesson route and session location</div>
            </div>
          </div>

          <div className="insGps-routesPanelActions">
            <div className="insGps-routesSelectWrap">
              <select
                className="insGps-routesSelect"
                value={session}
                onChange={(e) => setSession(e.target.value)}
              >
                {sessions.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
              <span className="insGps-routesChevron">▾</span>
            </div>

            <button
              className="insGps-editModeBtn"
              onClick={() => setEditMode(!editMode)}
            >
              {editMode ? "Exit Edit" : "Edit Mode"}
            </button>

            <button className="insGps-routesLiveBtn">Live Tracking</button>

            {editMode && (
              <button
                className="insGps-saveRouteBtn"
                onClick={handleSaveRoute}
              >
                Save Route
              </button>
            )}
          </div>
        </div>

        <div className="insGps-routesMapWrap">
          {/* Replace this iframe with real Google Maps API later */}
          <iframe
            title="route-map"
            className="insGps-routesMap"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            src="https://www.google.com/maps?q=Gampaha,Sri%20Lanka&z=12&output=embed"
          />
        </div>
      </section>

      {/* History Panel */}
      <section className="insGps-routesHistory">
        <div className="insGps-routesHistoryHead">
          <h2>Route History</h2>
        </div>

        <div className="insGps-routesTableWrap">
          <table className="insGps-routesTable">
            <thead>
              <tr>
                <th>DATE</th>
                <th>SESSION TYPE</th>
                <th>INSTRUCTOR</th>
                <th>DISTANCE</th>
                <th>DURATION</th>
                <th className="insGps-thRight">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {history.map((r) => (
                <tr key={r.date + r.type}>
                  <td>{r.date}</td>
                  <td>{r.type}</td>
                  <td>{r.instructor}</td>
                  <td>{r.distance}</td>
                  <td>{r.duration}</td>
                  <td className="insGps-tdRight">
                    <button className="insGps-routesLinkBtn">View Details</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
