# Task: Create Window and Desktop Components for SRIRAM.OS

## Summary

Created two major components for the SRIRAM.OS interactive portfolio:

### 1. Window Component (`/home/z/my-project/src/components/os/Window.tsx`)
- **Draggable** by title bar using native mouse events (mousedown/mousemove/mouseup)
- **Resizable** via bottom-right handle
- **macOS-style traffic lights**: Close (red #FF5F57), Minimize (yellow #FEBC2E), Maximize (green #28C840)
- **Glassmorphism** background with backdrop-filter blur
- **Active/Inactive states**: Active window gets cyan border glow + brighter shadow; inactive gets dimmed
- **Animated entrance**: Scale 0.8→1, opacity 0→1 with spring physics
- **Viewport bounds**: Windows stay within screen boundaries during drag
- **Maximize/restore**: Double-click title bar or click green button toggles maximize
- **z-index**: Controlled by parent for proper window stacking
- **Hover effects**: Traffic light buttons show X/—/+ icons on hover

### 2. Desktop Component (`/home/z/my-project/src/components/os/Desktop.tsx`)
- **Full-screen layout** with PixelWorld as background
- **Taskbar** (48px) with:
  - Start button (SRIRAM.OS logo) on the left
  - Open window buttons in the middle (with active indicator)
  - System tray on the right (time, sound toggle, assistant button)
- **Start Menu** popup with all sections listed
- **Window manager** rendering open windows with proper z-index stacking
- **PixelWorld building click** → opens corresponding window (mapped building IDs to WindowIds)

### Section Content Components (all inline in Desktop.tsx):
- **AboutSection**: Profile card, career objective, education, achievements, soft skills
- **ExperienceSection**: Timeline layout with connected dots, color-coded per company, impact badges
- **ProjectsSection**: Expandable project cards with metrics bar, overview, problem, architecture, highlights
- **SkillsSection**: Interactive tech tree with category tabs, node connectors, animated progress bars
- **CertificationsSection**: Card grid with icons and credential IDs
- **ResearchSection**: Paper cards with abstracts, SCOPUS badges, citation counts
- **ResumeSection**: Download placeholder with visual design
- **ContactSection**: Grid of contact methods with icons
- **AchievementsSection**: Achievement cards with icons and descriptions
- **SecretSection**: Locked/unlocked state based on Konami code
- **SnakeSection**: Coming soon placeholder
- **SettingsSection**: Toggle switches for sound/particles, system info

### Supporting Changes:
- **page.tsx**: Updated to show full OS flow (Boot → Login → Desktop) using useOSStore
- **globals.css**: Added custom-scrollbar styles for window content areas

### Key Design Decisions:
- Used `pointer-events-none` on windows container with `pointer-events-auto` on individual windows for proper event pass-through to PixelWorld
- Window z-index based on position in openWindows array (most recent = highest)
- Taskbar at z-[70] to always be on top
- Building ID mapping: ai-lab→about, projects→projects, experience→experience, skills→skills, research→research, contact→contact

### Lint Status: ✅ Pass (0 errors, 1 pre-existing warning)
### App Status: ✅ Running on port 3000, returning 200
