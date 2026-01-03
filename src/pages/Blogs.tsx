import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, ArrowRight, Loader2 } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { api } from '../lib/api';
import { toast } from 'sonner';

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

const Blogs = () => {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const posts = await api.blog.list();
      setBlogPosts(Array.isArray(posts) ? posts : []);
    } catch (err: any) {
      console.error('Error fetching blogs:', err);
      toast.error('Failed to load blogs');
      setBlogPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (coverImage?: string) => {
    if (!coverImage) return '/images/blog/default.png';
    if (coverImage.startsWith('http')) return coverImage;
    const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
    return `${apiBase}${coverImage}`;
  };

  const featured = blogPosts.find(p => p.featured);
  const rest = blogPosts.filter(p => !p.featured);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto space-y-20 pb-24">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="animate-spin text-blue-500" size={32} />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-20 pb-24">
      {/* ===== HEADER ===== */}
      <header className="space-y-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="inline-flex items-center gap-2 text-blue-500 font-black uppercase tracking-widest text-xs"
        >
          <FileText size={14} />
          <span>Finly Journal</span>
        </motion.div>

        <h1 className="text-4xl lg:text-5xl font-black tracking-tight">
          Insights & Updates
        </h1>

        <p className="text-zinc-500 text-lg max-w-2xl">
          Deep dives, product updates, and educational content on crypto,
          finance, and the Finly ecosystem.
        </p>
      </header>

      {/* ===== FEATURED POST ===== */}
      {featured && (
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center bg-zinc-900/30 border border-zinc-800 rounded-3xl overflow-hidden"
        >
          <div className="h-full min-h-[300px] lg:min-h-[400px] w-full bg-gradient-to-br from-blue-600/20 to-purple-600/20 flex items-center justify-center relative overflow-hidden">
            {featured.coverImage ? (
              <img
                src={getImageUrl(featured.coverImage)}
                alt={featured.title}
                className="h-full w-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            ) : (
              <FileText className="text-zinc-600" size={64} />
            )}
          </div>

          <div className="p-10 space-y-5">
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
              Featured · {new Date(featured.publishedAt || featured.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>

            <h2 className="text-3xl font-black leading-tight">
              {featured.title}
            </h2>

            <p className="text-zinc-400 leading-relaxed">
              {featured.excerpt}
            </p>

            <NavLink
              to={`/blog/${featured.slug}`}
              className="inline-flex items-center gap-2 text-sm font-black text-blue-500 hover:text-blue-400 transition-colors"
            >
              Read article <ArrowRight size={14} />
            </NavLink>
          </div>
        </motion.section>
      )}

      {/* ===== BLOG GRID ===== */}
      {rest.length > 0 ? (
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {rest.map((post, i) => (
            <NavLink key={post._id} to={`/blog/${post.slug}`}>
              <motion.article
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ y: -6 }}
                className="group rounded-3xl overflow-hidden bg-zinc-900/20 border border-zinc-800/50 hover:border-zinc-700 transition-all h-full flex flex-col"
              >
                {post.coverImage ? (
                  <img
                    src={getImageUrl(post.coverImage)}
                    alt={post.title}
                    className="h-44 w-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/images/blog/default.png';
                    }}
                  />
                ) : (
                  <div className="h-44 w-full bg-gradient-to-br from-blue-600/20 to-purple-600/20 flex items-center justify-center">
                    <FileText className="text-zinc-600" size={48} />
                  </div>
                )}

                <div className="p-6 space-y-4 flex-1 flex flex-col">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">
                    {new Date(post.publishedAt || post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>

                  <h3 className="text-lg font-bold leading-snug group-hover:text-blue-500 transition-colors">
                    {post.title}
                  </h3>

                  <p className="text-sm text-zinc-500 leading-relaxed flex-1">
                    {post.excerpt}
                  </p>

                  {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {post.tags.slice(0, 3).map(tag => (
                        <span key={tag} className="text-[10px] bg-zinc-800 text-zinc-400 px-2 py-1 rounded-md">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <span className="inline-flex items-center gap-1 text-xs font-black text-blue-500">
                    Read more <ArrowRight size={12} />
                  </span>
                </div>
              </motion.article>
            </NavLink>
          ))}
        </section>
      ) : (
        !loading && (
          <div className="text-center py-20">
            <p className="text-zinc-500 text-lg">No blog posts available yet.</p>
            <p className="text-zinc-600 text-sm mt-2">Check back soon for updates!</p>
          </div>
        )
      )}
    </div>
  );
};

export default Blogs;
