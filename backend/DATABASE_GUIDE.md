# Database Management Guide

## 🚨 Important: Migrations vs Backups

**Migrations** = Track structure changes (tables, columns, indexes)
**Backups** = Save actual data (users, projects, tasks)

### What Migrations DON'T Do:
- ❌ Don't backup your data
- ❌ Don't restore deleted records
- ❌ Don't protect against data loss

### What Migrations DO:
- ✅ Track schema changes over time
- ✅ Allow team collaboration
- ✅ Enable safe production deployments
- ✅ Provide rollback for structure changes

## 📦 How to Protect Your Data

### 1. Create Backups (BEFORE making changes)

```bash
# Create a backup
npm run db:backup

# This creates: backups/taskify_backup_20241104_120000.sql
```

### 2. Make Your Changes

```bash
# Option A: Quick development (no migration file)
npm run db:push

# Option B: Production-ready (creates migration)
npm run db:migrate
```

### 3. If Something Goes Wrong

```bash
# List available backups
ls -lh backups/

# Restore from backup
npm run db:restore backups/taskify_backup_20241104_120000.sql
```

## 🔄 Daily Workflow

### Development (Safe, keeps data):
```bash
# 1. Backup first (optional but recommended)
npm run db:backup

# 2. Edit schema.prisma
# 3. Push changes
npm run db:push

# 4. Test your changes
npm run dev
```

### Before Major Changes (Extra safe):
```bash
# 1. ALWAYS backup first!
npm run db:backup

# 2. Make changes
npm run db:migrate

# 3. If it breaks, restore
npm run db:restore backups/your_backup.sql
```

### Production Deployment:
```bash
# Use proper migrations (never db:push in production!)
npm run db:migrate:prod
```

## 🛡️ Backup Schedule Recommendations

### For Development:
- Before schema changes: **Always**
- Daily: **Optional**
- Before db:reset: **REQUIRED**

### For Production:
- Automated daily backups: **Required**
- Before deployments: **Required**
- Keep 30 days of backups: **Recommended**

## 🔧 Common Scenarios

### Scenario 1: "I accidentally ran db:reset!"
```bash
# Restore from latest backup
npm run db:restore backups/taskify_backup_LATEST.sql
```

### Scenario 2: "Migration wants to reset database"
```bash
# 1. Backup first!
npm run db:backup

# 2. Let migration reset
npm run db:migrate

# 3. If you need old data, restore
npm run db:restore backups/your_backup.sql
```

### Scenario 3: "I want to test with fresh data"
```bash
# 1. Backup current data
npm run db:backup

# 2. Reset database
npm run db:reset

# 3. Test with fresh data
npm run db:seed

# 4. When done, restore original data
npm run db:restore backups/your_backup.sql
```

## 📊 Neon Database (Your Current Setup)

Your database is hosted on Neon (cloud PostgreSQL). Additional protection:

1. **Neon Automatic Backups**: Neon keeps automatic backups
2. **Point-in-time Recovery**: Can restore to any point in last 7 days
3. **Access Neon Console**: https://console.neon.tech

### To restore from Neon:
1. Go to Neon Console
2. Select your project
3. Go to "Backups" tab
4. Choose restore point
5. Create new branch or restore

## 🎯 Best Practices

1. **Always backup before**:
   - Running migrations
   - Making schema changes
   - Testing destructive operations

2. **Use db:push for development**:
   - Fast iteration
   - Keeps data
   - No migration files clutter

3. **Use db:migrate for production**:
   - Proper version control
   - Team collaboration
   - Deployment safety

4. **Never in production**:
   - db:push (no migration history)
   - db:reset (deletes everything!)
   - Direct SQL without migrations

## 🆘 Emergency Recovery

If you lost data and have no backup:

1. **Check Neon Console** - They have automatic backups
2. **Check Git history** - Maybe you have old seed data
3. **Check development database** - If you have a local copy
4. **Contact Neon Support** - They might help recover

## 📝 Quick Reference

| Command | What it does | Safe? | Creates Migration? |
|---------|-------------|-------|-------------------|
| `db:push` | Sync schema quickly | ✅ Yes | ❌ No |
| `db:migrate` | Create migration | ⚠️ May reset | ✅ Yes |
| `db:reset` | Delete everything | ❌ NO! | ❌ No |
| `db:backup` | Save data | ✅ Yes | N/A |
| `db:restore` | Load data | ⚠️ Replaces current | N/A |
| `db:studio` | View/edit data | ✅ Yes | ❌ No |

## 💡 Remember

**Migrations = Structure History**
**Backups = Data Safety**

You need BOTH for complete protection!
