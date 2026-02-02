// MongoDB initialization script
// This script runs when the MongoDB container is first started

db = db.getSiblingDB('eventify');

// Create admin user for the application database
db.createUser({
  user: 'eventify_user',
  pwd: 'eventify_password',
  roles: [
    {
      role: 'readWrite',
      db: 'eventify'
    }
  ]
});

// Create indexes
db.users.createIndex({ email: 1 }, { unique: true });
db.events.createIndex({ status: 1, date: 1 });
db.events.createIndex({ title: 'text', description: 'text' });
db.reservations.createIndex({ event: 1, participant: 1 });
db.reservations.createIndex({ participant: 1, status: 1 });

print('MongoDB initialization completed successfully!');
