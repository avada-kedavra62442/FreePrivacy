# FreePrivacy
Local-first browser utilities: password/passphrase generation, SHA digests, Base64/URL encoding, JWT inspection, UUIDs, QR generation/reading, EXIF removal, metadata viewing, file checksums, AES-GCM text encryption, and secure random bytes.

Install with npm install; develop with npm run dev; build with npm run build.

JWT decoding does not verify signatures. Hashing is not password storage. Encryption depends on passphrase strength. Image metadata removal re-exports to PNG without copying EXIF.