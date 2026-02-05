import { Gift, Ticket, Car, Film } from 'lucide-react';

const Rewards = () => {
    const rewards = [
        { id: 1, title: 'Eco-Store Coupon', cost: 500, type: 'coupon', icon: Ticket },
        { id: 2, title: 'Fuel Discount (Rs. 50)', cost: 1000, type: 'fuel', icon: Car },
        { id: 3, title: 'Free Movie Ticket', cost: 1500, type: 'entertainment', icon: Film },
    ];

    return (
        <div className="p-4 pt-10 pb-28">
            <h1 className="text-2xl font-bold mb-2 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                    <Gift className="w-5 h-5 text-yellow-400" />
                </div>
                <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">Rewards</span>
            </h1>
            <p className="text-white/40 mb-6 ml-13">Redeem your civic points for real value.</p>

            {/* Points Balance Card */}
            <div className="glass-card-elevated p-6 text-center mb-8 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 pointer-events-none"></div>
                <div className="relative z-10">
                    <div className="text-sm font-medium text-white/50 uppercase tracking-wider">Current Balance</div>
                    <div className="text-5xl font-bold mt-2 bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">1,250</div>
                    <div className="text-sm font-semibold text-white/40 mt-1">POINTS</div>
                </div>
            </div>

            <h2 className="font-bold text-lg mb-4 text-white/80">Available Rewards</h2>
            <div className="space-y-4">
                {rewards.map(reward => {
                    const Icon = reward.icon;
                    return (
                        <div key={reward.id} className="glass-card p-4 flex items-center justify-between hover:bg-white/10 transition-colors group">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                                    <Icon className="w-6 h-6 text-white/50" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-white/90">{reward.title}</h3>
                                    <div className="text-sm text-green-400 font-medium">{reward.cost} Pts</div>
                                </div>
                            </div>
                            <button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold active:scale-95 transition-all shadow-[0_0_15px_rgba(59,130,246,0.3)]">
                                Redeem
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Rewards;
