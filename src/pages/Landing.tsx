import { motion } from 'framer-motion';
import { NavLink } from 'react-router-dom';
import { Check, ArrowRight, Shield, Zap, Globe, BarChart3, Activity, Phone, Mail, MapPin, Twitter, Github, Linkedin, FileText } from 'lucide-react';
import { ChatAgent } from '../components/ChatAgent';
import { useState, useEffect } from 'react';
import { api } from '../lib/api';

interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImage?: string;
  publishedAt?: string;
  createdAt: string;
  featured?: boolean;
  tags?: string[];
  authorId?: {
    fullName?: string;
    email: string;
  };
}

const Landing = () => {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loadingBlogs, setLoadingBlogs] = useState(true);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoadingBlogs(true);
        const posts = await api.blog.list();
        // Take only the first 5 posts for the landing page
        setBlogPosts(Array.isArray(posts) ? posts.slice(0, 5) : []);
      } catch (err: any) {
        console.error('Error fetching blogs:', err);
        setBlogPosts([]);
      } finally {
        setLoadingBlogs(false);
      }
    };

    fetchBlogs();
  }, []);

  const getCategoryFromTags = (tags?: string[]) => {
    if (!tags || tags.length === 0) return 'General';
    // Map common tags to categories
    if (tags.some(tag => tag.toLowerCase().includes('defi') || tag.toLowerCase().includes('crypto'))) return 'DeFi';
    if (tags.some(tag => tag.toLowerCase().includes('security'))) return 'Security';
    if (tags.some(tag => tag.toLowerCase().includes('education') || tag.toLowerCase().includes('guide'))) return 'Education';
    if (tags.some(tag => tag.toLowerCase().includes('product') || tag.toLowerCase().includes('feature'))) return 'Product';
    return 'General';
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'DeFi': return 'purple';
      case 'Security': return 'emerald';
      case 'Education': return 'orange';
      case 'Product': return 'purple';
      default: return 'blue';
    }
  };

  const plans = [
    {
      name: 'User',
      price: '$0',
      description: 'Perfect for beginners starting their financial journey.',
      features: ['Virtual Card (1)', 'Standard Support', '0.5% Crypto Cashback', 'Basic Analytics'],
      color: 'zinc',
    },
    {
      name: 'Level 1',
      price: '$12',
      description: 'For active users who want more flexibility and rewards.',
      features: ['Virtual Cards (5)', 'Priority Support', '1.5% Crypto Cashback', 'Advanced Analytics', 'Global Transfers'],
      color: 'blue',
      popular: true,
    },
    {
      name: 'Partner',
      price: '$29',
      description: 'The ultimate experience for high-net-worth individuals.',
      features: ['Unlimited Virtual Cards', '24/7 Dedicated Support', '3.0% Crypto Cashback', 'Predictive AI Analytics', 'VIP Event Access', 'Metal Card'],
      color: 'purple',
    },
  ];

  const features = [
    { icon: Shield, title: 'Military-Grade Security', desc: 'Your assets are protected by multiple layers of encryption and multi-sig wallets.' },
    { icon: Zap, title: 'Instant Issuance', desc: 'Generate virtual cards in seconds and start spending globally with Apple or Google Pay.' },
    { icon: Globe, title: 'Borderless Finance', desc: 'Send and receive money across 150+ countries with mid-market exchange rates.' },
    { icon: BarChart3, title: 'Smart Portfolio', desc: 'Track your fiat, crypto, and stock holdings in one unified, real-time dashboard.' },
  ];

  return (
    <div className="min-h-screen bg-[#09090b] text-white relative">
      {/* Chat Agent */}
      <ChatAgent />

      {/* Navigation */}
      <nav className="h-20 border-b border-zinc-800/50 flex items-center justify-between px-8 max-w-7xl mx-auto backdrop-blur-md sticky top-0 z-50 bg-black/80">
        <NavLink to="/" className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent hover:scale-105 transition-transform">Finly</NavLink>
        <div className="hidden md:flex items-center space-x-8 text-sm font-medium">
          <a href="#features" className="text-zinc-400 hover:text-white transition-colors relative group">
            Features
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-500 group-hover:w-full transition-all duration-300"></span>
          </a>
          <a href="#pricing" className="text-zinc-400 hover:text-white transition-colors relative group">
            Pricing
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-500 group-hover:w-full transition-all duration-300"></span>
          </a>
          <a href="#news" className="text-zinc-400 hover:text-white transition-colors relative group">
            News
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-500 group-hover:w-full transition-all duration-300"></span>
          </a>
          <NavLink to="/blogs" className="text-zinc-400 hover:text-white transition-colors relative group">
            Blogs
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-500 group-hover:w-full transition-all duration-300"></span>
          </NavLink>
        </div>
        <div className="flex items-center space-x-4">
          <NavLink to="/login" className="text-sm font-semibold text-zinc-400 hover:text-blue-500 transition-colors hover:scale-105">Login</NavLink>
          <NavLink to="/register" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-6 py-2.5 rounded-full text-sm font-bold text-white transition-all shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-105">
            Get Started
          </NavLink>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative pt-24 pb-32 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-blue-600/10 blur-[120px] rounded-full -z-10"></div>
        <div className="max-w-7xl mx-auto px-8 text-center space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-block px-4 py-2 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-bold text-blue-400 mb-6 uppercase tracking-widest">
              The Future of Banking is Here
            </span>
            <h1 className="text-6xl md:text-8xl font-black tracking-tight leading-[1.1]">
              Manage your wealth <br /> 
              <span className="text-zinc-500">without the complexity.</span>
            </h1>
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl text-zinc-400 max-w-3xl mx-auto leading-relaxed"
          >
            Join over 2 million users managing their fiat, crypto, and virtual cards in 
            one beautifully designed, high-performance ecosystem.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <NavLink to="/register" className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-bold text-lg transition-all flex items-center justify-center group shadow-lg shadow-blue-600/20">
              Get Started for Free
              <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </NavLink>
            <NavLink to="/tutorial" className="w-full sm:w-auto px-8 py-4 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-white rounded-full font-bold text-lg transition-all">
              How To Set Up an Account
            </NavLink>
          </motion.div>
        </div>

        {/* Hero Visual - Feature Showcase */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="max-w-7xl mx-auto px-8 mt-20 relative"
        >
          {/* Platform Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-zinc-900 border border-zinc-800 text-sm text-zinc-400">
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
              <span>Finly Platform</span>
            </div>
          </motion.div>

          {/* Feature Images with Captions Below */}
          <div className="max-w-7xl mx-auto px-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Market Interface */}
              <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.9 }}
                className="group"
              >
                <div className="relative mb-6">
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-[20px] blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
                  <div className="relative bg-zinc-900 border border-zinc-800 rounded-[20px] overflow-hidden shadow-2xl">
                    <img
                      src="/images/landing/market.png"
                      alt="Finly Crypto Market Interface"
                      className="w-full h-48 object-cover"
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                      <BarChart3 className="text-white" size={16} />
                    </div>
                    <div>
                      <div className="text-white font-bold">Live Crypto Markets</div>
                      <div className="text-zinc-400 text-sm">Real-time prices for 50+ cryptocurrencies</div>
                    </div>
                  </div>
                  <p className="text-zinc-500 text-sm leading-relaxed">
                    Track Bitcoin, Ethereum, and altcoins with advanced charts, technical indicators, and instant alerts.
                    Never miss a trading opportunity with our lightning-fast market data.
                  </p>
                </div>
              </motion.div>

              {/* P2P Trading */}
              <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 1.1 }}
                className="group"
              >
                <div className="relative mb-6">
                  <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-[20px] blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
                  <div className="relative bg-zinc-900 border border-zinc-800 rounded-[20px] overflow-hidden shadow-2xl">
                    <img
                      src="/images/landing/trade.png"
                      alt="Finly P2P Trading Platform"
                      className="w-full h-48 object-cover"
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
                      <ArrowRight className="text-white" size={16} />
                    </div>
                    <div>
                      <div className="text-white font-bold">P2P Crypto Trading</div>
                      <div className="text-zinc-400 text-sm">Trade directly with other users</div>
                    </div>
                  </div>
                  <p className="text-zinc-500 text-sm leading-relaxed">
                    Buy and sell cryptocurrencies peer-to-peer with escrow protection.
                    Choose from multiple payment methods and trade with confidence.
                  </p>
                </div>
              </motion.div>

              {/* Transactions */}
              <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 1.3 }}
                className="group"
              >
                <div className="relative mb-6">
                  <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-[20px] blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
                  <div className="relative bg-zinc-900 border border-zinc-800 rounded-[20px] overflow-hidden shadow-2xl">
                    <img
                      src="/images/landing/transaction.png"
                      alt="Finly Transaction History"
                      className="w-full h-48 object-cover"
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                      <Activity className="text-white" size={16} />
                    </div>
                    <div>
                      <div className="text-white font-bold">Complete Transaction History</div>
                      <div className="text-zinc-400 text-sm">Track every penny</div>
                    </div>
                  </div>
                  <p className="text-zinc-500 text-sm leading-relaxed">
                    Comprehensive transaction logs with detailed analytics.
                    Monitor your spending patterns and investment performance.
                  </p>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Feature Highlights */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.5 }}
            className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 text-center"
          >
            <div className="space-y-2">
              <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mx-auto">
                <Shield className="text-blue-500" size={24} />
              </div>
              <h3 className="text-lg font-bold text-white">Bank-Grade Security</h3>
              <p className="text-sm text-zinc-400">Military encryption protects your assets</p>
            </div>
            <div className="space-y-2">
              <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center mx-auto">
                <Zap className="text-emerald-500" size={24} />
              </div>
              <h3 className="text-lg font-bold text-white">Lightning Fast</h3>
              <p className="text-sm text-zinc-400">Instant transfers worldwide</p>
            </div>
            <div className="space-y-2">
              <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center mx-auto">
                <Globe className="text-purple-500" size={24} />
              </div>
              <h3 className="text-lg font-bold text-white">Global Network</h3>
              <p className="text-sm text-zinc-400">150+ countries, zero borders</p>
            </div>
          </motion.div>
        </motion.div>
      </header>

      {/* Features Grid */}
      <section id="features" className="py-32 max-w-7xl mx-auto px-8">
        <div className="text-center mb-20 space-y-4">
          <h2 className="text-4xl font-bold tracking-tight">Everything you need, all in one place.</h2>
          <p className="text-zinc-500 max-w-2xl mx-auto">Speed, security, and elegance designed for the next generation of finance.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((f, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -10 }}
              className="p-8 rounded-[32px] bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700 transition-all group"
            >
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <f.icon size={24} />
              </div>
              <h3 className="text-lg font-bold mb-3">{f.title}</h3>
              <p className="text-sm text-zinc-500 leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-32 bg-zinc-900/30">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold tracking-tight mb-4">Choose Your Plan</h2>
            <p className="text-zinc-500 max-w-2xl mx-auto">Start free and upgrade as you grow. All plans include our core features.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {plans.map((plan, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`relative rounded-2xl border overflow-hidden group hover:scale-105 transition-all duration-300 ${
                  plan.popular
                    ? 'border-blue-500 bg-gradient-to-br from-blue-500/10 to-purple-500/10 shadow-xl shadow-blue-500/20'
                    : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700'
                }`}
              >
                {plan.popular && (
                  <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-bold py-1 text-center">
                    MOST POPULAR
                  </div>
                )}

                <div className="p-6">
                  {/* Plan Header */}
                  <div className="text-center mb-6">
                    <h3 className={`text-xl font-bold mb-2 ${plan.popular ? 'text-white' : 'text-zinc-300'}`}>
                      {plan.name}
                    </h3>
                    <div className="flex items-baseline justify-center mb-2">
                      <span className={`text-3xl font-black ${plan.popular ? 'text-white' : 'text-zinc-200'}`}>
                        {plan.price}
                      </span>
                      {plan.price !== '$0' && (
                        <span className="text-zinc-500 text-sm ml-1">/month</span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-500 leading-tight">{plan.description}</p>
                  </div>

                  {/* Features */}
                  <div className="space-y-3 mb-6">
                    {plan.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center text-sm">
                        <div className={`w-4 h-4 rounded-full mr-3 flex items-center justify-center ${
                          plan.popular ? 'bg-blue-500' : 'bg-zinc-700'
                        }`}>
                          <Check size={10} className="text-white" />
                        </div>
                        <span className={plan.popular ? 'text-zinc-200' : 'text-zinc-400'}>
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* CTA Button */}
                  <NavLink
                    to={`/register?plan=${plan.name.toLowerCase().replace(' ', '')}`}
                    className={`w-full py-3 px-4 rounded-xl font-semibold text-sm text-center transition-all block ${
                      plan.popular
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg'
                        : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white'
                    }`}
                  >
                    {plan.price === '$0' ? 'Get Started Free' : `Choose ${plan.name}`}
                  </NavLink>
                </div>

                {/* Hover Effect Border */}
                <div className={`absolute inset-0 rounded-2xl transition-opacity duration-300 opacity-0 group-hover:opacity-100 ${
                  plan.popular
                    ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20'
                    : 'bg-zinc-700/20'
                }`} />
              </motion.div>
            ))}
          </div>

          {/* Bottom Note */}
          <div className="text-center mt-12">
            <p className="text-sm text-zinc-500">
              All plans include 256-bit encryption, multi-sig security, and 24/7 support.
              <br />
              <a href="#features" className="text-blue-500 hover:text-blue-400 underline">Learn more about our features</a>
            </p>
          </div>
        </div>
      </section>

      {/* Latest News Section */}
      <section id="news" className="py-32 bg-zinc-900/30">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-20 space-y-4">
            <h2 className="text-4xl font-bold tracking-tight">Latest News & Updates</h2>
            <p className="text-zinc-500 max-w-2xl mx-auto">Stay informed with the latest insights, product updates, and industry trends from Finly.</p>
          </div>

          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden">
            <div className="px-8 py-6 border-b border-zinc-800">
              <h3 className="text-xl font-bold text-white">Recent Articles</h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-zinc-800/50">
                  <tr>
                    <th className="px-8 py-4 text-left text-xs font-bold text-zinc-400 uppercase tracking-wider">Article</th>
                    <th className="px-8 py-4 text-left text-xs font-bold text-zinc-400 uppercase tracking-wider hidden md:table-cell">Category</th>
                    <th className="px-8 py-4 text-left text-xs font-bold text-zinc-400 uppercase tracking-wider hidden lg:table-cell">Author</th>
                    <th className="px-8 py-4 text-left text-xs font-bold text-zinc-400 uppercase tracking-wider">Date</th>
                    <th className="px-8 py-4 text-right text-xs font-bold text-zinc-400 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {loadingBlogs ? (
                    // Loading state
                    Array.from({ length: 3 }).map((_, index) => (
                      <tr key={index} className="animate-pulse">
                        <td className="px-8 py-6">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-zinc-700 rounded-lg"></div>
                            <div className="flex-1">
                              <div className="h-4 bg-zinc-700 rounded mb-2"></div>
                              <div className="h-3 bg-zinc-700 rounded w-2/3"></div>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6 hidden md:table-cell">
                          <div className="h-6 bg-zinc-700 rounded-full w-16"></div>
                        </td>
                        <td className="px-8 py-6 hidden lg:table-cell">
                          <div className="h-4 bg-zinc-700 rounded w-20"></div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="h-4 bg-zinc-700 rounded w-16"></div>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <div className="h-4 bg-zinc-700 rounded w-20 ml-auto"></div>
                        </td>
                      </tr>
                    ))
                  ) : blogPosts.length === 0 ? (
                    // Empty state
                    <tr>
                      <td colSpan={5} className="px-8 py-12 text-center text-zinc-400">
                        <FileText className="mx-auto mb-4" size={48} />
                        <p>No articles available yet. Check back soon!</p>
                      </td>
                    </tr>
                  ) : (
                    // Real blog posts
                    blogPosts.map((post) => {
                      const category = getCategoryFromTags(post.tags);
                      const categoryColor = getCategoryColor(category);
                      const publishDate = post.publishedAt ? new Date(post.publishedAt) : new Date(post.createdAt);
                      const authorName = post.authorId?.fullName || post.authorId?.email?.split('@')[0] || 'Finly Team';

                      return (
                        <tr key={post._id} className="hover:bg-zinc-800/30 transition-colors">
                          <td className="px-8 py-6">
                            <div className="flex items-center space-x-4">
                              <div className={`w-12 h-12 bg-${categoryColor}-500/10 rounded-lg flex items-center justify-center`}>
                                <FileText className={`text-${categoryColor}-500`} size={20} />
                              </div>
                              <div>
                                <div className="text-white font-semibold line-clamp-2">{post.title}</div>
                                <div className="text-zinc-400 text-sm line-clamp-1">{post.excerpt}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-6 text-zinc-400 hidden md:table-cell">
                            <span className={`px-3 py-1 bg-${categoryColor}-500/10 text-${categoryColor}-400 rounded-full text-xs font-medium`}>
                              {category}
                            </span>
                          </td>
                          <td className="px-8 py-6 text-zinc-400 hidden lg:table-cell">{authorName}</td>
                          <td className="px-8 py-6 text-zinc-400">
                            {publishDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </td>
                          <td className="px-8 py-6 text-right">
                            <NavLink
                              to={`/blog/${post.slug}`}
                              className="text-blue-500 hover:text-blue-400 text-sm font-medium transition-colors"
                            >
                              Read More →
                            </NavLink>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <div className="px-8 py-6 border-t border-zinc-800 text-center">
              <NavLink to="/blogs" className="inline-flex items-center space-x-2 text-blue-500 hover:text-blue-400 font-medium transition-colors">
                <span>View All Articles</span>
                <ArrowRight size={16} />
              </NavLink>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 bg-zinc-900/50 border-t border-zinc-800">
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
            {/* Company Info */}
            <div className="space-y-6">
              <div className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">Finly</div>
              <p className="text-sm text-zinc-400 leading-relaxed max-w-xs">
                Building the future of finance with cutting-edge technology and unparalleled user experience.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="w-10 h-10 bg-zinc-800 hover:bg-zinc-700 rounded-xl flex items-center justify-center text-zinc-400 hover:text-white transition-all">
                  <Twitter size={18} />
                </a>
                <a href="#" className="w-10 h-10 bg-zinc-800 hover:bg-zinc-700 rounded-xl flex items-center justify-center text-zinc-400 hover:text-white transition-all">
                  <Github size={18} />
                </a>
                <a href="#" className="w-10 h-10 bg-zinc-800 hover:bg-zinc-700 rounded-xl flex items-center justify-center text-zinc-400 hover:text-white transition-all">
                  <Linkedin size={18} />
                </a>
              </div>
            </div>

            {/* Product Links */}
            <div className="space-y-6">
              <h4 className="text-white text-sm uppercase tracking-widest font-black">Product</h4>
              <div className="space-y-3">
                <NavLink to="/dashboard" className="block text-sm text-zinc-400 hover:text-blue-500 transition-colors">Dashboard</NavLink>
                <NavLink to="/crypto" className="block text-sm text-zinc-400 hover:text-blue-500 transition-colors">Crypto Trading</NavLink>
                <NavLink to="/cards" className="block text-sm text-zinc-400 hover:text-blue-500 transition-colors">Virtual Cards</NavLink>
                <NavLink to="/p2p" className="block text-sm text-zinc-400 hover:text-blue-500 transition-colors">P2P Trading</NavLink>
                <NavLink to="/wallets" className="block text-sm text-zinc-400 hover:text-blue-500 transition-colors">My Wallets</NavLink>
              </div>
            </div>

            {/* Company Links */}
            <div className="space-y-6">
              <h4 className="text-white text-sm uppercase tracking-widest font-black">Company</h4>
              <div className="space-y-3">
                <a href="#" className="block text-sm text-zinc-400 hover:text-blue-500 transition-colors">About Us</a>
                <a href="#" className="block text-sm text-zinc-400 hover:text-blue-500 transition-colors">Careers</a>
                <a href="#" className="block text-sm text-zinc-400 hover:text-blue-500 transition-colors">Press</a>
                <a href="#" className="block text-sm text-zinc-400 hover:text-blue-500 transition-colors">Blog</a>
                <a href="#" className="block text-sm text-zinc-400 hover:text-blue-500 transition-colors">Security</a>
              </div>
            </div>

            {/* Support & Legal */}
            <div className="space-y-6">
              <h4 className="text-white text-sm uppercase tracking-widest font-black">Support</h4>
              <div className="space-y-3">
                <a href="#" className="block text-sm text-zinc-400 hover:text-blue-500 transition-colors">Help Center</a>
                <a href="#" className="block text-sm text-zinc-400 hover:text-blue-500 transition-colors">API Docs</a>
                <a href="#" className="block text-sm text-zinc-400 hover:text-blue-500 transition-colors">Contact Us</a>
                <a href="#" className="block text-sm text-zinc-400 hover:text-blue-500 transition-colors">Privacy Policy</a>
                <a href="#" className="block text-sm text-zinc-400 hover:text-blue-500 transition-colors">Terms of Service</a>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-8">
            <div className="flex items-center space-x-3 text-sm text-zinc-400">
              <Mail size={16} />
              <span>support@finly.app</span>
            </div>
            <div className="flex items-center space-x-3 text-sm text-zinc-400">
              <Phone size={16} />
              <span>+1 (555) 123-4567</span>
            </div>
            <div className="flex items-center space-x-3 text-sm text-zinc-400">
              <MapPin size={16} />
              <span>San Francisco, CA</span>
            </div>
          </div>

          <div className="pt-8 text-center">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-xs text-zinc-600">
                © 2024 Finly Industries Limited. All rights reserved.
              </p>
              <div className="flex items-center space-x-6 text-xs text-zinc-600">
                <span>Built with ❤️ in California</span>
                <span>•</span>
                <span>v2.1.0</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
