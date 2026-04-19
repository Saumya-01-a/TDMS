import React from 'react';
import './studentProgress.css';

const StudentProgress = () => {
  // Overall progress data
  const overallProgress = {
    percentage: 65,
    completed: 65,
    total: 100
  };

  // Category progress data
  const categories = [
    {
      id: 1,
      name: 'Motorcycle (A1)',
      progress: [
        { label: 'Theory Classes', percentage: 75 },
        { label: 'Practical Training', percentage: 60 },
        { label: 'Trial Exams', percentage: 55 }
      ]
    },
    {
      id: 2,
      name: 'Car (B1)',
      progress: [
        { label: 'Theory Classes', percentage: 80 },
        { label: 'Practical Training', percentage: 65 },
        { label: 'Trial Exams', percentage: 50 }
      ]
    }
  ];

  // Recent activities
  const recentActivities = [
    { id: 1, title: 'Completed Theory Test', date: '2024-09-10', type: 'completed' },
    { id: 2, title: 'Scheduled Practical Session', date: '2024-09-08', type: 'scheduled' },
    { id: 3, title: 'Passed Trial Exam - Traffic Rules', date: '2024-09-05', type: 'passed' },
    { id: 4, title: 'Started New Module - Vehicle Operation', date: '2024-09-01', type: 'started' },
    { id: 5, title: 'Completed Driving Session', date: '2024-08-28', type: 'completed' }
  ];

  // Upcoming milestones
  const upcomingMilestones = [
    { id: 1, title: 'Trial Exam - Road Signs', date: '2024-10-15', status: 'upcoming' },
    { id: 2, title: 'Final Practical Assessment', date: '2024-10-20', status: 'upcoming' },
    { id: 3, title: 'Theory Revision Session', date: '2024-09-25', status: 'upcoming' },
    { id: 4, title: 'License Application Deadline', date: '2024-11-30', status: 'deadline' }
  ];

  const getActivityIcon = (type) => {
    switch (type) {
      case 'completed':
        return '✓';
      case 'scheduled':
        return '📅';
      case 'passed':
        return '🏆';
      case 'started':
        return '▶';
      default:
        return '•';
    }
  };

  return (
    <div className="stu-progressWrapper">
      {/* Overall Progress Banner */}
      <div className="stu-progressHeaderBanner">
        <div className="stu-bannerContent">
          <h1 className="stu-bannerTitle">Overall Progress</h1>
          <div className="stu-bannerProgressBar">
            <div className="stu-progressFill" style={{ width: `${overallProgress.percentage}%` }}></div>
          </div>
        </div>
        <div className="stu-bannerPercentage">
          <span className="stu-percentageValue">{overallProgress.percentage}%</span>
          <span className="stu-percentageLabel">Complete</span>
        </div>
      </div>

      {/* Category Cards */}
      <div className="stu-progressCardsContainer">
        {categories.map(category => (
          <div key={category.id} className="stu-progressCard">
            <h2 className="stu-cardTitle">{category.name}</h2>
            <div className="stu-cardProgressItems">
              {category.progress.map((item, index) => (
                <div key={index} className="stu-progressItem">
                  <div className="stu-itemLabelRow">
                    <span className="stu-itemLabel">{item.label}</span>
                    <span className="stu-itemPercentage">{item.percentage}%</span>
                  </div>
                  <div className="stu-itemProgressBar">
                    <div className="stu-itemProgressFill" style={{ width: `${item.percentage}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activities & Upcoming Milestones */}
      <div className="stu-progressBottomSection">
        {/* Recent Activities */}
        <div className="stu-recentActivitiesSection">
          <h2 className="stu-sectionTitle">Recent Activities</h2>
          <div className="stu-activitiesList">
            {recentActivities.map(activity => (
              <div key={activity.id} className={`stu-activityItem stu-activity-${activity.type}`}>
                <div className="stu-activityIcon">{getActivityIcon(activity.type)}</div>
                <div className="stu-activityContent">
                  <p className="stu-activityTitle">{activity.title}</p>
                  <p className="stu-activityDate">{activity.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Milestones */}
        <div className="stu-upcomingMilestonesSection">
          <h2 className="stu-sectionTitle">Upcoming Milestones</h2>
          <div className="stu-milestonesList">
            {upcomingMilestones.map(milestone => (
              <div key={milestone.id} className={`stu-milestoneItem stu-milestone-${milestone.status}`}>
                <div className="stu-milestoneLeft">
                  <p className="stu-milestoneTitle">{milestone.title}</p>
                  <p className="stu-milestoneDate">{milestone.date}</p>
                </div>
                <div className={`stu-milestoneBadge stu-milestoneBadge-${milestone.status}`}>
                  {milestone.status === 'deadline' ? '📌 Deadline' : '📍 Upcoming'}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProgress;
