import { useState, useEffect, useRef } from "react";
import { AdminLayout } from "./AdminLayout";
import { api } from "../../lib/api";
import { toast } from "sonner";
import { Upload, Image as ImageIcon, Save, Loader2 } from "lucide-react";

// const initializeDefaultContent = async () => {
//   try {
//     // Check if default content exists, create if not
//     const existingHero = await api.get('/content/public/hero_image').catch(() => null);
//     const existingBlog = await api.get('/content/public/featured_blog').catch(() => null);

//     if (!existingHero) {
//       await api.put('/content/hero_image', {
//         type: 'hero_image',
//         title: 'About Hero Image',
//       });
//     }

//     if (!existingBlog) {
//       await api.put('/content/featured_blog', {
//         type: 'featured_blog',
//         title: 'Featured Blog',
//       });
//     }
//   } catch (err) {
//     console.error('Error initializing content:', err);
//   }
// };

interface ContentItem {
  _id: string;
  key: string;
  type: string;
  title?: string;
  content?: string;
  imageUrl?: string;
  blogSlug?: string;
  metadata?: any;
  updatedAt: string;
}

const ContentManager = () => {
  // const [heroImage, setHeroImage] = useState<ContentItem | null>(null);
  const [featuredBlog, setFeaturedBlog] = useState<ContentItem | null>(null);
  const [heroImagePreview, setHeroImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedBlogSlug, setSelectedBlogSlug] = useState("");
  const [blogs, setBlogs] = useState<any[]>([]);

  const heroImageRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchContent();
    fetchBlogs();
  }, []);

  // Remove the useEffect that calls initializeDefaultContent during render
  // It's already called inside fetchContent

  const initializeDefaultContent = async () => {
    try {
      // Check if default content exists, create if not
      const existingHero = await api
        .get("/content/public/hero_image")
        .catch(() => null);
      const existingBlog = await api
        .get("/content/public/featured_blog")
        .catch(() => null);

      if (!existingHero) {
        await api.put("/content/hero_image", {
          type: "hero_image",
          title: "About Hero Image",
        });
      }

      if (!existingBlog) {
        await api.put("/content/featured_blog", {
          type: "featured_blog",
          title: "Featured Blog",
        });
      }
    } catch (err) {
      console.error("Error initializing content:", err);
    }
  };

  const fetchContent = async () => {
    try {
      setLoading(true);

      // Fetch hero image content
      try {
        const heroRes: ContentItem = await api.get('/content/public/hero_image');
        // const heroRes = await api.get("/content/public/hero_image");
        if (heroRes) {
          // setHeroImage(heroRes);
          const apiBase =
            import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
          if (heroRes.imageUrl) {
            if (heroRes.imageUrl.startsWith("http")) {
              setHeroImagePreview(heroRes.imageUrl);
            } else {
              setHeroImagePreview(`${apiBase}${heroRes.imageUrl}`);
            }
          }
        }
      } catch (heroErr) {
        console.log("Hero image not found, will initialize defaults");
      }

      // Fetch featured blog content
      try {
        const blogRes = await api.get("/content/public/featured_blog");
        if (blogRes) {
          setFeaturedBlog(blogRes);
          setSelectedBlogSlug(blogRes.blogSlug || "");
        }
      } catch (blogErr) {
        console.log("Featured blog not found, will initialize defaults");
      }

      // Initialize default content if needed
      await initializeDefaultContent();
    } catch (err: any) {
      console.error("Error fetching content:", err);
      toast.error("Failed to load content settings");
    } finally {
      setLoading(false);
    }
  };

  const fetchBlogs = async () => {
    try {
      const blogsData = await api.blog.getAll();
      setBlogs(blogsData || []);
    } catch (err) {
      console.error("Error fetching blogs:", err);
    }
  };

  const handleHeroImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size must be less than 5MB");
        return;
      }
      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setHeroImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const saveHeroImage = async () => {
    try {
      setSaving(true);
      const formData = new FormData();

      if (heroImageRef.current?.files?.[0]) {
        formData.append("image", heroImageRef.current.files[0]);
      }

      // const result = await api.put('/content/hero_image', formData);
      toast.success("Hero image updated successfully");

      // Refresh content
      fetchContent();
    } catch (err: any) {
      toast.error(err.message || "Failed to save hero image");
    } finally {
      setSaving(false);
    }
  };

  const saveFeaturedBlog = async () => {
    try {
      setSaving(true);

      await api.put("/content/featured_blog", {
        blogSlug: selectedBlogSlug,
        type: "featured_blog",
        title: "Featured Blog",
      });

      toast.success("Featured blog updated successfully");

      // Refresh content
      fetchContent();
    } catch (err: any) {
      toast.error(err.message || "Failed to save featured blog");
    } finally {
      setSaving(false);
    }
  };

  // const getImageUrl = (imageUrl?: string) => {
  //   if (!imageUrl) return null;
  //   if (imageUrl.startsWith("http")) return imageUrl;
  //   const apiBase =
  //     import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
  //   return `${apiBase}${imageUrl}`;
  // };

  if (loading) {
    return (
      <AdminLayout activeTab="settings">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="animate-spin text-indigo-500" size={32} />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout activeTab="settings">
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">
              Content Management
            </h2>
            <p className="text-slate-400 mt-1">
              Manage About page content and featured elements
            </p>
          </div>
        </div>

        {/* Hero Image Section */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">
            About Page Hero Image
          </h3>

          <div className="space-y-4">
            {heroImagePreview && (
              <div className="relative w-full h-64 rounded-xl overflow-hidden border border-slate-700">
                <img
                  src={heroImagePreview}
                  alt="Hero preview"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => {
                    setHeroImagePreview(null);
                    if (heroImageRef.current) {
                      heroImageRef.current.value = "";
                    }
                  }}
                  className="absolute top-2 right-2 p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  ×
                </button>
              </div>
            )}

            <div className="flex items-center gap-4">
              <input
                ref={heroImageRef}
                type="file"
                accept="image/*"
                onChange={handleHeroImageChange}
                className="hidden"
                id="hero-image-upload"
              />
              <label
                htmlFor="hero-image-upload"
                className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl cursor-pointer transition-colors"
              >
                <Upload size={18} className="text-slate-300" />
                <span className="text-sm font-medium text-slate-300">
                  {heroImagePreview ? "Change Image" : "Upload Hero Image"}
                </span>
              </label>
              <button
                onClick={saveHeroImage}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-colors"
              >
                {saving ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Save size={16} />
                )}
                <span className="text-sm font-medium">Save</span>
              </button>
            </div>
            <p className="text-xs text-slate-500">
              Recommended: 1200x800px. Max size: 5MB
            </p>
          </div>
        </div>

        {/* Featured Blog Section */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">Featured Blog</h3>
          <p className="text-slate-400 text-sm mb-4">
            Select which blog post should be featured in the "Read Blog" button
          </p>

          <div className="space-y-4">
            <select
              value={selectedBlogSlug}
              onChange={(e) => setSelectedBlogSlug(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 transition-all"
            >
              <option value="">Select a blog post...</option>
              {blogs.map((blog) => (
                <option key={blog._id} value={blog.slug}>
                  {blog.title}
                </option>
              ))}
            </select>

            <button
              onClick={saveFeaturedBlog}
              disabled={saving || !selectedBlogSlug}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-colors"
            >
              {saving ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Save size={16} />
              )}
              <span className="text-sm font-medium">Save Featured Blog</span>
            </button>
          </div>

          {featuredBlog && (
            <div className="mt-4 p-4 bg-slate-800 rounded-xl">
              <h4 className="text-sm font-medium text-slate-300 mb-2">
                Current Featured Blog:
              </h4>
              <p className="text-slate-400 text-sm">
                {featuredBlog.blogSlug || "None selected"}
              </p>
            </div>
          )}
        </div>

        {/* Preview Section */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">Preview</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium text-slate-300 mb-2">
                Hero Image
              </h4>
              {heroImagePreview ? (
                <img
                  src={heroImagePreview}
                  alt="Hero"
                  className="w-full h-32 object-cover rounded-lg border border-slate-700"
                />
              ) : (
                <div className="w-full h-32 bg-slate-800 rounded-lg flex items-center justify-center border border-slate-700">
                  <ImageIcon className="text-slate-600" size={24} />
                </div>
              )}
            </div>

            <div>
              <h4 className="text-sm font-medium text-slate-300 mb-2">
                Featured Blog
              </h4>
              <div className="p-3 bg-slate-800 rounded-lg border border-slate-700">
                <p className="text-slate-400 text-sm">
                  {selectedBlogSlug
                    ? `Blog: ${selectedBlogSlug}`
                    : "No featured blog selected"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export { ContentManager };
