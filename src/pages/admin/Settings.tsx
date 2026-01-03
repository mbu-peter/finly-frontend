import { AdminLayout } from './AdminLayout';

export const Settings = () => {
  return (
    <AdminLayout activeTab="settings">
      <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-300">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
          <h2 className="text-xl font-bold text-white mb-6">Security Settings</h2>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-white">Two-Factor Authentication</p>
                <p className="text-sm text-slate-400 mt-0.5">Add an extra layer of security to your account.</p>
              </div>
              <div className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </div>
            </div>
            <div className="pt-6 border-t border-slate-800">
              <button className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors">
                Change Password
              </button>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
          <h2 className="text-xl font-bold text-white mb-6">Platform Configuration</h2>
          <div className="space-y-4">
            <label className="block">
              <span className="text-sm font-semibold text-slate-400">Maintenance Mode</span>
              <div className="mt-2 flex items-center space-x-4">
                <button className="bg-slate-800 text-slate-400 px-4 py-2 rounded-xl text-xs font-bold border border-transparent hover:border-slate-600">
                  Enable
                </button>
                <span className="text-xs text-rose-500 font-bold">Currently Disabled</span>
              </div>
            </label>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

