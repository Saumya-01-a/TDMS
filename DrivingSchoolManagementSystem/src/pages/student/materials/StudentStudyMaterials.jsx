import React from 'react';
import StudyMaterialsHub from '../../../components/materials/StudyMaterialsHub';

export default function StudentStudyMaterials() {
  return (
    <div className="student-page-content">
      <StudyMaterialsHub isAdmin={false} />
    </div>
  );
}
