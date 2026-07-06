'use client';

import React, { useState, useEffect } from 'react';
import {
  Newspaper,
  Plus,
  Edit2,
  Trash2,
  BookOpen,
  Eye,
  CheckCircle,
  AlertTriangle,
  FolderOpen,
  Tag,
  Search,
} from 'lucide-react';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  body: string;
  category: string;
  tags: string;
  featuredImage: string;
  isPublished: boolean;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  createdAt: string;
}

export default function BlogCMSPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states (Creating/Editing)
  const [isEditing, setIsEditing] = useState(false);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);

  // Inputs
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [category, setCategory] = useState('Gold Price Updates');
  const [tags, setTags] = useState('');
  const [featuredImage, setFeaturedImage] = useState('');
  const [isPublished, setIsPublished] = useState(true);
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [metaKeywords, setMetaKeywords] = useState('');

  // Status
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const categories = [
    'Gold Price Updates',
    'Gold Selling Tips',
    'Gold Purity Guides',
    'Investment Advice',
    'Company News',
  ];

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/blog');
      if (res.ok) {
        const data = await res.json();
        setPosts(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleEditClick = (post: BlogPost) => {
    setIsEditing(true);
    setEditingPostId(post.id);
    setTitle(post.title);
    setBody(post.body);
    setCategory(post.category);
    setTags(post.tags);
    setFeaturedImage(post.featuredImage);
    setIsPublished(post.isPublished);
    setMetaTitle(post.metaTitle || '');
    setMetaDescription(post.metaDescription || '');
    setMetaKeywords(post.metaKeywords || '');
    setSaveSuccess(false);
    setErrorMsg('');
  };

  const handleCreateNewClick = () => {
    setIsEditing(true);
    setEditingPostId(null);
    setTitle('');
    setBody('');
    setCategory(categories[0]);
    setTags('');
    setFeaturedImage('');
    setIsPublished(true);
    setMetaTitle('');
    setMetaDescription('');
    setMetaKeywords('');
    setSaveSuccess(false);
    setErrorMsg('');
  };

  const handleSavePost = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSaveSuccess(false);

    if (!title.trim() || !body.trim() || !category) {
      setErrorMsg('Title, Body, and Category are required');
      return;
    }

    const payload = {
      title,
      body,
      category,
      tags,
      featuredImage: featuredImage || '/images/blog-placeholder.jpg',
      isPublished,
      metaTitle: metaTitle || title,
      metaDescription,
      metaKeywords,
    };

    try {
      const url = editingPostId ? `/api/blog/${editingPostId}` : '/api/blog';
      const method = editingPostId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setSaveSuccess(true);
        setIsEditing(false);
        setEditingPostId(null);
        fetchPosts(); // Reload articles
      } else {
        const data = await res.json();
        setErrorMsg(data.error || 'Failed to save blog post');
      }
    } catch (err) {
      setErrorMsg('Connection error. Please try again.');
    }
  };

  const handleDeletePost = async (id: string) => {
    if (!confirm('Are you sure you want to delete this article? This action cannot be undone.')) return;
    
    try {
      const res = await fetch(`/api/blog/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchPosts();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between border-b border-gold-600/10 pb-4">
        <div>
          <h1 className="text-xl font-bold text-white uppercase tracking-wider">Blog CMS Manager</h1>
          <p className="text-xs text-gray-400 mt-0.5">Manage customer education posts and SEO copy</p>
        </div>
        {!isEditing && (
          <button
            onClick={handleCreateNewClick}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-gold-600 hover:bg-gold-500 text-black font-bold text-xs uppercase tracking-wider rounded transition-colors btn-gold-glow"
          >
            <Plus className="h-4 w-4" />
            <span>Create Article</span>
          </button>
        )}
      </div>

      {saveSuccess && (
        <div className="p-3 bg-green-500/10 border border-green-500/25 rounded text-green-400 text-xs flex items-center space-x-2">
          <CheckCircle className="h-5 w-5 shrink-0" />
          <span>Article saved successfully!</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded flex items-center space-x-2 text-xs text-red-400">
          <AlertTriangle className="h-4.5 w-4.5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {isEditing ? (
        /* CREATE / EDIT ARTICLE PANEL */
        <div className="glass border border-gold-600/10 rounded-xl p-6 animate-slide-in">
          <h2 className="text-sm font-bold text-white mb-6 border-b border-gold-600/10 pb-2 uppercase tracking-wider">
            {editingPostId ? 'Edit Article File' : 'Compose New Article'}
          </h2>

          <form onSubmit={handleSavePost} className="space-y-5 text-xs">
            {/* Title & Category */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 space-y-1.5">
                <label className="text-[10px] text-gray-400 uppercase font-semibold">Article Title</label>
                <input
                  type="text"
                  placeholder="e.g. 5 Tips for Selling Gold Jewelry"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-charcoal-900 border border-gray-800 rounded p-3 text-white focus:outline-none focus:border-gold-600"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-gray-400 uppercase font-semibold">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-charcoal-900 border border-gray-800 rounded p-3 text-white focus:outline-none focus:border-gold-600"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Featured Image & Tags & Published state */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] text-gray-400 uppercase font-semibold">Featured Image URL</label>
                <input
                  type="text"
                  placeholder="e.g. /uploads/gold-jewelry.jpg"
                  value={featuredImage}
                  onChange={(e) => setFeaturedImage(e.target.value)}
                  className="w-full bg-charcoal-900 border border-gray-800 rounded p-3 text-white focus:outline-none focus:border-gold-600"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-gray-400 uppercase font-semibold">Tags (comma separated)</label>
                <input
                  type="text"
                  placeholder="e.g. gold tips, selling gold, metal purity"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  className="w-full bg-charcoal-900 border border-gray-800 rounded p-3 text-white focus:outline-none focus:border-gold-600"
                />
              </div>

              <div className="flex items-center space-x-2 pt-6">
                <input
                  type="checkbox"
                  id="published"
                  checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                  className="rounded border-gray-800 text-gold-600 focus:ring-0 focus:ring-offset-0 h-4 w-4 bg-charcoal-900"
                />
                <label htmlFor="published" className="text-xs text-gray-300 font-semibold cursor-pointer">
                  Publish Article Immediately
                </label>
              </div>
            </div>

            {/* Body Rich Text Field */}
            <div className="space-y-1.5">
              <label className="text-[10px] text-gray-400 uppercase font-semibold">Article Content (markdown or plain text)</label>
              <textarea
                placeholder="Compose your article contents here. Separate paragraphs with a blank line."
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={12}
                className="w-full bg-charcoal-900 border border-gray-800 rounded p-3 text-white focus:outline-none focus:border-gold-600 font-mono leading-relaxed"
                required
              />
            </div>

            {/* SEO section */}
            <div className="border-t border-gold-600/10 pt-4 space-y-4">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center">
                <FolderOpen className="h-4.5 w-4.5 mr-2 text-gold-600" />
                SEO Metadata Configurations
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] text-gray-400 uppercase font-semibold">Meta Title</label>
                  <input
                    type="text"
                    placeholder="Search Engine Title"
                    value={metaTitle}
                    onChange={(e) => setMetaTitle(e.target.value)}
                    className="w-full bg-charcoal-900 border border-gray-800 rounded p-3 text-white focus:outline-none focus:border-gold-600"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-gray-400 uppercase font-semibold">Meta Keywords</label>
                  <input
                    type="text"
                    placeholder="gold, sell gold, cash for gold"
                    value={metaKeywords}
                    onChange={(e) => setMetaKeywords(e.target.value)}
                    className="w-full bg-charcoal-900 border border-gray-800 rounded p-3 text-white focus:outline-none focus:border-gold-600"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-gray-400 uppercase font-semibold">Meta Description</label>
                  <input
                    type="text"
                    placeholder="Search snippet summary..."
                    value={metaDescription}
                    onChange={(e) => setMetaDescription(e.target.value)}
                    className="w-full bg-charcoal-900 border border-gray-800 rounded p-3 text-white focus:outline-none focus:border-gold-600"
                  />
                </div>
              </div>
            </div>

            {/* Form actions */}
            <div className="flex items-center space-x-3 justify-end pt-4">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-6 py-2.5 bg-charcoal-900 border border-gray-800 text-gray-400 hover:text-white rounded font-bold transition-colors"
              >
                Back to List
              </button>
              <button
                type="submit"
                className="px-8 py-2.5 bg-gold-600 hover:bg-gold-500 text-black font-bold rounded transition-colors btn-gold-glow"
              >
                Save Article
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* ARTICLES LIST GRID */
        <div className="glass border border-gold-600/10 rounded-xl overflow-hidden">
          {loading ? (
            <div className="p-12 space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="h-10 w-full animate-shimmer-bg rounded" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-charcoal-900 border-b border-gold-600/10 text-gray-400 font-bold uppercase tracking-wider">
                    <th className="p-3.5">Article Title</th>
                    <th className="p-3.5">Category</th>
                    <th className="p-3.5 text-center">Status</th>
                    <th className="p-3.5">Created Date</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {posts.map((post) => (
                    <tr key={post.id} className="border-b border-gray-850 hover:bg-gold-600/5 transition-colors">
                      <td className="p-3.5">
                        <p className="font-bold text-white">{post.title}</p>
                        <p className="text-[10px] text-gray-500">/{post.slug}</p>
                      </td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded bg-charcoal-950 text-gray-400 font-semibold border border-gray-850">
                          {post.category}
                        </span>
                      </td>
                      <td className="p-3.5 text-center">
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[9px] ${
                          post.isPublished
                            ? 'bg-green-600/15 text-green-400 border border-green-600/25'
                            : 'bg-amber-600/15 text-amber-400 border border-amber-600/25'
                        }`}>
                          {post.isPublished ? 'Published' : 'Draft'}
                        </span>
                      </td>
                      <td className="p-3.5 text-gray-400">
                        {new Date(post.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            onClick={() => handleEditClick(post)}
                            className="p-1.5 rounded hover:bg-gray-800 text-gold-600"
                            title="Edit"
                          >
                            <Edit2 className="h-4.5 w-4.5" />
                          </button>
                          <button
                            onClick={() => handleDeletePost(post.id)}
                            className="p-1.5 rounded hover:bg-gray-800 text-red-400"
                            title="Delete"
                          >
                            <Trash2 className="h-4.5 w-4.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {posts.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-10 text-center text-gray-500">
                        No articles composed yet. Click Create Article above to start.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
