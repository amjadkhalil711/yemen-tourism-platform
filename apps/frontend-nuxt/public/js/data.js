// Legacy compatibility shim.
// Some old pages include js/data.js. Reuse the same landmarks source.
window.citiesData = window.updatedLandmarksData || window.completeLandmarksData || {};
