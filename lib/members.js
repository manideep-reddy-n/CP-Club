import { getDb } from "./mongo";
import { ObjectId } from "mongodb";

const COLLECTION = "members";

function normalizeUsername(username) {
  return username?.trim().toLowerCase();
}

function normalizeEmail(email) {
  return email?.trim().toLowerCase();
}

export async function getMembers() {
  const db = await getDb();
  const members = await db
    .collection(COLLECTION)
    .find({}, { projection: { passwordHash: 0 } })
    .sort({ createdAt: -1 })
    .toArray();
  return members;
}

export async function getMemberByUsername(username) {
  const db = await getDb();
  const normalized = normalizeUsername(username);
  if (!normalized) return null;

  return db
    .collection(COLLECTION)
    .findOne({ username: normalized }, { projection: { passwordHash: 0 } });
}

export async function getMemberForLogin(usernameOrEmail) {
  const db = await getDb();
  const normalized = normalizeUsername(usernameOrEmail);
  if (!normalized) return null;

  const normalizedEmail = normalizeEmail(usernameOrEmail);

  return db.collection(COLLECTION).findOne(
    {
      $or: [{ username: normalized }, { email: normalizedEmail }],
    },
    { projection: {} } // Include passwordHash
  );
}

export async function createMember({
  name,
  email,
  username,
  passwordHash,
  platforms,
  year,
}) {
  const db = await getDb();
  const normalizedUsername = normalizeUsername(username);
  const normalizedEmail = normalizeEmail(email);

  if (!normalizedUsername || !normalizedEmail) {
    throw new Error("Invalid username or email.");
  }

  const existing = await db.collection(COLLECTION).findOne({
    $or: [{ username: normalizedUsername }, { email: normalizedEmail }],
  });
  if (existing) {
    throw new Error("Username or email already exists.");
  }

  const payload = {
    name: name?.trim(),
    email: normalizedEmail,
    username: normalizedUsername,
    passwordHash,
    platforms: {
      cf_username: platforms?.cf_username?.trim()?.toLowerCase() || null,
      lc_username: platforms?.lc_username?.trim()?.toLowerCase() || null,
      cc_username: platforms?.cc_username?.trim()?.toLowerCase() || null,
      cses_id: platforms?.cses_id?.trim()?.toLowerCase() || null,
    },
    year: year ?? null,
    inClub: false,
    createdAt: new Date(),
  };

  const result = await db.collection(COLLECTION).insertOne(payload);
  return { ...payload, _id: result.insertedId };
}

export async function updateMember(username, updates) {
  const db = await getDb();
  const normalized = normalizeUsername(username);
  if (!normalized) {
    throw new Error("Invalid username.");
  }

  const updatePayload = {};
  
  if (updates.name !== undefined) {
    updatePayload.name = updates.name?.trim() || null;
  }
  
  if (updates.platforms) {
    updatePayload.platforms = {
      cf_username: updates.platforms.cf_username?.trim()?.toLowerCase() || null,
      lc_username: updates.platforms.lc_username?.trim()?.toLowerCase() || null,
      cc_username: updates.platforms.cc_username?.trim()?.toLowerCase() || null,
      cses_id: updates.platforms.cses_id?.trim()?.toLowerCase() || null,
    };
  }

  if (updates.year !== undefined) {
    // Accept numeric year or string; store as provided (or null to clear)
    updatePayload.year = updates.year === null || updates.year === "" ? null : updates.year;
  }

  if (Object.keys(updatePayload).length === 0) {
    throw new Error("No valid updates provided.");
  }

  const result = await db.collection(COLLECTION).findOneAndUpdate(
    { username: normalized },
    { $set: updatePayload },
    { returnDocument: "after", projection: { passwordHash: 0 } }
  );
  const updatedMember = result?.value ?? result;
  if (!updatedMember) {
    console.error(`updateMember: No document found for normalized username='${normalized}'`);
    throw new Error("Member not found.");
  }

  return updatedMember;
}

export async function updateMemberById(id, updates) {
  const db = await getDb();
  if (!id) {
    throw new Error("Invalid member id.");
  }

  let objectId;
  try {
    objectId = new ObjectId(String(id));
  } catch {
    throw new Error("Invalid member id.");
  }

  const updatePayload = {};

  if (updates.name !== undefined) {
    updatePayload.name = updates.name?.trim() || null;
  }

  if (updates.platforms) {
    updatePayload.platforms = {
      cf_username: updates.platforms.cf_username?.trim()?.toLowerCase() || null,
      lc_username: updates.platforms.lc_username?.trim()?.toLowerCase() || null,
      cc_username: updates.platforms.cc_username?.trim()?.toLowerCase() || null,
      cses_id: updates.platforms.cses_id?.trim()?.toLowerCase() || null,
    };
  }

  if (updates.year !== undefined) {
    updatePayload.year =
      updates.year === null || updates.year === "" ? null : updates.year;
  }

  if (Object.keys(updatePayload).length === 0) {
    throw new Error("No valid updates provided.");
  }

  const result = await db.collection(COLLECTION).findOneAndUpdate(
    { _id: objectId },
    { $set: updatePayload },
    { returnDocument: "after", projection: { passwordHash: 0 } }
  );

  const updatedMember = result?.value ?? result;
  if (!updatedMember) {
    console.error(`updateMemberById: No document found for id='${id}'`);
    throw new Error("Member not found.");
  }

  return updatedMember;
}
