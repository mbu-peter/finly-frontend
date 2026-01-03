export interface VirtualCard {
  id: string;
  profile_id: string;
  card_number_last4: string;
  expiry_date: string; // MM/YY
  cvc_encrypted?: string; // We won't store real CVC in plaintext on client
  status: 'active' | 'frozen' | 'cancelled';
  spend_limit?: number;
  created_at: string;
}

export const MOCK_CARD: VirtualCard = {
  id: 'vk_123456789',
  profile_id: '',
  card_number_last4: '4242',
  expiry_date: '12/28',
  status: 'active',
  created_at: new Date().toISOString()
};
