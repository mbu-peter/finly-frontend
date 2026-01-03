
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Info, Shield, Zap, Globe, ArrowRight, Loader2 } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { api } from '../lib/api';
// import { toast } from 'sonner';

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
}

const About = () => {
  const [heroImage, setHeroImage] = useState<string>('/images/about-hero.png');
  const [featuredBlog, setFeaturedBlog] = useState<BlogPost | null>(null);
  const [latestBlogs, setLatestBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      setLoading(true);

      // Fetch hero image
      try {
        const heroContent = await api.get('/content/public/hero_image');
        if (heroContent?.imageUrl) {
          const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
          if (heroContent.imageUrl.startsWith('http')) {
            setHeroImage(heroContent.imageUrl);
          } else {
            setHeroImage(`${apiBase}${heroContent.imageUrl}`);
          }
        }
      } catch (heroErr) {
        console.log('Hero image not available, using default');
      }

      // Fetch featured blog
      try {
        const blogContent = await api.get('/content/public/featured_blog');
        if (blogContent?.blogSlug) {
          const blog = await api.blog.get(blogContent.blogSlug);
          setFeaturedBlog(blog);
        }
      } catch (blogErr) {
        console.log('Featured blog not available');
      }

      // Fetch latest blogs
      const blogs = await api.blog.list();
      setLatestBlogs(blogs.slice(0, 3)); // Show only first 3

    } catch (err: any) {
      console.error('Error fetching content:', err);
      // Continue with defaults if content fetch fails
    } finally {
      setLoading(false);
    }
  };
  console.log(loading)

  const getImageUrl = (coverImage?: string) => {
    if (!coverImage) return '/images/blog/default.png';
    if (coverImage.startsWith('http')) return coverImage;
    const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
    return `${apiBase}${coverImage}`;
  };
  return (
    <div className="max-w-6xl mx-auto space-y-20 pb-24">

      {/* ===== HERO ===== */}
      <header className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="inline-flex p-3 rounded-2xl bg-blue-500/10 text-blue-500">
            <Info size={28} />
          </div>

          <h1 className="text-4xl lg:text-5xl font-black tracking-tight">
            Built for the next era of finance
          </h1>

          <p className="text-zinc-400 text-lg leading-relaxed">
            Finly is a modern financial platform designed for speed, security,
            and clarity. We merge decentralized infrastructure with a
            world-class user experience.
          </p>

          <div className="flex gap-4 pt-2">
            <NavLink
              to="/tutorial"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl text-white font-black text-sm"
            >
              Learn More
            </NavLink>
            {featuredBlog ? (
              <NavLink
                to={`/blog/${featuredBlog.slug}`}
                className="px-6 py-3 border border-zinc-800 rounded-xl text-sm font-bold hover:bg-zinc-900"
              >
                Read Blog
              </NavLink>
            ) : (
              <NavLink
                to="/blogs"
                className="px-6 py-3 border border-zinc-800 rounded-xl text-sm font-bold hover:bg-zinc-900"
              >
                Read Blog
              </NavLink>
            )}
          </div>
        </motion.div>

        {/* Image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative"
        >
          <img
            src={heroImage}
            alt="Finly Platform"
            className="rounded-3xl border border-zinc-800 shadow-2xl w-full"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/images/about-hero.png';
            }}
          />
        </motion.div>
      </header>

      {/* ===== CORE PRINCIPLES ===== */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          {
            icon: Shield,
            title: 'Security First',
            desc: 'Institutional-grade encryption, non-custodial architecture, and continuous monitoring.'
          },
          {
            icon: Zap,
            title: 'Blazing Fast',
            desc: 'Layer-2 powered swaps and near-instant settlement across supported networks.'
          },
          {
            icon: Globe,
            title: 'Borderless',
            desc: 'A truly global platform, accessible anywhere without traditional banking barriers.'
          }
        ].map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="p-6 rounded-3xl bg-zinc-900/30 border border-zinc-800/50 hover:border-zinc-700 transition-colors"
          >
            <div className="p-3 rounded-xl bg-zinc-800/50 w-fit mb-4">
              <item.icon size={22} />
            </div>
            <h3 className="text-lg font-bold mb-2">{item.title}</h3>
            <p className="text-sm text-zinc-500 leading-relaxed">
              {item.desc}
            </p>
          </motion.div>
        ))}
      </section>

      {/* ===== STORY / EDITORIAL ===== */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <h2 className="text-3xl font-black">Why Finly exists</h2>
          <p className="text-zinc-400 leading-relaxed">
            Traditional finance is complex, slow, and exclusionary. Crypto
            promised freedom — but delivered confusion.
          </p>
          <p className="text-zinc-400 leading-relaxed">
            Finly bridges that gap. We believe financial tools should feel
            intuitive, transparent, and empowering — whether you’re swapping
            assets, storing value, or learning about the ecosystem.
          </p>
        </div>

        <img
          src="/images/about-story.png"
          alt="Finly Vision"
          className="rounded-3xl border border-zinc-800"
        />
      </section>

      {/* ===== BLOG PREVIEW / CONTENT HUB ===== */}
      <section className="space-y-10">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black">Latest from Finly</h2>
          <NavLink
            to="/blog"
            className="text-sm font-bold text-blue-500 hover:text-blue-400 flex items-center gap-1"
          >
            View all <ArrowRight size={14} />
          </NavLink>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {latestBlogs.length > 0 ? (
            latestBlogs.map((post) => (
              <NavLink key={post._id} to={`/blog/${post.slug}`}>
                <motion.article
                  whileHover={{ y: -4 }}
                  className="rounded-3xl overflow-hidden bg-zinc-900/30 border border-zinc-800/50 hover:border-zinc-700 transition-all"
                >
                  {post.coverImage ? (
                    <img
                      src={getImageUrl(post.coverImage)}
                      alt={post.title}
                      className="h-40 w-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/images/blog/default.png';
                      }}
                    />
                  ) : (
                    <div className="h-40 w-full bg-gradient-to-br from-blue-600/20 to-purple-600/20 flex items-center justify-center">
                      <Info className="text-zinc-600" size={32} />
                    </div>
                  )}
                  <div className="p-5 space-y-3">
                    <h3 className="font-bold leading-snug">
                      {post.title}
                    </h3>
                    <p className="text-sm text-zinc-500">
                      {post.excerpt}
                    </p>
                    <span className="text-xs font-bold text-blue-500">
                      Read more →
                    </span>
                  </div>
                </motion.article>
              </NavLink>
            ))
          ) : (
            // Show loading placeholders or empty state
            Array.from({ length: 3 }).map((_, i) => (
              <motion.article
                key={i}
                className="rounded-3xl overflow-hidden bg-zinc-900/30 border border-zinc-800/50"
              >
                <div className="h-40 w-full bg-zinc-800 animate-pulse flex items-center justify-center">
                  <Loader2 className="animate-spin text-zinc-600" size={24} />
                </div>
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-zinc-800 rounded animate-pulse"></div>
                  <div className="h-3 bg-zinc-800 rounded animate-pulse w-3/4"></div>
                  <div className="h-3 bg-zinc-800 rounded animate-pulse w-1/2"></div>
                </div>
              </motion.article>
            ))
          )}
        </div>
      </section>

    </div>
  );
};

export default About;
