import { useState, useEffect } from 'react';
import { useParams, NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, User, Tag } from 'lucide-react';
import { api } from '../lib/api';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.css';

interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage?: string;
  publishedAt?: string;
  createdAt: string;
  featured?: boolean;
  tags?: string[];
  authorId?: {
    fullName?: string;
    email?: string;
  };
}

const BlogDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (slug) {
      fetchBlog();
    }
  }, [slug]);

  const fetchBlog = async () => {
    try {
      setLoading(true);
      const data = await api.blog.get(slug!);
      setPost(data);

      // Redirect non-logged-in users after 30 seconds to encourage signup
      if (!user) {
        setTimeout(() => {
          toast.info('Enjoyed the article? Create an account to access all our content!', {
            duration: 5000,
            action: {
              label: 'Sign Up',
              onClick: () => navigate('/register'),
            },
          });
          // Redirect to login after another 10 seconds
          setTimeout(() => {
            navigate('/login');
          }, 10000);
        }, 30000);
      }
    } catch (err: any) {
      console.error('Error fetching blog:', err);
      toast.error('Failed to load blog post');
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (coverImage?: string) => {
    if (!coverImage) return null;
    if (coverImage.startsWith('http')) return coverImage;
    const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
    return `${apiBase}${coverImage}`;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-20">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="animate-spin text-blue-500" size={32} />
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="max-w-4xl mx-auto py-20">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Blog Post Not Found</h1>
          <p className="text-zinc-500 mb-6">The blog post you're looking for doesn't exist.</p>
          <NavLink
            to="/blogs"
            className="inline-flex items-center gap-2 text-blue-500 hover:text-blue-400"
          >
            <ArrowLeft size={16} />
            Back to Blogs
          </NavLink>
        </div>
      </div>
    );
  }

  const coverImageUrl = getImageUrl(post.coverImage);

  return (
    <article className="max-w-4xl mx-auto pb-24">
      {/* Back Button */}
      <NavLink
        to="/blogs"
        className="inline-flex items-center gap-2 text-zinc-400 hover:text-white mb-8 transition-colors"
      >
        <ArrowLeft size={16} />
        <span>Back to Blogs</span>
      </NavLink>

      {/* Header */}
      <header className="space-y-6 mb-12">
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {post.tags.map(tag => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full text-xs font-bold uppercase tracking-wider"
              >
                <Tag size={12} />
                {tag}
              </span>
            ))}
          </div>
        )}

        <h1 className="text-4xl lg:text-5xl font-black tracking-tight leading-tight">
          {post.title}
        </h1>

        <p className="text-xl text-zinc-400 leading-relaxed">
          {post.excerpt}
        </p>

        <div className="flex items-center gap-6 text-sm text-zinc-500">
          <div className="flex items-center gap-2">
            <Calendar size={16} />
            <span>{formatDate(post.publishedAt || post.createdAt)}</span>
          </div>
          {post.authorId && (
            <div className="flex items-center gap-2">
              <User size={16} />
              <span>{post.authorId.fullName || post.authorId.email || 'Admin'}</span>
            </div>
          )}
        </div>
      </header>

      {/* Cover Image */}
      {coverImageUrl && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 rounded-2xl overflow-hidden"
        >
          <img
            src={coverImageUrl}
            alt={post.title}
            className="w-full h-[400px] object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        </motion.div>
      )}

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="prose prose-invert prose-lg max-w-none
          prose-headings:text-white prose-headings:font-bold
          prose-h1:text-4xl prose-h2:text-3xl prose-h3:text-2xl
          prose-p:text-zinc-300 prose-p:leading-relaxed prose-p:text-base
          prose-a:text-blue-400 prose-a:no-underline hover:prose-a:text-blue-300
          prose-strong:text-white prose-strong:font-bold
          prose-code:text-blue-400 prose-code:bg-zinc-900 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm
          prose-pre:bg-zinc-900 prose-pre:border prose-pre:border-zinc-800 prose-pre:rounded-xl
          prose-blockquote:border-l-blue-500 prose-blockquote:text-zinc-400 prose-blockquote:pl-4
          prose-img:rounded-xl prose-img:border prose-img:border-zinc-800 prose-img:my-8 prose-img:shadow-lg
          prose-ul:text-zinc-300 prose-ol:text-zinc-300
          prose-li:text-zinc-300 prose-li:my-2
          prose-hr:border-zinc-800 prose-hr:my-8"
      >
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeHighlight]}
          components={{
            img: ({ src, alt, ...props }) => {
              // Convert relative URLs to full URLs for blog images
              const fullSrc = src?.startsWith('/uploads')
                ? `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}${src}`
                : src;
              return <img src={fullSrc} alt={alt} className="max-w-full h-auto rounded-xl shadow-lg" {...props} />;
            },
            h1: ({ children, ...props }) => (
              <h1 className="text-4xl font-bold text-white mb-6 mt-8 first:mt-0 border-b border-zinc-700 pb-2" {...props}>
                {children}
              </h1>
            ),
            h2: ({ children, ...props }) => (
              <h2 className="text-3xl font-bold text-white mb-4 mt-8 border-b border-zinc-700 pb-1" {...props}>
                {children}
              </h2>
            ),
            h3: ({ children, ...props }) => (
              <h3 className="text-2xl font-bold text-white mb-3 mt-6" {...props}>
                {children}
              </h3>
            ),
          }}
        >
          {post.content}
        </ReactMarkdown>
      </motion.div>

      {/* Call to Action for Non-Logged-In Users */}
      {!user && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12 p-8 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-2xl text-center"
        >
          <h3 className="text-2xl font-bold text-white mb-4">Enjoyed this article?</h3>
          <p className="text-zinc-300 mb-6 max-w-2xl mx-auto">
            Join thousands of users who trust Finly for their financial needs.
            Get access to exclusive content, advanced features, and personalized insights.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <NavLink
              to="/register"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-8 py-3 rounded-xl font-bold text-white transition-all shadow-lg"
            >
              Create Free Account
            </NavLink>
            <NavLink
              to="/login"
              className="bg-zinc-800 hover:bg-zinc-700 px-8 py-3 rounded-xl font-semibold text-zinc-300 hover:text-white transition-all"
            >
              Sign In
            </NavLink>
          </div>
        </motion.div>
      )}
    </article>
  );
};

export default BlogDetail;

