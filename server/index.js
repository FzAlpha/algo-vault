import express from 'express';
import cors from 'cors';
import { db, initDB } from './db.js';
import { fetchLeetCodeProfile } from './leetcode.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

let cachedLanguageDistribution = null;
let cachedDifficultyBreakdown = null;

// ----------------------------------------------------
// USER & AUTHENTICATION ENDPOINTS
// ----------------------------------------------------

app.get('/api/user', (req, res) => {
  try {
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get('usr_primary');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/user', (req, res) => {
  try {
    const { username, full_name, email, title, bio, avatar_url } = req.body;
    const current = db.prepare('SELECT * FROM users WHERE id = ?').get('usr_primary') || {};
    
    const stmt = db.prepare(`
      UPDATE users 
      SET username = ?,
          full_name = ?,
          email = ?,
          title = ?,
          bio = ?,
          avatar_url = ?
      WHERE id = 'usr_primary'
    `);
    
    stmt.run(
      username ?? current.username,
      full_name ?? current.full_name,
      email ?? current.email,
      title ?? current.title,
      bio ?? current.bio,
      avatar_url ?? current.avatar_url
    );
    
    const updated = db.prepare('SELECT * FROM users WHERE id = ?').get('usr_primary');
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/login', (req, res) => {
  try {
    const { terminalId } = req.body;
    const handle = terminalId && terminalId.trim() ? terminalId.trim() : 'Operator';
    
    db.prepare(`
      UPDATE users 
      SET username = ?
      WHERE id = 'usr_primary'
    `).run(handle);

    const user = db.prepare('SELECT * FROM users WHERE id = ?').get('usr_primary');
    res.json({ success: true, user, message: `Terminal operator ${handle} authenticated.` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// LeetCode Authenticate / Sync Endpoint
app.post('/api/auth/leetcode', async (req, res) => {
  try {
    const { username } = req.body;
    if (!username) {
      return res.status(400).json({ error: 'LeetCode username is required' });
    }

    const lcData = await fetchLeetCodeProfile(username);
    const syncedAt = new Date().toISOString();
    const current = db.prepare('SELECT * FROM users WHERE id = ?').get('usr_primary') || {};

    // 1. Update SQLite user record with exact LeetCode streak and metrics
    const updateStmt = db.prepare(`
      UPDATE users 
      SET leetcode_username = ?,
          leetcode_synced_at = ?,
          problems_solved = ?,
          streak_days = ?,
          global_rank = ?,
          global_rank_num = ?,
          success_rate = ?,
          username = ?,
          avatar_url = ?
      WHERE id = 'usr_primary'
    `);

    updateStmt.run(
      lcData.username,
      syncedAt,
      lcData.problemsSolved,
      lcData.streakDays,
      lcData.topPercentage,
      lcData.globalRank,
      lcData.successRate,
      lcData.username || current.username,
      lcData.avatarUrl || current.avatar_url
    );

    // 2. Overwrite / update 365-day activity heatmap in SQLite from LeetCode calendar
    if (lcData.heatmap && Array.isArray(lcData.heatmap)) {
      const insertHeatmap = db.prepare('INSERT OR REPLACE INTO activity_heatmap (date, count, level) VALUES (?, ?, ?)');
      for (const item of lcData.heatmap) {
        insertHeatmap.run(item.date, item.count, item.level);
      }
    }

    // 3. Populate / Sync The Vault with real LeetCode problems
    if (lcData.vaultProblems && Array.isArray(lcData.vaultProblems) && lcData.vaultProblems.length > 0) {
      const insertProb = db.prepare(`
        INSERT OR REPLACE INTO problems (id, name, difficulty, language, time_complexity, space_complexity, runtime_ms, solved_at, code, notes, tags)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      for (const p of lcData.vaultProblems) {
        insertProb.run(p.id, p.name, p.difficulty, p.language, p.time_complexity, p.space_complexity, p.runtime_ms, p.solved_at, p.code, p.notes, p.tags);
      }
    }

    // 4. Cache language distribution & difficulty breakdown
    if (lcData.languageDistribution) {
      cachedLanguageDistribution = lcData.languageDistribution;
    }

    cachedDifficultyBreakdown = {
      Easy: lcData.easySolved || 0,
      Medium: lcData.mediumSolved || 0,
      Hard: lcData.hardSolved || 0
    };

    // 5. Overwrite / insert recent submissions from LeetCode
    if (lcData.recentSubmissions && Array.isArray(lcData.recentSubmissions) && lcData.recentSubmissions.length > 0) {
      const insertSub = db.prepare('INSERT OR REPLACE INTO submissions (id, problem_id, title, difficulty, language, status, runtime_ms, memory_mb, submitted_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
      for (const sub of lcData.recentSubmissions) {
        insertSub.run(sub.id, sub.problem_id, sub.title, sub.difficulty, sub.language, sub.status, sub.runtime_ms, sub.memory_mb, sub.submitted_at);
      }
    }

    const updatedUser = db.prepare('SELECT * FROM users WHERE id = ?').get('usr_primary');
    res.json({ success: true, user: updatedUser, leetcodeData: lcData });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ----------------------------------------------------
// PROBLEMS / VAULT ENDPOINTS
// ----------------------------------------------------

app.get('/api/problems', (req, res) => {
  try {
    const { search, difficulty, language, sort } = req.query;
    let query = 'SELECT * FROM problems WHERE 1=1';
    const params = [];

    if (search) {
      query += ' AND (name LIKE ? OR tags LIKE ? OR notes LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (difficulty && difficulty !== 'All' && difficulty !== 'Difficulty: All') {
      query += ' AND difficulty = ?';
      params.push(difficulty);
    }

    if (language && language !== 'All' && language !== 'Language: All') {
      query += ' AND language = ?';
      params.push(language);
    }

    if (sort === 'Oldest') {
      query += ' ORDER BY created_at ASC';
    } else if (sort === 'Difficulty') {
      query += ` ORDER BY CASE difficulty 
        WHEN 'Hard' THEN 1 
        WHEN 'Medium' THEN 2 
        WHEN 'Easy' THEN 3 
        ELSE 4 END ASC`;
    } else if (sort === 'Most Efficient') {
      query += ' ORDER BY runtime_ms ASC';
    } else {
      query += ' ORDER BY created_at DESC';
    }

    const problems = db.prepare(query).all(params);
    res.json(problems);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/problems/:id', (req, res) => {
  try {
    const problem = db.prepare('SELECT * FROM problems WHERE id = ?').get(req.params.id);
    if (!problem) return res.status(404).json({ error: 'Problem not found' });
    res.json(problem);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/problems', (req, res) => {
  try {
    const {
      name,
      difficulty = 'Medium',
      language = 'Python',
      time_complexity = 'O(n)',
      space_complexity = 'O(1)',
      runtime_ms = 15,
      code = '',
      notes = '',
      tags = 'Algorithms'
    } = req.body;

    if (!name) return res.status(400).json({ error: 'Problem name is required' });

    const id = 'prob-' + Date.now();
    const solved_at = 'Just now';

    const stmt = db.prepare(`
      INSERT INTO problems (id, name, difficulty, language, time_complexity, space_complexity, runtime_ms, solved_at, code, notes, tags)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(id, name, difficulty, language, time_complexity, space_complexity, runtime_ms, solved_at, code, notes, tags);

    // Update total count
    const user = db.prepare('SELECT problems_solved, streak_days FROM users WHERE id = "usr_primary"').get();
    const newCount = (user?.problems_solved || 0) + 1;
    db.prepare('UPDATE users SET problems_solved = ? WHERE id = "usr_primary"').run(newCount);

    // Increment today activity in heatmap
    const today = new Date().toISOString().split('T')[0];
    const act = db.prepare('SELECT * FROM activity_heatmap WHERE date = ?').get(today);
    if (act) {
      const updatedCount = (act.count || 0) + 1;
      const updatedLevel = Math.min(4, (act.level || 0) + 1);
      db.prepare('UPDATE activity_heatmap SET count = ?, level = ? WHERE date = ?').run(updatedCount, updatedLevel, today);
    } else {
      db.prepare('INSERT INTO activity_heatmap (date, count, level) VALUES (?, 1, 1)').run(today);
    }

    const created = db.prepare('SELECT * FROM problems WHERE id = ?').get(id);
    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/problems/:id', (req, res) => {
  try {
    const { name, difficulty, language, time_complexity, space_complexity, runtime_ms, code, notes, tags, is_favorite } = req.body;
    const current = db.prepare('SELECT * FROM problems WHERE id = ?').get(req.params.id);
    if (!current) return res.status(404).json({ error: 'Problem not found' });

    const stmt = db.prepare(`
      UPDATE problems 
      SET name = ?,
          difficulty = ?,
          language = ?,
          time_complexity = ?,
          space_complexity = ?,
          runtime_ms = ?,
          code = ?,
          notes = ?,
          tags = ?,
          is_favorite = ?
      WHERE id = ?
    `);

    stmt.run(
      name ?? current.name,
      difficulty ?? current.difficulty,
      language ?? current.language,
      time_complexity ?? current.time_complexity,
      space_complexity ?? current.space_complexity,
      runtime_ms ?? current.runtime_ms,
      code ?? current.code,
      notes ?? current.notes,
      tags ?? current.tags,
      is_favorite ?? current.is_favorite,
      req.params.id
    );

    const updated = db.prepare('SELECT * FROM problems WHERE id = ?').get(req.params.id);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/problems/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM problems WHERE id = ?').run(req.params.id);
    const user = db.prepare('SELECT problems_solved FROM users WHERE id = "usr_primary"').get();
    const newCount = Math.max(0, (user?.problems_solved || 1) - 1);
    db.prepare('UPDATE users SET problems_solved = ? WHERE id = "usr_primary"').run(newCount);
    res.json({ success: true, message: 'Problem deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ----------------------------------------------------
// STATISTICS & HEATMAP ENDPOINTS
// ----------------------------------------------------

app.get('/api/stats', (req, res) => {
  try {
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get('usr_primary');
    const problems = db.prepare('SELECT difficulty, language, runtime_ms FROM problems').all();
    const heatmap = db.prepare('SELECT date, count, level FROM activity_heatmap ORDER BY date ASC').all();
    const submissions = db.prepare('SELECT * FROM submissions ORDER BY rowid DESC').all().slice(0, 10);

    // Language distribution: Prioritize LeetCode synced counts, fallback to local problems
    let langCounts = cachedLanguageDistribution;
    if (!langCounts || Object.keys(langCounts).length === 0) {
      langCounts = {};
      for (const p of problems) {
        langCounts[p.language] = (langCounts[p.language] || 0) + 1;
      }
      if (Object.keys(langCounts).length === 0) {
        langCounts = { Python: 24, Java: 16, 'C++': 8, Rust: 6 };
      }
    }

    // Difficulty breakdown: Prioritize LeetCode synced breakdown, fallback to local problems
    let diffCounts = cachedDifficultyBreakdown;
    if (!diffCounts || (diffCounts.Easy === 0 && diffCounts.Medium === 0 && diffCounts.Hard === 0)) {
      diffCounts = { Easy: 0, Medium: 0, Hard: 0 };
      for (const p of problems) {
        if (diffCounts[p.difficulty] !== undefined) diffCounts[p.difficulty]++;
      }
      if (diffCounts.Easy === 0 && diffCounts.Medium === 0 && diffCounts.Hard === 0) {
        const total = user?.problems_solved || 54;
        diffCounts = {
          Easy: Math.floor(total * 0.38),
          Medium: Math.floor(total * 0.48),
          Hard: total - Math.floor(total * 0.38) - Math.floor(total * 0.48)
        };
      }
    }

    const totalSolved = user?.problems_solved || problems.length || 54;
    const weeklyGoalTarget = Math.max(15, Math.ceil(totalSolved * 0.1));
    const weeklySolved = Math.min(weeklyGoalTarget, Math.floor(weeklyGoalTarget * 0.72));

    res.json({
      user,
      totalProblems: totalSolved,
      difficultyBreakdown: diffCounts,
      languageDistribution: langCounts,
      heatmap,
      recentSubmissions: submissions,
      weeklyGoal: {
        solved: weeklySolved,
        total: weeklyGoalTarget,
        percentage: Math.round((weeklySolved / weeklyGoalTarget) * 100)
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ----------------------------------------------------
// AI INSIGHTS ENDPOINTS
// ----------------------------------------------------

app.get('/api/ai/insights', (req, res) => {
  try {
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get('usr_primary');
    res.json({
      status: 'Engine Active',
      model: 'vault-v2-optimized',
      latestRun: '14 mins ago',
      userHandle: user?.leetcode_username || user?.username,
      analysis: {
        title: 'Deep Dive Analysis: Substring Matcher',
        language: 'Python',
        detectedComplexity: 'O(N^2) Detected',
        targetFunction: `def find_longest_substring(s: str) -> int:
    n = len(s)
    res = 0
    for i in range(n):
        for j in range(i, n):
            if check_repetition(s, i, j):
                res = max(res, j - i + 1)
    return res`,
        annotatedCode: `# AI Heat Zone Annotation:
# The inner loop forces redundant checks across previously evaluated substrings.
# A sliding window approach utilizing a hash set will linearize this operation to O(N).`,
        optimizedFunction: `def find_longest_substring_optimized(s: str) -> int:
    char_index = {}
    left = max_len = 0
    for right, char in enumerate(s):
        if char in char_index and char_index[char] >= left:
            left = char_index[char] + 1
        char_index[char] = right
        max_len = max(max_len, right - left + 1)
    return max_len`,
        timeImprovement: 'O(N²) -> O(N)',
        spaceTradeoff: 'O(1) -> O(min(m, n))',
        speedup: '94.8% latency reduction on N=10,000'
      },
      recommendations: [
        {
          title: 'Minimum Window Substring',
          difficulty: 'Hard',
          pattern: 'Sliding Window',
          reason: 'Consolidates two-pointer boundary contraction logic'
        },
        {
          title: 'Longest Repeating Character Replacement',
          difficulty: 'Medium',
          pattern: 'Sliding Window + Frequency Map',
          reason: 'Reinforces dynamic window expansion heuristics'
        },
        {
          title: 'Fruit Into Baskets',
          difficulty: 'Medium',
          pattern: 'Sliding Window',
          reason: 'Direct application of max length condition checks'
        }
      ]
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ----------------------------------------------------
// SETTINGS ENDPOINTS
// ----------------------------------------------------

app.get('/api/settings', (req, res) => {
  try {
    const settings = db.prepare('SELECT * FROM settings WHERE id = ?').get('config_primary');
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/settings', (req, res) => {
  try {
    const current = db.prepare('SELECT * FROM settings WHERE id = ?').get('config_primary') || {};
    const {
      theme,
      font_family,
      font_size,
      vim_mode,
      leetcode_auto_sync,
      sync_frequency,
      ai_model,
      complexity_threshold,
      ai_severity,
      sound_effects,
      telemetry
    } = req.body;

    const stmt = db.prepare(`
      UPDATE settings 
      SET theme = ?,
          font_family = ?,
          font_size = ?,
          vim_mode = ?,
          leetcode_auto_sync = ?,
          sync_frequency = ?,
          ai_model = ?,
          complexity_threshold = ?,
          ai_severity = ?,
          sound_effects = ?,
          telemetry = ?
      WHERE id = 'config_primary'
    `);

    stmt.run(
      theme ?? current.theme,
      font_family ?? current.font_family,
      font_size ?? current.font_size,
      vim_mode ?? current.vim_mode,
      leetcode_auto_sync ?? current.leetcode_auto_sync,
      sync_frequency ?? current.sync_frequency,
      ai_model ?? current.ai_model,
      complexity_threshold ?? current.complexity_threshold,
      ai_severity ?? current.ai_severity,
      sound_effects ?? current.sound_effects,
      telemetry ?? current.telemetry
    );

    const updated = db.prepare('SELECT * FROM settings WHERE id = ?').get('config_primary');
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Export Database JSON
app.get('/api/db/export', (req, res) => {
  try {
    const users = db.prepare('SELECT * FROM users').all();
    const problems = db.prepare('SELECT * FROM problems').all();
    const heatmap = db.prepare('SELECT * FROM activity_heatmap').all();
    const settings = db.prepare('SELECT * FROM settings').all();
    const submissions = db.prepare('SELECT * FROM submissions').all();
    res.setHeader('Content-Disposition', 'attachment; filename=algovault_backup.json');
    res.json({ exported_at: new Date().toISOString(), users, problems, heatmap, settings, submissions });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Reset Database to Defaults
app.post('/api/db/reset', async (req, res) => {
  try {
    db.exec(`
      DROP TABLE IF EXISTS users;
      DROP TABLE IF EXISTS problems;
      DROP TABLE IF EXISTS activity_heatmap;
      DROP TABLE IF EXISTS settings;
      DROP TABLE IF EXISTS submissions;
    `);
    cachedLanguageDistribution = null;
    cachedDifficultyBreakdown = null;
    await initDB();
    res.json({ success: true, message: 'Database reset to factory defaults' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Boot server
initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Algo-Vault Server listening on port ${PORT}`);
  });
}).catch(err => {
  console.error('Failed to initialize database:', err);
});
