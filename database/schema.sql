-- ============================================================================
-- MarineCloudeX — full database schema (PostgreSQL)
--
-- WHEN TO USE THIS
--   Bringing up a FRESH, EMPTY database. Run this once, then register the
--   TypeORM baseline so future migrations diff from here:
--
--     psql "$DATABASE_URL" -f apps/backend/database/schema.sql
--     cd apps/backend && npm run migration:run     # records the no-op Baseline
--     npm run seed -- admin                         # roles/stages/sources + admin
--
--   If you are pointing at the EXISTING database, do NOT run this — the tables
--   already exist. Just `npm run migration:run` (Baseline is a no-op) and go.
--
-- 34 tables (28 entities + 6 join tables), 14 enum types, 47 foreign keys.
-- Generated from a pg_dump of the live schema on 2026-09-01.
-- ============================================================================

--
-- PostgreSQL database dump
--

\restrict JwS5De8fjLuokcK0t57llFYeI6lGNbnIGRzBNlhdmdvOOdFEEs56VumTSivxwHw

-- Dumped from database version 18.6 (c5250a2)
-- Dumped by pg_dump version 18.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: neon_auth; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA neon_auth;


--
-- Name: ActivityType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."ActivityType" AS ENUM (
    'LEAD_CREATED',
    'STATUS_CHANGED',
    'STAGE_CHANGED',
    'ASSIGNED',
    'UNASSIGNED',
    'CALL',
    'EMAIL',
    'MEETING',
    'MESSAGE',
    'WHATSAPP',
    'PROPOSAL_SENT',
    'FOLLOW_UP',
    'NOTE_ADDED',
    'TASK_CREATED',
    'TASK_COMPLETED',
    'CONVERSATION_LINKED',
    'OTHER'
);


--
-- Name: ConversationStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."ConversationStatus" AS ENUM (
    'ACTIVE',
    'ENDED',
    'ABANDONED',
    'CONVERTED'
);


--
-- Name: LeadStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."LeadStatus" AS ENUM (
    'OPEN',
    'WON',
    'LOST',
    'ARCHIVED'
);


--
-- Name: MediaType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."MediaType" AS ENUM (
    'IMAGE',
    'VIDEO',
    'DOCUMENT',
    'AUDIO',
    'OTHER'
);


--
-- Name: MessageRole; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."MessageRole" AS ENUM (
    'USER',
    'ASSISTANT',
    'SYSTEM',
    'TOOL'
);


--
-- Name: NotificationChannel; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."NotificationChannel" AS ENUM (
    'EMAIL',
    'WHATSAPP',
    'IN_APP'
);


--
-- Name: NotificationStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."NotificationStatus" AS ENUM (
    'PENDING',
    'SENT',
    'DELIVERED',
    'FAILED',
    'CANCELLED'
);


--
-- Name: Priority; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."Priority" AS ENUM (
    'LOW',
    'MEDIUM',
    'HIGH',
    'URGENT'
);


--
-- Name: ProjectMediaRole; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."ProjectMediaRole" AS ENUM (
    'GALLERY',
    'SCREENSHOT',
    'DIAGRAM',
    'OTHER'
);


--
-- Name: ProjectStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."ProjectStatus" AS ENUM (
    'PLANNED',
    'IN_PROGRESS',
    'COMPLETED',
    'ON_HOLD',
    'CANCELLED'
);


--
-- Name: PublicationStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."PublicationStatus" AS ENUM (
    'DRAFT',
    'PUBLISHED',
    'ARCHIVED'
);


--
-- Name: TaskStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."TaskStatus" AS ENUM (
    'PENDING',
    'IN_PROGRESS',
    'COMPLETED',
    'CANCELLED'
);


--
-- Name: TechnologyCategory; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."TechnologyCategory" AS ENUM (
    'FRONTEND',
    'BACKEND',
    'MOBILE',
    'DATABASE',
    'AI',
    'AUTOMATION',
    'CLOUD',
    'DEVOPS',
    'ANALYTICS',
    'OTHER'
);


--
-- Name: UserStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."UserStatus" AS ENUM (
    'ACTIVE',
    'INVITED',
    'SUSPENDED',
    'DISABLED'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: account; Type: TABLE; Schema: neon_auth; Owner: -
--

CREATE TABLE neon_auth.account (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    "accountId" text NOT NULL,
    "providerId" text NOT NULL,
    "userId" uuid NOT NULL,
    "accessToken" text,
    "refreshToken" text,
    "idToken" text,
    "accessTokenExpiresAt" timestamp with time zone,
    "refreshTokenExpiresAt" timestamp with time zone,
    scope text,
    password text,
    "createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


--
-- Name: invitation; Type: TABLE; Schema: neon_auth; Owner: -
--

CREATE TABLE neon_auth.invitation (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    "organizationId" uuid NOT NULL,
    email text NOT NULL,
    role text,
    status text NOT NULL,
    "expiresAt" timestamp with time zone NOT NULL,
    "createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "inviterId" uuid NOT NULL
);


--
-- Name: jwks; Type: TABLE; Schema: neon_auth; Owner: -
--

CREATE TABLE neon_auth.jwks (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    "publicKey" text NOT NULL,
    "privateKey" text NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "expiresAt" timestamp with time zone
);


--
-- Name: member; Type: TABLE; Schema: neon_auth; Owner: -
--

CREATE TABLE neon_auth.member (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    "organizationId" uuid NOT NULL,
    "userId" uuid NOT NULL,
    role text NOT NULL,
    "createdAt" timestamp with time zone NOT NULL
);


--
-- Name: organization; Type: TABLE; Schema: neon_auth; Owner: -
--

CREATE TABLE neon_auth.organization (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    logo text,
    "createdAt" timestamp with time zone NOT NULL,
    metadata text
);


--
-- Name: project_config; Type: TABLE; Schema: neon_auth; Owner: -
--

CREATE TABLE neon_auth.project_config (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    endpoint_id text NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    trusted_origins jsonb NOT NULL,
    social_providers jsonb NOT NULL,
    email_provider jsonb,
    email_and_password jsonb,
    allow_localhost boolean NOT NULL,
    plugin_configs jsonb,
    webhook_config jsonb
);


--
-- Name: session; Type: TABLE; Schema: neon_auth; Owner: -
--

CREATE TABLE neon_auth.session (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    "expiresAt" timestamp with time zone NOT NULL,
    token text NOT NULL,
    "createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "ipAddress" text,
    "userAgent" text,
    "userId" uuid NOT NULL,
    "impersonatedBy" text,
    "activeOrganizationId" text
);


--
-- Name: user; Type: TABLE; Schema: neon_auth; Owner: -
--

CREATE TABLE neon_auth."user" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    "emailVerified" boolean NOT NULL,
    image text,
    "createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    role text,
    banned boolean,
    "banReason" text,
    "banExpires" timestamp with time zone
);


--
-- Name: verification; Type: TABLE; Schema: neon_auth; Owner: -
--

CREATE TABLE neon_auth.verification (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    identifier text NOT NULL,
    value text NOT NULL,
    "expiresAt" timestamp with time zone NOT NULL,
    "createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: AuditLog; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."AuditLog" (
    id text NOT NULL,
    "userId" text,
    action text NOT NULL,
    "entityType" text NOT NULL,
    "entityId" text,
    metadata jsonb,
    "ipAddress" text,
    "userAgent" text,
    "createdAt" timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: BlogCategory; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."BlogCategory" (
    id text NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    description text,
    "order" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(6) with time zone NOT NULL
);


--
-- Name: BlogPost; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."BlogPost" (
    id text NOT NULL,
    title text NOT NULL,
    slug text NOT NULL,
    excerpt text,
    content text,
    "authorId" text,
    "categoryId" text,
    "coverMediaId" text,
    status public."PublicationStatus" DEFAULT 'DRAFT'::public."PublicationStatus" NOT NULL,
    "publishedAt" timestamp(6) with time zone,
    "seoTitle" text,
    "seoDescription" text,
    "createdAt" timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(6) with time zone NOT NULL
);


--
-- Name: BlogTag; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."BlogTag" (
    id text NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    "createdAt" timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(6) with time zone NOT NULL
);


--
-- Name: CaseStudy; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."CaseStudy" (
    id text NOT NULL,
    "projectId" text NOT NULL,
    challenge text,
    approach text,
    solution text,
    implementation text,
    results text,
    status public."PublicationStatus" DEFAULT 'DRAFT'::public."PublicationStatus" NOT NULL,
    "publishedAt" timestamp(6) with time zone,
    "seoTitle" text,
    "seoDescription" text,
    "createdAt" timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(6) with time zone NOT NULL
);


--
-- Name: Contact; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Contact" (
    id text NOT NULL,
    "firstName" text NOT NULL,
    "lastName" text,
    email text,
    phone text,
    company text,
    "jobTitle" text,
    website text,
    notes text,
    "createdAt" timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(6) with time zone NOT NULL
);


--
-- Name: Conversation; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Conversation" (
    id text NOT NULL,
    "sessionId" text NOT NULL,
    status public."ConversationStatus" DEFAULT 'ACTIVE'::public."ConversationStatus" NOT NULL,
    "leadId" text,
    metadata jsonb,
    "startedAt" timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "endedAt" timestamp(6) with time zone,
    "createdAt" timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(6) with time zone NOT NULL
);


--
-- Name: ConversationQualification; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."ConversationQualification" (
    id text NOT NULL,
    "conversationId" text NOT NULL,
    "serviceId" text,
    "industryId" text,
    intent text,
    requirement text,
    "budgetMin" numeric(12,2),
    "budgetMax" numeric(12,2),
    "budgetCurrency" character(3),
    timeline text,
    score integer,
    "createdAt" timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(6) with time zone NOT NULL
);


--
-- Name: Faq; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Faq" (
    id text NOT NULL,
    question text NOT NULL,
    answer text NOT NULL,
    category text,
    status public."PublicationStatus" DEFAULT 'DRAFT'::public."PublicationStatus" NOT NULL,
    "order" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(6) with time zone NOT NULL
);


--
-- Name: Industry; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Industry" (
    id text NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    description text,
    "order" integer DEFAULT 0 NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(6) with time zone NOT NULL
);


--
-- Name: Lead; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Lead" (
    id text NOT NULL,
    "contactId" text NOT NULL,
    "companyName" text,
    "sourceId" text NOT NULL,
    "pipelineStageId" text NOT NULL,
    "assignedUserId" text,
    "serviceId" text,
    "industryId" text,
    status public."LeadStatus" DEFAULT 'OPEN'::public."LeadStatus" NOT NULL,
    priority public."Priority" DEFAULT 'MEDIUM'::public."Priority" NOT NULL,
    "qualificationScore" integer,
    requirement text,
    "budgetMin" numeric(12,2),
    "budgetMax" numeric(12,2),
    "budgetCurrency" character(3),
    timeline text,
    "closedAt" timestamp(6) with time zone,
    "createdAt" timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(6) with time zone NOT NULL
);


--
-- Name: LeadActivity; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."LeadActivity" (
    id text NOT NULL,
    "leadId" text NOT NULL,
    "userId" text,
    type public."ActivityType" NOT NULL,
    description text,
    metadata jsonb,
    "occurredAt" timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "createdAt" timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: LeadNote; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."LeadNote" (
    id text NOT NULL,
    "leadId" text NOT NULL,
    "authorId" text,
    content text NOT NULL,
    "createdAt" timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(6) with time zone NOT NULL
);


--
-- Name: LeadSource; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."LeadSource" (
    id text NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    description text,
    "isActive" boolean DEFAULT true NOT NULL,
    "isSystem" boolean DEFAULT false NOT NULL,
    "order" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(6) with time zone NOT NULL
);


--
-- Name: Media; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Media" (
    id text NOT NULL,
    filename text NOT NULL,
    "originalFilename" text,
    "storageKey" text NOT NULL,
    url text,
    type public."MediaType" DEFAULT 'IMAGE'::public."MediaType" NOT NULL,
    "mimeType" text,
    size bigint,
    width integer,
    height integer,
    "altText" text,
    metadata jsonb,
    "uploadedById" text,
    "createdAt" timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(6) with time zone NOT NULL
);


--
-- Name: Message; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Message" (
    id text NOT NULL,
    "conversationId" text NOT NULL,
    role public."MessageRole" NOT NULL,
    content text NOT NULL,
    metadata jsonb,
    "createdAt" timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: Notification; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Notification" (
    id text NOT NULL,
    channel public."NotificationChannel" NOT NULL,
    status public."NotificationStatus" DEFAULT 'PENDING'::public."NotificationStatus" NOT NULL,
    recipient text,
    "userId" text,
    "leadId" text,
    subject text,
    body text,
    payload jsonb,
    attempts integer DEFAULT 0 NOT NULL,
    "sentAt" timestamp(6) with time zone,
    "failedAt" timestamp(6) with time zone,
    "errorMessage" text,
    "readAt" timestamp(6) with time zone,
    "createdAt" timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(6) with time zone NOT NULL
);


--
-- Name: PipelineStage; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."PipelineStage" (
    id text NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    description text,
    "order" integer DEFAULT 0 NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "isSystem" boolean DEFAULT false NOT NULL,
    "isWon" boolean DEFAULT false NOT NULL,
    "isLost" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(6) with time zone NOT NULL
);


--
-- Name: Project; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Project" (
    id text NOT NULL,
    title text NOT NULL,
    slug text NOT NULL,
    "shortDescription" text,
    "fullDescription" text,
    "categoryId" text,
    "publicationStatus" public."PublicationStatus" DEFAULT 'DRAFT'::public."PublicationStatus" NOT NULL,
    "publishedAt" timestamp(6) with time zone,
    status public."ProjectStatus" DEFAULT 'COMPLETED'::public."ProjectStatus" NOT NULL,
    featured boolean DEFAULT false NOT NULL,
    "order" integer DEFAULT 0 NOT NULL,
    "liveUrl" text,
    "seoTitle" text,
    "seoDescription" text,
    "coverMediaId" text,
    "createdAt" timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(6) with time zone NOT NULL
);


--
-- Name: ProjectCategory; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."ProjectCategory" (
    id text NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    description text,
    "order" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(6) with time zone NOT NULL
);


--
-- Name: ProjectMedia; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."ProjectMedia" (
    id text NOT NULL,
    "projectId" text NOT NULL,
    "mediaId" text NOT NULL,
    role public."ProjectMediaRole" DEFAULT 'GALLERY'::public."ProjectMediaRole" NOT NULL,
    caption text,
    "order" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: Role; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Role" (
    id text NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    description text,
    level integer DEFAULT 100 NOT NULL,
    "isSystem" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(6) with time zone NOT NULL
);


--
-- Name: Service; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Service" (
    id text NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    "shortDescription" text,
    "fullDescription" text,
    status public."PublicationStatus" DEFAULT 'DRAFT'::public."PublicationStatus" NOT NULL,
    "publishedAt" timestamp(6) with time zone,
    "order" integer DEFAULT 0 NOT NULL,
    "seoTitle" text,
    "seoDescription" text,
    "coverMediaId" text,
    "createdAt" timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(6) with time zone NOT NULL
);


--
-- Name: ServiceFeature; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."ServiceFeature" (
    id text NOT NULL,
    "serviceId" text NOT NULL,
    name text NOT NULL,
    description text,
    "order" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(6) with time zone NOT NULL
);


--
-- Name: Task; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Task" (
    id text NOT NULL,
    "leadId" text,
    "assignedUserId" text,
    "createdById" text,
    title text NOT NULL,
    description text,
    status public."TaskStatus" DEFAULT 'PENDING'::public."TaskStatus" NOT NULL,
    priority public."Priority" DEFAULT 'MEDIUM'::public."Priority" NOT NULL,
    "dueAt" timestamp(6) with time zone,
    "completedAt" timestamp(6) with time zone,
    "createdAt" timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(6) with time zone NOT NULL
);


--
-- Name: Technology; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Technology" (
    id text NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    category public."TechnologyCategory" DEFAULT 'OTHER'::public."TechnologyCategory" NOT NULL,
    "order" integer DEFAULT 0 NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(6) with time zone NOT NULL
);


--
-- Name: Testimonial; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Testimonial" (
    id text NOT NULL,
    "authorName" text NOT NULL,
    "authorRole" text,
    "companyName" text,
    content text NOT NULL,
    rating integer,
    "photoMediaId" text,
    "projectId" text,
    status public."PublicationStatus" DEFAULT 'DRAFT'::public."PublicationStatus" NOT NULL,
    "publishedAt" timestamp(6) with time zone,
    "order" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(6) with time zone NOT NULL
);


--
-- Name: User; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."User" (
    id text NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    phone text,
    status public."UserStatus" DEFAULT 'INVITED'::public."UserStatus" NOT NULL,
    "passwordHash" text,
    "emailVerifiedAt" timestamp(6) with time zone,
    "lastLoginAt" timestamp(6) with time zone,
    "roleId" text NOT NULL,
    "createdAt" timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(6) with time zone NOT NULL
);


--
-- Name: _BlogPostToBlogTag; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."_BlogPostToBlogTag" (
    "A" text NOT NULL,
    "B" text NOT NULL
);


--
-- Name: _IndustryToProject; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."_IndustryToProject" (
    "A" text NOT NULL,
    "B" text NOT NULL
);


--
-- Name: _IndustryToService; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."_IndustryToService" (
    "A" text NOT NULL,
    "B" text NOT NULL
);


--
-- Name: _ProjectToService; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."_ProjectToService" (
    "A" text NOT NULL,
    "B" text NOT NULL
);


--
-- Name: _ProjectToTechnology; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."_ProjectToTechnology" (
    "A" text NOT NULL,
    "B" text NOT NULL
);


--
-- Name: _ServiceToTechnology; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."_ServiceToTechnology" (
    "A" text NOT NULL,
    "B" text NOT NULL
);


--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


--
-- Data for Name: account; Type: TABLE DATA; Schema: neon_auth; Owner: -
--



--
-- Data for Name: invitation; Type: TABLE DATA; Schema: neon_auth; Owner: -
--



--
-- Data for Name: jwks; Type: TABLE DATA; Schema: neon_auth; Owner: -
--



--
-- Data for Name: member; Type: TABLE DATA; Schema: neon_auth; Owner: -
--



--
-- Data for Name: organization; Type: TABLE DATA; Schema: neon_auth; Owner: -
--



--
-- Data for Name: project_config; Type: TABLE DATA; Schema: neon_auth; Owner: -
--



--
-- Data for Name: session; Type: TABLE DATA; Schema: neon_auth; Owner: -
--



--
-- Data for Name: user; Type: TABLE DATA; Schema: neon_auth; Owner: -
--



--
-- Data for Name: verification; Type: TABLE DATA; Schema: neon_auth; Owner: -
--



--
-- Data for Name: AuditLog; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: BlogCategory; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: BlogPost; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: BlogTag; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: CaseStudy; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: Contact; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: Conversation; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: ConversationQualification; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: Faq; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: Industry; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: Lead; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: LeadActivity; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: LeadNote; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: LeadSource; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: Media; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: Message; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: Notification; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: PipelineStage; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: Project; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: ProjectCategory; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: ProjectMedia; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: Role; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: Service; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: ServiceFeature; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: Task; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: Technology; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: Testimonial; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: _BlogPostToBlogTag; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: _IndustryToProject; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: _IndustryToService; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: _ProjectToService; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: _ProjectToTechnology; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: _ServiceToTechnology; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Name: account account_pkey; Type: CONSTRAINT; Schema: neon_auth; Owner: -
--

ALTER TABLE ONLY neon_auth.account
    ADD CONSTRAINT account_pkey PRIMARY KEY (id);


--
-- Name: invitation invitation_pkey; Type: CONSTRAINT; Schema: neon_auth; Owner: -
--

ALTER TABLE ONLY neon_auth.invitation
    ADD CONSTRAINT invitation_pkey PRIMARY KEY (id);


--
-- Name: jwks jwks_pkey; Type: CONSTRAINT; Schema: neon_auth; Owner: -
--

ALTER TABLE ONLY neon_auth.jwks
    ADD CONSTRAINT jwks_pkey PRIMARY KEY (id);


--
-- Name: member member_pkey; Type: CONSTRAINT; Schema: neon_auth; Owner: -
--

ALTER TABLE ONLY neon_auth.member
    ADD CONSTRAINT member_pkey PRIMARY KEY (id);


--
-- Name: organization organization_pkey; Type: CONSTRAINT; Schema: neon_auth; Owner: -
--

ALTER TABLE ONLY neon_auth.organization
    ADD CONSTRAINT organization_pkey PRIMARY KEY (id);


--
-- Name: organization organization_slug_key; Type: CONSTRAINT; Schema: neon_auth; Owner: -
--

ALTER TABLE ONLY neon_auth.organization
    ADD CONSTRAINT organization_slug_key UNIQUE (slug);


--
-- Name: project_config project_config_endpoint_id_key; Type: CONSTRAINT; Schema: neon_auth; Owner: -
--

ALTER TABLE ONLY neon_auth.project_config
    ADD CONSTRAINT project_config_endpoint_id_key UNIQUE (endpoint_id);


--
-- Name: project_config project_config_pkey; Type: CONSTRAINT; Schema: neon_auth; Owner: -
--

ALTER TABLE ONLY neon_auth.project_config
    ADD CONSTRAINT project_config_pkey PRIMARY KEY (id);


--
-- Name: session session_pkey; Type: CONSTRAINT; Schema: neon_auth; Owner: -
--

ALTER TABLE ONLY neon_auth.session
    ADD CONSTRAINT session_pkey PRIMARY KEY (id);


--
-- Name: session session_token_key; Type: CONSTRAINT; Schema: neon_auth; Owner: -
--

ALTER TABLE ONLY neon_auth.session
    ADD CONSTRAINT session_token_key UNIQUE (token);


--
-- Name: user user_email_key; Type: CONSTRAINT; Schema: neon_auth; Owner: -
--

ALTER TABLE ONLY neon_auth."user"
    ADD CONSTRAINT user_email_key UNIQUE (email);


--
-- Name: user user_pkey; Type: CONSTRAINT; Schema: neon_auth; Owner: -
--

ALTER TABLE ONLY neon_auth."user"
    ADD CONSTRAINT user_pkey PRIMARY KEY (id);


--
-- Name: verification verification_pkey; Type: CONSTRAINT; Schema: neon_auth; Owner: -
--

ALTER TABLE ONLY neon_auth.verification
    ADD CONSTRAINT verification_pkey PRIMARY KEY (id);


--
-- Name: AuditLog AuditLog_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AuditLog"
    ADD CONSTRAINT "AuditLog_pkey" PRIMARY KEY (id);


--
-- Name: BlogCategory BlogCategory_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."BlogCategory"
    ADD CONSTRAINT "BlogCategory_pkey" PRIMARY KEY (id);


--
-- Name: BlogPost BlogPost_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."BlogPost"
    ADD CONSTRAINT "BlogPost_pkey" PRIMARY KEY (id);


--
-- Name: BlogTag BlogTag_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."BlogTag"
    ADD CONSTRAINT "BlogTag_pkey" PRIMARY KEY (id);


--
-- Name: CaseStudy CaseStudy_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."CaseStudy"
    ADD CONSTRAINT "CaseStudy_pkey" PRIMARY KEY (id);


--
-- Name: Contact Contact_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Contact"
    ADD CONSTRAINT "Contact_pkey" PRIMARY KEY (id);


--
-- Name: ConversationQualification ConversationQualification_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ConversationQualification"
    ADD CONSTRAINT "ConversationQualification_pkey" PRIMARY KEY (id);


--
-- Name: Conversation Conversation_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Conversation"
    ADD CONSTRAINT "Conversation_pkey" PRIMARY KEY (id);


--
-- Name: Faq Faq_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Faq"
    ADD CONSTRAINT "Faq_pkey" PRIMARY KEY (id);


--
-- Name: Industry Industry_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Industry"
    ADD CONSTRAINT "Industry_pkey" PRIMARY KEY (id);


--
-- Name: LeadActivity LeadActivity_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."LeadActivity"
    ADD CONSTRAINT "LeadActivity_pkey" PRIMARY KEY (id);


--
-- Name: LeadNote LeadNote_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."LeadNote"
    ADD CONSTRAINT "LeadNote_pkey" PRIMARY KEY (id);


--
-- Name: LeadSource LeadSource_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."LeadSource"
    ADD CONSTRAINT "LeadSource_pkey" PRIMARY KEY (id);


--
-- Name: Lead Lead_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Lead"
    ADD CONSTRAINT "Lead_pkey" PRIMARY KEY (id);


--
-- Name: Media Media_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Media"
    ADD CONSTRAINT "Media_pkey" PRIMARY KEY (id);


--
-- Name: Message Message_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Message"
    ADD CONSTRAINT "Message_pkey" PRIMARY KEY (id);


--
-- Name: Notification Notification_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Notification"
    ADD CONSTRAINT "Notification_pkey" PRIMARY KEY (id);


--
-- Name: PipelineStage PipelineStage_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PipelineStage"
    ADD CONSTRAINT "PipelineStage_pkey" PRIMARY KEY (id);


--
-- Name: ProjectCategory ProjectCategory_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ProjectCategory"
    ADD CONSTRAINT "ProjectCategory_pkey" PRIMARY KEY (id);


--
-- Name: ProjectMedia ProjectMedia_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ProjectMedia"
    ADD CONSTRAINT "ProjectMedia_pkey" PRIMARY KEY (id);


--
-- Name: Project Project_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Project"
    ADD CONSTRAINT "Project_pkey" PRIMARY KEY (id);


--
-- Name: Role Role_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Role"
    ADD CONSTRAINT "Role_pkey" PRIMARY KEY (id);


--
-- Name: ServiceFeature ServiceFeature_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ServiceFeature"
    ADD CONSTRAINT "ServiceFeature_pkey" PRIMARY KEY (id);


--
-- Name: Service Service_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Service"
    ADD CONSTRAINT "Service_pkey" PRIMARY KEY (id);


--
-- Name: Task Task_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Task"
    ADD CONSTRAINT "Task_pkey" PRIMARY KEY (id);


--
-- Name: Technology Technology_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Technology"
    ADD CONSTRAINT "Technology_pkey" PRIMARY KEY (id);


--
-- Name: Testimonial Testimonial_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Testimonial"
    ADD CONSTRAINT "Testimonial_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: _BlogPostToBlogTag _BlogPostToBlogTag_AB_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."_BlogPostToBlogTag"
    ADD CONSTRAINT "_BlogPostToBlogTag_AB_pkey" PRIMARY KEY ("A", "B");


--
-- Name: _IndustryToProject _IndustryToProject_AB_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."_IndustryToProject"
    ADD CONSTRAINT "_IndustryToProject_AB_pkey" PRIMARY KEY ("A", "B");


--
-- Name: _IndustryToService _IndustryToService_AB_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."_IndustryToService"
    ADD CONSTRAINT "_IndustryToService_AB_pkey" PRIMARY KEY ("A", "B");


--
-- Name: _ProjectToService _ProjectToService_AB_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."_ProjectToService"
    ADD CONSTRAINT "_ProjectToService_AB_pkey" PRIMARY KEY ("A", "B");


--
-- Name: _ProjectToTechnology _ProjectToTechnology_AB_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."_ProjectToTechnology"
    ADD CONSTRAINT "_ProjectToTechnology_AB_pkey" PRIMARY KEY ("A", "B");


--
-- Name: _ServiceToTechnology _ServiceToTechnology_AB_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."_ServiceToTechnology"
    ADD CONSTRAINT "_ServiceToTechnology_AB_pkey" PRIMARY KEY ("A", "B");


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: account_userId_idx; Type: INDEX; Schema: neon_auth; Owner: -
--

CREATE INDEX "account_userId_idx" ON neon_auth.account USING btree ("userId");


--
-- Name: invitation_email_idx; Type: INDEX; Schema: neon_auth; Owner: -
--

CREATE INDEX invitation_email_idx ON neon_auth.invitation USING btree (email);


--
-- Name: invitation_organizationId_idx; Type: INDEX; Schema: neon_auth; Owner: -
--

CREATE INDEX "invitation_organizationId_idx" ON neon_auth.invitation USING btree ("organizationId");


--
-- Name: member_organizationId_idx; Type: INDEX; Schema: neon_auth; Owner: -
--

CREATE INDEX "member_organizationId_idx" ON neon_auth.member USING btree ("organizationId");


--
-- Name: member_userId_idx; Type: INDEX; Schema: neon_auth; Owner: -
--

CREATE INDEX "member_userId_idx" ON neon_auth.member USING btree ("userId");


--
-- Name: organization_slug_uidx; Type: INDEX; Schema: neon_auth; Owner: -
--

CREATE UNIQUE INDEX organization_slug_uidx ON neon_auth.organization USING btree (slug);


--
-- Name: session_userId_idx; Type: INDEX; Schema: neon_auth; Owner: -
--

CREATE INDEX "session_userId_idx" ON neon_auth.session USING btree ("userId");


--
-- Name: verification_identifier_idx; Type: INDEX; Schema: neon_auth; Owner: -
--

CREATE INDEX verification_identifier_idx ON neon_auth.verification USING btree (identifier);


--
-- Name: AuditLog_action_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "AuditLog_action_idx" ON public."AuditLog" USING btree (action);


--
-- Name: AuditLog_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "AuditLog_createdAt_idx" ON public."AuditLog" USING btree ("createdAt");


--
-- Name: AuditLog_entityType_entityId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "AuditLog_entityType_entityId_idx" ON public."AuditLog" USING btree ("entityType", "entityId");


--
-- Name: AuditLog_userId_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "AuditLog_userId_createdAt_idx" ON public."AuditLog" USING btree ("userId", "createdAt");


--
-- Name: BlogCategory_name_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "BlogCategory_name_key" ON public."BlogCategory" USING btree (name);


--
-- Name: BlogCategory_slug_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "BlogCategory_slug_key" ON public."BlogCategory" USING btree (slug);


--
-- Name: BlogPost_authorId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "BlogPost_authorId_idx" ON public."BlogPost" USING btree ("authorId");


--
-- Name: BlogPost_categoryId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "BlogPost_categoryId_idx" ON public."BlogPost" USING btree ("categoryId");


--
-- Name: BlogPost_coverMediaId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "BlogPost_coverMediaId_idx" ON public."BlogPost" USING btree ("coverMediaId");


--
-- Name: BlogPost_slug_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "BlogPost_slug_key" ON public."BlogPost" USING btree (slug);


--
-- Name: BlogPost_status_publishedAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "BlogPost_status_publishedAt_idx" ON public."BlogPost" USING btree (status, "publishedAt");


--
-- Name: BlogTag_name_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "BlogTag_name_key" ON public."BlogTag" USING btree (name);


--
-- Name: BlogTag_slug_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "BlogTag_slug_key" ON public."BlogTag" USING btree (slug);


--
-- Name: CaseStudy_projectId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "CaseStudy_projectId_key" ON public."CaseStudy" USING btree ("projectId");


--
-- Name: CaseStudy_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "CaseStudy_status_idx" ON public."CaseStudy" USING btree (status);


--
-- Name: Contact_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Contact_createdAt_idx" ON public."Contact" USING btree ("createdAt");


--
-- Name: Contact_email_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Contact_email_key" ON public."Contact" USING btree (email);


--
-- Name: Contact_phone_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Contact_phone_idx" ON public."Contact" USING btree (phone);


--
-- Name: ConversationQualification_conversationId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "ConversationQualification_conversationId_key" ON public."ConversationQualification" USING btree ("conversationId");


--
-- Name: ConversationQualification_industryId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ConversationQualification_industryId_idx" ON public."ConversationQualification" USING btree ("industryId");


--
-- Name: ConversationQualification_serviceId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ConversationQualification_serviceId_idx" ON public."ConversationQualification" USING btree ("serviceId");


--
-- Name: Conversation_leadId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Conversation_leadId_idx" ON public."Conversation" USING btree ("leadId");


--
-- Name: Conversation_sessionId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Conversation_sessionId_key" ON public."Conversation" USING btree ("sessionId");


--
-- Name: Conversation_startedAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Conversation_startedAt_idx" ON public."Conversation" USING btree ("startedAt");


--
-- Name: Conversation_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Conversation_status_idx" ON public."Conversation" USING btree (status);


--
-- Name: Faq_category_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Faq_category_idx" ON public."Faq" USING btree (category);


--
-- Name: Faq_status_order_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Faq_status_order_idx" ON public."Faq" USING btree (status, "order");


--
-- Name: Industry_isActive_order_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Industry_isActive_order_idx" ON public."Industry" USING btree ("isActive", "order");


--
-- Name: Industry_name_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Industry_name_key" ON public."Industry" USING btree (name);


--
-- Name: Industry_slug_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Industry_slug_key" ON public."Industry" USING btree (slug);


--
-- Name: LeadActivity_leadId_occurredAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "LeadActivity_leadId_occurredAt_idx" ON public."LeadActivity" USING btree ("leadId", "occurredAt");


--
-- Name: LeadActivity_type_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "LeadActivity_type_idx" ON public."LeadActivity" USING btree (type);


--
-- Name: LeadActivity_userId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "LeadActivity_userId_idx" ON public."LeadActivity" USING btree ("userId");


--
-- Name: LeadNote_authorId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "LeadNote_authorId_idx" ON public."LeadNote" USING btree ("authorId");


--
-- Name: LeadNote_leadId_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "LeadNote_leadId_createdAt_idx" ON public."LeadNote" USING btree ("leadId", "createdAt");


--
-- Name: LeadSource_isActive_order_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "LeadSource_isActive_order_idx" ON public."LeadSource" USING btree ("isActive", "order");


--
-- Name: LeadSource_name_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "LeadSource_name_key" ON public."LeadSource" USING btree (name);


--
-- Name: LeadSource_slug_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "LeadSource_slug_key" ON public."LeadSource" USING btree (slug);


--
-- Name: Lead_assignedUserId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Lead_assignedUserId_idx" ON public."Lead" USING btree ("assignedUserId");


--
-- Name: Lead_assignedUserId_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Lead_assignedUserId_status_idx" ON public."Lead" USING btree ("assignedUserId", status);


--
-- Name: Lead_contactId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Lead_contactId_idx" ON public."Lead" USING btree ("contactId");


--
-- Name: Lead_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Lead_createdAt_idx" ON public."Lead" USING btree ("createdAt");


--
-- Name: Lead_industryId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Lead_industryId_idx" ON public."Lead" USING btree ("industryId");


--
-- Name: Lead_pipelineStageId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Lead_pipelineStageId_idx" ON public."Lead" USING btree ("pipelineStageId");


--
-- Name: Lead_priority_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Lead_priority_idx" ON public."Lead" USING btree (priority);


--
-- Name: Lead_serviceId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Lead_serviceId_idx" ON public."Lead" USING btree ("serviceId");


--
-- Name: Lead_sourceId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Lead_sourceId_idx" ON public."Lead" USING btree ("sourceId");


--
-- Name: Lead_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Lead_status_idx" ON public."Lead" USING btree (status);


--
-- Name: Lead_status_pipelineStageId_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Lead_status_pipelineStageId_createdAt_idx" ON public."Lead" USING btree (status, "pipelineStageId", "createdAt");


--
-- Name: Media_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Media_createdAt_idx" ON public."Media" USING btree ("createdAt");


--
-- Name: Media_storageKey_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Media_storageKey_key" ON public."Media" USING btree ("storageKey");


--
-- Name: Media_type_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Media_type_idx" ON public."Media" USING btree (type);


--
-- Name: Media_uploadedById_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Media_uploadedById_idx" ON public."Media" USING btree ("uploadedById");


--
-- Name: Message_conversationId_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Message_conversationId_createdAt_idx" ON public."Message" USING btree ("conversationId", "createdAt");


--
-- Name: Notification_leadId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Notification_leadId_idx" ON public."Notification" USING btree ("leadId");


--
-- Name: Notification_status_channel_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Notification_status_channel_createdAt_idx" ON public."Notification" USING btree (status, channel, "createdAt");


--
-- Name: Notification_userId_readAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Notification_userId_readAt_idx" ON public."Notification" USING btree ("userId", "readAt");


--
-- Name: PipelineStage_isActive_order_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "PipelineStage_isActive_order_idx" ON public."PipelineStage" USING btree ("isActive", "order");


--
-- Name: PipelineStage_name_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "PipelineStage_name_key" ON public."PipelineStage" USING btree (name);


--
-- Name: PipelineStage_slug_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "PipelineStage_slug_key" ON public."PipelineStage" USING btree (slug);


--
-- Name: ProjectCategory_name_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "ProjectCategory_name_key" ON public."ProjectCategory" USING btree (name);


--
-- Name: ProjectCategory_slug_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "ProjectCategory_slug_key" ON public."ProjectCategory" USING btree (slug);


--
-- Name: ProjectMedia_mediaId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ProjectMedia_mediaId_idx" ON public."ProjectMedia" USING btree ("mediaId");


--
-- Name: ProjectMedia_projectId_mediaId_role_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "ProjectMedia_projectId_mediaId_role_key" ON public."ProjectMedia" USING btree ("projectId", "mediaId", role);


--
-- Name: ProjectMedia_projectId_order_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ProjectMedia_projectId_order_idx" ON public."ProjectMedia" USING btree ("projectId", "order");


--
-- Name: Project_categoryId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Project_categoryId_idx" ON public."Project" USING btree ("categoryId");


--
-- Name: Project_coverMediaId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Project_coverMediaId_idx" ON public."Project" USING btree ("coverMediaId");


--
-- Name: Project_publicationStatus_featured_order_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Project_publicationStatus_featured_order_idx" ON public."Project" USING btree ("publicationStatus", featured, "order");


--
-- Name: Project_publishedAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Project_publishedAt_idx" ON public."Project" USING btree ("publishedAt");


--
-- Name: Project_slug_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Project_slug_key" ON public."Project" USING btree (slug);


--
-- Name: Role_name_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Role_name_key" ON public."Role" USING btree (name);


--
-- Name: Role_slug_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Role_slug_key" ON public."Role" USING btree (slug);


--
-- Name: ServiceFeature_serviceId_order_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ServiceFeature_serviceId_order_idx" ON public."ServiceFeature" USING btree ("serviceId", "order");


--
-- Name: Service_coverMediaId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Service_coverMediaId_idx" ON public."Service" USING btree ("coverMediaId");


--
-- Name: Service_name_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Service_name_key" ON public."Service" USING btree (name);


--
-- Name: Service_publishedAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Service_publishedAt_idx" ON public."Service" USING btree ("publishedAt");


--
-- Name: Service_slug_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Service_slug_key" ON public."Service" USING btree (slug);


--
-- Name: Service_status_order_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Service_status_order_idx" ON public."Service" USING btree (status, "order");


--
-- Name: Task_assignedUserId_status_dueAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Task_assignedUserId_status_dueAt_idx" ON public."Task" USING btree ("assignedUserId", status, "dueAt");


--
-- Name: Task_createdById_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Task_createdById_idx" ON public."Task" USING btree ("createdById");


--
-- Name: Task_dueAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Task_dueAt_idx" ON public."Task" USING btree ("dueAt");


--
-- Name: Task_leadId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Task_leadId_idx" ON public."Task" USING btree ("leadId");


--
-- Name: Task_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Task_status_idx" ON public."Task" USING btree (status);


--
-- Name: Technology_category_order_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Technology_category_order_idx" ON public."Technology" USING btree (category, "order");


--
-- Name: Technology_isActive_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Technology_isActive_idx" ON public."Technology" USING btree ("isActive");


--
-- Name: Technology_name_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Technology_name_key" ON public."Technology" USING btree (name);


--
-- Name: Technology_slug_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Technology_slug_key" ON public."Technology" USING btree (slug);


--
-- Name: Testimonial_photoMediaId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Testimonial_photoMediaId_idx" ON public."Testimonial" USING btree ("photoMediaId");


--
-- Name: Testimonial_projectId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Testimonial_projectId_idx" ON public."Testimonial" USING btree ("projectId");


--
-- Name: Testimonial_status_order_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Testimonial_status_order_idx" ON public."Testimonial" USING btree (status, "order");


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: User_phone_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "User_phone_idx" ON public."User" USING btree (phone);


--
-- Name: User_roleId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "User_roleId_idx" ON public."User" USING btree ("roleId");


--
-- Name: User_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "User_status_idx" ON public."User" USING btree (status);


--
-- Name: _BlogPostToBlogTag_B_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "_BlogPostToBlogTag_B_index" ON public."_BlogPostToBlogTag" USING btree ("B");


--
-- Name: _IndustryToProject_B_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "_IndustryToProject_B_index" ON public."_IndustryToProject" USING btree ("B");


--
-- Name: _IndustryToService_B_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "_IndustryToService_B_index" ON public."_IndustryToService" USING btree ("B");


--
-- Name: _ProjectToService_B_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "_ProjectToService_B_index" ON public."_ProjectToService" USING btree ("B");


--
-- Name: _ProjectToTechnology_B_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "_ProjectToTechnology_B_index" ON public."_ProjectToTechnology" USING btree ("B");


--
-- Name: _ServiceToTechnology_B_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "_ServiceToTechnology_B_index" ON public."_ServiceToTechnology" USING btree ("B");


--
-- Name: account account_userId_fkey; Type: FK CONSTRAINT; Schema: neon_auth; Owner: -
--

ALTER TABLE ONLY neon_auth.account
    ADD CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES neon_auth."user"(id) ON DELETE CASCADE;


--
-- Name: invitation invitation_inviterId_fkey; Type: FK CONSTRAINT; Schema: neon_auth; Owner: -
--

ALTER TABLE ONLY neon_auth.invitation
    ADD CONSTRAINT "invitation_inviterId_fkey" FOREIGN KEY ("inviterId") REFERENCES neon_auth."user"(id) ON DELETE CASCADE;


--
-- Name: invitation invitation_organizationId_fkey; Type: FK CONSTRAINT; Schema: neon_auth; Owner: -
--

ALTER TABLE ONLY neon_auth.invitation
    ADD CONSTRAINT "invitation_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES neon_auth.organization(id) ON DELETE CASCADE;


--
-- Name: member member_organizationId_fkey; Type: FK CONSTRAINT; Schema: neon_auth; Owner: -
--

ALTER TABLE ONLY neon_auth.member
    ADD CONSTRAINT "member_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES neon_auth.organization(id) ON DELETE CASCADE;


--
-- Name: member member_userId_fkey; Type: FK CONSTRAINT; Schema: neon_auth; Owner: -
--

ALTER TABLE ONLY neon_auth.member
    ADD CONSTRAINT "member_userId_fkey" FOREIGN KEY ("userId") REFERENCES neon_auth."user"(id) ON DELETE CASCADE;


--
-- Name: session session_userId_fkey; Type: FK CONSTRAINT; Schema: neon_auth; Owner: -
--

ALTER TABLE ONLY neon_auth.session
    ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES neon_auth."user"(id) ON DELETE CASCADE;


--
-- Name: AuditLog AuditLog_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AuditLog"
    ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: BlogPost BlogPost_authorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."BlogPost"
    ADD CONSTRAINT "BlogPost_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: BlogPost BlogPost_categoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."BlogPost"
    ADD CONSTRAINT "BlogPost_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES public."BlogCategory"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: BlogPost BlogPost_coverMediaId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."BlogPost"
    ADD CONSTRAINT "BlogPost_coverMediaId_fkey" FOREIGN KEY ("coverMediaId") REFERENCES public."Media"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: CaseStudy CaseStudy_projectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."CaseStudy"
    ADD CONSTRAINT "CaseStudy_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES public."Project"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ConversationQualification ConversationQualification_conversationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ConversationQualification"
    ADD CONSTRAINT "ConversationQualification_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES public."Conversation"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ConversationQualification ConversationQualification_industryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ConversationQualification"
    ADD CONSTRAINT "ConversationQualification_industryId_fkey" FOREIGN KEY ("industryId") REFERENCES public."Industry"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: ConversationQualification ConversationQualification_serviceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ConversationQualification"
    ADD CONSTRAINT "ConversationQualification_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES public."Service"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Conversation Conversation_leadId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Conversation"
    ADD CONSTRAINT "Conversation_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES public."Lead"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: LeadActivity LeadActivity_leadId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."LeadActivity"
    ADD CONSTRAINT "LeadActivity_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES public."Lead"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: LeadActivity LeadActivity_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."LeadActivity"
    ADD CONSTRAINT "LeadActivity_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: LeadNote LeadNote_authorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."LeadNote"
    ADD CONSTRAINT "LeadNote_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: LeadNote LeadNote_leadId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."LeadNote"
    ADD CONSTRAINT "LeadNote_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES public."Lead"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Lead Lead_assignedUserId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Lead"
    ADD CONSTRAINT "Lead_assignedUserId_fkey" FOREIGN KEY ("assignedUserId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Lead Lead_contactId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Lead"
    ADD CONSTRAINT "Lead_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES public."Contact"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Lead Lead_industryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Lead"
    ADD CONSTRAINT "Lead_industryId_fkey" FOREIGN KEY ("industryId") REFERENCES public."Industry"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Lead Lead_pipelineStageId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Lead"
    ADD CONSTRAINT "Lead_pipelineStageId_fkey" FOREIGN KEY ("pipelineStageId") REFERENCES public."PipelineStage"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Lead Lead_serviceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Lead"
    ADD CONSTRAINT "Lead_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES public."Service"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Lead Lead_sourceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Lead"
    ADD CONSTRAINT "Lead_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES public."LeadSource"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Media Media_uploadedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Media"
    ADD CONSTRAINT "Media_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Message Message_conversationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Message"
    ADD CONSTRAINT "Message_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES public."Conversation"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Notification Notification_leadId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Notification"
    ADD CONSTRAINT "Notification_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES public."Lead"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Notification Notification_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Notification"
    ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: ProjectMedia ProjectMedia_mediaId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ProjectMedia"
    ADD CONSTRAINT "ProjectMedia_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES public."Media"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ProjectMedia ProjectMedia_projectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ProjectMedia"
    ADD CONSTRAINT "ProjectMedia_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES public."Project"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Project Project_categoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Project"
    ADD CONSTRAINT "Project_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES public."ProjectCategory"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Project Project_coverMediaId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Project"
    ADD CONSTRAINT "Project_coverMediaId_fkey" FOREIGN KEY ("coverMediaId") REFERENCES public."Media"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: ServiceFeature ServiceFeature_serviceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ServiceFeature"
    ADD CONSTRAINT "ServiceFeature_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES public."Service"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Service Service_coverMediaId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Service"
    ADD CONSTRAINT "Service_coverMediaId_fkey" FOREIGN KEY ("coverMediaId") REFERENCES public."Media"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Task Task_assignedUserId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Task"
    ADD CONSTRAINT "Task_assignedUserId_fkey" FOREIGN KEY ("assignedUserId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Task Task_createdById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Task"
    ADD CONSTRAINT "Task_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Task Task_leadId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Task"
    ADD CONSTRAINT "Task_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES public."Lead"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Testimonial Testimonial_photoMediaId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Testimonial"
    ADD CONSTRAINT "Testimonial_photoMediaId_fkey" FOREIGN KEY ("photoMediaId") REFERENCES public."Media"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Testimonial Testimonial_projectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Testimonial"
    ADD CONSTRAINT "Testimonial_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES public."Project"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: User User_roleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES public."Role"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: _BlogPostToBlogTag _BlogPostToBlogTag_A_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."_BlogPostToBlogTag"
    ADD CONSTRAINT "_BlogPostToBlogTag_A_fkey" FOREIGN KEY ("A") REFERENCES public."BlogPost"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: _BlogPostToBlogTag _BlogPostToBlogTag_B_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."_BlogPostToBlogTag"
    ADD CONSTRAINT "_BlogPostToBlogTag_B_fkey" FOREIGN KEY ("B") REFERENCES public."BlogTag"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: _IndustryToProject _IndustryToProject_A_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."_IndustryToProject"
    ADD CONSTRAINT "_IndustryToProject_A_fkey" FOREIGN KEY ("A") REFERENCES public."Industry"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: _IndustryToProject _IndustryToProject_B_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."_IndustryToProject"
    ADD CONSTRAINT "_IndustryToProject_B_fkey" FOREIGN KEY ("B") REFERENCES public."Project"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: _IndustryToService _IndustryToService_A_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."_IndustryToService"
    ADD CONSTRAINT "_IndustryToService_A_fkey" FOREIGN KEY ("A") REFERENCES public."Industry"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: _IndustryToService _IndustryToService_B_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."_IndustryToService"
    ADD CONSTRAINT "_IndustryToService_B_fkey" FOREIGN KEY ("B") REFERENCES public."Service"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: _ProjectToService _ProjectToService_A_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."_ProjectToService"
    ADD CONSTRAINT "_ProjectToService_A_fkey" FOREIGN KEY ("A") REFERENCES public."Project"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: _ProjectToService _ProjectToService_B_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."_ProjectToService"
    ADD CONSTRAINT "_ProjectToService_B_fkey" FOREIGN KEY ("B") REFERENCES public."Service"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: _ProjectToTechnology _ProjectToTechnology_A_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."_ProjectToTechnology"
    ADD CONSTRAINT "_ProjectToTechnology_A_fkey" FOREIGN KEY ("A") REFERENCES public."Project"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: _ProjectToTechnology _ProjectToTechnology_B_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."_ProjectToTechnology"
    ADD CONSTRAINT "_ProjectToTechnology_B_fkey" FOREIGN KEY ("B") REFERENCES public."Technology"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: _ServiceToTechnology _ServiceToTechnology_A_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."_ServiceToTechnology"
    ADD CONSTRAINT "_ServiceToTechnology_A_fkey" FOREIGN KEY ("A") REFERENCES public."Service"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: _ServiceToTechnology _ServiceToTechnology_B_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."_ServiceToTechnology"
    ADD CONSTRAINT "_ServiceToTechnology_B_fkey" FOREIGN KEY ("B") REFERENCES public."Technology"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict JwS5De8fjLuokcK0t57llFYeI6lGNbnIGRzBNlhdmdvOOdFEEs56VumTSivxwHw

