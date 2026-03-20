// src/pages/Home.jsx
import { useEffect, useState } from 'react';
import Hero from '../components/Hero';
import PostGrid from '../components/PostGrid';
import CreatePost from '../components/CreatePost';
import { getPosts } from '../services/api';

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [showCreate, setShowCreate] = useState(false);

  const loadPosts = () => {
    getPosts()
      .then((res) => {
        if (res.data?.data?.length > 0) setPosts(res.data.data);
      })
      .catch((err) => console.log('Error loading posts', err));
  };

  useEffect(() => { loadPosts(); }, []);

  return (
    <main style={{ background: '#060B14', minHeight: '100vh' }}>
      <Hero onShareClick={() => setShowCreate(true)} />
      <PostGrid posts={posts} />

      {showCreate && (
        <CreatePost
          onClose={() => setShowCreate(false)}
          onCreated={() => { setShowCreate(false); loadPosts(); }}
        />
      )}
    </main>
  );
}