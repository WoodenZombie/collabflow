# CollabFlow

The **CollabFlow** is a web-based system designed to help users efficiently organize projects, tasks, teams, and appointments within collaborative environments.  
It provides an intuitive interface for planning and tracking progress, ensuring smooth teamwork and productivity throughout the project lifecycle.

This application is being developed as part of a Semestral task for "Project Management" Unicorn University course and aims to demonstrate full-stack development principles using modern web technologies.

---

## Technology Stack

| Layer | Technology | Description |
|-------|-------------|--------------|
| **Frontend** | **React** | Used to build a dynamic and responsive user interface for managing projects, tasks, and appointments. |
| **Backend** | **Node.js + Express** | Handles business logic, routing, authentication, and communication with the database. |
| **Database** | **MySQL** | Stores persistent application data such as users, projects, tasks, and teams. 

---


# Git Branching Strategy

This project uses the **Feature Branch Workflow**

Each new feature, fix, or enhancement is developed in its **own dedicated branch** and merged back into the shared `develop` branch via pull requests after review and testing.

---

## Branch Structure

### **Main Branches**

| Branch | Purpose |
|--------|----------|
| `main` | Contains the latest stable and production-ready code. Only fully tested and approved changes are merged here. |
| `develop` | Serves as the integration branch for all upcoming sprint work. All completed feature branches are merged into `develop` after testing. |

### **Supporting Branches**

| Branch Type | Naming Convention | Purpose |
|--------------|------------------|----------|
| **Feature Branches** | `feature/<feature-name>` | Used to develop new features or functionalities (e.g., `feature/create-project-api`). |
| **Bugfix Branches** | `bugfix/<issue-name>` | Used to fix identified issues during development (e.g., `bugfix/task-validation`). |
| **Hotfix Branches** | `hotfix/<issue-name>` | Used for urgent fixes on the `main` branch (e.g., `hotfix/deployment-error`). |

---

## Workflow

1. **Create a new branch** from `develop`:  
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/<feature-name>
   ```

2. **Work on your feature** — commit changes regularly:  
   ```bash
   git add .
   git commit -m "Add API endpoint for creating a project"
   ```

3. **Push your branch** to the repository:  
   ```bash
   git push origin feature/<feature-name>
   ```

4. **Create a Pull Request (PR)** from your feature branch → `develop`.  
   - Include a short description of what was added or changed.  
   - Assign a reviewer.  

5. **After review and approval**, merge into `develop`.

6. **When the sprint is complete and tested**, merge `develop` into `main`:  
   ```bash
   git checkout main
   git merge develop
   git push origin main
   ```

---

## Example Branch Naming

| Type | Example |
|------|----------|
| Feature | `feature/create-project-api` |
| Feature | `feature/create-task-form` |
| Bugfix | `bugfix/fix-task-deadline` |
| Hotfix | `hotfix/fix-deployment-error` |

---

## Branching Rules

- Always branch **off of `develop`**, not `main`.  
- Never push directly to `main`.  
- Always use **Pull Requests** for merging — no direct commits.  
- Delete feature branches after merging to keep the repo clean.  
- Write clear and descriptive commit messages.  

---

## Additional Notes

- The **`main`** branch will represent the **latest stable release** (end of each sprint).  
- The **`develop`** branch is considered **unstable but testable**. 
- The **PM** is responsible for merging `develop` → `main` at the end of each sprint.  

---

## Example Branch Tree

```
main
│
└── develop
     ├── feature/create-project-api
     ├── feature/create-task-form
     ├── bugfix/task-validation
     └── hotfix/fix-deployment-error
```

---

### Contributors
- **Tetiana Velehura** – PM / Analyst  
- **Yurii Adamchuk** – Analyst  
- **Jan Svoboda**, **Denys Krupskyi**, **Aruzhan Boltabekova** – Backend Developers  
- **Viktor Hašenko**, **Olina Savčuková**, **Dmytro Starosta**, **Diana Stoyka** – Frontend Developers  
- **Maksym Karaban**, **Daniel Bělík** – Testers  
