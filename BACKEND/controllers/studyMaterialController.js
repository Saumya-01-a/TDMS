const pool = require('../config/db');
const fs = require('fs');
const path = require('path');

// Category mapping helper between slug enums and UI labels
const CATEGORY_MAP = {
  'road_signs': 'Road Signs',
  'traffic_rules': 'Traffic Rules',
  'vehicle_operation': 'Vehicle Operation',
  'past_papers': 'Past Papers',
  'Road Signs': 'road_signs',
  'Traffic Rules': 'traffic_rules',
  'Vehicle Operation': 'vehicle_operation',
  'Past Papers': 'past_papers',
};

const normalizeCategory = (cat) => {
  if (!cat) return 'road_signs';
  const trimmed = cat.trim();
  if (['road_signs', 'traffic_rules', 'vehicle_operation', 'past_papers'].includes(trimmed)) {
    return trimmed;
  }
  if (CATEGORY_MAP[trimmed]) {
    return CATEGORY_MAP[trimmed];
  }
  // Convert "Road Signs" -> "road_signs"
  const slug = trimmed.toLowerCase().replace(/\s+/g, '_');
  if (['road_signs', 'traffic_rules', 'vehicle_operation', 'past_papers'].includes(slug)) {
    return slug;
  }
  return 'road_signs';
};

const getDisplayCategory = (cat) => {
  if (!cat) return 'Road Signs';
  return CATEGORY_MAP[cat] || cat;
};

// Formats bytes to readable string (e.g. 2.4 MB)
const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

// Format record for API response (both camelCase and snake_case for maximum compatibility)
const formatMaterialRecord = (row, req) => {
  const displayCat = getDisplayCategory(row.category);
  const slugCat = normalizeCategory(row.category);
  
  // Format URL if relative
  let fileUrl = row.file_url;
  if (fileUrl && fileUrl.startsWith('/') && req) {
    fileUrl = `${req.protocol}://${req.get('host')}${fileUrl}`;
  }

  return {
    id: row.id,
    _id: row.id,
    material_id: row.id,
    title: row.title,
    description: row.description || '',
    category: displayCat,
    categorySlug: slugCat,
    fileUrl: fileUrl,
    file_url: fileUrl,
    fileType: row.file_type || 'application/pdf',
    file_type: row.file_type || 'application/pdf',
    fileSize: row.file_size || 'Unknown',
    file_size: row.file_size || 'Unknown',
    createdAt: row.created_at,
    created_at: row.created_at,
    upload_date: row.created_at
  };
};

/**
 * POST /api/study-materials
 * Accepts multipart/form-data: title, description, category, and file
 */
exports.uploadStudyMaterial = async (req, res) => {
  try {
    const { title, description, category } = req.body;
    const file = req.file;

    if (!title || !title.trim()) {
      return res.status(400).json({ ok: false, message: 'Document Title is required.' });
    }

    if (!file) {
      return res.status(400).json({ ok: false, message: 'A document file (PDF or image) is required.' });
    }

    const normCategory = normalizeCategory(category);
    const host = req.get('host');
    const protocol = req.protocol;
    const fileUrl = `${protocol}://${host}/uploads/materials/${file.filename}`;
    const fileSizeFormatted = formatFileSize(file.size);
    const fileType = file.mimetype || path.extname(file.originalname).substring(1);

    const query = `
      INSERT INTO study_materials (title, description, category, file_url, file_type, file_size)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `;

    const result = await pool.query(query, [
      title.trim(),
      description ? description.trim() : '',
      normCategory,
      fileUrl,
      fileType,
      fileSizeFormatted
    ]);

    const formatted = formatMaterialRecord(result.rows[0], req);

    res.status(201).json({
      ok: true,
      message: 'Study material uploaded successfully!',
      data: formatted,
      material: formatted
    });
  } catch (err) {
    console.error('❌ Study Material Upload Error:', err);
    res.status(500).json({ ok: false, message: 'Server failed to save document: ' + err.message });
  }
};

/**
 * GET /api/study-materials?category={category}&search={query}
 * Fetches filtered materials by category tab and search input
 */
exports.getStudyMaterials = async (req, res) => {
  try {
    const { category, search } = req.query;
    let query = 'SELECT * FROM study_materials WHERE 1=1';
    const params = [];

    // Filter by category if specified and not 'all'
    if (category && category !== 'all' && category !== 'All') {
      const slug = normalizeCategory(category);
      const display = getDisplayCategory(category);
      params.push(slug, display);
      query += ` AND (category = $${params.length - 1} OR category = $${params.length})`;
    }

    // Filter by search query if provided
    if (search && search.trim()) {
      params.push(`%${search.trim()}%`);
      query += ` AND (title ILIKE $${params.length} OR description ILIKE $${params.length})`;
    }

    query += ' ORDER BY created_at DESC;';

    const result = await pool.query(query, params);
    const items = result.rows.map(row => formatMaterialRecord(row, req));

    res.json({
      ok: true,
      count: items.length,
      data: items,
      materials: items
    });
  } catch (err) {
    console.error('❌ Study Materials Query Error:', err);
    res.status(500).json({ ok: false, message: 'Failed to retrieve study materials: ' + err.message });
  }
};

/**
 * DELETE /api/study-materials/:id
 * Removes the document record and deletes the physical file
 */
exports.deleteStudyMaterial = async (req, res) => {
  try {
    const { id } = req.params;

    const findResult = await pool.query('SELECT * FROM study_materials WHERE id = $1', [id]);
    if (findResult.rowCount === 0) {
      return res.status(404).json({ ok: false, message: 'Document not found or already deleted.' });
    }

    const doc = findResult.rows[0];

    // Attempt to delete physical file from uploads/materials if local
    if (doc.file_url) {
      try {
        const urlParts = doc.file_url.split('/uploads/materials/');
        if (urlParts.length > 1) {
          const filename = urlParts[1];
          const localPath = path.join(__dirname, '../uploads/materials', filename);
          if (fs.existsSync(localPath)) {
            fs.unlinkSync(localPath);
            console.log(`🗑️ Removed local file: ${localPath}`);
          }
        }
      } catch (fileErr) {
        console.warn('⚠️ Warning: File unlink error (non-fatal):', fileErr.message);
      }
    }

    // Delete record from database
    await pool.query('DELETE FROM study_materials WHERE id = $1', [id]);

    res.json({
      ok: true,
      message: 'Study material permanently deleted.'
    });
  } catch (err) {
    console.error('❌ Study Material Deletion Error:', err);
    res.status(500).json({ ok: false, message: 'Failed to delete study material: ' + err.message });
  }
};

