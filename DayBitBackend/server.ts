import express from 'express';
import cors from 'cors';
import Database from 'better-sqlite3';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const app = express();
const PORT = 3000;
const HOST = '0.0.0.0';
const LOCAL_IP = '10.0.0.11';

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

interface DbPost {
  id: number;
  user_name: string;
  type: 'photo' | 'text';
  image_url: string | null;
  caption: string | null;
  text_content: string | null;
  bg_color: string | null;
  likes: number;
  comments: number;
  created_at: string;
}

interface DbPostLike {
  id: number;
  post_id: number;
  user_id: string;
}

const db = new Database('daybit.db');

db.exec(`
  CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('photo', 'text')),
    image_url TEXT,
    caption TEXT,
    text_content TEXT,
    bg_color TEXT,
    likes INTEGER DEFAULT 0,
    comments INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS post_likes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    post_id INTEGER,
    user_id TEXT,
    UNIQUE(post_id, user_id)
  )
`);

app.get('/api/posts', (req, res) => {
  const user_id = 'current_user';
  const posts = db.prepare(`
    SELECT p.*, 
           (SELECT 1 FROM post_likes pl WHERE pl.post_id = p.id AND pl.user_id = ?) as is_liked
    FROM posts p ORDER BY created_at DESC
  `).all(user_id) as any[];
  
  const formattedPosts = posts.map(post => ({
    id: post.id.toString(),
    user: { name: post.user_name, avatar: '' },
    image: post.image_url ? `http://${LOCAL_IP}:${PORT}/uploads/${path.basename(post.image_url)}` : null,
    caption: post.caption || '',
    textContent: post.text_content || '',
    bgColor: post.bg_color || null,
    type: post.type,
    likes: post.likes,
    isLiked: !!post.is_liked,
    comments: post.comments,
    time: formatTime(post.created_at)
  }));
  
  res.json(formattedPosts);
});

app.post('/api/posts', upload.single('image'), (req, res) => {
  console.log('--- POST /api/posts received ---');
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  console.log('File:', req.file);
  console.log('Files:', req.files);
  
  const { user_name, type, caption, text_content, bg_color } = req.body;
  const image_filename = req.file ? req.file.filename : null;
  
  console.log('Creating post:', { user_name, type, image_filename, caption, text_content, bg_color });

  const stmt = db.prepare(`
    INSERT INTO posts (user_name, type, image_url, caption, text_content, bg_color)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  
  const result = stmt.run(user_name || 'Your Name', type, image_filename, caption, text_content, bg_color);
  
  res.json({
    id: result.lastInsertRowid,
    message: 'Post created successfully',
    image_filename: image_filename
  });
});

app.post('/api/posts/:id/like', (req, res) => {
  const { id } = req.params;
  const { user_id = 'current_user' } = req.body;
  
  const check = db.prepare('SELECT * FROM post_likes WHERE post_id = ? AND user_id = ?').get(id, user_id) as DbPostLike | undefined;
  
  if (check) {
    db.prepare('DELETE FROM post_likes WHERE post_id = ? AND user_id = ?').run(id, user_id);
    db.prepare('UPDATE posts SET likes = likes - 1 WHERE id = ?').run(id);
  } else {
    db.prepare('INSERT INTO post_likes (post_id, user_id) VALUES (?, ?)').run(id, user_id);
    db.prepare('UPDATE posts SET likes = likes + 1 WHERE id = ?').run(id);
  }
  
  const post = db.prepare('SELECT * FROM posts WHERE id = ?').get(id) as DbPost | undefined;
  if (post) {
    res.json({ likes: post.likes, liked: !check });
  } else {
    res.status(404).json({ error: 'Post not found' });
  }
});

app.post('/api/posts/:id/comment', (req, res) => {
  const { id } = req.params;
  
  db.prepare('UPDATE posts SET comments = comments + 1 WHERE id = ?').run(id);
  
  const post = db.prepare('SELECT * FROM posts WHERE id = ?').get(id) as DbPost | undefined;
  if (post) {
    res.json({ comments: post.comments });
  } else {
    res.status(404).json({ error: 'Post not found' });
  }
});

function formatTime(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  return date.toLocaleDateString();
}



app.listen(PORT, HOST, () => {
  console.log(`Server running on http://${LOCAL_IP}:${PORT}`);
  console.log(`Also accessible on http://localhost:${PORT}`);
});
