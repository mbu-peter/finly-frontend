import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface LogoutButtonProps {
  className?: string;
  showLabel?: boolean;
}

export const LogoutButton = ({ className = '', showLabel = true }: LogoutButtonProps) => {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Logout failed', error);
      // Fallback redirect even if API call fails
      navigate('/');
    }
  };

  return (
    <button 
      onClick={handleLogout}
      className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-zinc-500 hover:bg-rose-500/10 hover:text-rose-500 transition-all ${className}`}
    >
      <LogOut size={20} />
      {showLabel && <span className="font-medium">Logout</span>}
    </button>
  );
};
