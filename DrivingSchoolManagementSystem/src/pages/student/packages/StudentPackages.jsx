import React, { useState } from 'react';
import './studentPackages.css';

export default function StudentPackages() {
  const [selectedPackage, setSelectedPackage] = useState(null);

  const packages = [
    {
      id: 1,
      name: 'Van Package',
      price: '10,000',
      description: 'Van training only',
      icon: '🚐',
      sessions: [
        { name: 'Motorcycle / Bike', count: '' },
        { name: 'Three Wheeler', count: '' },
        { name: 'Van', count: '' },
      ],
      isNew: false,
    },
    {
      id: 2,
      name: 'Beginner Package',
      price: '45,000',
      description: 'Perfect for new drivers',
      icon: '🚗',
      sessions: [
        { name: 'Motorcycle / Bike', count: '' },
        { name: 'Three Wheeler', count: '' },
        { name: 'Van', count: '' },
      ],
      isNew: true,
    },
    {
      id: 3,
      name: 'Premium Package',
      price: '55,000',
      description: 'Comprehensive training package',
      icon: '👑',
      sessions: [
        { name: 'Motorcycle / Bike', count: '' },
        { name: 'Three Wheeler', count: '' },
        { name: 'Van', count: '' },
      ],
      isNew: false,
    },
  ];

  const handleSelectPackage = (pkg) => {
    setSelectedPackage(pkg);
  };

  return (
    <div className="stu-packagesPage">
      <div className="stu-packagesPageHeader">
        <h1>Available Packages</h1>
      </div>

      {/* Header Card */}
      <div className="stu-packagesHeaderCard">
        <h2>Available Packages</h2>
        <p>Choose the right driving package for you</p>
      </div>

      {/* Packages Grid */}
      <div className="stu-packagesContainer">
        {packages.map(pkg => (
          <div key={pkg.id} className="stu-packageCard">
            {pkg.isNew && <div className="stu-newBadge">New one</div>}
            
            <div className="stu-packageIconTile">{pkg.icon}</div>
            
            <div className="stu-packagePrice">
              <span className="stu-currency">Rs.</span>
              <span className="stu-amount">{pkg.price}</span>
            </div>
            
            <h3 className="stu-packageName">{pkg.name}</h3>
            <p className="stu-packageDesc">{pkg.description}</p>

            {/* Detailed Information Section */}
            <div className="stu-detailedInfo">
              <h4 className="stu-sectionHeading">Detailed Information</h4>
              <p className="stu-sectionSubheading">Included Training Sessions</p>
              
              <div className="stu-sessionsList">
                {pkg.sessions.map((session, idx) => (
                  <div key={idx} className="stu-sessionItem">
                    <span className="stu-sessionTick">✓</span>
                    <span className="stu-sessionName">{session.name}</span>
                  </div>
                ))}
              </div>
            </div>

            <button 
              className="stu-selectBtn"
              onClick={() => handleSelectPackage(pkg)}
            >
              <span className="stu-btnIcon">✓</span>
              Select Package
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
