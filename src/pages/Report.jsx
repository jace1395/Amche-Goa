import { useState, useRef, useCallback, useEffect } from 'react';
import { Camera, Send, AlertTriangle, MapPin, CheckCircle, Image as ImageIcon, X, AlertCircle, Navigation, Loader2 } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { validateImage, getWarningCount, addWarning } from '../services/GeminiService';
import { getCurrentLocation, determineAuthority } from '../services/LocationRouter';
import { useUI } from '../context/UIContext';

// Fix Leaflet default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// EXIF Parser
const getExifData = (file) => {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const view = new DataView(e.target.result);
                if (view.getUint16(0, false) !== 0xFFD8) {
                    resolve({ hasExif: false });
                    return;
                }
                let offset = 2;
                while (offset < view.byteLength) {
                    if (view.getUint16(offset, false) === 0xFFE1) {
                        resolve({ hasExif: true });
                        return;
                    }
                    offset += 2 + view.getUint16(offset + 2, false);
                }
                resolve({ hasExif: false });
            } catch {
                resolve({ hasExif: false });
            }
        };
        reader.onerror = () => resolve({ hasExif: false });
        reader.readAsArrayBuffer(file);
    });
};

const Report = () => {
    const [image, setImage] = useState(null);
    const [file, setFile] = useState(null);
    const [status, setStatus] = useState('idle');
    const [result, setResult] = useState(null);
    const [reportData, setReportData] = useState(null);
    const [showCamera, setShowCamera] = useState(false);
    const [cameraReady, setCameraReady] = useState(false);
    const [warningCount, setWarningCount] = useState(getWarningCount());
    const [userLocation, setUserLocation] = useState(null);
    const [locationStatus, setLocationStatus] = useState('idle');
    const videoRef = useRef(null);
    const streamRef = useRef(null);
    const { setHideNav } = useUI();

    // Fetch location
    const fetchUserLocation = useCallback(async () => {
        setLocationStatus('fetching');
        try {
            const location = await getCurrentLocation();
            setUserLocation(location);
            setLocationStatus('success');
            return location;
        } catch (err) {
            console.error('Location error:', err);
            setLocationStatus('error');
            return null;
        }
    }, []);

    useEffect(() => {
        fetchUserLocation();
    }, [fetchUserLocation]);

    const closeCamera = useCallback(() => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        setShowCamera(false);
        setCameraReady(false);
        setHideNav(false);
    }, [setHideNav]);

    const openWebcam = useCallback(async () => {
        try {
            setShowCamera(true);
            setHideNav(true);
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
            });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.onloadedmetadata = () => {
                    videoRef.current.play();
                    setCameraReady(true);
                };
            }
        } catch (err) {
            console.error('Camera error:', err);
            alert('Camera access denied.');
            setShowCamera(false);
            setHideNav(false);
        }
    }, [setHideNav]);

    const capturePhoto = useCallback(() => {
        if (videoRef.current && cameraReady) {
            const canvas = document.createElement('canvas');
            canvas.width = videoRef.current.videoWidth || 640;
            canvas.height = videoRef.current.videoHeight || 480;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
            canvas.toBlob((blob) => {
                if (blob) {
                    const capturedFile = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' });
                    setFile(capturedFile);
                    setImage(canvas.toDataURL('image/jpeg'));
                    fetchUserLocation();
                }
                closeCamera();
            }, 'image/jpeg', 0.9);
        }
    }, [cameraReady, closeCamera, fetchUserLocation]);

    useEffect(() => {
        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    useEffect(() => {
        const handleReset = () => {
            setImage(null);
            setFile(null);
            setStatus('idle');
            setResult(null);
            setReportData(null);
            setWarningCount(getWarningCount());
            closeCamera();
        };
        window.addEventListener('resetReport', handleReset);
        return () => window.removeEventListener('resetReport', handleReset);
    }, [closeCamera]);

    const handleFileSelect = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            const reader = new FileReader();
            reader.onloadend = () => setImage(reader.result);
            reader.readAsDataURL(selectedFile);
            setStatus('idle');
            setResult(null);
            fetchUserLocation();
        }
    };

    const saveReportToHistory = (data) => {
        const history = JSON.parse(localStorage.getItem('reports') || '[]');
        const newReport = { ...data, timestamp: new Date().toISOString(), id: Date.now() };
        localStorage.setItem('reports', JSON.stringify([...history, newReport]));
    };

    const handleSubmit = async () => {
        if (!file) return;

        try {
            setStatus('analyzing');

            const location = userLocation || await fetchUserLocation();
            if (!location) {
                setResult({ isValid: false, description: '📍 Could not get your location. Please enable GPS.' });
                setStatus('invalid');
                return;
            }

            const metadata = await getExifData(file);
            console.log('Metadata:', metadata);

            const validation = await validateImage(file, '');
            console.log('Validation:', validation);

            if (validation.isAiGenerated) {
                const warningResult = addWarning(1);
                setResult({
                    isValid: false,
                    isAiGenerated: true,
                    description: '🤖 Invalid! AI-generated image detected.',
                    warningCount: warningResult.warnings
                });
                setStatus('invalid');
                setWarningCount(warningResult.warnings);
                saveReportToHistory({
                    category: 'AI Image',
                    description: 'AI-generated image rejected',
                    authority: 'Rejected',
                    status: 'rejected',
                    lat: location.lat,
                    lng: location.lng
                });
                return;
            }

            setResult(validation);
            if (validation.warningCount !== undefined) setWarningCount(validation.warningCount);

            if (!validation.isValid) {
                setStatus('invalid');
                saveReportToHistory({
                    category: validation.category || 'Invalid',
                    description: validation.description || 'Validation Failed',
                    authority: 'Rejected',
                    status: 'rejected',
                    lat: location.lat,
                    lng: location.lng
                });
                return;
            }

            if (['Fire', 'Police', 'Accident'].includes(validation.category)) {
                setStatus('emergency');
                const emergencyData = {
                    category: validation.category,
                    authority: 'Emergency Services',
                    lat: location.lat,
                    lng: location.lng,
                    description: validation.description || 'Emergency Detected',
                    status: 'emergency'
                };
                setReportData(emergencyData);
                saveReportToHistory(emergencyData);
                return;
            }

            const authority = determineAuthority(location.lat, location.lng, validation.category);
            const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
            currentUser.points = (currentUser.points || 0) + 50;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            window.dispatchEvent(new Event('userUpdated'));

            const finalData = {
                category: validation.category,
                description: validation.description,
                authority,
                lat: location.lat,
                lng: location.lng,
                status: 'approved',
                pointsEarned: 50
            };
            setReportData(finalData);
            saveReportToHistory(finalData);
            setStatus('success');
        } catch (error) {
            console.error(error);
            setStatus('error');
        }
    };

    const resetReport = () => {
        setImage(null);
        setFile(null);
        setStatus('idle');
        setResult(null);
        setReportData(null);
        setWarningCount(getWarningCount());
    };

    return (
        <div className="min-h-screen pb-28">
            {/* Header */}
            <div className="p-6 pt-10">
                <h1 className="text-2xl font-bold text-center mb-2">
                    <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-green-400 bg-clip-text text-transparent">
                        Report Issue
                    </span>
                </h1>
                <p className="text-white/40 text-center text-sm">Capture or upload a civic issue</p>
            </div>

            {/* Location Card */}
            <div className="px-4 mb-4">
                <div className="glass-card p-4">
                    <div className="flex items-center gap-3 mb-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${userLocation ? 'bg-green-500/20' : 'bg-yellow-500/20'}`}>
                            {locationStatus === 'fetching' ? (
                                <Loader2 className="w-5 h-5 text-yellow-400 animate-spin" />
                            ) : (
                                <Navigation className={`w-5 h-5 ${userLocation ? 'text-green-400' : 'text-yellow-400'}`} />
                            )}
                        </div>
                        <div className="flex-1">
                            <p className="text-xs text-white/50 uppercase tracking-wide">Live Location</p>
                            {userLocation ? (
                                <p className="text-sm font-medium text-white">
                                    {userLocation.lat.toFixed(5)}, {userLocation.lng.toFixed(5)}
                                </p>
                            ) : (
                                <p className="text-sm text-yellow-400">
                                    {locationStatus === 'fetching' ? 'Getting location...' : 'Location unavailable'}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Map */}
                    {userLocation && (
                        <div className="rounded-xl overflow-hidden h-32 border border-white/10">
                            <MapContainer
                                center={[userLocation.lat, userLocation.lng]}
                                zoom={15}
                                style={{ height: '100%', width: '100%' }}
                                zoomControl={false}
                                attributionControl={false}
                            >
                                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                <Marker position={[userLocation.lat, userLocation.lng]}>
                                    <Popup>Your Location</Popup>
                                </Marker>
                            </MapContainer>
                        </div>
                    )}
                </div>
            </div>

            {/* Image Section */}
            <div className="px-4 mb-4">
                {!image ? (
                    <div className="grid grid-cols-2 gap-4">
                        <button
                            onClick={openWebcam}
                            className="glass-card p-6 flex flex-col items-center justify-center gap-3 hover:bg-white/10 transition-all active:scale-95 border-2 border-transparent hover:border-blue-500/30"
                        >
                            <div className="w-16 h-16 rounded-2xl bg-blue-500/20 flex items-center justify-center">
                                <Camera className="w-8 h-8 text-blue-400" />
                            </div>
                            <span className="font-semibold text-white/90">Camera</span>
                        </button>

                        <label className="glass-card p-6 flex flex-col items-center justify-center gap-3 hover:bg-white/10 transition-all active:scale-95 cursor-pointer border-2 border-transparent hover:border-purple-500/30">
                            <div className="w-16 h-16 rounded-2xl bg-purple-500/20 flex items-center justify-center">
                                <ImageIcon className="w-8 h-8 text-purple-400" />
                            </div>
                            <span className="font-semibold text-white/90">Gallery</span>
                            <input type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
                        </label>
                    </div>
                ) : (
                    <div className="glass-card overflow-hidden relative">
                        <img src={image} alt="Preview" className="w-full h-56 object-cover" />
                        <button
                            onClick={resetReport}
                            className="absolute top-3 right-3 w-10 h-10 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center text-white hover:bg-red-500 transition-colors"
                        >
                            <X size={20} />
                        </button>
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                            <p className="text-white/80 text-sm">Image ready for analysis</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Status Cards */}
            <div className="px-4 space-y-4">
                {status === 'analyzing' && (
                    <div className="glass-card p-4 border border-blue-500/30">
                        <div className="flex items-center gap-3">
                            <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
                            <span className="text-blue-400 font-medium">Analyzing with Gemini AI...</span>
                        </div>
                    </div>
                )}

                {status === 'invalid' && result && (
                    <div className="glass-card p-5 border border-red-500/30 bg-red-500/5">
                        <div className="flex items-center gap-2 mb-3">
                            {result.isAiGenerated ? (
                                <AlertCircle className="w-6 h-6 text-red-400" />
                            ) : (
                                <AlertTriangle className="w-6 h-6 text-red-400" />
                            )}
                            <span className="font-bold text-red-400 text-lg">
                                {result.isAiGenerated ? 'AI Image Detected!' : 'Invalid Report'}
                            </span>
                        </div>
                        <p className="text-white/70 mb-3">{result.description}</p>
                        {result.warningCount > 0 && (
                            <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-2 mb-3">
                                <p className="text-orange-400 text-sm">⚠️ Warning {result.warningCount}/3</p>
                            </div>
                        )}
                        <button onClick={resetReport} className="text-blue-400 text-sm font-medium hover:underline">
                            Try Again →
                        </button>
                    </div>
                )}

                {status === 'success' && reportData && (
                    <div className="glass-card p-5 border border-green-500/30 bg-green-500/5">
                        <div className="flex items-center gap-2 mb-4">
                            <CheckCircle className="w-6 h-6 text-green-400" />
                            <span className="font-bold text-green-400 text-lg">Report Filed!</span>
                        </div>
                        <div className="space-y-3">
                            <div className="flex justify-between py-2 border-b border-white/10">
                                <span className="text-white/50">Category</span>
                                <span className="font-semibold text-white">{reportData.category}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-white/10">
                                <span className="text-white/50">Authority</span>
                                <span className="font-semibold text-white">{reportData.authority}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-white/10">
                                <span className="text-white/50">Location</span>
                                <span className="font-mono text-white/80 text-xs">
                                    {reportData.lat?.toFixed(4)}, {reportData.lng?.toFixed(4)}
                                </span>
                            </div>
                        </div>
                        <div className="mt-4 text-center">
                            <span className="text-green-400 font-bold text-lg">+50 Points 🎉</span>
                        </div>
                    </div>
                )}

                {status === 'emergency' && reportData && (
                    <div className="glass-card p-5 border-2 border-red-500/50 bg-red-500/10 animate-pulse">
                        <div className="flex items-center gap-2 mb-3">
                            <AlertTriangle className="w-6 h-6 text-red-400" />
                            <span className="font-bold text-red-400 text-lg">EMERGENCY</span>
                        </div>
                        <p className="text-white/80 mb-2">Alerting {reportData.authority}!</p>
                        <p className="text-white/50 text-xs font-mono">
                            📍 {reportData.lat?.toFixed(4)}, {reportData.lng?.toFixed(4)}
                        </p>
                    </div>
                )}
            </div>

            {/* Submit Button */}
            {image && status !== 'success' && status !== 'emergency' && (
                <div className="px-4 mt-6">
                    <button
                        onClick={handleSubmit}
                        disabled={status === 'analyzing'}
                        className="w-full py-4 rounded-2xl font-bold text-white bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 disabled:from-gray-600 disabled:to-gray-700 shadow-lg shadow-green-500/20 flex items-center justify-center gap-2 transition-all active:scale-95"
                    >
                        {status === 'analyzing' ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <Send className="w-5 h-5" />
                        )}
                        {status === 'analyzing' ? 'Analyzing...' : 'Submit Report'}
                    </button>
                    <button onClick={resetReport} className="w-full mt-3 py-2 text-white/50 hover:text-white/80 transition-colors">
                        Cancel
                    </button>
                </div>
            )}

            {/* Camera Overlay - Full Screen */}
            {showCamera && (
                <div className="fixed inset-0 z-[9999] bg-black flex flex-col">
                    {/* Video Container */}
                    <div className="flex-1 flex items-center justify-center relative">
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            className="w-full h-full object-cover"
                        />
                        {!cameraReady && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black">
                                <Loader2 className="w-12 h-12 text-white animate-spin" />
                            </div>
                        )}
                    </div>

                    {/* Camera Controls - Fixed at bottom with safe area */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-transparent pb-10 pt-16">
                        <div className="flex items-center justify-center gap-12">
                            {/* Close Button */}
                            <button
                                onClick={closeCamera}
                                className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center active:scale-90 transition-transform"
                            >
                                <X className="w-7 h-7 text-white" />
                            </button>

                            {/* Capture Button */}
                            <button
                                onClick={capturePhoto}
                                disabled={!cameraReady}
                                className="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.5)] disabled:opacity-40 active:scale-90 transition-transform"
                            >
                                <div className="w-16 h-16 rounded-full border-4 border-gray-400"></div>
                            </button>

                            {/* Spacer for symmetry */}
                            <div className="w-14 h-14"></div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Report;
