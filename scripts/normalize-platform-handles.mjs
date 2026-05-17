import { getDb } from '../lib/mongo.js';

async function normalize() {
  const db = await getDb();
  const col = db.collection('members');

  const cursor = col.find({}, { projection: { platforms: 1 } });
  let updated = 0;

  while (await cursor.hasNext()) {
    const doc = await cursor.next();
    const platforms = doc.platforms || {};
    const updates = {};

    if (platforms.cf_username && typeof platforms.cf_username === 'string') {
      const val = platforms.cf_username.trim().toLowerCase();
      if (val !== platforms.cf_username) updates['platforms.cf_username'] = val;
    }
    if (platforms.lc_username && typeof platforms.lc_username === 'string') {
      const val = platforms.lc_username.trim().toLowerCase();
      if (val !== platforms.lc_username) updates['platforms.lc_username'] = val;
    }
    if (platforms.cc_username && typeof platforms.cc_username === 'string') {
      const val = platforms.cc_username.trim().toLowerCase();
      if (val !== platforms.cc_username) updates['platforms.cc_username'] = val;
    }
    if (platforms.cses_id && typeof platforms.cses_id === 'string') {
      const val = platforms.cses_id.trim().toLowerCase();
      if (val !== platforms.cses_id) updates['platforms.cses_id'] = val;
    }

    if (Object.keys(updates).length > 0) {
      await col.updateOne({ _id: doc._id }, { $set: updates });
      updated++;
    }
  }

  console.log(`Normalization complete. Documents updated: ${updated}`);
  process.exit(0);
}

normalize().catch((err) => {
  console.error('Normalization error:', err);
  process.exit(1);
});
