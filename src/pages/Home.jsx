// src/pages/Home.jsx
import { useEffect, useState, useRef } from 'react';
import Hero from '../components/Hero';
import PostGrid from '../components/PostGrid';
import CreatePost from '../components/CreatePost';
import { getPosts } from '../services/api';

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const feedRef = useRef(null);

  const loadPosts = () => {
    getPosts()
      .then((res) => {
        if (res.data?.data?.length > 0) setPosts(res.data.data);
      })
      .catch((err) => console.log('Error loading posts', err));
  };

  useEffect(() => { loadPosts(); }, []);

  const scrollToFeed = () => {
    feedRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <main style={{ background: '#060B14', minHeight: '100vh' }}>
      <Hero onShareClick={() => setShowCreate(true)} onBrowseClick={scrollToFeed} />
      <div ref={feedRef}>
        <PostGrid posts={posts} />
      </div>

      {showCreate && (
        <CreatePost
          onClose={() => setShowCreate(false)}
          onCreated={() => { setShowCreate(false); loadPosts(); }}
        />
      )}
    </main>
  );
}