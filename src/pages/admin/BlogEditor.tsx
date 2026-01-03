import { useState, useRef, useEffect } from 'react';
import { X, Sparkles, Upload, Image as ImageIcon, Bold, Italic, List, Heading1, Heading2, Link, Image, Eye, Edit } from 'lucide-react';
import { api } from '../../lib/api';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface BlogPost {
  _id: string;
  title: string;
  excerpt: string;
  content: string;
  status?: 'published' | 'draft';
  published?: boolean;
  tags?: string[];
  coverImage?: string;
}

interface BlogEditorProps {
  blog: BlogPost;
  onClose: () => void;
  onSave: () => void;
}

export const BlogEditor = ({ blog, onClose, onSave }: BlogEditorProps) => {
  const [blogDraft, setBlogDraft] = useState<Partial<BlogPost>>(blog);
  const [isSaving, setIsSaving] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [activeTab, setActiveTab] = useState<'write' | 'preview'>('write');
  const coverFileInputRef = useRef<HTMLInputElement>(null);
  const contentImageInputRef = useRef<HTMLInputElement>(null);
  const contentTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Set initial cover image preview
  useEffect(() => {
    if (blog.coverImage) {
      const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
      if (blog.coverImage.startsWith('http')) {
        setCoverImagePreview(blog.coverImage);
      } else {
        setCoverImagePreview(`${apiBase}${blog.coverImage}`);
      }
    }
  }, [blog.coverImage]);

  // Sync textarea value with blogDraft state
  useEffect(() => {
    if (contentTextareaRef.current && blogDraft.content !== undefined) {
      contentTextareaRef.current.value = blogDraft.content;
    }
  }, [blogDraft.content]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUpload = async (file: File) => {
    try {
      setIsUploadingImage(true);
      const result = await api.blog.uploadImage(file);
      const imageUrl = result.imageUrl;

      // Insert image markdown at cursor position
      const textarea = contentTextareaRef.current;
      if (textarea) {
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const imageMarkdown = `![Image description](${imageUrl})`;
        const newContent = blogDraft.content?.substring(0, start) + imageMarkdown + blogDraft.content?.substring(end);

        setBlogDraft({ ...blogDraft, content: newContent });

        // Set cursor after the inserted image
        setTimeout(() => {
          textarea.focus();
          textarea.setSelectionRange(start + imageMarkdown.length, start + imageMarkdown.length);
        }, 0);
      }

      toast.success('Image uploaded successfully');
    } catch (err: any) {
      toast.error(err.message || 'Failed to upload image');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      toast.error('No image selected');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    handleImageUpload(file);

    // Reset input
    if (contentImageInputRef.current) {
      contentImageInputRef.current.value = '';
    }
  };

  const insertMarkdown = (before: string, after: string = '', placeholder: string = '') => {
    const textarea = contentTextareaRef.current;
    if (!textarea) {
      console.error('Textarea not found');
      return;
    }

    // Ensure textarea is focused first
    textarea.focus();

    // Use requestAnimationFrame for better timing
    requestAnimationFrame(() => {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = blogDraft.content?.substring(start, end) || placeholder;
      const replacement = before + selectedText + after;

      const newContent = blogDraft.content?.substring(0, start) + replacement + blogDraft.content?.substring(end);

      console.log('Inserting markdown:', { before, after, selectedText, start, end, newContent });

      // Update state - this will trigger the useEffect to update textarea
      setBlogDraft(prev => ({ ...prev, content: newContent }));

      // Set cursor position after state update
      setTimeout(() => {
        if (textarea) {
          textarea.focus();
          const newCursorPos = start + before.length + selectedText.length + after.length;
          textarea.setSelectionRange(newCursorPos, newCursorPos);
        }
      }, 0);
    });
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const formData = new FormData();
      formData.append('title', blogDraft.title || '');
      formData.append('excerpt', blogDraft.excerpt || '');
      formData.append('content', blogDraft.content || '');
      formData.append('published', (blogDraft.status === 'published' || blogDraft.published) ? 'true' : 'false');
      formData.append('featured', 'false');
      if (blogDraft.tags) {
        formData.append('tags', blogDraft.tags.join(','));
      }

      // Add cover image if a new file was selected
      const fileInput = coverFileInputRef.current;
      if (fileInput?.files?.[0]) {
        formData.append('cover', fileInput.files[0]);
      }

      if (blog._id === 'new') {
        await api.blog.create(formData);
        toast.success('Blog created successfully');
      } else {
        await api.blog.update(blog._id, formData);
        toast.success('Blog updated successfully');
      }

      onSave();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save blog');
    } finally {
      setIsSaving(false);
    }
  };

  const generateBlogContent = async () => {
    if (!blogDraft.title) {
      toast.error('Please enter a title first');
      return;
    }

    setIsAiLoading(true);
    try {
      // For now, generate a simple placeholder
      // You can integrate with your AI service later
      const generatedContent = `# ${blogDraft.title}\n\nThis is a placeholder for AI-generated content. You can integrate with your AI service to generate actual blog content based on the title.\n\n## Introduction\n\nAdd your introduction here.\n\n## Main Content\n\nAdd your main content here.\n\n## Conclusion\n\nAdd your conclusion here.`;
      setBlogDraft({ ...blogDraft, content: generatedContent });
      toast.info('AI content generation coming soon');
    } catch (err) {
      toast.error('Failed to generate content');
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-4xl max-h-[90vh] rounded-3xl overflow-hidden flex flex-col shadow-2xl">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-xl font-bold text-white">
            {blog._id === 'new' ? 'Create Blog Post' : 'Edit Blog Post'}
          </h3>
          <button 
            onClick={onClose} 
            className="p-2 text-slate-400 hover:bg-slate-800 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          <div className="space-y-4">
            {/* Cover Image Upload */}
            <label className="block">
              <span className="text-sm font-semibold text-slate-400 mb-2 block">Cover Image</span>
              <div className="space-y-3">
                {coverImagePreview && (
                  <div className="relative w-full h-48 rounded-xl overflow-hidden border border-slate-700">
                    <img
                      src={coverImagePreview}
                      alt="Cover preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setCoverImagePreview(null);
                        if (coverFileInputRef.current) {
                          coverFileInputRef.current.value = '';
                        }
                      }}
                      className="absolute top-2 right-2 p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <input
                    ref={coverFileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    id="cover-image-upload"
                  />
                  <label
                    htmlFor="cover-image-upload"
                    className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl cursor-pointer transition-colors"
                  >
                    <Upload size={18} className="text-slate-300" />
                    <span className="text-sm font-medium text-slate-300">
                      {coverImagePreview ? 'Change Image' : 'Upload Cover Image'}
                    </span>
                  </label>
                  {coverImagePreview && (
                    <span className="text-xs text-slate-500">Click to change image</span>
                  )}
                </div>
                <p className="text-xs text-slate-500">Recommended: 1200x630px. Max size: 5MB</p>
              </div>
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-slate-400">Post Title</span>
              <input 
                type="text" 
                value={blogDraft.title || ''}
                onChange={(e) => setBlogDraft({ ...blogDraft, title: e.target.value })}
                className="mt-1 block w-full bg-slate-800 border-none rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 transition-all"
                placeholder="Enter post title..."
              />
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-slate-400">Excerpt</span>
              <textarea 
                rows={2}
                value={blogDraft.excerpt || ''}
                onChange={(e) => setBlogDraft({ ...blogDraft, excerpt: e.target.value })}
                className="mt-1 block w-full bg-slate-800 border-none rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 transition-all resize-none"
                placeholder="Enter brief summary..."
              />
            </label>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-semibold text-slate-400">Content (Markdown)</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={generateBlogContent}
                    disabled={isAiLoading}
                    className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center space-x-1 disabled:opacity-50"
                  >
                    <Sparkles size={14} />
                    <span>{isAiLoading ? 'Drafting...' : 'Generate with AI'}</span>
                  </button>
                </div>
              </div>

              {/* Tab Navigation */}
              <div className="flex border-b border-slate-700 mb-4">
                <button
                  onClick={() => setActiveTab('write')}
                  className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${
                    activeTab === 'write'
                      ? 'text-indigo-400 border-b-2 border-indigo-400'
                      : 'text-slate-400 hover:text-slate-300'
                  }`}
                >
                  <Edit size={16} />
                  Write
                </button>
                <button
                  onClick={() => setActiveTab('preview')}
                  className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${
                    activeTab === 'preview'
                      ? 'text-indigo-400 border-b-2 border-indigo-400'
                      : 'text-slate-400 hover:text-slate-300'
                  }`}
                >
                  <Eye size={16} />
                  Preview
                </button>
              </div>

              {activeTab === 'write' ? (
                <>
                  {/* Markdown Toolbar */}
                  <div className="flex items-center gap-1 mb-2 p-2 bg-slate-800 rounded-lg border border-slate-700">
                    <button
                      onClick={() => {
                        // Focus textarea first, then insert markdown
                        if (contentTextareaRef.current) {
                          contentTextareaRef.current.focus();
                          setTimeout(() => insertMarkdown('# ', '', 'Heading'), 0);
                        }
                      }}
                      className="p-1.5 hover:bg-slate-700 rounded text-slate-400 hover:text-white transition-colors"
                      title="Heading 1"
                    >
                      <Heading1 size={16} />
                    </button>
                    <button
                      onClick={() => {
                        // Focus textarea first, then insert markdown
                        if (contentTextareaRef.current) {
                          contentTextareaRef.current.focus();
                          setTimeout(() => insertMarkdown('## ', '', 'Subheading'), 0);
                        }
                      }}
                      className="p-1.5 hover:bg-slate-700 rounded text-slate-400 hover:text-white transition-colors"
                      title="Heading 2"
                    >
                      <Heading2 size={16} />
                    </button>
                    <div className="w-px h-6 bg-slate-600 mx-1"></div>
                    <button
                      onClick={() => {
                        if (contentTextareaRef.current) {
                          contentTextareaRef.current.focus();
                          setTimeout(() => insertMarkdown('**', '**', 'bold text'), 0);
                        }
                      }}
                      className="p-1.5 hover:bg-slate-700 rounded text-slate-400 hover:text-white transition-colors"
                      title="Bold"
                    >
                      <Bold size={16} />
                    </button>
                    <button
                      onClick={() => {
                        if (contentTextareaRef.current) {
                          contentTextareaRef.current.focus();
                          setTimeout(() => insertMarkdown('*', '*', 'italic text'), 0);
                        }
                      }}
                      className="p-1.5 hover:bg-slate-700 rounded text-slate-400 hover:text-white transition-colors"
                      title="Italic"
                    >
                      <Italic size={16} />
                    </button>
                    <div className="w-px h-6 bg-slate-600 mx-1"></div>
                    <button
                      onClick={() => {
                        if (contentTextareaRef.current) {
                          contentTextareaRef.current.focus();
                          setTimeout(() => insertMarkdown('- ', '', 'List item'), 0);
                        }
                      }}
                      className="p-1.5 hover:bg-slate-700 rounded text-slate-400 hover:text-white transition-colors"
                      title="Bullet List"
                    >
                      <List size={16} />
                    </button>
                    <div className="w-px h-6 bg-slate-600 mx-1"></div>
                    <button
                      onClick={() => {
                        if (contentTextareaRef.current) {
                          contentTextareaRef.current.focus();
                          setTimeout(() => insertMarkdown('[', '](url)', 'link text'), 0);
                        }
                      }}
                      className="p-1.5 hover:bg-slate-700 rounded text-slate-400 hover:text-white transition-colors"
                      title="Link"
                    >
                      <Link size={16} />
                    </button>

                    {/* Image Upload */}
                    <div className="w-px h-6 bg-slate-600 mx-1"></div>
                    <input
                      ref={contentImageInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="content-image-upload"
                    />
                    <label
                      htmlFor="content-image-upload"
                      className={`p-1.5 hover:bg-slate-700 rounded text-slate-400 hover:text-white transition-colors cursor-pointer ${
                        isUploadingImage ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                      title="Upload Image"
                    >
                      {isUploadingImage ? (
                        <div className="animate-spin w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full"></div>
                      ) : (
                        <Image size={16} />
                      )}
                    </label>
                  </div>

                  <textarea
                    ref={contentTextareaRef}
                    rows={15}
                    value={blogDraft.content || ''}
                    onChange={(e) => setBlogDraft({ ...blogDraft, content: e.target.value })}
                    className="block w-full bg-slate-800 border-none rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 transition-all font-mono text-sm leading-relaxed"
                    placeholder="Write your article in Markdown...

Use the toolbar above to format text, add images, and create headers.

**Markdown Examples:**
# Heading 1
## Heading 2
**bold text**
*italic text*
- Bullet list
[link text](url)
![image alt](image-url)

You can also upload images directly using the image button in the toolbar."
                  />
                </>
              ) : (
                <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 min-h-[400px]">
                  <div className="text-sm text-slate-400 mb-4">Live Preview:</div>
                  <div className="prose prose-invert prose-sm max-w-none">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        img: ({ src, alt, ...props }) => {
                          const fullSrc = src?.startsWith('/uploads')
                            ? `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}${src}`
                            : src;
                          return <img src={fullSrc} alt={alt} className="max-w-full h-auto rounded-lg shadow-md" {...props} />;
                        },
                      }}
                    >
                      {blogDraft.content || '*No content yet...*'}
                    </ReactMarkdown>
                  </div>
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <label className="block">
                <span className="text-sm font-semibold text-slate-400">Status</span>
                <select 
                  value={blogDraft.status || (blogDraft.published ? 'published' : 'draft')}
                  onChange={(e) => setBlogDraft({ ...blogDraft, status: e.target.value as 'published' | 'draft', published: e.target.value === 'published' })}
                  className="mt-1 block w-full bg-slate-800 border-none rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 transition-all"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </label>
              <label className="block">
                <span className="text-sm font-semibold text-slate-400">Tags (comma separated)</span>
                <input 
                  type="text" 
                  value={blogDraft.tags?.join(', ') || ''}
                  onChange={(e) => setBlogDraft({ ...blogDraft, tags: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                  className="mt-1 block w-full bg-slate-800 border-none rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 transition-all"
                  placeholder="e.g. BTC, Wallet, Security"
                />
              </label>
            </div>
          </div>
        </div>
        <div className="p-6 border-t border-slate-800 bg-slate-900/50 flex justify-end space-x-3">
          <button 
            onClick={onClose} 
            className="px-6 py-2.5 text-slate-400 font-bold hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave} 
            disabled={isSaving}
            className="px-8 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/20 transition-all disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

