# Developer Workflows: CorpAI Standard & Playbooks

## 1. Development Environment Setup

```bash
# 1. Install dependencies
npm install # or pnpm install / pip install -r requirements.txt

# 2. Run local development server
python -m corpai.cli --help
```

---

## 2. Testing & Quality Verification

```bash
# Run unit and integration tests
pytest tests/

# Run production build validation
python setup.py build
```

---

## 3. Release & CI/CD Pipeline
1. Ensure all tests pass locally.
2. Commit with standard Conventional Commits format (`feat:`, `fix:`, `chore:`).
3. Push to `main` branch to trigger automated GitHub Actions CI workflow.
