export const Landing = () => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
    <h1 className="text-6xl font-extrabold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
      Finly
    </h1>
    <p className="text-xl text-zinc-400 max-w-2xl">
      The ultimate fintech platform for managing your wealth, virtual cards, and crypto assets.
    </p>
    <div className="flex gap-4">
      <button className="px-8 py-3 bg-blue-600 rounded-full font-bold hover:bg-blue-700 transition-all">
        Get Started
      </button>
      <button className="px-8 py-3 bg-zinc-800 rounded-full font-bold hover:bg-zinc-700 transition-all">
        View Pricing
      </button>
    </div>
  </div>
);

export const Login = () => (
  <div className="max-w-md mx-auto mt-20 p-8 bg-zinc-900 rounded-3xl border border-zinc-800">
    <h2 className="text-3xl font-bold mb-6">Login to Finly</h2>
    <div className="space-y-4">
      <input type="email" placeholder="Email" className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3" />
      <input type="password" placeholder="Password" className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3" />
      <button className="w-full bg-blue-600 py-3 rounded-xl font-bold mt-4">Login</button>
    </div>
  </div>
);

export const Register = () => (
  <div className="max-w-md mx-auto mt-20 p-8 bg-zinc-900 rounded-3xl border border-zinc-800">
    <h2 className="text-3xl font-bold mb-6">Create Account</h2>
    <div className="space-y-4">
      <input type="text" placeholder="Full Name" className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3" />
      <input type="email" placeholder="Email" className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3" />
      <input type="password" placeholder="Password" className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3" />
      <button className="w-full bg-blue-600 py-3 rounded-xl font-bold mt-4">Register</button>
    </div>
  </div>
);

export const Cards = () => (
  <div className="space-y-8">
    <h2 className="text-3xl font-bold">Virtual Cards</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="aspect-[1.6/1] bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-8 relative overflow-hidden group cursor-pointer shadow-2xl">
        <div className="flex justify-between items-start">
          <span className="text-xl font-bold">Virtual Visa</span>
          <div className="w-12 h-8 bg-yellow-500/20 rounded-md"></div>
        </div>
        <div className="mt-12 text-2xl tracking-[0.2em] font-mono">•••• •••• •••• 4242</div>
        <div className="mt-auto flex justify-between items-end">
          <div>
            <p className="text-[10px] uppercase text-indigo-200">Card Holder</p>
            <p className="font-medium">ALEX RIVERA</p>
          </div>
          <div>
            <p className="text-[10px] uppercase text-indigo-200">Expires</p>
            <p className="font-medium">12/26</p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export const Crypto = () => (
  <div className="space-y-8">
    <h2 className="text-3xl font-bold">Crypto Marketplace</h2>
    <div className="bg-zinc-900 rounded-3xl border border-zinc-800 overflow-hidden">
      <table className="w-full">
        <thead className="bg-zinc-800/50">
          <tr className="text-left">
            <th className="px-6 py-4 font-medium text-zinc-400">Asset</th>
            <th className="px-6 py-4 font-medium text-zinc-400">Price</th>
            <th className="px-6 py-4 font-medium text-zinc-400">24h Change</th>
            <th className="px-6 py-4 font-medium text-zinc-400">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-800">
          {[
            { name: 'Bitcoin', symbol: 'BTC', price: '$64,231.00', change: '+2.4%' },
            { name: 'Ethereum', symbol: 'ETH', price: '$3,452.12', change: '-1.2%' },
            { name: 'Solana', symbol: 'SOL', price: '$142.45', change: '+5.7%' },
          ].map((coin) => (
            <tr key={coin.symbol} className="hover:bg-zinc-800/30 transition-colors">
              <td className="px-6 py-4 flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-xs">
                  {coin.symbol[0]}
                </div>
                <div>
                  <p className="font-medium">{coin.name}</p>
                  <p className="text-xs text-zinc-500">{coin.symbol}</p>
                </div>
              </td>
              <td className="px-6 py-4 font-medium">{coin.price}</td>
              <td className={`px-6 py-4 font-medium ${coin.change.startsWith('+') ? 'text-emerald-500' : 'text-rose-500'}`}>
                {coin.change}
              </td>
              <td className="px-6 py-4">
                <button className="text-blue-500 font-medium hover:text-blue-400">Trade</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);
