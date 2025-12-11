# Contributing to PaymentAlert

Thank you for your interest in contributing to PaymentAlert! This document provides guidelines and instructions for contributing to the project.

## Code of Conduct

Please be respectful and constructive in all interactions with the project community.

## Getting Started

### Prerequisites

- Node.js 18.0.0 or higher
- MongoDB 5.0 or higher
- Git
- Basic knowledge of TypeScript, MongoDB, and Mongoose

### Setup Development Environment

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/your-username/payment-alert.git
   cd payment-alert
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Set up environment:
   ```bash
   cp .env.example .env
   # Edit .env with your local MongoDB URI
   ```

5. Build the project:
   ```bash
   npm run build
   ```

6. Seed the database:
   ```bash
   npm run seed:admin
   ```

## Development Workflow

### Branch Naming Convention

- `feat/` - New features (e.g., `feat/add-webhook-support`)
- `fix/` - Bug fixes (e.g., `fix/donation-amount-validation`)
- `docs/` - Documentation changes (e.g., `docs/update-api-guide`)
- `refactor/` - Code refactoring (e.g., `refactor/optimize-queries`)
- `test/` - Test additions or changes (e.g., `test/add-user-tests`)
- `chore/` - Maintenance tasks (e.g., `chore/update-dependencies`)

### Making Changes

1. Create a new branch:
   ```bash
   git checkout -b feat/your-feature-name
   ```

2. Make your changes following our coding standards

3. Test your changes:
   ```bash
   npm run build
   npm run lint
   ```

4. Commit your changes:
   ```bash
   git add .
   git commit -m "feat: add description of your changes"
   ```

## Coding Standards

### TypeScript

- Use TypeScript strict mode
- Define interfaces for all data structures
- Use meaningful variable and function names
- Avoid `any` type unless absolutely necessary
- Export interfaces with `I` prefix (e.g., `IUser`, `IDonation`)

### Mongoose Models

- Always include timestamps: `{ timestamps: true }`
- Add appropriate indexes for common queries
- Use enums for status fields
- Include field validation
- Document complex fields with comments
- Use middleware for data transformation (e.g., password hashing)

### File Organization

```
src/
├── config/       # Configuration files
├── models/       # Mongoose models
├── seeds/        # Database seed scripts
└── utils/        # Utility functions and enums
```

### Naming Conventions

- **Files**: PascalCase for models (e.g., `User.ts`, `Donation.ts`)
- **Variables**: camelCase (e.g., `donationAmount`, `userId`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `MAX_RETRIES`, `DEFAULT_TIMEOUT`)
- **Interfaces**: IPascalCase (e.g., `IUser`, `IDonation`)
- **Enums**: PascalCase (e.g., `UserRole`, `DonationStatus`)

### Code Style

We use Prettier and ESLint for consistent code formatting:

```bash
# Format code
npm run format

# Check linting
npm run lint
```

**Prettier Configuration**:
- Single quotes
- 2-space indentation
- 100 character line width
- Semicolons required

## Adding New Models

When adding a new Mongoose model:

1. Create the model file in `src/models/`
2. Define the interface extending `Document`
3. Create the schema with appropriate validation
4. Add indexes for common query patterns
5. Export the model
6. Add the export to `src/models/index.ts`
7. Update documentation in `docs/DATABASE_SCHEMA.md`

Example:

```typescript
import mongoose, { Schema, Document } from 'mongoose';

export interface INewModel extends Document {
  field1: string;
  field2: number;
  createdAt: Date;
  updatedAt: Date;
}

const NewModelSchema = new Schema<INewModel>(
  {
    field1: { type: String, required: true, index: true },
    field2: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Add indexes
NewModelSchema.index({ field1: 1, field2: -1 });

export default mongoose.model<INewModel>('NewModel', NewModelSchema);
```

## Adding New Enums

When adding enums to `src/utils/enums.ts`:

```typescript
export enum NewEnum {
  OPTION_ONE = 'OPTION_ONE',
  OPTION_TWO = 'OPTION_TWO',
  OPTION_THREE = 'OPTION_THREE',
}
```

## Documentation

### Code Comments

- Add comments for complex logic
- Document function parameters and return types
- Explain "why" not "what" in comments
- Keep comments up-to-date with code changes

### Documentation Files

When updating documentation:

- **README.md** - Main project documentation
- **DATABASE_SCHEMA.md** - Schema details
- **MIGRATION_GUIDE.md** - Setup and migration instructions
- **CHANGELOG.md** - Version history

## Testing

### Writing Tests (Future)

When the test suite is implemented:

```bash
# Run all tests
npm test

# Run specific test file
npm test -- User.test.ts

# Run with coverage
npm test -- --coverage
```

### Manual Testing

Before submitting a PR:

1. Test the build: `npm run build`
2. Test seed scripts: `npm run seed:admin`
3. Verify TypeScript compilation: `npx tsc --noEmit`
4. Check for linting errors: `npm run lint`

## Pull Request Process

### Before Submitting

- [ ] Code follows project style guidelines
- [ ] TypeScript compiles without errors
- [ ] All lint checks pass
- [ ] Documentation is updated if needed
- [ ] Commit messages follow conventions
- [ ] Branch is up-to-date with main

### Commit Message Format

Follow the Conventional Commits specification:

```
type(scope): subject

body (optional)

footer (optional)
```

**Types**:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `test`: Test additions or changes
- `chore`: Maintenance tasks

**Examples**:
```
feat(donations): add refund functionality

fix(user): resolve password hashing issue

docs(readme): update installation instructions

refactor(database): optimize connection pooling
```

### PR Description Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Changes Made
- Change 1
- Change 2
- Change 3

## Testing
How has this been tested?

## Checklist
- [ ] Code compiles without errors
- [ ] Lint checks pass
- [ ] Documentation updated
- [ ] Self-review completed
```

## Review Process

1. Submit your PR
2. Maintainers will review within 3-5 business days
3. Address any feedback or requested changes
4. Once approved, your PR will be merged

## Database Migrations

When making schema changes:

1. Create a migration script in `migrations/`
2. Test the migration on a local database
3. Document the migration in `MIGRATION_GUIDE.md`
4. Include rollback instructions

## Performance Considerations

- Add indexes for frequently queried fields
- Use lean() for read-only queries
- Implement pagination for large result sets
- Use aggregation pipelines for complex queries
- Monitor query execution times

## Security Considerations

- Never commit sensitive data (passwords, API keys)
- Use environment variables for configuration
- Validate and sanitize all inputs
- Use select: false for sensitive fields
- Keep dependencies up-to-date

## Getting Help

- Review existing documentation
- Check GitHub Issues for similar problems
- Open a new issue with detailed information
- Join community discussions

## License

By contributing to PaymentAlert, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to PaymentAlert! 🎉
