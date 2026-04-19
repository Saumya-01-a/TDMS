import React from 'react';
import StudyMaterialsHub from '../../../components/materials/StudyMaterialsHub';

export default function AdminStudyMaterials() {
  return (
    <div className="admin-page-content">
      <StudyMaterialsHub isAdmin={true} />
    </div>
  );
}
