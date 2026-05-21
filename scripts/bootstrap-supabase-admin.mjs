import { createClient } from "@supabase/supabase-js";

function readOption(name) {
  const prefix = `--${name}=`;
  const match = process.argv.find((value) => value.startsWith(prefix));
  return match ? match.slice(prefix.length) : undefined;
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}

const email = (readOption("email") || process.env.ADMIN_EMAIL || "admin@daaicf.org").toLowerCase();
const password = readOption("password");
const displayName = readOption("name") || "DAAICF Administrator";
const phone = readOption("phone") || "+234 000 000 0000";

if (!password) {
  console.error("Pass a password with --password=your-secure-password");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const { data: usersPage, error: listError } = await supabase.auth.admin.listUsers({
  page: 1,
  perPage: 1000,
});

if (listError) {
  console.error(listError.message);
  process.exit(1);
}

let user = usersPage.users.find(
  (candidate) => candidate.email?.toLowerCase() === email
);

if (!user) {
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      role: "admin",
      display_name: displayName,
      is_admin: true,
    },
  });

  if (error || !data.user) {
    console.error(error?.message || "Unable to create admin user.");
    process.exit(1);
  }

  user = data.user;
} else {
  const { error } = await supabase.auth.admin.updateUserById(user.id, {
    email,
    password,
    email_confirm: true,
    user_metadata: {
      ...(user.user_metadata || {}),
      role: "admin",
      display_name: displayName,
      is_admin: true,
    },
  });

  if (error) {
    console.error(error.message);
    process.exit(1);
  }
}

const { error: profileError } = await supabase.from("user_profiles").upsert(
  {
    id: user.id,
    role: "admin",
    display_name: displayName,
    email,
    phone,
    is_admin: true,
    status: "active",
  },
  { onConflict: "id" }
);

if (profileError) {
  console.error(profileError.message);
  process.exit(1);
}

console.log(`Admin user ready: ${email}`);
