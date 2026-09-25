/**
 * Distance and Routing Utilities
 * Implements the Haversine formula for spherical distance between two geospatial coordinates.
 * Structured modularly so Google Maps Distance Matrix or OSRM can be plugged in.
 */

const toRadians = (degrees) => (degrees * Math.PI) / 180;

/**
 * Calculates great-circle distance between two points in kilometers
 * @param {number} lat1 
 * @param {number} lon1 
 * @param {number} lat2 
 * @param {number} lon2 
 * @returns {number} distance in kilometers (rounded to 2 decimal places)
 */
const calculateHaversineDistance = (lat1, lon1, lat2, lon2) => {
  if (lat1 === undefined || lon1 === undefined || lat2 === undefined || lon2 === undefined) {
    return 0;
  }

  const R = 6371; // Earth's mean radius in km
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance * 100) / 100;
};

/**
 * Calculates estimated travel time in minutes based on urban traffic conditions
 * Assumes average speed of 25 km/h in Indian urban areas plus 5 mins pickup buffer
 * @param {number} distanceKm 
 * @returns {number} estimated travel time in minutes
 */
const calculateEstimatedTravelTime = (distanceKm) => {
  const averageSpeedKmH = 25; // 25 km/h
  const travelTimeHours = distanceKm / averageSpeedKmH;
  const travelTimeMinutes = Math.ceil(travelTimeHours * 60);
  const handlingBuffer = 5; // 5 min handling buffer
  return Math.max(5, travelTimeMinutes + handlingBuffer);
};

/**
 * Generates intermediate waypoints between pickup and delivery for visual map route line
 * @param {[number, number]} start [lat, lng]
 * @param {[number, number]} end [lat, lng]
 * @returns {Array<[number, number]>}
 */
const generateRouteCoordinates = (start, end) => {
  if (!start || !end) return [];
  const [lat1, lng1] = start;
  const [lat2, lng2] = end;

  // Generate 5 intermediate waypoints with slight realistic urban curvature
  const points = [[lat1, lng1]];
  const steps = 4;
  for (let i = 1; i < steps; i++) {
    const fraction = i / steps;
    const midLat = lat1 + (lat2 - lat1) * fraction;
    const midLng = lng1 + (lng2 - lng1) * fraction;
    // slight natural offset
    const offset = Math.sin(fraction * Math.PI) * 0.002;
    points.push([midLat + offset, midLng - offset]);
  }
  points.push([lat2, lng2]);
  return points;
};

module.exports = {
  calculateHaversineDistance,
  calculateEstimatedTravelTime,
  generateRouteCoordinates
};
