# Shopping List & Recipe Assistant - Project Status

**Last Updated:** December 8, 2025  
**Current Phase:** Task 4 Complete → Home Cooking Expansion Planned  
**Overall Status:** ✅ Backend API Complete | ✅ Mobile CRUD Complete | ✅ Send to Manager Complete | ✅ Voice Stubs Complete | ✅ Backend Voice Services Complete | ✅ Mobile Audio & Voice Commands Working

**📋 GitHub Issues:** [36 issues created](#github-issues-reference) (#26-#61) across 6 epics for home cooking expansion

---

## 🎯 Project Context

**Purpose:** Enable both restaurant professionals and home cooks to manage shopping lists and recipes using natural voice commands.

**Key User Segments:**

### Restaurant Users (Current Focus)
- **Chefs:** Create lists via mobile app (voice-first, hands-free)
- **Managers:** Receive sent lists and place orders via web interface

### Home Users (Planned Expansion)
- **Home Cooks:** Voice-guided recipe assistance while cooking
- **Meal Planners:** Generate shopping lists from recipes
- **Grocery Shoppers:** Manage and order groceries hands-free

**Critical Features:**

**Restaurant Mode:**
- Voice-driven list/item creation (OpenAI Whisper + GPT-4)
- Text-to-speech confirmations
- Send list workflow (chef → manager)
- Push notifications for reminders
- Mobile-first design (large touch targets, kitchen-friendly)

**Home Cooking Mode (Planned):**
- Hands-free recipe guidance ("what's the next step?")
- Voice-driven recipe search ("find a recipe for cheesecake")
- Ingredient recall ("how many eggs was it?")
- Automatic shopping list generation from recipes
- Multi-recipe meal planning
- Instacart/grocery service integration

---

## 🏠 Home User Feature Set (Planned)

### Phase 1: Recipe Voice Assistant (Core Experience)

> **GitHub Issues:** Epic 1 (#26, #28-#31) & Epic 2 (#32-#38)

**Use Cases:**
```
User: "Find a recipe for New York cheesecake"
Assistant: "I found 3 recipes. The most popular is Classic New York Cheesecake with 4.8 stars. Would you like to hear the details?"

User: "Start cooking"
Assistant: "Okay, starting Classic New York Cheesecake. First, preheat your oven to 325°F. Let me know when you're ready for the next step."

User: "Next step"
Assistant: "In a large bowl, beat the cream cheese until fluffy, about 2-3 minutes."

User: "How many eggs was it?"
Assistant: "The recipe calls for 4 large eggs."

User: "Set a timer for 3 minutes"
Assistant: "Timer set for 3 minutes. I'll let you know when it's done."
```

**Voice Commands - Recipe Navigation:**
- "Find a recipe for [dish]"
- "Show me [cuisine] recipes"
- "What's the next step?"
- "Repeat that step"
- "Go back a step"
- "How long does this take?"
- "Jump to step [number]"
- "What ingredients do I need?"
- "How many [ingredient] do I need?"
- "Can I substitute [ingredient]?"

**Voice Commands - Cooking Support:**
- "Set a timer for [duration]"
- "How much time is left?"
- "Cancel timer"
- "What temperature should the oven be?"
- "Is this step done?"
- "Pause recipe"
- "Resume recipe"

**Technical Implementation:**
- Recipe database/API integration (Spoonacular, Edamam, or custom)
- Recipe state management (current step, active recipe, ingredient tracking)
- Context-aware GPT-4 prompting for cooking questions
- Timer integration with device notifications
- Measurement conversion support
- Recipe bookmarking and favorites

---

### Phase 2: Shopping List Generation

> **GitHub Issues:** Epic 3 (#39-#44)

**Use Cases:**
```
User: "Add this recipe to my shopping list"
Assistant: "I've added 8 ingredients from Classic New York Cheesecake to your shopping list. You already have sugar and vanilla extract in your pantry."

User: "Make a shopping list for all the ingredients"
Assistant: "Creating shopping list from Classic New York Cheesecake. That's 12 items total. Should I check your pantry first?"

User: "Plan meals for this week"
Assistant: "I can help you plan meals. How many dinners would you like to plan?"

User: "Three dinners"
Assistant: "Great! What type of cuisine or dietary preferences should I consider?"
```

**Voice Commands - Shopping List:**
- "Add this recipe to my shopping list"
- "Create a shopping list for [recipe]"
- "What's on my shopping list?"
- "Remove [item] from shopping list"
- "How much will this cost?"
- "Organize by aisle"
- "Check if I have [ingredient]"

**Voice Commands - Meal Planning:**
- "Plan meals for this week"
- "Suggest dinners for [number] days"
- "Make a shopping list for the week"
- "What can I make with [ingredients]?"
- "Show me quick recipes under 30 minutes"

**Technical Implementation:**
- Recipe → shopping list converter
- Ingredient normalization (3 eggs + 2 eggs = 5 eggs)
- Pantry inventory tracking (optional)
- Smart consolidation (eliminate duplicates across recipes)
- Category/aisle organization
- Price estimation API (optional)
- Reusable shopping list templates

---

### Phase 3: Grocery Delivery Integration

> **GitHub Issues:** Epic 6 (#27, #57-#61)

**Use Cases:**
```
User: "Send my shopping list to Instacart"
Assistant: "I've created an Instacart cart with 15 items from your shopping list. The estimated total is $47.32. Would you like to review before ordering?"

User: "Order groceries for delivery tomorrow"
Assistant: "I can place an Instacart order for tomorrow. Your cart has 15 items totaling $47.32. Should I schedule delivery between 2-4 PM?"

User: "What's the cheapest store for these items?"
Assistant: "Based on current prices, Walmart is cheapest at $43.15, followed by Kroger at $45.80 and Target at $47.32."
```

**Voice Commands - Delivery:**
- "Send this list to Instacart"
- "Order groceries for [date/time]"
- "What's my order status?"
- "Add [item] to my cart"
- "Compare prices across stores"
- "Reorder last week's groceries"

**Technical Implementation:**
- Instacart API integration (partner API)
- Alternative: Walmart, Amazon Fresh, Kroger APIs
- OAuth authentication for delivery services
- Price comparison engine
- Order tracking and status updates
- Delivery scheduling
- Payment integration (use existing accounts)
- Order history and reordering

**API Integration Strategy:**
1. **Instacart Partner API:** Full cart/checkout integration
2. **Fallback:** Web scraping + deep linking if API unavailable
3. **Multi-Provider:** Support 2-3 grocery services for user choice

---

## 📊 Feature Comparison Matrix

| Feature | Restaurant Mode | Home Cooking Mode |
|---------|----------------|-------------------|
| **Primary User** | Professional chefs | Home cooks |
| **Voice Commands** | Shopping lists | Recipes + Shopping |
| **Main Flow** | Create → Send → Manager | Find → Cook → Shop |
| **List Creation** | Manual voice input | Auto-generated from recipes |
| **Quantity Focus** | Bulk (cases, pounds) | Individual (cups, tablespoons) |
| **Integration** | Manager web UI | Grocery delivery services |
| **Notifications** | Reminder to order | Timer alerts, delivery updates |
| **Complexity** | Simple lists | Recipe state + lists + timers |

---

## 🏗️ Unified Architecture (Restaurant + Home)

### Database Schema Extensions

**New Tables:**
```sql
-- Recipes
CREATE TABLE recipes (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  cuisine TEXT,
  difficulty TEXT, -- easy, medium, hard
  prep_time_minutes INTEGER,
  cook_time_minutes INTEGER,
  total_time_minutes INTEGER,
  servings INTEGER,
  image_url TEXT,
  source_url TEXT,
  source_api TEXT, -- spoonacular, edamam, custom
  rating REAL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Recipe Steps
CREATE TABLE recipe_steps (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  recipe_id TEXT NOT NULL,
  step_number INTEGER NOT NULL,
  instruction TEXT NOT NULL,
  duration_minutes INTEGER, -- for timer automation
  temperature_f INTEGER, -- for oven steps
  FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
  UNIQUE(recipe_id, step_number)
);

-- Recipe Ingredients
CREATE TABLE recipe_ingredients (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  recipe_id TEXT NOT NULL,
  name TEXT NOT NULL,
  quantity REAL,
  unit TEXT, -- cup, tbsp, tsp, lb, oz, etc.
  notes TEXT, -- "finely chopped", "at room temperature"
  aisle TEXT, -- produce, dairy, meat, etc.
  FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE
);

-- Active Recipe Sessions (for "what's next step" context)
CREATE TABLE recipe_sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL, -- future: multi-user support
  recipe_id TEXT NOT NULL,
  current_step INTEGER DEFAULT 1,
  status TEXT DEFAULT 'active', -- active, paused, completed
  started_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE
);

-- Pantry Inventory (optional, for "do I have X?" queries)
CREATE TABLE pantry_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  ingredient_name TEXT NOT NULL,
  quantity REAL,
  unit TEXT,
  expiration_date TEXT,
  added_at TEXT DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, ingredient_name)
);

-- Meal Plans (for weekly planning)
CREATE TABLE meal_plans (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL, -- "Week of Dec 9"
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE meal_plan_recipes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  meal_plan_id TEXT NOT NULL,
  recipe_id TEXT NOT NULL,
  meal_type TEXT, -- breakfast, lunch, dinner, snack
  scheduled_date TEXT,
  FOREIGN KEY (meal_plan_id) REFERENCES meal_plans(id) ON DELETE CASCADE,
  FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE
);

-- Link shopping lists to recipes
ALTER TABLE shopping_lists ADD COLUMN recipe_id TEXT REFERENCES recipes(id);
ALTER TABLE shopping_lists ADD COLUMN meal_plan_id TEXT REFERENCES meal_plans(id);
```

---

### Voice Intent Expansion

**Current Intents (Restaurant Mode):**
- `create_list` - "Create a list called produce"
- `add_item` - "Add tomatoes"
- `remove_item` - "Remove chicken"
- `send_list` - "Send this list"
- `show_lists` - "Show my lists"

**New Intents (Home Cooking Mode):**

**Recipe Discovery:**
- `find_recipe` - "Find a recipe for lasagna"
- `filter_recipes` - "Show me Italian recipes under 30 minutes"
- `search_by_ingredients` - "What can I make with chicken and broccoli?"

**Recipe Navigation:**
- `start_recipe` - "Start cooking the cheesecake recipe"
- `next_step` - "What's the next step?"
- `previous_step` - "Go back a step"
- `repeat_step` - "Repeat that"
- `jump_to_step` - "Jump to step 5"
- `get_ingredient` - "How many eggs?" / "How much sugar?"
- `pause_recipe` - "Pause cooking"
- `resume_recipe` - "Resume recipe"

**Cooking Utilities:**
- `set_timer` - "Set a timer for 10 minutes"
- `check_timer` - "How much time is left?"
- `cancel_timer` - "Cancel timer"
- `convert_measurement` - "How many tablespoons in a cup?"
- `substitute_ingredient` - "Can I substitute butter with oil?"

**Shopping Integration:**
- `generate_shopping_list` - "Make a shopping list for this recipe"
- `add_recipe_to_list` - "Add this to my shopping list"
- `plan_meals` - "Plan 3 dinners this week"
- `order_groceries` - "Send my list to Instacart"

---

### GPT-4 System Prompt Updates

**Current Prompt (Restaurant):**
```
You are a voice assistant for professional chefs creating shopping lists.
Commands: create_list, add_item, remove_item, send_list, show_lists
```

**Enhanced Prompt (Home Cooking):**
```
You are a cooking assistant helping home cooks with recipes and shopping.

MODES:
1. RECIPE MODE: User is actively cooking, needs step-by-step guidance
2. PLANNING MODE: User is meal planning or browsing recipes
3. SHOPPING MODE: User is building/managing shopping lists

CURRENT MODE: {mode}
ACTIVE RECIPE: {recipe_name or null}
CURRENT STEP: {step_number or null}
SHOPPING LIST: {list_name or null}

RECIPE MODE COMMANDS:
- next_step: "What's next?" → Respond with next instruction
- previous_step: "Go back" → Return to previous step
- get_ingredient: "How much flour?" → Look up quantity from recipe
- set_timer: "Timer for 10 minutes" → Start countdown
- pause_recipe: "Pause" → Save progress

PLANNING MODE COMMANDS:
- find_recipe: "Find cheesecake recipe" → Search recipe database
- filter_recipes: "Italian under 30 min" → Apply filters
- start_recipe: "Start this recipe" → Switch to RECIPE MODE

SHOPPING MODE COMMANDS:
- generate_shopping_list: "List for this recipe" → Convert ingredients
- add_recipe_to_list: "Add to list" → Append ingredients
- order_groceries: "Order on Instacart" → Initiate checkout

CONTEXT AWARENESS:
- If user asks ingredient question, check active recipe first
- If user says "next step" without active recipe, prompt to start one
- Track multi-turn conversations (clarifications)
```

---

### API Endpoints - Home Cooking Extensions

**Recipe Management:**
```
POST   /api/v1/recipes/search          # Find recipes by query
GET    /api/v1/recipes/:id              # Get recipe with steps & ingredients
POST   /api/v1/recipes                  # Save custom recipe
PUT    /api/v1/recipes/:id              # Update recipe
DELETE /api/v1/recipes/:id              # Delete recipe
POST   /api/v1/recipes/:id/favorite     # Bookmark recipe
```

**Recipe Sessions:**
```
POST   /api/v1/recipe-sessions          # Start cooking a recipe
GET    /api/v1/recipe-sessions/active   # Get current session
PUT    /api/v1/recipe-sessions/:id      # Update step/status
DELETE /api/v1/recipe-sessions/:id      # End session
```

**Shopping List Generation:**
```
POST   /api/v1/recipes/:id/generate-list  # Create list from recipe
POST   /api/v1/meal-plans/:id/generate-list  # Create list from meal plan
```

**Meal Planning:**
```
POST   /api/v1/meal-plans               # Create meal plan
GET    /api/v1/meal-plans                # Get all plans
PUT    /api/v1/meal-plans/:id           # Update plan
POST   /api/v1/meal-plans/:id/recipes   # Add recipe to plan
DELETE /api/v1/meal-plans/:id/recipes/:recipeId  # Remove recipe
```

**Grocery Delivery:**
```
POST   /api/v1/integrations/instacart/cart      # Create cart
POST   /api/v1/integrations/instacart/checkout  # Place order
GET    /api/v1/integrations/instacart/status    # Order status
```

---

## 🚀 Implementation Roadmap

### Home Cooking MVP (4-6 weeks)

**Week 1: Recipe Infrastructure** → [Epic 1: Issues #26, #28-#31](https://github.com/akisma/shopping-list/issues?q=is%3Aissue+is%3Aopen+%2326+OR+%2328+OR+%2329+OR+%2330+OR+%2331)
- [ ] Database schema for recipes, steps, ingredients → [#28](https://github.com/akisma/shopping-list/issues/28)
- [ ] Recipe API integration (start with Spoonacular) → [#26 SPIKE](https://github.com/akisma/shopping-list/issues/26)
- [ ] Recipe search service → [#30](https://github.com/akisma/shopping-list/issues/30)
- [ ] Basic recipe CRUD endpoints → [#29](https://github.com/akisma/shopping-list/issues/29)
- [ ] Tests for recipe services → [#31](https://github.com/akisma/shopping-list/issues/31)

**Week 2: Recipe Voice Assistant** → [Epic 2: Issues #32-#38](https://github.com/akisma/shopping-list/issues?q=is%3Aissue+is%3Aopen+%2332+OR+%2333+OR+%2334+OR+%2335+OR+%2336+OR+%2337+OR+%2338)
- [ ] Recipe session management → [#32](https://github.com/akisma/shopping-list/issues/32)
- [ ] Voice intent: find_recipe, start_recipe → [#33](https://github.com/akisma/shopping-list/issues/33), [#34](https://github.com/akisma/shopping-list/issues/34)
- [ ] Voice intent: next_step, previous_step, get_ingredient → [#35](https://github.com/akisma/shopping-list/issues/35), [#36](https://github.com/akisma/shopping-list/issues/36)
- [ ] Context-aware GPT-4 prompting → [#37](https://github.com/akisma/shopping-list/issues/37)
- [ ] TTS for recipe instructions → [#38](https://github.com/akisma/shopping-list/issues/38)
- [ ] Tests for recipe voice commands

**Week 3: Shopping List Generation** → [Epic 3: Issues #39-#44](https://github.com/akisma/shopping-list/issues?q=is%3Aissue+is%3Aopen+%2339+OR+%2340+OR+%2341+OR+%2342+OR+%2343+OR+%2344)
- [ ] Recipe → shopping list converter → [#39](https://github.com/akisma/shopping-list/issues/39)
- [ ] Ingredient consolidation logic → [#40](https://github.com/akisma/shopping-list/issues/40)
- [ ] Voice intent: generate_shopping_list, add_recipe_to_list → [#42](https://github.com/akisma/shopping-list/issues/42), [#43](https://github.com/akisma/shopping-list/issues/43)
- [ ] UI: Recipe detail with "Add to List" button → [#44](https://github.com/akisma/shopping-list/issues/44)
- [ ] Tests for list generation

**Week 4: Timer & Cooking Utilities** → [Epic 4: Issues #45-#50](https://github.com/akisma/shopping-list/issues?q=is%3Aissue+is%3Aopen+%2345+OR+%2346+OR+%2347+OR+%2348+OR+%2349+OR+%2350)
- [ ] Timer service with notifications → [#45](https://github.com/akisma/shopping-list/issues/45)
- [ ] Voice intent: set_timer, check_timer, cancel_timer → [#46](https://github.com/akisma/shopping-list/issues/46), [#47](https://github.com/akisma/shopping-list/issues/47)
- [ ] Timer UI widget → [#48](https://github.com/akisma/shopping-list/issues/48)
- [ ] Measurement conversions → [#49](https://github.com/akisma/shopping-list/issues/49)
- [ ] Temperature conversions (F ↔ C) → [#50](https://github.com/akisma/shopping-list/issues/50)
- [ ] Tests for utilities

**Weeks 5-6: Polish & Testing**
- [ ] Kitchen usability testing (hands dirty, noise, etc.)
- [ ] Performance optimization
- [ ] Error handling improvements
- [ ] Documentation
- [ ] Beta testing with home cooks

---

### Grocery Integration Phase (2-3 weeks)

> **GitHub Issues:** Epic 6 (#27, #57-#61) + Epic 5 (#51-#56)

**Week 1: Instacart API** → [Issues #57-#59](https://github.com/akisma/shopping-list/issues?q=is%3Aissue+is%3Aopen+%2357+OR+%2358+OR+%2359)
- [ ] Partner API credentials/approval → [#27 SPIKE](https://github.com/akisma/shopping-list/issues/27)
- [ ] OAuth authentication flow → [#57](https://github.com/akisma/shopping-list/issues/57)
- [ ] Cart creation from shopping list → [#58](https://github.com/akisma/shopping-list/issues/58)
- [ ] Checkout API integration → [#59](https://github.com/akisma/shopping-list/issues/59)
- [ ] Order tracking

**Week 2: Multi-Provider Support** → [Issues #60-#61](https://github.com/akisma/shopping-list/issues?q=is%3Aissue+is%3Aopen+%2360+OR+%2361)
- [ ] Voice intent: order_groceries → [#60](https://github.com/akisma/shopping-list/issues/60)
- [ ] Multi-provider grocery support → [#61](https://github.com/akisma/shopping-list/issues/61)
- [ ] Walmart API integration
- [ ] Amazon Fresh integration (if available)
- [ ] Price comparison service
- [ ] UI: Provider selection

**Week 3: Testing & Launch**
- [ ] End-to-end order flow testing
- [ ] Payment testing (sandbox)
- [ ] Production deployment
- [ ] User onboarding flow

---

## 💰 Cost Analysis - Home Cooking Features

**Recipe API Costs:**
- Spoonacular: $0.01-0.02 per search, $0.001 per recipe detail
- Edamam: $0.005 per request (cheaper, less comprehensive)
- Custom DB: Free (one-time content build)

**Voice Processing (same as restaurant):**
- Whisper: ~$0.001 per command (2-5 sec audio)
- GPT-4: ~$0.007 per command
- Total: ~$0.008 per voice interaction

**Grocery API:**
- Instacart Partner API: Free (commission-based revenue)
- Alternative APIs: Varies by provider

**Monthly Estimate (Home User):**
- Light use (20 recipes, 100 voice commands): $10-15
- Moderate use (50 recipes, 300 voice commands): $25-35
- Heavy use (100 recipes, 500 voice commands): $50-65

**Optimization Strategies:**
- Cache popular recipes locally
- Reduce GPT-4 calls for deterministic commands (next_step)
- Batch recipe API requests
- Use cheaper Edamam for search, Spoonacular for details

---

## 🎨 UI/UX Considerations

### Home Cooking Mode

**Primary Screen: Recipe Browser**
- Search bar: "What do you want to cook?"
- Voice search button (prominent)
- Filters: Cuisine, time, difficulty, dietary
- Recipe cards: Image, name, time, rating
- "Add to Meal Plan" quick action

**Recipe Detail Screen:**
- Header: Recipe name, image, rating, time
- Tabs: Ingredients | Instructions | Nutrition
- Voice button (sticky, always visible)
- "Start Cooking" CTA button
- "Add to Shopping List" secondary button
- Servings adjuster (2x, 4x, etc.)

**Active Recipe Screen (Cooking Mode):**
- Full-screen, minimal UI (focus on current step)
- Large text for readability
- Current step highlighted
- Progress indicator (Step 3 of 8)
- Voice button (extra large, center bottom)
- Visual: "Listening..." animation
- Timer widget (if active)
- Swipe gestures: Left = next, Right = previous
- Voice hints: "Say 'next step' or 'how much sugar?'"

**Shopping List Screen (Enhanced):**
- Mode toggle: Restaurant | Home Cooking
- Source indicator: Manual | From Recipe
- Recipe link (tap to view)
- Organize by: Aisle | Recipe | Category
- "Send to Instacart" button (if connected)
- Voice add still works

---

## 🔧 Technical Architecture - Unified System

### Mode Detection

```typescript
// Voice session includes user mode
interface VoiceSession {
  id: string;
  mode: 'restaurant' | 'home_cooking';
  activeRecipeId?: string;
  currentStep?: number;
  activeListId?: string;
  // ... existing fields
}

// GPT-4 gets mode-specific context
function buildSystemPrompt(session: VoiceSession): string {
  if (session.mode === 'restaurant') {
    return RESTAURANT_PROMPT;
  } else {
    return HOME_COOKING_PROMPT;
  }
}
```

### Recipe State Machine

```typescript
type RecipeSessionStatus = 'active' | 'paused' | 'completed';

interface RecipeSession {
  id: string;
  userId: string;
  recipeId: string;
  currentStep: number;
  status: RecipeSessionStatus;
  timers: Timer[];
  startedAt: Date;
  pausedAt?: Date;
}

// Voice commands update session
async function handleNextStep(sessionId: string) {
  const session = await getRecipeSession(sessionId);
  const recipe = await getRecipe(session.recipeId);
  
  if (session.currentStep >= recipe.steps.length) {
    return { message: "You've completed this recipe!", completed: true };
  }
  
  session.currentStep++;
  await updateRecipeSession(session);
  
  const nextStep = recipe.steps[session.currentStep - 1];
  return {
    instruction: nextStep.instruction,
    stepNumber: session.currentStep,
    totalSteps: recipe.steps.length
  };
}
```

### Shopping List Generation

```typescript
async function generateShoppingListFromRecipe(
  recipeId: string,
  servings?: number
): Promise<ShoppingList> {
  const recipe = await getRecipe(recipeId);
  const ingredients = recipe.ingredients;
  
  // Scale quantities if servings adjusted
  const scaledIngredients = servings 
    ? scaleIngredients(ingredients, servings / recipe.servings)
    : ingredients;
  
  // Convert to shopping list items
  const items = scaledIngredients.map(ing => ({
    name: ing.name,
    quantity: ing.quantity,
    unit: ing.unit,
    notes: ing.notes,
    aisle: ing.aisle,
    checked: false
  }));
  
  // Create list
  const list = await createShoppingList({
    name: `Ingredients for ${recipe.name}`,
    recipeId: recipe.id,
    items
  });
  
  return list;
}

// Consolidate multiple recipes
async function generateMealPlanShoppingList(
  mealPlanId: string
): Promise<ShoppingList> {
  const mealPlan = await getMealPlan(mealPlanId);
  const recipes = await getRecipesForMealPlan(mealPlanId);
  
  // Merge ingredients, consolidate duplicates
  const consolidatedIngredients = consolidateIngredients(
    recipes.flatMap(r => r.ingredients)
  );
  
  // Group by aisle for easier shopping
  const itemsByAisle = groupByAisle(consolidatedIngredients);
  
  return createShoppingList({
    name: `Shopping for ${mealPlan.name}`,
    mealPlanId: mealPlan.id,
    items: itemsByAisle
  });
}

function consolidateIngredients(ingredients: Ingredient[]): Ingredient[] {
  // Normalize names (tomatoes = tomato)
  // Convert to common unit (3 cups = 0.75 quarts)
  // Sum quantities
  // Example: 2 cups flour + 1 cup flour = 3 cups flour
}
```

---

## 📱 Mobile UI Components (New)

**RecipeBrowser Component:**
- Search with voice button
- Filter chips (Cuisine, Time, Difficulty)
- Recipe grid/list
- Pull-to-refresh

**RecipeCard Component:**
- Image with gradient overlay
- Recipe name, time, rating
- Quick actions: Favorite, Add to list
- Tap to view detail

**RecipeDetailScreen:**
- Sticky header with image
- Ingredient list with checkboxes
- Step-by-step instructions
- Voice cooking button
- Shopping list integration

**ActiveRecipeScreen:**
- Immersive, full-screen
- Current step (large text)
- Progress bar
- Voice button (prominent)
- Timer display
- Swipe navigation

**TimerWidget:**
- Countdown display
- Pause/Resume/Cancel
- Multiple timers support
- Notifications when complete

---

## 🧪 Testing Strategy - Home Features

**Recipe Service Tests:**
- Recipe search by query
- Recipe filtering (cuisine, time, difficulty)
- Recipe detail retrieval
- Custom recipe creation
- Recipe session management
- Step navigation (next, previous, jump)

**Shopping List Generation Tests:**
- Single recipe → list conversion
- Ingredient scaling (2x, 4x servings)
- Multi-recipe consolidation
- Duplicate elimination
- Unit normalization
- Aisle organization

**Voice Intent Tests:**
- find_recipe: "Find lasagna recipe"
- start_recipe: "Start cooking this"
- next_step: "What's next?" (context-aware)
- get_ingredient: "How much sugar?" (active recipe required)
- set_timer: "Timer for 10 minutes"
- generate_shopping_list: "Make a shopping list"

**Integration Tests:**
- Recipe API calls (mocked)
- Instacart API calls (sandbox)
- End-to-end cooking flow
- End-to-end shopping flow

---

## 📊 Success Metrics

**Restaurant Mode (Existing):**
- Time to create list: <60 seconds
- Voice command accuracy: >90%
- Chef adoption rate
- Lists sent per day

**Home Cooking Mode (New):**
- Recipe search success rate: >85%
- Time to start cooking: <30 seconds
- Step completion rate (% users who finish recipe)
- Voice commands per cooking session
- Shopping list generation rate
- Instacart conversion rate (% lists that become orders)
- User retention (weekly active cooks)

---

## 🔮 Future Enhancements

**Advanced Recipe Features:**
- [ ] Video step instructions (YouTube integration)
- [ ] Ingredient substitution database
- [ ] Dietary filters (vegan, gluten-free, keto)
- [ ] Nutrition tracking
- [ ] Recipe ratings and reviews
- [ ] Social sharing (share my creation)
- [ ] Recipe remixing (modify and save)

**Smart Kitchen Integration:**
- [ ] Oven/stove integration (voice preheat)
- [ ] Smart scale integration (auto-measure)
- [ ] Fridge camera integration (ingredient detection)
- [ ] Recipe recommendations based on inventory

**Community Features:**
- [ ] User-submitted recipes
- [ ] Cooking challenges
- [ ] Follow favorite chefs
- [ ] Recipe collections (meal prep, date night, etc.)

**Business Model:**
- [ ] Freemium: Basic recipes free, premium content paid
- [ ] Grocery affiliate revenue (Instacart commission)
- [ ] Recipe API subscription for developers
- [ ] Sponsored recipes (brands)

---

## 🎯 MVP Feature Prioritization

**Must-Have (MVP):**
1. ✅ Voice-driven shopping lists (restaurant) - *Complete*
2. 🟡 Recipe search with voice → [#26](https://github.com/akisma/shopping-list/issues/26), [#30](https://github.com/akisma/shopping-list/issues/30), [#33](https://github.com/akisma/shopping-list/issues/33)
3. 🟡 Step-by-step voice cooking guidance → [#34](https://github.com/akisma/shopping-list/issues/34), [#35](https://github.com/akisma/shopping-list/issues/35)
4. 🟡 "Next step" / "How much X" commands → [#35](https://github.com/akisma/shopping-list/issues/35), [#36](https://github.com/akisma/shopping-list/issues/36)
5. 🟡 Recipe → shopping list generation → [#39](https://github.com/akisma/shopping-list/issues/39), [#42](https://github.com/akisma/shopping-list/issues/42)
6. 🟡 Basic timer functionality → [#45](https://github.com/akisma/shopping-list/issues/45), [#46](https://github.com/akisma/shopping-list/issues/46)

**Should-Have (V1.1):**
7. 🟡 Meal planning (multi-recipe lists) → [#51](https://github.com/akisma/shopping-list/issues/51)-[#56](https://github.com/akisma/shopping-list/issues/56)
8. 🟡 Ingredient consolidation → [#40](https://github.com/akisma/shopping-list/issues/40), [#54](https://github.com/akisma/shopping-list/issues/54)
9. 🔲 Pantry inventory (optional)
10. 🟡 Instacart integration → [#57](https://github.com/akisma/shopping-list/issues/57)-[#59](https://github.com/akisma/shopping-list/issues/59)
11. 🔲 Recipe favorites/bookmarks
12. 🔲 Serving size adjustments

**Nice-to-Have (V2.0):**
13. 🟡 Multi-provider grocery comparison → [#61](https://github.com/akisma/shopping-list/issues/61)
14. 🔲 Nutrition information
15. 🔲 Dietary filtering
16. 🔲 Video instructions
17. 🔲 Social features
18. 🔲 Custom recipe creation

*Legend: ✅ Complete | 🟡 Issue Created | 🔲 Not Started*

---

## 📝 Documentation Updates Needed

- [ ] Update API documentation with recipe endpoints
- [ ] Add home cooking mode to voice commands guide
- [ ] Document recipe search integration
- [ ] Add Instacart integration guide
- [ ] Create user guide: "Cooking with Voice"
- [ ] Update architecture diagrams (dual-mode system)

---

[Previous content continues with Task 1-4 sections unchanged...]

---

## Git Workflow

**Current Branch:** `feature/recipe-foundations`

**GitHub Issues:** 36 issues created (#26-#61) - See [GitHub Issues Reference](#github-issues-reference) below

**Future Branches:**
- `feature/home-cooking-mvp` - Recipe voice assistant core
- `feature/shopping-list-generation` - Recipe → list conversion
- `feature/grocery-integration` - Instacart/delivery APIs

**Commit Strategy:**
- Small, focused commits
- Descriptive commit messages
- All tests passing before commit

**Ready to Merge:**
- ✅ All tests passing
- ✅ Linter clean
- ✅ Documentation updated
- ✅ Manual testing complete
- ✅ GitHub issue updated

---

## Contact & Support

**Repository:** akisma/shopping-list  
**Issue Tracker:** GitHub Issues  
**Documentation:** `.docs/TECHNICAL_DOCUMENTATION.md`

---

**🎉 Current Status: Restaurant mode complete, Home cooking mode planned!**

---

## 📋 GitHub Issues Reference

> **Created:** December 8, 2025 | **Total Issues:** 36 (#26-#61) | **Repository:** [akisma/shopping-list](https://github.com/akisma/shopping-list/issues)

### Epic 1: Recipe Infrastructure (5 issues)
| Issue | Title | Dependencies |
|-------|-------|--------------|
| [#26](https://github.com/akisma/shopping-list/issues/26) | **SPIKE: Recipe API Evaluation** | None (start first) |
| [#28](https://github.com/akisma/shopping-list/issues/28) | Recipe Database Schema | #26 |
| [#29](https://github.com/akisma/shopping-list/issues/29) | Recipe CRUD Endpoints | #28 |
| [#30](https://github.com/akisma/shopping-list/issues/30) | Recipe Search Service | #28, #29 |
| [#31](https://github.com/akisma/shopping-list/issues/31) | Recipe Service Unit Tests | #29, #30 |

### Epic 2: Recipe Voice Commands (7 issues)
| Issue | Title | Dependencies |
|-------|-------|--------------|
| [#32](https://github.com/akisma/shopping-list/issues/32) | Recipe Session Management | #28 |
| [#33](https://github.com/akisma/shopping-list/issues/33) | Voice Intent: find_recipe | #30 |
| [#34](https://github.com/akisma/shopping-list/issues/34) | Voice Intent: start_recipe | #32, #29 |
| [#35](https://github.com/akisma/shopping-list/issues/35) | Voice Intent: Recipe Navigation | #32 |
| [#36](https://github.com/akisma/shopping-list/issues/36) | Voice Intent: get_ingredient | #32, #28 |
| [#37](https://github.com/akisma/shopping-list/issues/37) | Context-Aware GPT-4 Prompting | #32 |
| [#38](https://github.com/akisma/shopping-list/issues/38) | TTS for Recipe Instructions | #35 |

### Epic 3: Shopping List Generation (6 issues)
| Issue | Title | Dependencies |
|-------|-------|--------------|
| [#39](https://github.com/akisma/shopping-list/issues/39) | Recipe to Shopping List Converter | #28 |
| [#40](https://github.com/akisma/shopping-list/issues/40) | Ingredient Consolidation Logic | #39 |
| [#41](https://github.com/akisma/shopping-list/issues/41) | Shopping List Schema Extensions | #28 |
| [#42](https://github.com/akisma/shopping-list/issues/42) | Voice Intent: generate_shopping_list | #39, #32, #41 |
| [#43](https://github.com/akisma/shopping-list/issues/43) | Voice Intent: add_recipe_to_list | #39, #40, #32 |
| [#44](https://github.com/akisma/shopping-list/issues/44) | UI: Recipe Detail Add to List Button | #39, #41 |

### Epic 4: Timer & Utilities (6 issues)
| Issue | Title | Dependencies |
|-------|-------|--------------|
| [#45](https://github.com/akisma/shopping-list/issues/45) | Timer Service | #32 |
| [#46](https://github.com/akisma/shopping-list/issues/46) | Voice Intent: set_timer | #45, #32 |
| [#47](https://github.com/akisma/shopping-list/issues/47) | Voice Intent: Timer Management | #45, #46 |
| [#48](https://github.com/akisma/shopping-list/issues/48) | Timer UI Widget | #45 |
| [#49](https://github.com/akisma/shopping-list/issues/49) | Measurement Conversion Service | None |
| [#50](https://github.com/akisma/shopping-list/issues/50) | Temperature Conversion Voice Intent | #49, #32 |

### Epic 5: Meal Planning (6 issues)
| Issue | Title | Dependencies |
|-------|-------|--------------|
| [#51](https://github.com/akisma/shopping-list/issues/51) | Meal Plan Database Schema | #28 |
| [#52](https://github.com/akisma/shopping-list/issues/52) | Meal Plan CRUD Endpoints | #51, #28 |
| [#53](https://github.com/akisma/shopping-list/issues/53) | Add Recipe to Meal Plan | #52, #29 |
| [#54](https://github.com/akisma/shopping-list/issues/54) | Multi-Recipe Consolidation | #40, #52, #49 |
| [#55](https://github.com/akisma/shopping-list/issues/55) | Voice Intent: plan_meals | #52, #54, #32 |
| [#56](https://github.com/akisma/shopping-list/issues/56) | Meal Plan UI Screen | #52, #53, #54 |

### Epic 6: Grocery Delivery Integration (6 issues)
| Issue | Title | Dependencies |
|-------|-------|--------------|
| [#27](https://github.com/akisma/shopping-list/issues/27) | **SPIKE: Grocery Delivery API Evaluation** | None (start first) |
| [#57](https://github.com/akisma/shopping-list/issues/57) | Instacart OAuth Integration | #27 |
| [#58](https://github.com/akisma/shopping-list/issues/58) | Instacart Cart Creation | #57, #41 |
| [#59](https://github.com/akisma/shopping-list/issues/59) | Instacart Checkout Deep Link | #58, #57 |
| [#60](https://github.com/akisma/shopping-list/issues/60) | Voice Intent: order_groceries | #57, #58, #59 |
| [#61](https://github.com/akisma/shopping-list/issues/61) | Multi-Provider Grocery Support | #57, #58, #27 |

### Recommended Implementation Order

```
Phase 1: Foundation (Weeks 1-2)
├── #26 SPIKE: Recipe API (research)
├── #27 SPIKE: Grocery API (research)
├── #28 Recipe Database Schema
├── #29 Recipe CRUD Endpoints
├── #30 Recipe Search Service
├── #31 Recipe Service Tests
└── #49 Measurement Conversion (foundational utility)

Phase 2: Voice Assistant (Weeks 2-3)
├── #32 Recipe Session Management ⭐ (key dependency)
├── #33 Voice Intent: find_recipe
├── #34 Voice Intent: start_recipe
├── #35 Voice Intent: Recipe Navigation
├── #36 Voice Intent: get_ingredient
├── #37 Context-Aware GPT-4 Prompting
└── #38 TTS for Recipe Instructions

Phase 3: Shopping & Timers (Weeks 3-4)
├── #39 Recipe to Shopping List Converter
├── #40 Ingredient Consolidation
├── #41 Shopping List Schema Extensions
├── #42 Voice Intent: generate_shopping_list
├── #43 Voice Intent: add_recipe_to_list
├── #44 UI: Add to List Button
├── #45 Timer Service
├── #46 Voice Intent: set_timer
├── #47 Voice Intent: Timer Management
├── #48 Timer UI Widget
└── #50 Temperature Conversion Voice Intent

Phase 4: Meal Planning (Weeks 5-6)
├── #51 Meal Plan Database Schema
├── #52 Meal Plan CRUD Endpoints
├── #53 Add Recipe to Meal Plan
├── #54 Multi-Recipe Consolidation
├── #55 Voice Intent: plan_meals
└── #56 Meal Plan UI Screen

Phase 5: Grocery Integration (Weeks 6-8)
├── #57 Instacart OAuth
├── #58 Instacart Cart Creation
├── #59 Instacart Checkout
├── #60 Voice Intent: order_groceries
└── #61 Multi-Provider Support
```

### Quick Links

- **All Open Issues:** [View on GitHub](https://github.com/akisma/shopping-list/issues?q=is%3Aissue+is%3Aopen)
- **SPIKEs (Research):** [#26](https://github.com/akisma/shopping-list/issues/26), [#27](https://github.com/akisma/shopping-list/issues/27)
- **Voice Intents:** #33-#36, #42-#43, #46-#47, #50, #55, #60
- **Database/Schema:** #28, #41, #51
- **UI Components:** #44, #48, #56
