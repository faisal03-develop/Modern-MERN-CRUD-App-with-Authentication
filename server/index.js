const express = require('express');
const cors = require('cors');
const app = express();
const db = require('./models'); // Import the models
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const auth = require('./middleware/auth'); // TokenVerificationMiddleware


// Middleware
app.use(cors());
app.use(express.json());

// Simple Test Route
app.get('/', (req, res) => {
  res.send('Hello from Express Server!');
});

app.get('/posts', async (req, res) => {
  try {
    const posts = await db.Post.findAll({
      include: [{
        model: db.User,
        attributes: ['username']
      }]
    });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/posts', auth, async (req, res) => {
  try {
    const { title, content } = req.body;
    const post = await db.Post.create({ title, content, userId: req.userId }); 
    res.json(post);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/posts/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;
    const [updatedRows] = await db.Post.update({ title, content }, {
      where: { id: id, userId: req.userId } 
    });

    if (updatedRows === 0) {
       return res.status(403).json({ error: 'Access denied or post not found.' });
    }

    const updatedPost = await db.Post.findByPk(id);
    res.json(updatedPost);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/posts/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await db.Post.destroy({
      where: { id: id, userId: req.userId } 
    });

    if (deleted === 0) {
       return res.status(403).json({ error: 'Access denied or post not found.' });
    }

    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


app.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await db.User.create({
      username,
      email,
      password: hashedPassword
    });

    res.json(newUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await db.User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, username: user.username }, 'SECRET_KEY', { expiresIn: '1h' });

    res.json({ token, user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 5000;

db.sequelize.sync().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}).catch((err) => {
  console.log("Failed to sync database: " + err.message);
});