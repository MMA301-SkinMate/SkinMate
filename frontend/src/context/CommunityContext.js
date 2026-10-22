import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { copyCommunityRoutine, createCommunityPost, deleteCommunityPost, listCommunityPosts, toggleCommunityPostLike } from '../api/communityApi';

const CommunityContext = createContext(null);

export function CommunityProvider({ children }) {
  const [posts, setPosts] = useState([]);
  const [skinTypeFilter, setSkinTypeFilter] = useState(null);
  const [isCommunityLoading, setIsCommunityLoading] = useState(false);
  const [communityError, setCommunityError] = useState(null);

  const refreshPosts = useCallback(async () => {
    setIsCommunityLoading(true);
    setCommunityError(null);
    try {
      const result = await listCommunityPosts(skinTypeFilter ? { skinType: skinTypeFilter } : {});
      setPosts(result.posts || []);
    } catch (error) {
      setCommunityError(error.message || 'Không thể tải bài viết cộng đồng.');
    } finally {
      setIsCommunityLoading(false);
    }
  }, [skinTypeFilter]);

  useEffect(() => { refreshPosts(); }, [refreshPosts]);

  const replacePost = post => setPosts(current => current.map(item => item.id === post.id ? post : item));

  const addPost = useCallback(async payload => {
    const result = await createCommunityPost(payload);
    if (result.post.status === 'published') setPosts(current => [result.post, ...current]);
    return result.post;
  }, []);
  const toggleLike = useCallback(async id => {
    const result = await toggleCommunityPostLike(id);
    replacePost(result.post);
    return result.post;
  }, []);
  const copyRoutine = useCallback(async id => {
    const result = await copyCommunityRoutine(id);
    replacePost(result.post);
    return result;
  }, []);
  const removePost = useCallback(async id => {
    await deleteCommunityPost(id);
    setPosts(current => current.filter(post => post.id !== id));
  }, []);

  const value = useMemo(() => ({
    posts, skinTypeFilter, setSkinTypeFilter, isCommunityLoading, communityError,
    refreshPosts, addPost, toggleLike, copyRoutine, removePost,
  }), [posts, skinTypeFilter, isCommunityLoading, communityError, refreshPosts, addPost, toggleLike, copyRoutine, removePost]);
  return <CommunityContext.Provider value={value}>{children}</CommunityContext.Provider>;
}

export function useCommunity() {
  const value = useContext(CommunityContext);
  if (!value) throw new Error('useCommunity must be used inside CommunityProvider');
  return value;
}
