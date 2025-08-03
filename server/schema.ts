import { pgTable, text, timestamp, boolean, integer, jsonb, uuid } from 'drizzle-orm/pg-core';

// Users table
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  authProvider: text('auth_provider').notNull(),
  authProviderId: text('auth_provider_id').notNull(),
  avatar: text('avatar'),
  deathSwitchEnabled: boolean('death_switch_enabled').default(false),
  lastActive: timestamp('last_active').defaultNow(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Wills table
export const wills = pgTable('wills', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  title: text('title').notNull(),
  status: text('status').notNull().default('draft'), // draft, completed, signed
  personalInfo: jsonb('personal_info'),
  executors: jsonb('executors'),
  guardians: jsonb('guardians'),
  assets: jsonb('assets'),
  beneficiaries: jsonb('beneficiaries'),
  digitalAssets: jsonb('digital_assets'),
  finalInstructions: text('final_instructions'),
  witnessRequirements: jsonb('witness_requirements'),
  stateCompliance: jsonb('state_compliance'),
  aiSuggestions: jsonb('ai_suggestions'),
  blockchainHash: text('blockchain_hash'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  completedAt: timestamp('completed_at')
});

// Documents table
export const documents = pgTable('documents', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  originalName: text('original_name').notNull(),
  fileName: text('file_name').notNull(),
  fileSize: integer('file_size').notNull(),
  mimeType: text('mime_type').notNull(),
  category: text('category').notNull(),
  tags: jsonb('tags'),
  aiDescription: text('ai_description'),
  blockchainHash: text('blockchain_hash'),
  encryptionKey: text('encryption_key'),
  uploadedAt: timestamp('uploaded_at').defaultNow()
});

// Family members table
export const familyMembers = pgTable('family_members', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  email: text('email').notNull(),
  phone: text('phone'),
  relationship: text('relationship').notNull(),
  role: text('role').notNull(), // executor, beneficiary, guardian, witness
  status: text('status').notNull().default('invited'), // invited, accepted, declined
  permissions: jsonb('permissions'),
  biometricTemplate: text('biometric_template'),
  verificationToken: text('verification_token'),
  accessToken: text('access_token'),
  deviceToken: text('device_token'),
  invitedAt: timestamp('invited_at').defaultNow(),
  respondedAt: timestamp('responded_at'),
  verifiedAt: timestamp('verified_at')
});

// Death switch table
export const deathSwitch = pgTable('death_switch', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  enabled: boolean('enabled').default(false),
  inactivityPeriod: integer('inactivity_period').default(90), // days
  checkFrequency: text('check_frequency').default('daily'),
  obituaryMonitoring: boolean('obituary_monitoring').default(true),
  emergencyContacts: jsonb('emergency_contacts'),
  triggerConditions: jsonb('trigger_conditions'),
  automatedActions: jsonb('automated_actions'),
  lastCheckIn: timestamp('last_check_in').defaultNow(),
  status: text('status').default('active'), // active, triggered, paused
  triggeredAt: timestamp('triggered_at'),
  triggeredBy: text('triggered_by'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Video messages table
export const videoMessages = pgTable('video_messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  title: text('title').notNull(),
  description: text('description'),
  fileName: text('file_name').notNull(),
  fileSize: integer('file_size').notNull(),
  duration: integer('duration'), // seconds
  recipient: text('recipient'), // 'all', 'family', or specific person
  recipientEmail: text('recipient_email'),
  triggerEvent: text('trigger_event').default('death'), // death, birthday, anniversary, etc.
  triggerDate: timestamp('trigger_date'),
  isPlayed: boolean('is_played').default(false),
  playedAt: timestamp('played_at'),
  encryptionKey: text('encryption_key'),
  thumbnailPath: text('thumbnail_path'),
  createdAt: timestamp('created_at').defaultNow()
});

// Grief counseling sessions table
export const griefCounselingSessions = pgTable('grief_counseling_sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  sessionId: text('session_id').notNull(),
  message: text('message').notNull(),
  response: text('response').notNull(),
  emotion: text('emotion'), // detected emotion
  aiModel: text('ai_model').default('gpt-4'),
  sessionType: text('session_type').default('grief'), // grief, loss, support
  createdAt: timestamp('created_at').defaultNow()
});

// Activity log table
export const activityLog = pgTable('activity_log', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  action: text('action').notNull(),
  entityType: text('entity_type'), // will, document, family, etc.
  entityId: uuid('entity_id'),
  details: jsonb('details'),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at').defaultNow()
});

// Blockchain notarization table
export const blockchainNotarizations = pgTable('blockchain_notarizations', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  event: text('event').notNull(),
  entityType: text('entity_type').notNull(),
  entityId: uuid('entity_id').notNull(),
  hash: text('hash').notNull(),
  blockchainTx: text('blockchain_tx'), // transaction hash
  blockNumber: text('block_number'),
  network: text('network').default('polygon'), // ethereum, polygon, etc.
  gasUsed: integer('gas_used'),
  status: text('status').default('pending'), // pending, confirmed, failed
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow(),
  confirmedAt: timestamp('confirmed_at')
});

// Subscription table
export const subscriptions = pgTable('subscriptions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  planId: text('plan_id').notNull(),
  status: text('status').notNull(), // active, canceled, past_due
  stripeSubscriptionId: text('stripe_subscription_id'),
  currentPeriodStart: timestamp('current_period_start'),
  currentPeriodEnd: timestamp('current_period_end'),
  canceledAt: timestamp('canceled_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Heir verification table
export const heirVerifications = pgTable('heir_verifications', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  heirId: uuid('heir_id').references(() => familyMembers.id).notNull(),
  verificationType: text('verification_type').notNull(), // biometric, government_id, knowledge_based
  verificationData: jsonb('verification_data'),
  status: text('status').default('pending'), // pending, verified, failed
  attempts: integer('attempts').default(0),
  maxAttempts: integer('max_attempts').default(3),
  verifiedAt: timestamp('verified_at'),
  createdAt: timestamp('created_at').defaultNow()
});