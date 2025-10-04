# Backend Consolidation & Enhancement Plan

## Current Situation Analysis

### Backend Duplication
You have **two backend implementations**:

1. **`/backend`** (JavaScript/Express) ✅ **ACTIVE**
   - Running on port 3001
   - Pure JavaScript with ES modules
   - JSON file storage
   - Fully functional with all endpoints
   - Currently connected to frontend

2. **`/backend-nest`** (TypeScript/NestJS) ⚠️ **REFERENCE ONLY**
   - NestJS framework
   - TypeScript with decorators
   - Similar functionality
   - Not currently in use
   - Preserved as reference implementation

### Recommendation: **Keep JavaScript backend, remove NestJS**

**Reasons:**
- The Express backend is already fully functional and connected
- Simpler architecture (no framework overhead)
- Easier to maintain and modify
- Less dependencies
- Currently running and tested
- Frontend already integrated

## Pages Requiring Backend Endpoints

### ✅ Already Implemented

1. **ImpositionPage.vue**
   - Endpoint: `POST /api/impose`
   - Functionality: PDF/image imposition processing
   - Status: ✅ Connected and working

2. **Templates.vue** (Partial)
   - Endpoints exist: `GET /api/templates`, `POST /api/templates`, etc.
   - Issue: ⚠️ Using hardcoded data instead of API
   - Action needed: Connect to backend

### 🔴 Missing Backend Support

3. **LoginPage.vue** & **SignupPage.vue**
   - Current: Mock login (setTimeout redirect)
   - Needs: 
     - `POST /api/auth/login`
     - `POST /api/auth/signup`
     - `POST /api/auth/logout`
     - `POST /api/auth/refresh-token`
     - `GET /api/auth/me` (current user)

4. **Templates.vue**
   - Needs full integration with existing endpoints
   - Add image upload for custom templates
   - Connect like/unlike functionality

5. **CustomerComments.vue** / **UsersComment.vue**
   - Current: Empty file
   - Needs:
     - `GET /api/comments` (list all)
     - `POST /api/comments` (create)
     - `PUT /api/comments/:id` (edit)
     - `DELETE /api/comments/:id` (delete)
     - `GET /api/comments/template/:templateId` (by template)

6. **CarouselCards.vue**
   - Needs: Featured templates/designs endpoint
   - `GET /api/featured` (highlighted content)

7. **Designer Components** (CanvaArea, PropertyPanel, etc.)
   - Needs:
     - `POST /api/designs/autosave` (auto-save drafts)
     - `GET /api/designs/recent` (recent work)
     - `POST /api/designs/export` (export to various formats)

### 📋 Optional/Future Enhancements

8. **Analytics Dashboard**
   - `GET /api/analytics/usage`
   - `GET /api/analytics/popular-templates`

9. **Collaboration**
   - `POST /api/designs/:id/share`
   - `GET /api/designs/shared-with-me`

## Implementation Plan

### Phase 1: Consolidate Backend (Immediate)
1. ✅ Keep `/backend` (Express/JS)
2. 🗑️ Delete `/backend-nest` (move to archive if needed)
3. ✅ Verify all existing endpoints work

### Phase 2: Add Authentication (Priority)
1. Install dependencies: `bcrypt`, `jsonwebtoken`
2. Create auth service & middleware
3. Add user registration/login endpoints
4. Add JWT token management
5. Protect sensitive endpoints

### Phase 3: Enhance Existing Features
1. Connect Templates.vue to backend API
2. Add comments system
3. Add featured content endpoint
4. Add auto-save for designer

### Phase 4: Testing & Documentation
1. Test all new endpoints
2. Update API documentation
3. Add error handling
4. Add request validation

## Files to Create/Modify

### New Backend Files
```
backend/
├── services/
│   ├── authService.js          [NEW]
│   ├── commentsService.js      [NEW]
│   └── featuredService.js      [NEW]
├── middleware/
│   ├── authMiddleware.js       [NEW]
│   └── validation.js           [NEW]
├── utils/
│   ├── jwt.js                  [NEW]
│   └── password.js             [NEW]
└── storage/
    └── comments.json           [NEW]
```

### Frontend Files to Update
```
src/
├── components/pages/
│   ├── Templates.vue           [MODIFY - connect to API]
│   ├── auth/LoginPage.vue      [MODIFY - real auth]
│   ├── auth/SignupPage.vue     [MODIFY - real auth]
│   └── CustomerComments.vue    [IMPLEMENT]
└── services/
    └── backendApi.js           [ADD - new methods]
```

## Next Steps

1. **Confirm:** Delete `backend-nest` folder? (recommended)
2. **Prioritize:** Which features do you want first?
   - Authentication system?
   - Comments system?
   - Template API integration?
   - All of the above?

3. **Timeline:** 
   - Auth system: ~30 minutes
   - Comments: ~20 minutes
   - Template integration: ~15 minutes
   - Testing: ~20 minutes
