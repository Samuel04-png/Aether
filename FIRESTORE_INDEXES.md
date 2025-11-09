# Firestore Indexes

Some Firestore queries in Aether require composite indexes. Create the following indexes in the Firebase console so queries succeed without errors.

1. **Project invites received**
   - Collection: `projectInvites`
   - Fields:
     - `invitedUser` (Ascending)
     - `createdAt` (Descending)
   - Console link: https://console.firebase.google.com/v1/r/project/aether-db171/firestore/indexes?create_composite=CkVwcm9qZWN0L2Flemhlci1kYjE3MS9kYXRhYmFzZXMvKGRlZmF1bHQpL2NvbGxlY3Rpb24vUHJvamVjdEludml0ZXMvaW5kZXgvXxABGg0KCWludml0ZWRVc2VyEAEaDQoJY3JlYXRlZEF0EAM

2. **Project invites sent**
   - Collection: `projectInvites`
   - Fields:
     - `invitedBy` (Ascending)
     - `createdAt` (Descending)
   - Console link: https://console.firebase.google.com/v1/r/project/aether-db171/firestore/indexes?create_composite=CkVwcm9qZWN0L2Flemhlci1kYjE3MS9kYXRhYmFzZXMvKGRlZmF1bHQpL2NvbGxlY3Rpb24vUHJvamVjdEludml0ZXMvaW5kZXgvXxABGgwKCWludml0ZWRCeRABGgwKCWNyZWF0ZWRBdBAC

After creating the indexes, Firestore will take a few minutes to build them. Queries that previously failed with “The query requires an index” will succeed once the index is ready.

