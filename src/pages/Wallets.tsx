import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Plus,
  Wallet,
  Copy,
  Trash2,
  Download,
  Loader2,
  CheckCircle,
  AlertCircle,
  QrCode
} from 'lucide-react';
import { api } from '../lib/api';
import { toast } from 'sonner';
import QRCode from 'qrcode';

interface UserWallet {
  _id: string;
  cryptocurrency: string;
  network: string;
  address: string;
  label?: string;
  isDefault: boolean;
  balance: number;
  lockedBalance: number;
  totalDeposits: number;
  totalWithdrawals: number;
  derivationPath?: string;
  isActive?: boolean;
}

interface QRCodeData {
  walletId: string;
  cryptocurrency: string;
  network: string;
  address: string;
  qrData: string;
  amount: number | null;
}

interface Deposit {
  _id: string;
  cryptocurrency: string;
  network: string;
  amount: number;
  status: string;
  txHash?: string;
  depositAddress: string;
  createdAt: string;
}

const Wallets = () => {
  const [wallets, setWallets] = useState<UserWallet[]>([]);
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [supportedCryptos, setSupportedCryptos] = useState<any[]>([]);
  const [networks, setNetworks] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [showAddWallet, setShowAddWallet] = useState(false);
  const [showDeposit, setShowDeposit] = useState(false);

  // Add wallet form
  const [walletForm, setWalletForm] = useState({
    cryptocurrency: 'BTC',
    network: 'BTC',
    label: '',
    isDefault: false
  });

  // QR Code modal
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrCodeData, setQrCodeData] = useState<QRCodeData | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [depositAmount, setDepositAmount] = useState('');

  // Deposit form
  const [depositForm, setDepositForm] = useState({
    walletId: '',
    amount: '',
    txHash: ''
  });

  useEffect(() => {
    fetchData();
    fetchNetworks();
  }, []);

  const fetchNetworks = async () => {
    try {
      const networksData = await api.p2p.getNetworks();
      setNetworks(networksData);
    } catch (err) {
      console.error('Error fetching networks:', err);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [walletsRes, cryptosRes, networksRes, depositsRes] = await Promise.all([
        api.p2p.getWallets(),
        api.p2p.getSupportedCryptos(),
        api.p2p.getNetworks(),
        api.p2p.getDeposits()
      ]);

      setWallets(walletsRes);
      setSupportedCryptos(cryptosRes);
      setNetworks(networksRes);
      setDeposits(depositsRes.deposits || []);
    } catch (err: any) {
      console.error('Error fetching data:', err);
      toast.error('Failed to load wallet data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddWallet = async () => {
    try {
      await api.p2p.createWallet(walletForm);
      toast.success('Wallet created successfully!');
      setShowAddWallet(false);
      setWalletForm({
        cryptocurrency: 'BTC',
        network: 'BTC',
        label: '',
        isDefault: false
      });
      fetchData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to create wallet');
    }
  };

  const handleShowQR = async (wallet: UserWallet) => {
    try {
      const amount = depositAmount ? parseFloat(depositAmount) : undefined;
      const qrData = await api.p2p.getWalletQR(wallet._id, amount);

      setQrCodeData(qrData);

      // Generate QR code image
      const qrUrl = await QRCode.toDataURL(qrData.qrData, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });

      setQrCodeUrl(qrUrl);
      setShowQRModal(true);
    } catch (err: any) {
      toast.error('Failed to generate QR code');
    }
  };

  const handleDeleteWallet = async (walletId: string) => {
    if (!confirm('Are you sure you want to delete this wallet?')) return;

    try {
      await api.p2p.deleteWallet(walletId);
      toast.success('Wallet deleted successfully');
      fetchData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete wallet');
    }
  };

  const handleDeposit = async () => {
    try {
      await api.p2p.createDeposit({
        walletId: depositForm.walletId,
        amount: depositForm.amount,
        txHash: depositForm.txHash || undefined
      });
      toast.success('Deposit recorded successfully');
      setShowDeposit(false);
      setDepositForm({ walletId: '', amount: '', txHash: '' });
      fetchData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to record deposit');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const getCryptoIcon = (symbol: string) => {
    const crypto = supportedCryptos.find(c => c.symbol === symbol);
    return crypto?.icon || symbol;
  };

  const getNetworkName = (crypto: string, network: string) => {
    const cryptoNetworks = networks[crypto];
    if (!cryptoNetworks) return network;
    const net = cryptoNetworks.find((n: any) => n.id === network);
    return net?.name || network;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'text-green-500';
      case 'pending': return 'text-yellow-500';
      case 'failed': return 'text-red-500';
      default: return 'text-zinc-400';
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-8 pb-24">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="animate-spin text-blue-500" size={32} />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight">My Wallets</h1>
          <p className="text-zinc-400 mt-2">Secure platform-generated wallets for all your crypto needs</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowDeposit(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 rounded-xl text-white font-bold transition-colors"
          >
            <Download size={16} />
            Record Deposit
          </button>
          <button
            onClick={() => setShowAddWallet(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-xl text-white font-bold transition-colors"
          >
            <Plus size={16} />
            Create Wallet
          </button>
        </div>
      </div>

      {/* Wallets Grid */}
      {wallets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wallets.map((wallet) => (
            <motion.div
              key={wallet._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-zinc-800 rounded-xl flex items-center justify-center">
                    <span className="text-lg font-bold">{getCryptoIcon(wallet.cryptocurrency)}</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-bold">{wallet.cryptocurrency}</span>
                      {wallet.isDefault && (
                        <span className="px-2 py-1 bg-blue-600/20 text-blue-400 rounded text-xs font-medium">
                          Default
                        </span>
                      )}
                    </div>
                    <div className="text-zinc-400 text-sm">{getNetworkName(wallet.cryptocurrency, wallet.network)}</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleShowQR(wallet)}
                    className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
                    title="Show QR Code"
                  >
                    <QrCode size={16} className="text-zinc-400" />
                  </button>
                  <button
                    onClick={() => copyToClipboard(wallet.address)}
                    className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
                    title="Copy address"
                  >
                    <Copy size={16} className="text-zinc-400" />
                  </button>
                  <button
                    onClick={() => handleDeleteWallet(wallet._id)}
                    className="p-2 hover:bg-red-600/20 rounded-lg transition-colors"
                    title="Delete wallet"
                  >
                    <Trash2 size={16} className="text-zinc-400 hover:text-red-400" />
                  </button>
                </div>
              </div>

              {wallet.label && (
                <div className="mb-4">
                  <span className="text-zinc-400 text-sm">{wallet.label}</span>
                </div>
              )}

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400">Available Balance:</span>
                  <span className="text-white font-medium">{wallet.balance.toFixed(8)} {wallet.cryptocurrency}</span>
                </div>
                {wallet.lockedBalance > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-400">Locked (Escrow):</span>
                    <span className="text-yellow-500 font-medium">{wallet.lockedBalance.toFixed(8)} {wallet.cryptocurrency}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400">Total Deposits:</span>
                  <span className="text-green-500 font-medium">{wallet.totalDeposits.toFixed(8)} {wallet.cryptocurrency}</span>
                </div>
              </div>

              <div className="bg-zinc-800 rounded-lg p-3">
                <div className="text-xs text-zinc-400 mb-1">Wallet Address</div>
                <div className="font-mono text-sm text-zinc-300 break-all">
                  {wallet.address}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <Wallet className="text-zinc-600" size={32} />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No wallets yet</h3>
          <p className="text-zinc-400 mb-6 max-w-md mx-auto">
            Create your first secure platform wallet. We'll generate a unique address for you
            that you can use for deposits and P2P trading. Your funds are protected by our
            enterprise-grade security.
          </p>
          <button
            onClick={() => setShowAddWallet(true)}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl text-white font-bold transition-colors"
          >
            Create Your First Wallet
          </button>
        </div>
      )}

      {/* Recent Deposits */}
      {deposits.length > 0 && (
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">Recent Deposits</h3>
          <div className="space-y-4">
            {deposits.slice(0, 5).map((deposit) => (
              <div key={deposit._id} className="flex items-center justify-between p-4 bg-zinc-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    deposit.status === 'confirmed' ? 'bg-green-600/20' :
                    deposit.status === 'pending' ? 'bg-yellow-600/20' : 'bg-red-600/20'
                  }`}>
                    {deposit.status === 'confirmed' ? (
                      <CheckCircle size={16} className="text-green-500" />
                    ) : deposit.status === 'pending' ? (
                      <Loader2 size={16} className="text-yellow-500 animate-spin" />
                    ) : (
                      <AlertCircle size={16} className="text-red-500" />
                    )}
                  </div>
                  <div>
                    <div className="text-white font-medium">
                      {deposit.amount} {deposit.cryptocurrency}
                    </div>
                    <div className="text-zinc-400 text-sm">
                      {getNetworkName(deposit.cryptocurrency, deposit.network)} • {new Date(deposit.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className={`text-sm font-medium ${getStatusColor(deposit.status)}`}>
                  {deposit.status.charAt(0).toUpperCase() + deposit.status.slice(1)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Wallet Modal */}
      {showAddWallet && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md"
          >
            <div className="p-6 border-b border-zinc-800">
              <h2 className="text-xl font-bold text-white">Create New Wallet</h2>
              <p className="text-zinc-400 text-sm mt-1">
                We'll generate a secure wallet address for you
              </p>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  Cryptocurrency
                </label>
                <select
                  value={walletForm.cryptocurrency}
                  onChange={(e) => setWalletForm({
                    ...walletForm,
                    cryptocurrency: e.target.value,
                    network: networks[e.target.value]?.[0]?.id || e.target.value
                  })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {supportedCryptos.map(crypto => (
                    <option key={crypto.symbol} value={crypto.symbol}>
                      {crypto.icon} {crypto.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  Network
                </label>
                <select
                  value={walletForm.network}
                  onChange={(e) => setWalletForm({ ...walletForm, network: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {networks[walletForm.cryptocurrency]?.map((network: any) => (
                    <option key={network.id} value={network.id}>
                      {network.name} - {network.description}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  Label (Optional)
                </label>
                <input
                  type="text"
                  value={walletForm.label}
                  onChange={(e) => setWalletForm({ ...walletForm, label: e.target.value })}
                  placeholder="e.g., My Trading Wallet"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={walletForm.isDefault}
                  onChange={(e) => setWalletForm({ ...walletForm, isDefault: e.target.checked })}
                  className="w-4 h-4 text-blue-600 bg-zinc-800 border-zinc-600 rounded focus:ring-blue-500"
                />
                <span className="text-zinc-300">Set as default wallet for this cryptocurrency</span>
              </label>

              <div className="bg-blue-600/10 border border-blue-500/20 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="text-blue-500 mt-0.5 flex-shrink-0" size={16} />
                  <div className="text-sm text-blue-300">
                    <strong>Platform Security:</strong> Your wallet will be generated securely by our platform.
                    Private keys are encrypted and never shared. You can only send/receive through our secure interface.
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 p-6 border-t border-zinc-800">
              <button
                onClick={() => setShowAddWallet(false)}
                className="flex-1 px-4 py-3 border border-zinc-700 rounded-xl text-zinc-300 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddWallet}
                className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl text-white font-bold transition-colors"
              >
                Create Wallet
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* QR Code Modal */}
      {showQRModal && qrCodeData && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md"
          >
            <div className="p-6 border-b border-zinc-800">
              <h2 className="text-xl font-bold text-white">Deposit {qrCodeData.cryptocurrency}</h2>
              <p className="text-zinc-400 text-sm mt-1">
                Scan QR code or copy address to deposit
              </p>
            </div>

            <div className="p-6 space-y-4">
              {/* QR Code */}
              <div className="flex justify-center">
                <div className="bg-white p-4 rounded-xl">
                  <img
                    src={qrCodeUrl}
                    alt="Wallet QR Code"
                    className="w-48 h-48"
                  />
                </div>
              </div>

              {/* Amount Input (Optional) */}
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  Deposit Amount (Optional)
                </label>
                <input
                  type="number"
                  step="0.00000001"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  placeholder="Enter amount for QR code"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={() => qrCodeData && handleShowQR(wallets.find(w => w._id === qrCodeData.walletId)!)}
                  className="text-xs text-blue-400 hover:text-blue-300 mt-2"
                  disabled={!depositAmount}
                >
                  Update QR Code with Amount
                </button>
              </div>

              {/* Wallet Address */}
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  Wallet Address
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={qrCodeData.address}
                    readOnly
                    className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white font-mono text-sm"
                  />
                  <button
                    onClick={() => copyToClipboard(qrCodeData.address)}
                    className="px-4 py-3 bg-zinc-700 hover:bg-zinc-600 rounded-xl transition-colors"
                  >
                    <Copy size={16} />
                  </button>
                </div>
              </div>

              {/* Network Info */}
              <div className="bg-zinc-800 rounded-xl p-4">
                <div className="text-sm text-zinc-400 mb-2">Network</div>
                <div className="text-white font-medium">
                  {getNetworkName(qrCodeData.cryptocurrency, qrCodeData.network)}
                </div>
              </div>

              {/* Instructions */}
              <div className="bg-blue-600/10 border border-blue-500/20 rounded-xl p-4">
                <h4 className="text-blue-400 font-medium mb-2">Deposit Instructions:</h4>
                <ol className="text-sm text-blue-300 space-y-1">
                  <li>1. Copy the wallet address above</li>
                  <li>2. Send {qrCodeData.cryptocurrency} from your external wallet</li>
                  <li>3. Wait for blockchain confirmation</li>
                  <li>4. Your balance will update automatically</li>
                </ol>
              </div>
            </div>

            <div className="flex gap-3 p-6 border-t border-zinc-800">
              <button
                onClick={() => {
                  setShowQRModal(false);
                  setQrCodeData(null);
                  setQrCodeUrl('');
                  setDepositAmount('');
                }}
                className="flex-1 px-4 py-3 border border-zinc-700 rounded-xl text-zinc-300 hover:text-white transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowQRModal(false);
                  setShowDeposit(true);
                }}
                className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-500 rounded-xl text-white font-bold transition-colors"
              >
                Record Manual Deposit
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Deposit Modal */}
      {showDeposit && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md"
          >
            <div className="p-6 border-b border-zinc-800">
              <h2 className="text-xl font-bold text-white">Record Manual Deposit</h2>
              <p className="text-zinc-400 text-sm mt-1">
                Already sent crypto? Record the transaction here
              </p>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  Wallet
                </label>
                <select
                  value={depositForm.walletId}
                  onChange={(e) => setDepositForm({ ...depositForm, walletId: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select wallet</option>
                  {wallets.map(wallet => (
                    <option key={wallet._id} value={wallet._id}>
                      {wallet.cryptocurrency} - {getNetworkName(wallet.cryptocurrency, wallet.network)}
                      {wallet.label && ` (${wallet.label})`}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  Amount
                </label>
                <input
                  type="number"
                  step="0.00000001"
                  value={depositForm.amount}
                  onChange={(e) => setDepositForm({ ...depositForm, amount: e.target.value })}
                  placeholder="0.00"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  Transaction Hash (Optional)
                </label>
                <input
                  type="text"
                  value={depositForm.txHash}
                  onChange={(e) => setDepositForm({ ...depositForm, txHash: e.target.value })}
                  placeholder="Blockchain transaction hash"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex gap-3 p-6 border-t border-zinc-800">
              <button
                onClick={() => setShowDeposit(false)}
                className="flex-1 px-4 py-3 border border-zinc-700 rounded-xl text-zinc-300 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeposit}
                className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-500 rounded-xl text-white font-bold transition-colors"
              >
                Record Deposit
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Wallets;
