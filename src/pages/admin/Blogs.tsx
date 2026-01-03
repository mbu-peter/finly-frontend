import { useState, useEffect, useMemo } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { AdminLayout } from './AdminLayout';
import { api } from '../../lib/api';
import { toast } from 'sonner';
import { BlogEditor } from './BlogEditor';

interface BlogPost {
  _id: string;
  id?: string;
  title: string;
  excerpt: string;
  content: string;
  status?: 'published' | 'draft';
  published?: boolean;
  author?: string;
  authorId?: string;
  createdAt: string;
  publishedAt?: string;
  tags?: string[];
  slug?: string;
  coverImage?: string;
}

export const Blogs = () => {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditingBlog, setIsEditingBlog] = useState<string | null>(null);
  const [editingBlog, setEditingBlog] = useState<BlogPost | null>(null);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      // Get all blogs including drafts (admin endpoint)
      const data = await api.blog.getAll();
      setBlogs(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error('Error fetching blogs:', err);
      toast.error(err.message || 'Failed to load blogs');
      setBlogs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBlog = () => {
    const newBlog: BlogPost = {
      _id: 'new',
      title: 'New Post Title',
      excerpt: 'Brief summary of the post...',
      content: 'Write your content here...',
      status: 'draft',
      published: false,
      createdAt: new Date().toISOString(),
      tags: ['Crypto'],
    };
    setEditingBlog(newBlog);
    setIsEditingBlog('new');
  };

  const handleEditBlog = (blog: BlogPost) => {
    setEditingBlog(blog);
    setIsEditingBlog(blog._id);
  };

  const handleDeleteBlog = async (id: string) => {
    if (!confirm('Delete this post?')) return;

    try {
      await api.blog.delete(id);
      toast.success('Blog deleted successfully');
      fetchBlogs();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete blog');
    }
  };

  const handleSaveBlog = () => {
    setIsEditingBlog(null);
    setEditingBlog(null);
    fetchBlogs();
  };

  const filteredBlogs = useMemo(() => {
    if (!searchQuery) return blogs;
    return blogs.filter(b => 
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.tags || []).some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [blogs, searchQuery]);

  if (loading && blogs.length === 0) {
    return (
      <AdminLayout activeTab="blogs">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <>
      <AdminLayout activeTab="blogs">
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">Blog Management</h2>
            <button 
              onClick={handleCreateBlog}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-bold flex items-center space-x-2 shadow-lg shadow-indigo-600/20"
            >
              <Plus size={20} />
              <span>New Blog Post</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBlogs.map((post) => (
              <div key={post._id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-indigo-500/50 transition-all flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                    (post.status === 'published' || post.published) ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
                  }`}>
                    {post.status || (post.published ? 'published' : 'draft')}
                  </span>
                  <div className="flex space-x-1">
                    <button 
                      onClick={() => handleEditBlog(post)} 
                      className="p-1.5 text-slate-400 hover:text-indigo-400"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={() => handleDeleteBlog(post._id)} 
                      className="p-1.5 text-slate-400 hover:text-rose-400"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <h3 className="text-lg font-bold text-white mb-2 line-clamp-2">{post.title}</h3>
                <p className="text-slate-400 text-sm mb-4 line-clamp-3 flex-1">{post.excerpt}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {(post.tags || []).map(t => (
                    <span key={t} className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md">
                      #{t}
                    </span>
                  ))}
                </div>
                <div className="pt-4 border-t border-slate-800 flex justify-between items-center text-xs text-slate-500">
                  <span>{post.author || 'Admin'}</span>
                  <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>

          {filteredBlogs.length === 0 && !loading && (
            <div className="text-center py-12">
              <p className="text-slate-400">No blog posts found. Create your first post!</p>
            </div>
          )}
        </div>
      </AdminLayout>

      {isEditingBlog && editingBlog && (
        <BlogEditor
          blog={editingBlog}
          onClose={() => {
            setIsEditingBlog(null);
            setEditingBlog(null);
          }}
          onSave={handleSaveBlog}
        />
      )}
    </>
  );
};

