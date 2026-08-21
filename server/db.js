import initSqlJs from 'sql.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, '..', 'algovault.db');

let SQL;
let rawDb;

// Helper wrapper to provide intuitive prepare/run/get/all and auto-save methods
class DBWrapper {
  constructor(database) {
    this.database = database;
  }

  save() {
    try {
      const data = this.database.export();
      const buffer = Buffer.from(data);
      fs.writeFileSync(dbPath, buffer);
    } catch (err) {
      console.error('Error saving SQLite DB to disk:', err);
    }
  }

  exec(sql) {
    this.database.exec(sql);
    this.save();
  }

  prepare(sql) {
    const database = this.database;
    const save = () => this.save();

    return {
      run(...params) {
        if (params.length === 1 && typeof params[0] === 'object' && !Array.isArray(params[0])) {
          // Object params
          const obj = params[0];
          // Replace @key or :key or $key with values
          const namedKeys = Object.keys(obj);
          let modifiedSql = sql;
          const boundVals = [];
          for (const key of namedKeys) {
            const regex = new RegExp(`[@:$]${key}\\b`, 'g');
            if (modifiedSql.match(regex)) {
              modifiedSql = modifiedSql.replace(regex, '?');
              boundVals.push(obj[key]);
            }
          }
          const stmt = database.prepare(modifiedSql);
          stmt.run(boundVals);
          stmt.free();
        } else {
          // Positional params
          const flatParams = params.flat();
          const stmt = database.prepare(sql);
          stmt.run(flatParams);
          stmt.free();
        }
        save();
        return { changes: 1 };
      },

      get(...params) {
        const flatParams = params.flat();
        const stmt = database.prepare(sql);
        if (flatParams.length > 0) stmt.bind(flatParams);
        let result = null;
        if (stmt.step()) {
          result = stmt.getAsObject();
        }
        stmt.free();
        return result;
      },

      all(...params) {
        const flatParams = params.flat();
        const stmt = database.prepare(sql);
        if (flatParams.length > 0) stmt.bind(flatParams);
        const results = [];
        while (stmt.step()) {
          results.push(stmt.getAsObject());
        }
        stmt.free();
        return results;
      }
    };
  }

  transaction(fn) {
    return (...args) => {
      this.database.exec('BEGIN TRANSACTION;');
      try {
        const res = fn(...args);
        this.database.exec('COMMIT;');
        this.save();
        return res;
      } catch (e) {
        this.database.exec('ROLLBACK;');
        throw e;
      }
    };
  }
}

export let db;

export async function initDB() {
  if (!SQL) {
    SQL = await initSqlJs();
  }

  if (fs.existsSync(dbPath)) {
    const filebuffer = fs.readFileSync(dbPath);
    rawDb = new SQL.Database(filebuffer);
  } else {
    rawDb = new SQL.Database();
  }

  db = new DBWrapper(rawDb);

  // Setup tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT NOT NULL,
      full_name TEXT,
      email TEXT,
      avatar_url TEXT,
      title TEXT,
      bio TEXT,
      level INTEGER DEFAULT 99,
      streak_days INTEGER DEFAULT 26,
      problems_solved INTEGER DEFAULT 54,
      global_rank TEXT DEFAULT 'Top 12%',
      global_rank_num TEXT DEFAULT '#42',
      avg_time TEXT DEFAULT '14m 20s',
      total_time TEXT DEFAULT '142h 32m',
      avg_runtime_percentile INTEGER DEFAULT 88,
      success_rate REAL DEFAULT 94.2,
      code_efficiency INTEGER DEFAULT 92,
      leetcode_username TEXT,
      leetcode_synced_at TEXT,
      api_token TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS problems (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      difficulty TEXT NOT NULL,
      language TEXT NOT NULL,
      time_complexity TEXT,
      space_complexity TEXT,
      runtime_ms INTEGER,
      solved_at TEXT,
      code TEXT,
      notes TEXT,
      tags TEXT,
      is_favorite INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS activity_heatmap (
      date TEXT PRIMARY KEY,
      count INTEGER DEFAULT 0,
      level INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS settings (
      id TEXT PRIMARY KEY,
      theme TEXT DEFAULT 'dark',
      font_family TEXT DEFAULT 'JetBrains Mono',
      font_size TEXT DEFAULT '14px',
      vim_mode INTEGER DEFAULT 0,
      leetcode_auto_sync INTEGER DEFAULT 1,
      sync_frequency TEXT DEFAULT 'Every 6 hours',
      ai_model TEXT DEFAULT 'vault-v2-optimized',
      complexity_threshold TEXT DEFAULT 'O(N^2)',
      ai_severity TEXT DEFAULT 'Strict (Flag sub-optimal heuristics)',
      telemetry INTEGER DEFAULT 1,
      sound_effects INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS submissions (
      id TEXT PRIMARY KEY,
      problem_id TEXT,
      title TEXT NOT NULL,
      difficulty TEXT,
      language TEXT,
      status TEXT DEFAULT 'Accepted',
      runtime_ms INTEGER,
      memory_mb REAL,
      submitted_at TEXT
    );
  `);

  // Seed default user if empty
  const user = db.prepare('SELECT COUNT(*) as count FROM users').get();
  if (!user || user.count === 0) {
    db.prepare(`
      INSERT INTO users (
        id, username, full_name, email, avatar_url, title, bio, level, streak_days, 
        problems_solved, global_rank, global_rank_num, avg_time, total_time, 
        avg_runtime_percentile, success_rate, code_efficiency, leetcode_username, api_token
      ) VALUES (
        'usr_primary', 'Vault_Architect', 'Alex Mercer', 'sysadmin@algo-vault.net',
        'https://lh3.googleusercontent.com/aida-public/AB6AXuA-bZztR6p2vQsH9f-e1uOkaxYljNvtwGQe6J1Kjbyf-OAgAzCBkP7uKSynszR847bpDFLzM6Qr4_QKrWtZ4liphs5VQ38vm_B3hHPb9sbF_yYbNisTVlWCIpL5mYNXDCmX-ym5lYcAYIZZWTORGEIJY0fpfSOtkoE9FoXyhVbIpK0k5Hdd53dVIrHm0kajofj6RgotlsEsMgWBLH_EvCNQpa3GwInmTWjde3v--wHZA6LbdQLuFXfd',
        'Senior Optimizer // O(1) Specialist',
        'Full-stack engineer specializing in O(1) solutions and high-concurrency systems. Currently refactoring the world.',
        99, 26, 54, 'Top 12%', '#42', '14m 20s', '142h 32m', 88, 94.2, 92, 'vault_architect',
        'av_live_9f8a72b1049c81e7d32e49f2'
      )
    `).run();
  }

  // Seed default settings if empty
  const settingsCheck = db.prepare('SELECT COUNT(*) as count FROM settings').get();
  if (!settingsCheck || settingsCheck.count === 0) {
    db.prepare(`
      INSERT INTO settings (
        id, theme, font_family, font_size, vim_mode, leetcode_auto_sync, sync_frequency, ai_model, complexity_threshold, ai_severity
      ) VALUES (
        'config_primary', 'dark', 'JetBrains Mono', '14px', 0, 1, 'Every 6 hours', 'vault-v2-optimized', 'O(N^2)', 'Strict (Flag sub-optimal heuristics)'
      )
    `).run();
  }

  // Seed default problems from Stitch design
  const problemCheck = db.prepare('SELECT COUNT(*) as count FROM problems').get();
  if (!problemCheck || problemCheck.count === 0) {
    const initialProblems = [
      {
        id: 'prob-1',
        name: 'Two Sum',
        difficulty: 'Easy',
        language: 'Python',
        time_complexity: 'O(n)',
        space_complexity: 'O(n)',
        runtime_ms: 12,
        solved_at: '2 days ago',
        code: `class Solution:\n    def twoSum(self, nums: list[int], target: int) -> list[int]:\n        hashmap = {}\n        for i, num in enumerate(nums):\n            diff = target - num\n            if diff in hashmap:\n                return [hashmap[diff], i]\n            hashmap[num] = i\n        return []`,
        notes: 'Optimal single-pass hash table lookup. Time: O(n), Space: O(n).',
        tags: 'Array,Hash Table'
      },
      {
        id: 'prob-2',
        name: 'Merge k Sorted Lists',
        difficulty: 'Hard',
        language: 'Java',
        time_complexity: 'O(N log k)',
        space_complexity: 'O(1)',
        runtime_ms: 24,
        solved_at: '5 days ago',
        code: `class Solution {\n    public ListNode mergeKLists(ListNode[] lists) {\n        PriorityQueue<ListNode> pq = new PriorityQueue<>((a, b) -> a.val - b.val);\n        for (ListNode node : lists) {\n            if (node != null) pq.add(node);\n        }\n        ListNode dummy = new ListNode(0);\n        ListNode curr = dummy;\n        while (!pq.isEmpty()) {\n            ListNode smallest = pq.poll();\n            curr.next = smallest;\n            curr = curr.next;\n            if (smallest.next != null) pq.add(smallest.next);\n        }\n        return dummy.next;\n    }\n}`,
        notes: 'Min-Heap priority queue implementation merging k lists in O(N log k) time.',
        tags: 'Linked List,Divide and Conquer,Heap (Priority Queue)'
      },
      {
        id: 'prob-3',
        name: 'LRU Cache',
        difficulty: 'Medium',
        language: 'C++',
        time_complexity: 'O(1)',
        space_complexity: 'O(capacity)',
        runtime_ms: 8,
        solved_at: '1 week ago',
        code: `class LRUCache {\n    int cap;\n    list<pair<int, int>> dll;\n    unordered_map<int, list<pair<int, int>>::iterator> mp;\npublic:\n    LRUCache(int capacity) : cap(capacity) {}\n    \n    int get(int key) {\n        if (mp.find(key) == mp.end()) return -1;\n        dll.splice(dll.begin(), dll, mp[key]);\n        return mp[key]->second;\n    }\n    \n    void put(int key, int value) {\n        if (mp.find(key) != mp.end()) {\n            mp[key]->second = value;\n            dll.splice(dll.begin(), dll, mp[key]);\n            return;\n        }\n        if (dll.size() == cap) {\n            int k = dll.back().first;\n            dll.pop_back();\n            mp.erase(k);\n        }\n        dll.emplace_front(key, value);\n        mp[key] = dll.begin();\n    }\n};`,
        notes: 'Hash map + doubly linked list for guaranteed O(1) get and put operations.',
        tags: 'Hash Table,Linked List,Design,Doubly-Linked List'
      },
      {
        id: 'prob-4',
        name: 'Trapping Rain Water',
        difficulty: 'Hard',
        language: 'Python',
        time_complexity: 'O(n)',
        space_complexity: 'O(1)',
        runtime_ms: 18,
        solved_at: '2 weeks ago',
        code: `class Solution:\n    def trap(self, height: list[int]) -> int:\n        if not height: return 0\n        l, r = 0, len(height) - 1\n        l_max, r_max = height[l], height[r]\n        ans = 0\n        while l < r:\n            if l_max < r_max:\n                l += 1\n                l_max = max(l_max, height[l])\n                ans += l_max - height[l]\n            else:\n                r -= 1\n                r_max = max(r_max, height[r])\n                ans += r_max - height[r]\n        return ans`,
        notes: 'Two-pointer approach maintaining left and right peak boundaries.',
        tags: 'Array,Two Pointers,Dynamic Programming,Stack'
      },
      {
        id: 'prob-5',
        name: 'Longest Substring Without Repeating Characters',
        difficulty: 'Medium',
        language: 'Python',
        time_complexity: 'O(n)',
        space_complexity: 'O(min(m, n))',
        runtime_ms: 14,
        solved_at: '3 weeks ago',
        code: `class Solution:\n    def lengthOfLongestSubstring(self, s: str) -> int:\n        char_map = {}\n        left = 0\n        max_len = 0\n        for right, char in enumerate(s):\n            if char in char_map and char_map[char] >= left:\n                left = char_map[char] + 1\n            char_map[char] = right\n            max_len = max(max_len, right - left + 1)\n        return max_len`,
        notes: 'Sliding window technique using character index mapping to achieve O(n) linear performance.',
        tags: 'Hash Table,String,Sliding Window'
      },
      {
        id: 'prob-6',
        name: 'Valid Anagram',
        difficulty: 'Easy',
        language: 'Rust',
        time_complexity: 'O(n)',
        space_complexity: 'O(1)',
        runtime_ms: 2,
        solved_at: '3 weeks ago',
        code: `impl Solution {\n    pub fn is_anagram(s: String, t: String) -> bool {\n        if s.len() != t.len() { return false; }\n        let mut counts = [0i32; 26];\n        for (b1, b2) in s.bytes().zip(t.bytes()) {\n            counts[(b1 - b'a') as usize] += 1;\n            counts[(b2 - b'a') as usize] -= 1;\n        }\n        counts.iter().all(|&c| c == 0)\n    }\n}`,
        notes: 'Direct 26-element array bucket count for zero-allocation Rust optimization.',
        tags: 'Hash Table,String,Sorting'
      }
    ];

    const insertStmt = db.prepare(`
      INSERT INTO problems (id, name, difficulty, language, time_complexity, space_complexity, runtime_ms, solved_at, code, notes, tags)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const prob of initialProblems) {
      insertStmt.run([
        prob.id, prob.name, prob.difficulty, prob.language,
        prob.time_complexity, prob.space_complexity, prob.runtime_ms,
        prob.solved_at, prob.code, prob.notes, prob.tags
      ]);
    }
  }

  // Seed activity heatmap if empty (365 days)
  const activityCheck = db.prepare('SELECT COUNT(*) as count FROM activity_heatmap').get();
  if (!activityCheck || activityCheck.count === 0) {
    const insertActivity = db.prepare('INSERT OR REPLACE INTO activity_heatmap (date, count, level) VALUES (?, ?, ?)');
    const now = new Date();
    for (let i = 364; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const rand = Math.random();
      let level = 0;
      let count = 0;
      if (rand > 0.45) {
        if (rand > 0.88) { level = 4; count = Math.floor(Math.random() * 8) + 8; }
        else if (rand > 0.72) { level = 3; count = Math.floor(Math.random() * 4) + 4; }
        else if (rand > 0.58) { level = 2; count = Math.floor(Math.random() * 3) + 2; }
        else { level = 1; count = 1; }
      }
      insertActivity.run([dateStr, count, level]);
    }
  }

  // Seed sample submissions if empty
  const subCheck = db.prepare('SELECT COUNT(*) as count FROM submissions').get();
  if (!subCheck || subCheck.count === 0) {
    const sampleSubs = [
      { id: 'sub-1', problem_id: 'prob-1', title: 'Two Sum', difficulty: 'Easy', language: 'Python', status: 'Accepted', runtime_ms: 12, memory_mb: 17.2, submitted_at: '2 hours ago' },
      { id: 'sub-2', problem_id: 'prob-2', title: 'Merge k Sorted Lists', difficulty: 'Hard', language: 'Java', status: 'Accepted', runtime_ms: 24, memory_mb: 44.8, submitted_at: '1 day ago' },
      { id: 'sub-3', problem_id: 'prob-3', title: 'LRU Cache', difficulty: 'Medium', language: 'C++', status: 'Accepted', runtime_ms: 8, memory_mb: 28.6, submitted_at: '3 days ago' },
      { id: 'sub-4', problem_id: 'prob-4', title: 'Trapping Rain Water', difficulty: 'Hard', language: 'Python', status: 'Accepted', runtime_ms: 18, memory_mb: 18.9, submitted_at: '5 days ago' },
      { id: 'sub-5', problem_id: 'prob-5', title: 'Longest Substring Without Repeating Characters', difficulty: 'Medium', language: 'Python', status: 'Accepted', runtime_ms: 14, memory_mb: 16.5, submitted_at: '1 week ago' },
    ];
    const insertSub = db.prepare('INSERT INTO submissions (id, problem_id, title, difficulty, language, status, runtime_ms, memory_mb, submitted_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
    for (const sub of sampleSubs) {
      insertSub.run([sub.id, sub.problem_id, sub.title, sub.difficulty, sub.language, sub.status, sub.runtime_ms, sub.memory_mb, sub.submitted_at]);
    }
  }
}
