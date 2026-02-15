# Menu Resource Restriction - Architecture Diagram

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         User Login                               │
│                    (via Keycloak/Auth)                          │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
        ┌─────────────────────────────────────┐
        │      JWT Token Generated            │
        │  (with resource_access claims)      │
        └────────────┬────────────────────────┘
                     │
                     ▼
        ┌─────────────────────────────────────┐
        │  AuthContext.tsx (Updated)          │
        │  • Stores token                     │
        │  • Exposes resource methods         │
        │  • Provides useAuth() hook          │
        └────────────┬────────────────────────┘
                     │
         ┌───────────┴───────────┐
         │                       │
         ▼                       ▼
   ┌──────────────┐      ┌──────────────┐
   │  tokenUtils  │      │ menuResource │
   │     .ts      │      │     Map.ts   │
   └──────┬───────┘      └──────┬───────┘
          │                     │
   Token parsing & menu item to  │
   resource mapping              │
          │                      │
          └──────────┬───────────┘
                     │
                     ▼
        ┌─────────────────────────────────────┐
        │      AppShell.tsx (Updated)         │
        │  • Uses useAuth()                   │
        │  • Filters menu items               │
        │  • Filters menu picker              │
        │  • Based on token resources         │
        └────────────┬────────────────────────┘
                     │
         ┌───────────┴───────────┐
         │                       │
         ▼                       ▼
   ┌──────────────┐      ┌──────────────┐
   │   Sidebar    │      │ Menu Picker  │
   │   (Filtered) │      │  (Filtered)  │
   └──────────────┘      └──────────────┘
         │
         ▼
   ┌──────────────────────┐
   │  Menu Items          │
   │  (Only accessible)   │
   └──────────────────────┘
         │
         └──────────────┬──────────────┐
                        │              │
                        ▼              ▼
              ┌─────────────────┐ ┌──────────────────┐
              │ Route Access    │ │ Component Render │
              │ (Permitted)     │ │ (User navigates) │
              └────────┬────────┘ └────────┬─────────┘
                       │                   │
                       ▼                   ▼
          ┌────────────────────────────────────┐
          │  RequireResource.tsx (NEW)         │
          │  • Checks route resource access    │
          │  • Blocks unauthorized paths       │
          │  • Shows denial message or         │
          │    redirects to dashboard          │
          └────────────────────────────────────┘
                       │
         ┌─────────────┴──────────────┐
         │                            │
         ▼                            ▼
   ┌─────────────┐            ┌──────────────┐
   │   Access    │            │    Denied    │
   │   Granted   │            │ (ShowDenial) │
   │             │            │   or Redirect│
   │ ✅ Route    │            │   to /dash   │
   │    renders  │            │   ❌         │
   └─────────────┘            └──────────────┘
```

## Data Flow Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                    JWT Token                                     │
│  {                                                               │
│    "resource_access": {                                          │
│      "user-management": { "roles": [...]  },                    │
│      "visitor-management": { "roles": [...] }                   │
│    }                                                             │
│  }                                                               │
└──────────┬───────────────────────────────────────────────────────┘
           │
           │ decodeJWT()
           │ ↓
           │ ├─ getResourceAccess()
           │ │ ├─ getResourceRoles()
           │ │ └─ hasResourceAccess()
           │ │
           │ └─ hasResourceRole()
           │
           ▼
   ┌─────────────────────────┐
   │  Resource Access Map    │
   │  {                      │
   │    "resource1": true,   │
   │    "resource2": false   │
   │  }                      │
   └────────┬────────────────┘
            │
            ├─────────────────────────────────┐
            │                                 │
            ▼                                 ▼
     ┌──────────────┐              ┌──────────────┐
     │  Filter      │              │  Filter      │
     │  Menu Items  │              │  Routes      │
     └──────┬───────┘              └──────┬───────┘
            │                             │
            ├─ Sidebar                    ├─ RequireResource
            ├─ Menu Picker               │  • Shows only
            │  (Only show)               │    accessible
            │  accessible                │    paths
            │  items                     │
            │                            └─ Deny access
            └─ Menus Hidden              if no resource
               if no resource
```

## Component Integration Flow

```
┌──────────────────────────────────────────────────────┐
│                   App Component                      │
│  (Route definitions with RequireResource)           │
└───────────────────┬──────────────────────────────────┘
                    │
             ┌──────┴────────┐
             │               │
             ▼               ▼
      ┌─────────────┐  ┌──────────────┐
      │ Dashboard   │  │ User         │
      │             │  │ Management   │
      └─────────────┘  └──────┬───────┘
                              │
                              ▼
                    ┌──────────────────────┐
                    │  RequireResource     │
                    │  resourceId=         │
                    │  "user-management"   │
                    └──────┬────────┬──────┘
                           │        │
                    ┌──────┘        └──────┐
                    │                      │
         User has resource         User lacks resource
                    │                      │
                    ▼                      ▼
          ┌──────────────┐        ┌──────────────┐
          │   Render     │        │   Restricted │
          │  Component   │        │   Page/Deny  │
          └──────────────┘        └──────────────┘
```

## Resource Filtering Sequence

```
Step 1: User logs in
├─ Token received
├─ Decoded by tokenUtils
└─ Stored in AuthContext

Step 2: AppShell renders
├─ Calls useAuth()
├─ Gets available resources
├─ Filters all menu items:
│  ├─ For each menu item:
│  │  ├─ Get required resource
│  │  ├─ Check user has it
│  │  ├─ Include if ✓
│  │  └─ Exclude if ✗
│  └─ Returns filtered list
└─ Passes to Sidebar & Picker

Step 3: User navigates
├─ Clicks accessible menu
├─ Route renders
├─ RequireResource checks
├─ Validates resource access
├─ Renders component if ✓
└─ Shows denied/redirects if ✗

Step 4: User tries direct URL
├─ Types /user-management
├─ RequireResource activates
├─ Checks token resources
├─ Has resource? → Render
└─ No resource? → Deny/Redirect
```

## Class Diagram

```
┌──────────────────────────────┐
│      AuthContextType         │
├──────────────────────────────┤
│ - user: User                 │
│ - token: string              │
│ - isAuthenticated: boolean   │
├──────────────────────────────┤
│ + hasResourceAccess()        │
│ + getResourceRoles()         │
│ + hasResourceRole()          │
│ + getAvailableResources()    │
└──────────────────────────────┘
           ▲
           │
      uses
           │
┌──────────────────────────────┐
│     tokenUtils               │
├──────────────────────────────┤
│ + decodeJWT()                │
│ + getResourceAccess()        │
│ + getResourceRoles()         │
│ + hasResourceAccess()        │
│ + hasResourceRole()          │
│ + getAvailableResources()    │
└──────────────────────────────┘

           │
           │ provides
           ▼
┌──────────────────────────────┐
│    AppShellMenuItem          │
├──────────────────────────────┤
│ - id: string                 │
│ - resource: string (mapped)  │
│ - permission?: () => boolean │
└──────────────────────────────┘
           │
           │ filtered by
           │
┌──────────────────────────────────┐
│      AppShell Component           │
├──────────────────────────────────┤
│ - menuItems: filtered[]          │
│ - allMenuItems: filtered[]       │
├──────────────────────────────────┤
│ + filterByResource()             │
└──────────────────────────────────┘
           │
           ├─────────┬────────────┐
           │         │            │
           ▼         ▼            ▼
      Sidebar   MenuPicker  RequireResource
```

## State Management Flow

```
┌─────────────────────────────────────┐
│  Initial State                      │
│  {                                  │
│    user: null,                      │
│    token: null,                     │
│    isAuthenticated: false           │
│  }                                  │
└──────────────┬──────────────────────┘
               │
         Login Action
               │
    ┌──────────▼──────────┐
    │ Call apiLogin()      │
    └──────────┬───────────┘
               │
         ✓ Success
               │
    ┌──────────▼──────────┐
    │ New State:          │
    │ {                   │
    │  user: userData,    │
    │  token: JWT,        │
    │   auth: true        │
    │ }                   │
    └──────────┬──────────┘
               │
         ┌─────┴─────┐
         │           │
         ▼           ▼
    Sidebar    RequireResource
    filters    validates access
         │           │
    Filtered    Components
    menus       rendered/denied
```

## Token Validation Timeline

```
Time  Component              Action
────  ─────────────────────  ──────────────────────────
 t0   User                   Logs in
      
 t0   Keycloak               Returns JWT token
      
 t0   AuthProvider           Stores token in state
                             Stores in localStorage
      
 t0   useAuth() calls        tokenUtils.decodeJWT()
                             Extract resource_access
      
 t0   AppShell               Calls useAuth()
                             Gets available resources
                             Filters menu items
      
 t0   UI                     Shows filtered menus
      
 t1   User                   Clicks menu or URL nav
      
 t1   RequireResource        getMenuResource(id)
                             tokenUtils.hasResourceAccess()
                             Check token
      
 t1   Route                  Component renders ✓
                             or shows denied ✗
      
 tnow App continues          Periodic validation
      (optional)             in useEffect hooks
```

## Decision Tree

```
                         ┌─── User has token? ───┐
                         │                        │
                         No                      Yes
                         │                        │
                    No access                     │
                    to anything                   ▼
                                    ┌─── Token expired? ───┐
                                    │                      │
                                    Yes                   No
                                    │                      │
                               Redirect              Continue
                               to login                  │
                                                         ▼
                                          ┌─── Menu item has ───┐
                                          │ required resource?  │
                                          │                     │
                                         No                    Yes
                                          │                     │
                                     Hide menu            ┌─────┴──────┐
                                      item               │             │
                                                    User has    User lacks
                                                   resource?   resource?
                                                        │             │
                                                    Show menu     Hide menu
                                                    item          item
                                                        │             │
                                                   User clicks    N/A
                                                        │
                                                        ▼
                                            ┌─── RequireResource ───┐
                                            │ checks token again     │
                                            │                       │
                                            ├─── Has resource? ──┐ │
                                            │                    │ │
                                            No                  Yes
                                            │                    │
                                    ┌──────►Deny/Redirect   Render ◄─────┐
                                    │                     Component      │
                                    │                         │         │
                                    │                    showDenial?   │
                                    │                      │    │       │
                                    │                     Yes  No      │
                                    │                      │    │       │
                                    └──────────────────────┘    └───────┘
                                           Show message        Redirect to
                                                                dashboard
```

## File Dependencies

```
tokenUtils.ts
  ├─ No dependencies (pure functions)
  └─ Used by: AuthContext, AppShell, RequireResource

AuthContext.tsx
  ├─ Imports: tokenUtils
  └─ Used by: AppShell, RequireResource, Components

menuResourceMap.ts
  ├─ No dependencies
  └─ Used by: AppShell, RequireResource

AppShell.tsx
  ├─ Imports: AuthContext, menuResourceMap
  └─ Used by: Root layout, App

RequireResource.tsx
  ├─ Imports: AuthContext, menuResourceMap
  └─ Used by: Route definitions

Components using useAuth()
  ├─ Imports: AuthContext
  └─ Can check: hasResourceAccess, getResourceRoles, etc.
```

## Performance Characteristics

```
Operation               Time Complexity    Space Complexity
─────────────────────   ────────────────    ────────────────
decodeJWT()             O(1)                O(payload size)
hasResourceAccess()     O(1)                O(1)
getResourceRoles()      O(1)                O(roles count)
Filter menu items       O(n)                O(n)
  n = number of items
  Usually ~60 items
  = microseconds

Cached operations (memoized):
- filteredMenuItems      computed once per token change
- filteredAllMenuItems   computed once per token change
- useAuth() hook         cached in component
```

---

**Visual Architecture**:
- **Components**: Blue boxes
- **Processes**: Green boxes
- **Data Flow**: Arrows
- **Decisions**: Diamond shapes
- **Results**: Yellow boxes

For more details, see:
- [MENU_RESOURCE_RESTRICTION.md](./MENU_RESOURCE_RESTRICTION.md) - Full guide
- [MENU_RESOURCE_RESTRICTION_CHECKLIST.md](./MENU_RESOURCE_RESTRICTION_CHECKLIST.md) - Implementation checklist
