-- Shopping Lists Table
CREATE TABLE IF NOT EXISTS shopping_lists (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL CHECK(length(name) > 0 AND length(name) <= 200),
  status TEXT NOT NULL CHECK(status IN ('active', 'sent', 'completed')),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_shopping_lists_status ON shopping_lists(status);
CREATE INDEX IF NOT EXISTS idx_shopping_lists_created ON shopping_lists(created_at);

-- Shopping List Items Table
CREATE TABLE IF NOT EXISTS shopping_list_items (
  id TEXT PRIMARY KEY,
  shopping_list_id TEXT NOT NULL,
  name TEXT NOT NULL CHECK(length(name) > 0 AND length(name) <= 200),
  quantity TEXT CHECK(quantity IS NULL OR length(quantity) <= 100),
  notes TEXT CHECK(notes IS NULL OR length(notes) <= 500),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (shopping_list_id) REFERENCES shopping_lists(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_items_shopping_list ON shopping_list_items(shopping_list_id);
CREATE INDEX IF NOT EXISTS idx_items_created ON shopping_list_items(created_at);

-- Reminders Table (stub for Task 6)
CREATE TABLE IF NOT EXISTS reminders (
  id TEXT PRIMARY KEY,
  shopping_list_id TEXT NOT NULL,
  scheduled_at TEXT NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('pending', 'sent', 'cancelled')),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (shopping_list_id) REFERENCES shopping_lists(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_reminders_shopping_list ON reminders(shopping_list_id);
CREATE INDEX IF NOT EXISTS idx_reminders_scheduled ON reminders(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_reminders_status ON reminders(status);
