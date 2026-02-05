export const determineAuthority = (latitude, longitude, category) => {
    // If category is not location-dependent assignment (like Police or Electricity), 
    // we might still return the specific station, but for this MVP we focus on Municipal vs PWD routing.

    if (category === 'Police' || category === 'Fire' || category === 'Electricity' || category === 'PWD' || category === 'Health') {
        return category; // These are state-wide or routed differently
    }

    // For 'Municipal' (Garbage), we route based on Location
    if (category === 'Municipal') {
        // Approx Latitudes: Vasco ~15.39, Margao ~15.27
        // We'll use a simple threshold or distance check.

        if (Math.abs(latitude - 15.39) < 0.05) {
            return 'MMC'; // Mormugao Municipal Council
        } else if (Math.abs(latitude - 15.27) < 0.05) {
            return 'Margao MC'; // Margao Municipal Council
        } else {
            return 'Local Panchayat'; // Fallback
        }
    }

    return 'Unknown Authority';
};

export const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error("Geolocation is not supported by your browser"));
        } else {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    resolve({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                },
                (error) => {
                    reject(error);
                }
            );
        }
    });
};
