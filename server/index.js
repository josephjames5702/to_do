require('dotenv').config();

const bcrypt = require('bcryptjs');
const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const mongoose = require('mongoose');
const path = require('path');
const { randomUUID } = require('crypto');
const User = require('./models/User');
const Task = require('./models/Task');

const app = express();
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

const port = Number(process.env.API_PORT || process.env.PORT || 5000);
const mongoUri = process.env.MONGO_URI;
const sessionSecret = process.env.SESSION_SECRET;
const demoMode = process.env.DEMO_MODE === 'true';
const demoUsers = new Map();
const demoTasks = new Map();

if (!demoMode && !mongoUri) {
  throw new Error('MONGO_URI is required. Add it to your local .env file.');
}

if (!sessionSecret || sessionSecret.length < 32) {
  throw new Error('SESSION_SECRET must be at least 32 characters long.');
}

app.disable('x-powered-by');
app.use(express.json({ limit: '10kb' }));
let sessionMiddleware;

function asyncRoute(handler) {
  return (request, response, next) => {
    Promise.resolve(handler(request, response, next)).catch(next);
  };
}

function getCredentials(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return {};
  }

  return body;
}

async function startSession(request, userId) {
  await new Promise((resolve, reject) => {
    request.session.regenerate((error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });
  request.session.userId = userId.toString();
  await new Promise((resolve, reject) => {
    request.session.save((error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });
}

const requireAuth = asyncRoute(async (request, response, next) => {
  if (!request.session.userId) {
    response.status(401).json({ error: 'Not signed in.' });
    return;
  }

  const user = demoMode
    ? demoUsers.get(request.session.userId)
    : await User.findById(request.session.userId).select('_id email');
  if (!user) {
    response.status(401).json({ error: 'Not signed in.' });
    return;
  }

  request.user = user;
  next();
});

app.get('/api/health', (request, response) => {
  const connected = mongoose.connection.readyState === 1;
  const available = demoMode || connected;
  response.status(available ? 200 : 503).json({
    status: available ? 'ok' : 'unavailable',
    database: demoMode ? 'in-memory demo' : connected ? 'connected' : 'disconnected',
    demoMode,
  });
});

app.use('/api', (request, response, next) => {
  if (!demoMode && mongoose.connection.readyState !== 1) {
    response.status(503).json({
      error:
        'MongoDB is not connected. Start MongoDB, then wait for the API to connect and try again.',
    });
    return;
  }

  if (!sessionMiddleware) {
    const sessionOptions = {
      name: 'todo.sid',
      secret: sessionSecret,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
      },
    };

    if (!demoMode) {
      sessionOptions.store = MongoStore.create({
        client: mongoose.connection.getClient(),
        collectionName: 'sessions',
        ttl: 7 * 24 * 60 * 60,
      });
    }

    sessionMiddleware = session(sessionOptions);
  }

  sessionMiddleware(request, response, next);
});

app.post(
  '/api/auth/register',
  asyncRoute(async (request, response) => {
    const { email, password } = getCredentials(request.body);
    if (
      typeof email !== 'string' ||
      typeof password !== 'string' ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ||
      Buffer.byteLength(password, 'utf8') < 8 ||
      Buffer.byteLength(password, 'utf8') > 72
    ) {
      response.status(400).json({
        error: 'Enter a valid email and a password between 8 and 72 bytes.',
      });
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = demoMode
      ? [...demoUsers.values()].some((user) => user.email === normalizedEmail)
      : await User.exists({ email: normalizedEmail });
    if (existingUser) {
      response.status(409).json({ error: 'An account with that email exists.' });
      return;
    }

    let user;
    const passwordHash = await bcrypt.hash(password, 12);
    if (demoMode) {
      user = { _id: randomUUID(), email: normalizedEmail, passwordHash };
      demoUsers.set(user._id, user);
      demoTasks.set(user._id, []);
    } else {
      try {
        user = await User.create({ email: normalizedEmail, passwordHash });
      } catch (error) {
        if (error.code === 11000) {
          response
            .status(409)
            .json({ error: 'An account with that email exists.' });
          return;
        }

        throw error;
      }
    }
    await startSession(request, user._id);
    response.status(201).json({
      user: { id: user._id, email: user.email },
    });
  })
);

app.post(
  '/api/auth/login',
  asyncRoute(async (request, response) => {
    const { email, password } = getCredentials(request.body);
    if (typeof email !== 'string' || typeof password !== 'string') {
      response.status(400).json({ error: 'Email and password are required.' });
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = demoMode
      ? [...demoUsers.values()].find(
          (candidate) => candidate.email === normalizedEmail
        )
      : await User.findOne({ email: normalizedEmail })
          .select('+passwordHash')
          .exec();
    const passwordMatches =
      user && (await bcrypt.compare(password, user.passwordHash));

    if (!passwordMatches) {
      response.status(401).json({ error: 'Email or password is incorrect.' });
      return;
    }

    await startSession(request, user._id);
    response.json({ user: { id: user._id, email: user.email } });
  })
);

app.get(
  '/api/auth/me',
  requireAuth,
  (request, response) => {
    response.json({
      user: { id: request.user._id, email: request.user.email },
    });
  }
);

app.post('/api/auth/logout', (request, response, next) => {
  request.session.destroy((error) => {
    if (error) {
      next(error);
      return;
    }

    response.clearCookie('todo.sid', {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });
    response.status(204).end();
  });
});

app.get(
  '/api/tasks',
  requireAuth,
  asyncRoute(async (request, response) => {
    if (demoMode) {
      response.json({ tasks: demoTasks.get(request.user._id) || [] });
      return;
    }

    const tasks = await Task.find({ user: request.user._id })
      .sort({ createdAt: 1 })
      .lean();
    response.json({ tasks });
  })
);

app.post(
  '/api/tasks',
  requireAuth,
  asyncRoute(async (request, response) => {
    const { text } = getCredentials(request.body);
    if (typeof text !== 'string' || !text.trim() || text.trim().length > 500) {
      response.status(400).json({
        error: 'Task text must be between 1 and 500 characters.',
      });
      return;
    }

    let task;
    if (demoMode) {
      task = {
        _id: randomUUID(),
        user: request.user._id,
        text: text.trim(),
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const userTasks = demoTasks.get(request.user._id) || [];
      userTasks.push(task);
      demoTasks.set(request.user._id, userTasks);
    } else {
      task = await Task.create({
        user: request.user._id,
        text: text.trim(),
      });
    }

    response.status(201).json({ task });
  })
);

app.patch(
  '/api/tasks/:id',
  requireAuth,
  asyncRoute(async (request, response) => {
    if (!demoMode && !mongoose.isValidObjectId(request.params.id)) {
      response.status(400).json({ error: 'Invalid task ID.' });
      return;
    }

    const { completed } = getCredentials(request.body);
    if (typeof completed !== 'boolean') {
      response.status(400).json({ error: 'Completed must be true or false.' });
      return;
    }

    let task;
    if (demoMode) {
      const userTasks = demoTasks.get(request.user._id) || [];
      const taskIndex = userTasks.findIndex(
        (item) => item._id === request.params.id
      );
      if (taskIndex !== -1) {
        task = {
          ...userTasks[taskIndex],
          completed,
          updatedAt: new Date(),
        };
        userTasks[taskIndex] = task;
      }
    } else {
      task = await Task.findOneAndUpdate(
        { _id: request.params.id, user: request.user._id },
        { completed },
        { new: true, runValidators: true }
      );
    }
    if (!task) {
      response.status(404).json({ error: 'Task not found.' });
      return;
    }

    response.json({ task });
  })
);

app.delete(
  '/api/tasks/:id',
  requireAuth,
  asyncRoute(async (request, response) => {
    if (!demoMode && !mongoose.isValidObjectId(request.params.id)) {
      response.status(400).json({ error: 'Invalid task ID.' });
      return;
    }

    let task;
    if (demoMode) {
      const userTasks = demoTasks.get(request.user._id) || [];
      const taskIndex = userTasks.findIndex(
        (item) => item._id === request.params.id
      );
      if (taskIndex !== -1) {
        [task] = userTasks.splice(taskIndex, 1);
      }
    } else {
      task = await Task.findOneAndDelete({
        _id: request.params.id,
        user: request.user._id,
      });
    }
    if (!task) {
      response.status(404).json({ error: 'Task not found.' });
      return;
    }

    response.status(204).end();
  })
);

if (process.env.NODE_ENV === 'production') {
  const buildDirectory = path.join(__dirname, '..', 'build');
  app.use(express.static(buildDirectory));
  app.get('*', (request, response, next) => {
    if (request.path.startsWith('/api/')) {
      next();
      return;
    }

    response.sendFile(path.join(buildDirectory, 'index.html'), (error) => {
      if (error) {
        next(error);
      }
    });
  });
}

app.use((error, request, response, next) => {
  console.error(error);
  if (response.headersSent) {
    next(error);
    return;
  }

  response.status(500).json({ error: 'An unexpected server error occurred.' });
});

async function connectToMongo() {
  try {
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
    console.log('Connected to MongoDB.');
  } catch (error) {
    console.error(`Unable to connect to MongoDB: ${error.message}`);
    setTimeout(connectToMongo, 5000).unref();
  }
}

async function startServer() {
  if (demoMode) {
    const passwordHash = await bcrypt.hash('TodoDemo123!', 12);
    const user = {
      _id: randomUUID(),
      email: 'todo.demo@example.com',
      passwordHash,
    };
    demoUsers.set(user._id, user);
    demoTasks.set(user._id, []);
    console.log('Demo account ready: todo.demo@example.com');
  }

  const host =
    demoMode && process.env.NODE_ENV !== 'production'
      ? '127.0.0.1'
      : '0.0.0.0';
  app.listen(port, host, () => {
    console.log(`API server listening on http://localhost:${port}`);
  });

  if (!demoMode) {
    connectToMongo();
  }
}

startServer().catch((error) => {
  console.error(`Unable to start API server: ${error.message}`);
  process.exitCode = 1;
});
