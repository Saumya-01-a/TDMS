import React from 'react';
import StudyMaterialsHub from '../../../components/materials/StudyMaterialsHub';

export default function InstructorStudyMaterials() {
  return (
    <div className="instructor-page-content">
      <StudyMaterialsHub isAdmin={false} />
    </div>
  );
}
