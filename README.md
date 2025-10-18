# Civdraft

## Civdraft Description

Civdraft is a collaborative web application for managing and drafting leaders and maps in Civilization VI. The platform enables players to participate in organized draft sessions where they can select civilizations, leaders, and maps in real-time. It supports team-based gameplay with features like lobbies, chat functionality, timers, and draft tracking. The application is designed to facilitate fair and engaging multiplayer game preparation with admin capabilities for managing presets and bans.

## Technologies

**Frontend:**
- **[Next.js 15](https://nextjs.org)**
- **[React 19](https://react.dev)**
- **[TypeScript](https://www.typescriptlang.org)**
- **[Tailwind CSS](https://tailwindcss.com)**
- **[Radix UI](https://www.radix-ui.com)**
- **[React Hook Form](https://react-hook-form.com)**
- **[Zod](https://zod.dev)**

**Backend & Database:**
- **[Convex](https://www.convex.dev)**

**Authentication:**
- **[Clerk](https://clerk.com)**

**Development & Tooling:**
- **[Biome](https://biomejs.dev)**
- **[pnpm](https://pnpm.io)**
- **[Turbopack](https://turbo.build/pack)**

## Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- pnpm

### Installation & Development

1. Clone the repository:
```bash
git clone git@github.com:leovalette/civdraft.git
cd civdraft
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables (ask project maintainers for `.env.local`):
```bash
# Create .env.local with necessary keys for Clerk and Convex
```

4. Run the development server:
```bash
pnpm dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

### Build for Production

```bash
pnpm build
pnpm start
```

### Code Quality

Lint and format code:
```bash
pnpm lint
pnpm format
```

## How to Contribute

We welcome contributions to Civdraft! Here's how you can help:

### Getting Started with Contributing

1. **Fork the repository** on GitHub
2. **Create a feature branch** for your changes:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes** and commit with clear, descriptive messages:
   ```bash
   git commit -m "Add description of changes"
   ```
4. **Ensure code quality**:
   - Run `pnpm lint` to check for linting issues
   - Run `pnpm format` to format your code
5. **Push to your fork** and **create a Pull Request** against the main branch
6. **Describe your changes** in the PR description, including:
   - What problem does it solve?
   - How does it work?
   - Any breaking changes?

### Development Guidelines

- Follow the existing code style and project structure
- Use TypeScript for type safety
- Write clear, descriptive commit messages
- Test your changes before submitting a PR
- Keep PRs focused on a single feature or bug fix

### Areas to Contribute

- Bug fixes and issue resolutions
- UI/UX improvements
- Performance optimizations
- Documentation improvements
- New features and game modes
- Testing

### Questions?

If you have questions about contributing, feel free to open an issue or discuss in the project's issue tracker.

---

**License:** See [LICENSE](./LICENSE) file for details.
