import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { pool, withUserContext } from '../db';
import { passwordProblems } from '../utils/passwordPolicy';

// One-off admin helper to (re)set the MANAGER login password on the live DB.
// Use it when the manager password is lost — logins store only a one-way bcrypt
// hash, so the old password can't be recovered; this writes a fresh hash.
//
// The new password is read from an env var so it never lands in git or in this
// process's argv. Run it yourself so you own the credential:
//
//   PowerShell:
//     $env:NEW_MANAGER_PASSWORD = "your-new-password"; npm run set-manager-password
//   bash:
//     NEW_MANAGER_PASSWORD="your-new-password" npm run set-manager-password
//
// Then verify end-to-end with the same value:
//   $env:TEST_MANAGER_PASSWORD = "your-new-password"; npm run smoke

const BCRYPT_COST = 10;          // must match userService.ts / the login path
const ROLE = 'manager';          // login is role-based; exactly one manager row
const EMAIL = 'manager@drivepro.test';

async function main(): Promise<void> {
  // Default to '' so `password` is always a string (the policy rejects '' with a
  // length problem anyway) — keeps the rest of the flow simply typed.
  const password = process.env.NEW_MANAGER_PASSWORD ?? '';
  // Enforce the same strength policy the app applies to every other password,
  // so the recovery path can't quietly set a weak manager password.
  const problems = passwordProblems(password);
  if (problems.length > 0) {
    console.error(
      'Refusing to set the password.\n' +
      `NEW_MANAGER_PASSWORD must ${problems.join(' and ')}. For example:\n` +
      '  $env:NEW_MANAGER_PASSWORD = "your-new-password"; npm run set-manager-password',
    );
    process.exit(1);
  }

  const hash = await bcrypt.hash(password, BCRYPT_COST);

  // Route the write through withUserContext (same as every app write) so the
  // audit trigger has app.current_user_id set rather than tripping on an unset GUC.
  const rowCount = await withUserContext(null, async (client) => {
    const r = await client.query(
      'update public.users set password_hash = $1, updated_at = now() where role = $2',
      [hash, ROLE],
    );
    return r.rowCount ?? 0;
  });

  if (rowCount === 1) {
    console.log(`\n✓ Password updated for the ${ROLE} account (${EMAIL}).`);
    console.log('  Verify:  $env:TEST_MANAGER_PASSWORD = "<same value>"; npm run smoke\n');
  } else {
    console.warn(`\n⚠ Expected to update exactly 1 ${ROLE} row but touched ${rowCount}. Nothing was changed harmfully; investigate before retrying.\n`);
  }

  await pool.end();
  process.exit(rowCount === 1 ? 0 : 1);
}

main().catch(async (err) => {
  console.error('Password reset failed:', err instanceof Error ? err.message : err);
  await pool.end().catch(() => {});
  process.exit(1);
});
