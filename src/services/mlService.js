// Dummy ML Service abstraction. Replace implementations to call your Python ML service via REST/gRPC.

/**
 * Calculate risk prediction based on sensor data
 * @param {Array} sensorData - Array of sensor readings
 * @returns {Object} Risk level and score
 */
async function getRiskPrediction(sensorData = []) {
  // Simple heuristic dummy: more offline/critical sensors -> higher risk.
  let score = 0.2;
  const total = sensorData.length || 1;
  const offline = sensorData.filter((s) => s.status === 'offline').length;
  const critical = sensorData.filter((s) => s.health === 'critical').length;
  score = Math.min(1, 0.2 + offline / total * 0.4 + critical / total * 0.4);

  let level = 'low';
  if (score >= 0.8) level = 'critical';
  else if (score >= 0.6) level = 'high';
  else if (score >= 0.4) level = 'medium';

  return { level, score };
}

/**
 * Generate GeoJSON overlay for map visualization
 * @param {Object} bounds - Optional map bounds for filtering
 * @returns {Object} GeoJSON feature collection
 */
async function getRiskOverlay(bounds = null) {
  // Return a dummy geo overlay structure
  return {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: { risk: 'medium' },
        geometry: { type: 'Polygon', coordinates: [[[0, 0],[0, 1],[1, 1],[1, 0],[0, 0]]] },
      },
    ],
  };
}

module.exports = { getRiskPrediction, getRiskOverlay };
