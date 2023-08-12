declare module 'gps-distance' {
  
    function calculateDistance(
        prv_latitude: number,
        prv_longitude: number,
        current_latitude: number,
        current_longitude: number,
    ): number;
  
    export = calculateDistance;
  }
  