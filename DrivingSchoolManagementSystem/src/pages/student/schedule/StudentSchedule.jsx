import React from "react";
import "./studentSchedule.css";

export default function StudentSchedule() {
  const schedules = [
    {
      id: 1,
      date: "2024-08-10",
      timeRange: "08:00 AM - 09:15 AM",
      studentName: "Kamal Perera",
      instructorName: "Sanath Jayasuriya",
      vehicleText: "Van - ABC-1234",
      vehicleType: "Van",
      status: "Scheduled",
    },
    {
      id: 2,
      date: "2024-08-12",
      timeRange: "02:00 PM - 03:30 PM",
      studentName: "Kamal Perera",
      instructorName: "Nilupa De Silva",
      vehicleText: "Car - XYZ-5678",
      vehicleType: "Car",
      status: "Completed",
    },
    {
      id: 3,
      date: "2024-08-15",
      timeRange: "10:00 AM - 11:15 AM",
      studentName: "Kamal Perera",
      instructorName: "Sanath Jayasuriya",
      vehicleText: "Motorcycle - MTO-9012",
      vehicleType: "Motorcycle",
      status: "Scheduled",
    },
  ];

  return (
    <div className="stuSch__schedulePageWrapper">
      <h1 className="stuSch__schedulePageTitle">Schedule & Appointments</h1>

      <div className="stuSch__scheduleHeaderCard">
        <div className="stuSch__headerContent">
          <h2 className="stuSch__headerTitle">Lesson Schedule</h2>
          <p className="stuSch__headerSubtitle">View and book your driving lessons</p>
        </div>
        <button className="stuSch__bookAppointmentBtn">+ Book Appointment</button>
      </div>

      <div className="stuSch__scheduleCardsContainer">
        {schedules.map((schedule) => (
          <div key={schedule.id} className="stuSch__scheduleCard">
            <div className="stuSch__cardLeftSection">
              <div className="stuSch__dateTimeBlock">
                <span className="stuSch__icon">📅</span>
                <span className="stuSch__text">{schedule.date}</span>
              </div>
              <div className="stuSch__dateTimeBlock">
                <span className="stuSch__icon">🕐</span>
                <span className="stuSch__text">{schedule.timeRange}</span>
              </div>
            </div>

            <div className="stuSch__cardMiddleSection">
              <div className="stuSch__infoColumn">
                <span className="stuSch__icon">👤</span>
                <div className="stuSch__infoText">
                  <div className="stuSch__infoLabel">Student</div>
                  <div className="stuSch__infoValue">{schedule.studentName}</div>
                </div>
              </div>
              <div className="stuSch__infoColumn">
                <span className="stuSch__icon">👨‍🏫</span>
                <div className="stuSch__infoText">
                  <div className="stuSch__infoLabel">Instructor</div>
                  <div className="stuSch__infoValue">{schedule.instructorName}</div>
                </div>
              </div>
              <div className="stuSch__infoColumn">
                <span className="stuSch__icon">🚗</span>
                <div className="stuSch__infoText">
                  <div className="stuSch__infoLabel">Vehicle</div>
                  <div className="stuSch__infoValue">{schedule.vehicleText}</div>
                </div>
              </div>
            </div>

            <div className="stuSch__cardRightSection">
              <div className={`stuSch__vehicleTypePill ${schedule.vehicleType.toLowerCase()}`}>
                {schedule.vehicleType}
              </div>
              <div className={`stuSch__statusPill ${schedule.status.toLowerCase()}`}>
                {schedule.status}
              </div>
              {schedule.status === "Scheduled" && (
                <a href="#reschedule" className="stuSch__rescheduleLink">
                  Reschedule
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
