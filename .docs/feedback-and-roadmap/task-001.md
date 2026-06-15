# Task 001 — GitHub Issue Templates

## Goal
Create GitHub Issue templates for bug reports, feature requests, and questions so feedback category buttons can link directly to pre-filled issue forms.

## Prerequisites
- None

## Tasks

### GitHub Issue Templates

- [x] `.github/ISSUE_TEMPLATE/bug_report.yml` — Create bug report issue template with title prefix `[Bug]`, labels `bug`, and structured body (description, steps to reproduce, expected vs actual, environment) (new)
- [x] `.github/ISSUE_TEMPLATE/feature_request.yml` — Create feature request template with title prefix `[Feature]`, labels `enhancement`, and body (description, use case, proposed solution) (new)
- [x] `.github/ISSUE_TEMPLATE/question.yml` — Create question template with title prefix `[Question]`, labels `question`, and body (question, context) (new)
- [x] `.github/ISSUE_TEMPLATE/config.yml` — Create template chooser config with blank issues disabled and contact links (new)

## Done When
- [x] Three issue templates exist under `.github/ISSUE_TEMPLATE/` <!-- verified 2026-06-15 -->
- [x] Each template has correct title prefix, labels, and structured body fields <!-- verified 2026-06-15 -->
- [x] Template chooser config disables blank issues <!-- verified 2026-06-15 -->
- [ ] Navigating to `github.com/<repo>/issues/new/choose` shows all three templates <!-- blocked: requires push to remote -->
