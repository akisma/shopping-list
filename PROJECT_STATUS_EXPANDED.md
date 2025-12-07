# Shopping List & Recipe Assistant - Project Status

**Last Updated:** December 6, 2025  
**Current Phase:** Task 4 - Phase 2 Mobile Audio Capture Complete  
**Overall Status:** ✅ Backend API Complete | ✅ Mobile CRUD Complete | ✅ Send to Manager Complete | ✅ Voice Stubs Complete | ✅ Backend Voice Services Complete | ✅ Mobile Audio & Voice Commands Working

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

**Week 1: Recipe Infrastructure**
- [ ] Database schema for recipes, steps, ingredients
- [ ] Recipe API integration (start with Spoonacular)
- [ ] Recipe search service
- [ ] Basic recipe CRUD endpoints
- [ ] Tests for recipe services

**Week 2: Recipe Voice Assistant**
- [ ] Recipe session management
- [ ] Voice intent: find_recipe, start_recipe
- [ ] Voice intent: next_step, previous_step, get_ingredient
- [ ] Context-aware GPT-4 prompting
- [ ] TTS for recipe instructions
- [ ] Tests for recipe voice commands

**Week 3: Shopping List Generation**
- [ ] Recipe → shopping list converter
- [ ] Ingredient consolidation logic
- [ ] Voice intent: generate_shopping_list, add_recipe_to_list
- [ ] UI: Recipe detail with "Add to List" button
- [ ] Tests for list generation

**Week 4: Timer & Cooking Utilities**
- [ ] Timer service with notifications
- [ ] Voice intent: set_timer, check_timer, cancel_timer
- [ ] Measurement conversions
- [ ] Temperature conversions (F ↔ C)
- [ ] Tests for utilities

**Weeks 5-6: Polish & Testing**
- [ ] Kitchen usability testing (hands dirty, noise, etc.)
- [ ] Performance optimization
- [ ] Error handling improvements
- [ ] Documentation
- [ ] Beta testing with home cooks

---

### Grocery Integration Phase (2-3 weeks)

**Week 1: Instacart API**
- [ ] Partner API credentials/approval
- [ ] OAuth authentication flow
- [ ] Cart creation from shopping list
- [ ] Checkout API integration
- [ ] Order tracking

**Week 2: Multi-Provider Support**
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
1. ✅ Voice-driven shopping lists (restaurant)
2. 🔲 Recipe search with voice
3. 🔲 Step-by-step voice cooking guidance
4. 🔲 "Next step" / "How much X" commands
5. 🔲 Recipe → shopping list generation
6. 🔲 Basic timer functionality

**Should-Have (V1.1):**
7. 🔲 Meal planning (multi-recipe lists)
8. 🔲 Ingredient consolidation
9. 🔲 Pantry inventory (optional)
10. 🔲 Instacart integration
11. 🔲 Recipe favorites/bookmarks
12. 🔲 Serving size adjustments

**Nice-to-Have (V2.0):**
13. 🔲 Multi-provider grocery comparison
14. 🔲 Nutrition information
15. 🔲 Dietary filtering
16. 🔲 Video instructions
17. 🔲 Social features
18. 🔲 Custom recipe creation

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

**Current Branch:** `feature/task-2`

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
