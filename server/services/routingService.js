const { calculateHaversineDistance, calculateEstimatedTravelTime, generateRouteCoordinates } = require('../utils/distance');

/**
 * Modular Routing Service
 * Abstracted routing provider: Currently computes accurate Haversine distance,
 * realistic urban travel ETA and intermediate polyline waypoints.
 * Can be swapped with OSRM (Open Source Routing Machine) or Google Directions API.
 */
class RoutingService {
  /**
   * Computes route details between origin and destination
   * @param {{ latitude: number, longitude: number, address: string }} origin 
   * @param {{ latitude: number, longitude: number, address: string }} destination 
   * @returns {Promise<object>}
   */
  static async calculateRoute(origin, destination) {
    const distanceKm = calculateHaversineDistance(
      origin.latitude,
      origin.longitude,
      destination.latitude,
      destination.longitude
    );

    const estimatedMinutes = calculateEstimatedTravelTime(distanceKm);

    const waypoints = generateRouteCoordinates(
      [origin.latitude, origin.longitude],
      [destination.latitude, destination.longitude]
    );

    return {
      distanceKm,
      estimatedMinutes,
      waypoints,
      origin: {
        address: origin.address,
        coordinates: [origin.latitude, origin.longitude]
      },
      destination: {
        address: destination.address,
        coordinates: [destination.latitude, destination.longitude]
      },
      provider: 'Haversine Urban Matrix (Configurable to OSRM/Google)'
    };
  }
}

module.exports = RoutingService;
