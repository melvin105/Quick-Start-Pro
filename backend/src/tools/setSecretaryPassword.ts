import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { pool, withUserContext } from '../db';
import { passwordProblems } from '../utils/passwordPolicy';

// One-off admin helper to (re)set the SECRETARY login password on the live DB.
// Mirrors setManagerPassword.ts — see that file for the full rationale.
//
//   PowerShell:
//     $env:NEW_SECRETARY_PASSWORD = "your-new-password"; npm run set-secretary-password
//   bash:
//     NEW_SECRETARY_PASSWORD="your-new-password" npm run set-secretary-password

const BCRYPT_COST = 10;          // must match userService.ts / the login path
const ROLE = 'secretary';        // login is role-based; exactly one secretary row
const EMAIL = 'secretary@drivepro.test';

async function main(): Promise<void> {
  const password = process.env.NEW_SECRETARY_PASSWORD ?? '';
  const problems = passwordProblems(password);
  if (problems.length > 0) {
    console.error(
      'Refusing to set the password.\n' +
      `NEW_SECRETARY_PASSWORD must ${problems.join(' and ')}. For example:\n` +
      '  $env:NEW_SECRETARY_PASSWORD = "your-new-password"; npm run set-secretary-password',
    );
    process.exit(1);
  }

  const hash = await bcrypt.hash(password, BCRYPT_COST);

  const rowCount = await withUserContext(null, async (client) => {
    const r = await client.query(
      'update public.users set password_hash = $1, updated_at = now() where role = $2',
      [hash, ROLE],
    );
    return r.rowCount ?? 0;
  });

  if (rowCount === 1) {
    console.log(`\n✓ Password updated for the ${ROLE} account (${EMAIL}).\n`);
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
