import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { divIcon } from 'leaflet';
import { renderToStaticMarkup } from 'react-dom/server';
import { MapPin, AlertCircle, CheckCircle, Flame } from 'lucide-react';

const iconMarkup = renderToStaticMarkup(<div className="text-green-400 drop-shadow-[0_0_8px_rgba(74,222,128,0.8)]"><MapPin size={32} fill="currentColor" /></div>);
const customMarkerIcon = divIcon({
    html: iconMarkup,
    className: 'custom-marker-icon',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
});

const REPORTS = [
    { id: 1, lat: 15.39, lng: 73.81, category: 'Garbage', authority: 'MMC', status: 'Pending' },
    { id: 2, lat: 15.28, lng: 73.98, category: 'Roads', authority: 'PWD', status: 'Resolved' },
    { id: 3, lat: 15.50, lng: 73.82, category: 'Electricity', authority: 'Electricity Dept', status: 'In Progress' },
];

const Home = () => {
    const position = [15.3911, 73.8782];

    return (
        <div className="h-full w-full relative">
            {/* Header */}
            <div className="absolute top-0 left-0 right-0 z-[400] p-4 bg-gradient-to-b from-slate-900/95 via-slate-900/80 to-transparent">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent">Amche Goa</h1>
                <p className="text-sm text-white/50">Live Civic Issues Map</p>
            </div>

            {/* Map */}
            <MapContainer center={position} zoom={11} style={{ height: "100%", width: "100%", zIndex: 0 }} zoomControl={false}>
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
                />

                {REPORTS.map(report => (
                    <Marker key={report.id} position={[report.lat, report.lng]} icon={customMarkerIcon}>
                        <Popup>
                            <div className="p-1 bg-slate-800 text-white rounded-lg">
                                <h3 className="font-bold text-sm">{report.category}</h3>
                                <div className="text-xs text-white/60">{report.authority}</div>
                                <div className={`mt-1 text-xs font-semibold px-2 py-0.5 rounded-full inline-block ${report.status === 'Resolved' ? 'bg-green-500/20 text-green-400' :
                                    report.status === 'Pending' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'
                                    }`}>
                                    {report.status}
                                </div>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>

            {/* Stats Panel - Left Side */}
            <div className="absolute top-24 left-4 z-[400] w-36 space-y-3">
                <div className="glass-card p-4 group hover:bg-white/10 transition-colors">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                            <AlertCircle className="w-5 h-5 text-green-400" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-white">128</div>
                            <div className="text-[10px] uppercase font-semibold text-white/40 tracking-wider">Active</div>
                        </div>
                    </div>
                </div>

                <div className="glass-card p-4 group hover:bg-white/10 transition-colors">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                            <CheckCircle className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-white">42</div>
                            <div className="text-[10px] uppercase font-semibold text-white/40 tracking-wider">Resolved</div>
                        </div>
                    </div>
                </div>

                <div className="glass-card p-4 group hover:bg-white/10 transition-colors border-red-500/20">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
                            <Flame className="w-5 h-5 text-red-400" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-white">3</div>
                            <div className="text-[10px] uppercase font-semibold text-white/40 tracking-wider">Emergency</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;
