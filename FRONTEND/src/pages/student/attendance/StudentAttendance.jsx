import React, { useState } from 'react';
import './studentAttendance.css';

export default function StudentAttendance() {
  const [currentPage, setCurrentPage] = useState(1);

  const summaryStats = [
    { id: 1, label: 'Present', value: 15, borderColor: '#22c55e' },
    { id: 2, label: 'Absent', value: 2, borderColor: '#ef4444' },
    { id: 3, label: 'Late', value: 1, borderColor: '#eab308' },
    { id: 4, label: 'Upcoming', value: 3, borderColor: '#9ca3af' },
  ];

  const attendanceRecords = [
    { id: 1, date: '2026-01-20', session: 'City Driving', time: '10:00 AM', instructor: 'Ahmed Hassan', status: 'present' },
    { id: 2, date: '2026-01-18', session: 'Highway Driving', time: '2:30 PM', instructor: 'Sarah Williams', status: 'present' },
    { id: 3, date: '2026-01-16', session: 'Parking', time: '9:00 AM', instructor: 'Ahmed Hassan', status: 'late' },
    { id: 4, date: '2026-01-15', session: 'Traffic Rules', time: '3:00 PM', instructor: 'Michael Chen', status: 'absent' },
    { id: 5, date: '2026-01-14', session: 'City Driving', time: '10:00 AM', instructor: 'Ahmed Hassan', status: 'present' },
    { id: 6, date: '2026-01-12', session: 'Emergency Procedures', time: '2:00 PM', instructor: 'Sarah Williams', status: 'present' },
    { id: 7, date: '2026-01-10', session: 'City Driving', time: '9:00 AM', instructor: 'Ahmed Hassan', status: 'present' },
    { id: 8, date: '2026-01-08', session: 'Vehicle Operation', time: '1:00 PM', instructor: 'Michael Chen', status: 'present' },
    { id: 9, date: '2026-01-05', session: 'Road Signs', time: '11:00 AM', instructor: 'Sarah Williams', status: 'present' },
  ];

  const recordsPerPage = 5;
  const totalRecords = attendanceRecords.length;
  const startRecord = (currentPage - 1) * recordsPerPage + 1;
  const endRecord = Math.min(currentPage * recordsPerPage, totalRecords);
  const totalPages = Math.ceil(totalRecords / recordsPerPage);
  const paginatedData = attendanceRecords.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage
  );

  const getStatusBadge = (status) => {
    const statusMap = {
      present: { text: 'Present', class: 'stu-status-present' },
      absent: { text: 'Absent', class: 'stu-status-absent' },
      late: { text: 'Late', class: 'stu-status-late' },
    };
    return statusMap[status] || statusMap.present;
  };

  return (
    <div className="stu-attendancePageWrapper">
      <h1 className="stu-pageTitle">Attendance</h1>

      {/* Summary Cards */}
      <div className="stu-summaryCardsContainer">
        {summaryStats.map(stat => (
          <div key={stat.id} className="stu-summaryCard" style={{ borderLeftColor: stat.borderColor }}>
            <div className="stu-summaryLabel">{stat.label}</div>
            <div className="stu-summaryValue">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Attendance Label */}
      <div className="stu-attendanceLabelBar">
        Daniel Grant's Attendance
      </div>

      {/* Attendance Table Card */}
      <div className="stu-attendanceTableCard">
        <div className="stu-tableHeader">Attendance Records</div>

        <table className="stu-attendanceTable">
          <thead>
            <tr>
              <th>DATE</th>
              <th>SESSION TYPE</th>
              <th>TIME</th>
              <th>INSTRUCTOR</th>
              <th>STATUS</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map(record => {
              const statusInfo = getStatusBadge(record.status);
              return (
                <tr key={record.id}>
                  <td>{record.date}</td>
                  <td>{record.session}</td>
                  <td>{record.time}</td>
                  <td>{record.instructor}</td>
                  <td>
                    <span className={`stu-statusBadge ${statusInfo.class}`}>
                      {statusInfo.text}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Table Footer */}
        <div className="stu-tableFooter">
          <div className="stu-recordsCount">
            Showing {startRecord} to {endRecord} of {totalRecords} records
          </div>

          <div className="stu-paginationControls">
            <button
              className="stu-paginationBtn stu-prevBtn"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <button
              className="stu-paginationBtn stu-nextBtn"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
