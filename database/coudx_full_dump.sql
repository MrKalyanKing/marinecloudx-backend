--
-- PostgreSQL database dump
--

\restrict ypyZTAUMcXNYxVX5wXqNU4ihNA2UcWtsymijhzB0YenwQNn6bv3bsGDRSDcXhsz

-- Dumped from database version 18.4
-- Dumped by pg_dump version 18.4

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

ALTER TABLE IF EXISTS ONLY public."_ServiceToTechnology" DROP CONSTRAINT IF EXISTS "_ServiceToTechnology_B_fkey";
ALTER TABLE IF EXISTS ONLY public."_ServiceToTechnology" DROP CONSTRAINT IF EXISTS "_ServiceToTechnology_A_fkey";
ALTER TABLE IF EXISTS ONLY public."_ProjectToTechnology" DROP CONSTRAINT IF EXISTS "_ProjectToTechnology_B_fkey";
ALTER TABLE IF EXISTS ONLY public."_ProjectToTechnology" DROP CONSTRAINT IF EXISTS "_ProjectToTechnology_A_fkey";
ALTER TABLE IF EXISTS ONLY public."_ProjectToService" DROP CONSTRAINT IF EXISTS "_ProjectToService_B_fkey";
ALTER TABLE IF EXISTS ONLY public."_ProjectToService" DROP CONSTRAINT IF EXISTS "_ProjectToService_A_fkey";
ALTER TABLE IF EXISTS ONLY public."_IndustryToService" DROP CONSTRAINT IF EXISTS "_IndustryToService_B_fkey";
ALTER TABLE IF EXISTS ONLY public."_IndustryToService" DROP CONSTRAINT IF EXISTS "_IndustryToService_A_fkey";
ALTER TABLE IF EXISTS ONLY public."_IndustryToProject" DROP CONSTRAINT IF EXISTS "_IndustryToProject_B_fkey";
ALTER TABLE IF EXISTS ONLY public."_IndustryToProject" DROP CONSTRAINT IF EXISTS "_IndustryToProject_A_fkey";
ALTER TABLE IF EXISTS ONLY public."_BlogPostToBlogTag" DROP CONSTRAINT IF EXISTS "_BlogPostToBlogTag_B_fkey";
ALTER TABLE IF EXISTS ONLY public."_BlogPostToBlogTag" DROP CONSTRAINT IF EXISTS "_BlogPostToBlogTag_A_fkey";
ALTER TABLE IF EXISTS ONLY public."User" DROP CONSTRAINT IF EXISTS "User_roleId_fkey";
ALTER TABLE IF EXISTS ONLY public."Testimonial" DROP CONSTRAINT IF EXISTS "Testimonial_projectId_fkey";
ALTER TABLE IF EXISTS ONLY public."Testimonial" DROP CONSTRAINT IF EXISTS "Testimonial_photoMediaId_fkey";
ALTER TABLE IF EXISTS ONLY public."Task" DROP CONSTRAINT IF EXISTS "Task_leadId_fkey";
ALTER TABLE IF EXISTS ONLY public."Task" DROP CONSTRAINT IF EXISTS "Task_createdById_fkey";
ALTER TABLE IF EXISTS ONLY public."Task" DROP CONSTRAINT IF EXISTS "Task_assignedUserId_fkey";
ALTER TABLE IF EXISTS ONLY public."Service" DROP CONSTRAINT IF EXISTS "Service_coverMediaId_fkey";
ALTER TABLE IF EXISTS ONLY public."ServiceFeature" DROP CONSTRAINT IF EXISTS "ServiceFeature_serviceId_fkey";
ALTER TABLE IF EXISTS ONLY public."Project" DROP CONSTRAINT IF EXISTS "Project_coverMediaId_fkey";
ALTER TABLE IF EXISTS ONLY public."Project" DROP CONSTRAINT IF EXISTS "Project_categoryId_fkey";
ALTER TABLE IF EXISTS ONLY public."ProjectMedia" DROP CONSTRAINT IF EXISTS "ProjectMedia_projectId_fkey";
ALTER TABLE IF EXISTS ONLY public."ProjectMedia" DROP CONSTRAINT IF EXISTS "ProjectMedia_mediaId_fkey";
ALTER TABLE IF EXISTS ONLY public."Notification" DROP CONSTRAINT IF EXISTS "Notification_userId_fkey";
ALTER TABLE IF EXISTS ONLY public."Notification" DROP CONSTRAINT IF EXISTS "Notification_leadId_fkey";
ALTER TABLE IF EXISTS ONLY public."Message" DROP CONSTRAINT IF EXISTS "Message_conversationId_fkey";
ALTER TABLE IF EXISTS ONLY public."Media" DROP CONSTRAINT IF EXISTS "Media_uploadedById_fkey";
ALTER TABLE IF EXISTS ONLY public."Lead" DROP CONSTRAINT IF EXISTS "Lead_sourceId_fkey";
ALTER TABLE IF EXISTS ONLY public."Lead" DROP CONSTRAINT IF EXISTS "Lead_serviceId_fkey";
ALTER TABLE IF EXISTS ONLY public."Lead" DROP CONSTRAINT IF EXISTS "Lead_pipelineStageId_fkey";
ALTER TABLE IF EXISTS ONLY public."Lead" DROP CONSTRAINT IF EXISTS "Lead_industryId_fkey";
ALTER TABLE IF EXISTS ONLY public."Lead" DROP CONSTRAINT IF EXISTS "Lead_contactId_fkey";
ALTER TABLE IF EXISTS ONLY public."Lead" DROP CONSTRAINT IF EXISTS "Lead_assignedUserId_fkey";
ALTER TABLE IF EXISTS ONLY public."LeadNote" DROP CONSTRAINT IF EXISTS "LeadNote_leadId_fkey";
ALTER TABLE IF EXISTS ONLY public."LeadNote" DROP CONSTRAINT IF EXISTS "LeadNote_authorId_fkey";
ALTER TABLE IF EXISTS ONLY public."LeadActivity" DROP CONSTRAINT IF EXISTS "LeadActivity_userId_fkey";
ALTER TABLE IF EXISTS ONLY public."LeadActivity" DROP CONSTRAINT IF EXISTS "LeadActivity_leadId_fkey";
ALTER TABLE IF EXISTS ONLY public."Conversation" DROP CONSTRAINT IF EXISTS "Conversation_leadId_fkey";
ALTER TABLE IF EXISTS ONLY public."ConversationQualification" DROP CONSTRAINT IF EXISTS "ConversationQualification_serviceId_fkey";
ALTER TABLE IF EXISTS ONLY public."ConversationQualification" DROP CONSTRAINT IF EXISTS "ConversationQualification_industryId_fkey";
ALTER TABLE IF EXISTS ONLY public."ConversationQualification" DROP CONSTRAINT IF EXISTS "ConversationQualification_conversationId_fkey";
ALTER TABLE IF EXISTS ONLY public."CaseStudy" DROP CONSTRAINT IF EXISTS "CaseStudy_projectId_fkey";
ALTER TABLE IF EXISTS ONLY public."BlogPost" DROP CONSTRAINT IF EXISTS "BlogPost_coverMediaId_fkey";
ALTER TABLE IF EXISTS ONLY public."BlogPost" DROP CONSTRAINT IF EXISTS "BlogPost_categoryId_fkey";
ALTER TABLE IF EXISTS ONLY public."BlogPost" DROP CONSTRAINT IF EXISTS "BlogPost_authorId_fkey";
ALTER TABLE IF EXISTS ONLY public."AuditLog" DROP CONSTRAINT IF EXISTS "AuditLog_userId_fkey";
ALTER TABLE IF EXISTS ONLY neon_auth.session DROP CONSTRAINT IF EXISTS "session_userId_fkey";
ALTER TABLE IF EXISTS ONLY neon_auth.member DROP CONSTRAINT IF EXISTS "member_userId_fkey";
ALTER TABLE IF EXISTS ONLY neon_auth.member DROP CONSTRAINT IF EXISTS "member_organizationId_fkey";
ALTER TABLE IF EXISTS ONLY neon_auth.invitation DROP CONSTRAINT IF EXISTS "invitation_organizationId_fkey";
ALTER TABLE IF EXISTS ONLY neon_auth.invitation DROP CONSTRAINT IF EXISTS "invitation_inviterId_fkey";
ALTER TABLE IF EXISTS ONLY neon_auth.account DROP CONSTRAINT IF EXISTS "account_userId_fkey";
DROP INDEX IF EXISTS public."_ServiceToTechnology_B_index";
DROP INDEX IF EXISTS public."_ProjectToTechnology_B_index";
DROP INDEX IF EXISTS public."_ProjectToService_B_index";
DROP INDEX IF EXISTS public."_IndustryToService_B_index";
DROP INDEX IF EXISTS public."_IndustryToProject_B_index";
DROP INDEX IF EXISTS public."_BlogPostToBlogTag_B_index";
DROP INDEX IF EXISTS public."User_status_idx";
DROP INDEX IF EXISTS public."User_roleId_idx";
DROP INDEX IF EXISTS public."User_phone_idx";
DROP INDEX IF EXISTS public."User_email_key";
DROP INDEX IF EXISTS public."Testimonial_status_order_idx";
DROP INDEX IF EXISTS public."Testimonial_projectId_idx";
DROP INDEX IF EXISTS public."Testimonial_photoMediaId_idx";
DROP INDEX IF EXISTS public."Technology_slug_key";
DROP INDEX IF EXISTS public."Technology_name_key";
DROP INDEX IF EXISTS public."Technology_isActive_idx";
DROP INDEX IF EXISTS public."Technology_category_order_idx";
DROP INDEX IF EXISTS public."Task_status_idx";
DROP INDEX IF EXISTS public."Task_leadId_idx";
DROP INDEX IF EXISTS public."Task_dueAt_idx";
DROP INDEX IF EXISTS public."Task_createdById_idx";
DROP INDEX IF EXISTS public."Task_assignedUserId_status_dueAt_idx";
DROP INDEX IF EXISTS public."Service_status_order_idx";
DROP INDEX IF EXISTS public."Service_slug_key";
DROP INDEX IF EXISTS public."Service_publishedAt_idx";
DROP INDEX IF EXISTS public."Service_name_key";
DROP INDEX IF EXISTS public."Service_coverMediaId_idx";
DROP INDEX IF EXISTS public."ServiceFeature_serviceId_order_idx";
DROP INDEX IF EXISTS public."Role_slug_key";
DROP INDEX IF EXISTS public."Role_name_key";
DROP INDEX IF EXISTS public."Project_slug_key";
DROP INDEX IF EXISTS public."Project_publishedAt_idx";
DROP INDEX IF EXISTS public."Project_publicationStatus_featured_order_idx";
DROP INDEX IF EXISTS public."Project_coverMediaId_idx";
DROP INDEX IF EXISTS public."Project_categoryId_idx";
DROP INDEX IF EXISTS public."ProjectMedia_projectId_order_idx";
DROP INDEX IF EXISTS public."ProjectMedia_projectId_mediaId_role_key";
DROP INDEX IF EXISTS public."ProjectMedia_mediaId_idx";
DROP INDEX IF EXISTS public."ProjectCategory_slug_key";
DROP INDEX IF EXISTS public."ProjectCategory_name_key";
DROP INDEX IF EXISTS public."PipelineStage_slug_key";
DROP INDEX IF EXISTS public."PipelineStage_name_key";
DROP INDEX IF EXISTS public."PipelineStage_isActive_order_idx";
DROP INDEX IF EXISTS public."Notification_userId_readAt_idx";
DROP INDEX IF EXISTS public."Notification_status_channel_createdAt_idx";
DROP INDEX IF EXISTS public."Notification_leadId_idx";
DROP INDEX IF EXISTS public."Message_conversationId_createdAt_idx";
DROP INDEX IF EXISTS public."Media_uploadedById_idx";
DROP INDEX IF EXISTS public."Media_type_idx";
DROP INDEX IF EXISTS public."Media_storageKey_key";
DROP INDEX IF EXISTS public."Media_createdAt_idx";
DROP INDEX IF EXISTS public."Lead_status_pipelineStageId_createdAt_idx";
DROP INDEX IF EXISTS public."Lead_status_idx";
DROP INDEX IF EXISTS public."Lead_sourceId_idx";
DROP INDEX IF EXISTS public."Lead_serviceId_idx";
DROP INDEX IF EXISTS public."Lead_priority_idx";
DROP INDEX IF EXISTS public."Lead_pipelineStageId_idx";
DROP INDEX IF EXISTS public."Lead_industryId_idx";
DROP INDEX IF EXISTS public."Lead_createdAt_idx";
DROP INDEX IF EXISTS public."Lead_contactId_idx";
DROP INDEX IF EXISTS public."Lead_assignedUserId_status_idx";
DROP INDEX IF EXISTS public."Lead_assignedUserId_idx";
DROP INDEX IF EXISTS public."LeadSource_slug_key";
DROP INDEX IF EXISTS public."LeadSource_name_key";
DROP INDEX IF EXISTS public."LeadSource_isActive_order_idx";
DROP INDEX IF EXISTS public."LeadNote_leadId_createdAt_idx";
DROP INDEX IF EXISTS public."LeadNote_authorId_idx";
DROP INDEX IF EXISTS public."LeadActivity_userId_idx";
DROP INDEX IF EXISTS public."LeadActivity_type_idx";
DROP INDEX IF EXISTS public."LeadActivity_leadId_occurredAt_idx";
DROP INDEX IF EXISTS public."Industry_slug_key";
DROP INDEX IF EXISTS public."Industry_name_key";
DROP INDEX IF EXISTS public."Industry_isActive_order_idx";
DROP INDEX IF EXISTS public."Faq_status_order_idx";
DROP INDEX IF EXISTS public."Faq_category_idx";
DROP INDEX IF EXISTS public."Conversation_status_idx";
DROP INDEX IF EXISTS public."Conversation_startedAt_idx";
DROP INDEX IF EXISTS public."Conversation_sessionId_key";
DROP INDEX IF EXISTS public."Conversation_leadId_idx";
DROP INDEX IF EXISTS public."ConversationQualification_serviceId_idx";
DROP INDEX IF EXISTS public."ConversationQualification_industryId_idx";
DROP INDEX IF EXISTS public."ConversationQualification_conversationId_key";
DROP INDEX IF EXISTS public."Contact_phone_idx";
DROP INDEX IF EXISTS public."Contact_email_key";
DROP INDEX IF EXISTS public."Contact_createdAt_idx";
DROP INDEX IF EXISTS public."CaseStudy_status_idx";
DROP INDEX IF EXISTS public."CaseStudy_projectId_key";
DROP INDEX IF EXISTS public."BlogTag_slug_key";
DROP INDEX IF EXISTS public."BlogTag_name_key";
DROP INDEX IF EXISTS public."BlogPost_status_publishedAt_idx";
DROP INDEX IF EXISTS public."BlogPost_slug_key";
DROP INDEX IF EXISTS public."BlogPost_coverMediaId_idx";
DROP INDEX IF EXISTS public."BlogPost_categoryId_idx";
DROP INDEX IF EXISTS public."BlogPost_authorId_idx";
DROP INDEX IF EXISTS public."BlogCategory_slug_key";
DROP INDEX IF EXISTS public."BlogCategory_name_key";
DROP INDEX IF EXISTS public."AuditLog_userId_createdAt_idx";
DROP INDEX IF EXISTS public."AuditLog_entityType_entityId_idx";
DROP INDEX IF EXISTS public."AuditLog_createdAt_idx";
DROP INDEX IF EXISTS public."AuditLog_action_idx";
DROP INDEX IF EXISTS neon_auth.verification_identifier_idx;
DROP INDEX IF EXISTS neon_auth."session_userId_idx";
DROP INDEX IF EXISTS neon_auth.organization_slug_uidx;
DROP INDEX IF EXISTS neon_auth."member_userId_idx";
DROP INDEX IF EXISTS neon_auth."member_organizationId_idx";
DROP INDEX IF EXISTS neon_auth."invitation_organizationId_idx";
DROP INDEX IF EXISTS neon_auth.invitation_email_idx;
DROP INDEX IF EXISTS neon_auth."account_userId_idx";
ALTER TABLE IF EXISTS ONLY public._prisma_migrations DROP CONSTRAINT IF EXISTS _prisma_migrations_pkey;
ALTER TABLE IF EXISTS ONLY public."_ServiceToTechnology" DROP CONSTRAINT IF EXISTS "_ServiceToTechnology_AB_pkey";
ALTER TABLE IF EXISTS ONLY public."_ProjectToTechnology" DROP CONSTRAINT IF EXISTS "_ProjectToTechnology_AB_pkey";
ALTER TABLE IF EXISTS ONLY public."_ProjectToService" DROP CONSTRAINT IF EXISTS "_ProjectToService_AB_pkey";
ALTER TABLE IF EXISTS ONLY public."_IndustryToService" DROP CONSTRAINT IF EXISTS "_IndustryToService_AB_pkey";
ALTER TABLE IF EXISTS ONLY public."_IndustryToProject" DROP CONSTRAINT IF EXISTS "_IndustryToProject_AB_pkey";
ALTER TABLE IF EXISTS ONLY public."_BlogPostToBlogTag" DROP CONSTRAINT IF EXISTS "_BlogPostToBlogTag_AB_pkey";
ALTER TABLE IF EXISTS ONLY public."User" DROP CONSTRAINT IF EXISTS "User_pkey";
ALTER TABLE IF EXISTS ONLY public."Testimonial" DROP CONSTRAINT IF EXISTS "Testimonial_pkey";
ALTER TABLE IF EXISTS ONLY public."Technology" DROP CONSTRAINT IF EXISTS "Technology_pkey";
ALTER TABLE IF EXISTS ONLY public."Task" DROP CONSTRAINT IF EXISTS "Task_pkey";
ALTER TABLE IF EXISTS ONLY public."Service" DROP CONSTRAINT IF EXISTS "Service_pkey";
ALTER TABLE IF EXISTS ONLY public."ServiceFeature" DROP CONSTRAINT IF EXISTS "ServiceFeature_pkey";
ALTER TABLE IF EXISTS ONLY public."Role" DROP CONSTRAINT IF EXISTS "Role_pkey";
ALTER TABLE IF EXISTS ONLY public."Project" DROP CONSTRAINT IF EXISTS "Project_pkey";
ALTER TABLE IF EXISTS ONLY public."ProjectMedia" DROP CONSTRAINT IF EXISTS "ProjectMedia_pkey";
ALTER TABLE IF EXISTS ONLY public."ProjectCategory" DROP CONSTRAINT IF EXISTS "ProjectCategory_pkey";
ALTER TABLE IF EXISTS ONLY public."PipelineStage" DROP CONSTRAINT IF EXISTS "PipelineStage_pkey";
ALTER TABLE IF EXISTS ONLY public._migrations DROP CONSTRAINT IF EXISTS "PK_52c0aa36ad15cc87e5bab334659";
ALTER TABLE IF EXISTS ONLY public."Notification" DROP CONSTRAINT IF EXISTS "Notification_pkey";
ALTER TABLE IF EXISTS ONLY public."Message" DROP CONSTRAINT IF EXISTS "Message_pkey";
ALTER TABLE IF EXISTS ONLY public."Media" DROP CONSTRAINT IF EXISTS "Media_pkey";
ALTER TABLE IF EXISTS ONLY public."Lead" DROP CONSTRAINT IF EXISTS "Lead_pkey";
ALTER TABLE IF EXISTS ONLY public."LeadSource" DROP CONSTRAINT IF EXISTS "LeadSource_pkey";
ALTER TABLE IF EXISTS ONLY public."LeadNote" DROP CONSTRAINT IF EXISTS "LeadNote_pkey";
ALTER TABLE IF EXISTS ONLY public."LeadActivity" DROP CONSTRAINT IF EXISTS "LeadActivity_pkey";
ALTER TABLE IF EXISTS ONLY public."Industry" DROP CONSTRAINT IF EXISTS "Industry_pkey";
ALTER TABLE IF EXISTS ONLY public."Faq" DROP CONSTRAINT IF EXISTS "Faq_pkey";
ALTER TABLE IF EXISTS ONLY public."Conversation" DROP CONSTRAINT IF EXISTS "Conversation_pkey";
ALTER TABLE IF EXISTS ONLY public."ConversationQualification" DROP CONSTRAINT IF EXISTS "ConversationQualification_pkey";
ALTER TABLE IF EXISTS ONLY public."Contact" DROP CONSTRAINT IF EXISTS "Contact_pkey";
ALTER TABLE IF EXISTS ONLY public."CaseStudy" DROP CONSTRAINT IF EXISTS "CaseStudy_pkey";
ALTER TABLE IF EXISTS ONLY public."BlogTag" DROP CONSTRAINT IF EXISTS "BlogTag_pkey";
ALTER TABLE IF EXISTS ONLY public."BlogPost" DROP CONSTRAINT IF EXISTS "BlogPost_pkey";
ALTER TABLE IF EXISTS ONLY public."BlogCategory" DROP CONSTRAINT IF EXISTS "BlogCategory_pkey";
ALTER TABLE IF EXISTS ONLY public."AuditLog" DROP CONSTRAINT IF EXISTS "AuditLog_pkey";
ALTER TABLE IF EXISTS ONLY neon_auth.verification DROP CONSTRAINT IF EXISTS verification_pkey;
ALTER TABLE IF EXISTS ONLY neon_auth."user" DROP CONSTRAINT IF EXISTS user_pkey;
ALTER TABLE IF EXISTS ONLY neon_auth."user" DROP CONSTRAINT IF EXISTS user_email_key;
ALTER TABLE IF EXISTS ONLY neon_auth.session DROP CONSTRAINT IF EXISTS session_token_key;
ALTER TABLE IF EXISTS ONLY neon_auth.session DROP CONSTRAINT IF EXISTS session_pkey;
ALTER TABLE IF EXISTS ONLY neon_auth.project_config DROP CONSTRAINT IF EXISTS project_config_pkey;
ALTER TABLE IF EXISTS ONLY neon_auth.project_config DROP CONSTRAINT IF EXISTS project_config_endpoint_id_key;
ALTER TABLE IF EXISTS ONLY neon_auth.organization DROP CONSTRAINT IF EXISTS organization_slug_key;
ALTER TABLE IF EXISTS ONLY neon_auth.organization DROP CONSTRAINT IF EXISTS organization_pkey;
ALTER TABLE IF EXISTS ONLY neon_auth.member DROP CONSTRAINT IF EXISTS member_pkey;
ALTER TABLE IF EXISTS ONLY neon_auth.jwks DROP CONSTRAINT IF EXISTS jwks_pkey;
ALTER TABLE IF EXISTS ONLY neon_auth.invitation DROP CONSTRAINT IF EXISTS invitation_pkey;
ALTER TABLE IF EXISTS ONLY neon_auth.account DROP CONSTRAINT IF EXISTS account_pkey;
ALTER TABLE IF EXISTS public._migrations ALTER COLUMN id DROP DEFAULT;
DROP TABLE IF EXISTS public._prisma_migrations;
DROP SEQUENCE IF EXISTS public._migrations_id_seq;
DROP TABLE IF EXISTS public._migrations;
DROP TABLE IF EXISTS public."_ServiceToTechnology";
DROP TABLE IF EXISTS public."_ProjectToTechnology";
DROP TABLE IF EXISTS public."_ProjectToService";
DROP TABLE IF EXISTS public."_IndustryToService";
DROP TABLE IF EXISTS public."_IndustryToProject";
DROP TABLE IF EXISTS public."_BlogPostToBlogTag";
DROP TABLE IF EXISTS public."User";
DROP TABLE IF EXISTS public."Testimonial";
DROP TABLE IF EXISTS public."Technology";
DROP TABLE IF EXISTS public."Task";
DROP TABLE IF EXISTS public."ServiceFeature";
DROP TABLE IF EXISTS public."Service";
DROP TABLE IF EXISTS public."Role";
DROP TABLE IF EXISTS public."ProjectMedia";
DROP TABLE IF EXISTS public."ProjectCategory";
DROP TABLE IF EXISTS public."Project";
DROP TABLE IF EXISTS public."PipelineStage";
DROP TABLE IF EXISTS public."Notification";
DROP TABLE IF EXISTS public."Message";
DROP TABLE IF EXISTS public."Media";
DROP TABLE IF EXISTS public."LeadSource";
DROP TABLE IF EXISTS public."LeadNote";
DROP TABLE IF EXISTS public."LeadActivity";
DROP TABLE IF EXISTS public."Lead";
DROP TABLE IF EXISTS public."Industry";
DROP TABLE IF EXISTS public."Faq";
DROP TABLE IF EXISTS public."ConversationQualification";
DROP TABLE IF EXISTS public."Conversation";
DROP TABLE IF EXISTS public."Contact";
DROP TABLE IF EXISTS public."CaseStudy";
DROP TABLE IF EXISTS public."BlogTag";
DROP TABLE IF EXISTS public."BlogPost";
DROP TABLE IF EXISTS public."BlogCategory";
DROP TABLE IF EXISTS public."AuditLog";
DROP TABLE IF EXISTS neon_auth.verification;
DROP TABLE IF EXISTS neon_auth."user";
DROP TABLE IF EXISTS neon_auth.session;
DROP TABLE IF EXISTS neon_auth.project_config;
DROP TABLE IF EXISTS neon_auth.organization;
DROP TABLE IF EXISTS neon_auth.member;
DROP TABLE IF EXISTS neon_auth.jwks;
DROP TABLE IF EXISTS neon_auth.invitation;
DROP TABLE IF EXISTS neon_auth.account;
DROP TYPE IF EXISTS public."UserStatus";
DROP TYPE IF EXISTS public."TechnologyCategory";
DROP TYPE IF EXISTS public."TaskStatus";
DROP TYPE IF EXISTS public."PublicationStatus";
DROP TYPE IF EXISTS public."ProjectStatus";
DROP TYPE IF EXISTS public."ProjectMediaRole";
DROP TYPE IF EXISTS public."Priority";
DROP TYPE IF EXISTS public."NotificationStatus";
DROP TYPE IF EXISTS public."NotificationChannel";
DROP TYPE IF EXISTS public."MessageRole";
DROP TYPE IF EXISTS public."MediaType";
DROP TYPE IF EXISTS public."LeadStatus";
DROP TYPE IF EXISTS public."ConversationStatus";
DROP TYPE IF EXISTS public."ActivityType";
DROP SCHEMA IF EXISTS neon_auth;
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
-- Name: _migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public._migrations (
    id integer NOT NULL,
    "timestamp" bigint NOT NULL,
    name character varying NOT NULL
);


--
-- Name: _migrations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public._migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: _migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public._migrations_id_seq OWNED BY public._migrations.id;


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
-- Name: _migrations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public._migrations ALTER COLUMN id SET DEFAULT nextval('public._migrations_id_seq'::regclass);


--
-- Data for Name: account; Type: TABLE DATA; Schema: neon_auth; Owner: -
--

COPY neon_auth.account (id, "accountId", "providerId", "userId", "accessToken", "refreshToken", "idToken", "accessTokenExpiresAt", "refreshTokenExpiresAt", scope, password, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: invitation; Type: TABLE DATA; Schema: neon_auth; Owner: -
--

COPY neon_auth.invitation (id, "organizationId", email, role, status, "expiresAt", "createdAt", "inviterId") FROM stdin;
\.


--
-- Data for Name: jwks; Type: TABLE DATA; Schema: neon_auth; Owner: -
--

COPY neon_auth.jwks (id, "publicKey", "privateKey", "createdAt", "expiresAt") FROM stdin;
\.


--
-- Data for Name: member; Type: TABLE DATA; Schema: neon_auth; Owner: -
--

COPY neon_auth.member (id, "organizationId", "userId", role, "createdAt") FROM stdin;
\.


--
-- Data for Name: organization; Type: TABLE DATA; Schema: neon_auth; Owner: -
--

COPY neon_auth.organization (id, name, slug, logo, "createdAt", metadata) FROM stdin;
\.


--
-- Data for Name: project_config; Type: TABLE DATA; Schema: neon_auth; Owner: -
--

COPY neon_auth.project_config (id, name, endpoint_id, created_at, updated_at, trusted_origins, social_providers, email_provider, email_and_password, allow_localhost, plugin_configs, webhook_config) FROM stdin;
\.


--
-- Data for Name: session; Type: TABLE DATA; Schema: neon_auth; Owner: -
--

COPY neon_auth.session (id, "expiresAt", token, "createdAt", "updatedAt", "ipAddress", "userAgent", "userId", "impersonatedBy", "activeOrganizationId") FROM stdin;
\.


--
-- Data for Name: user; Type: TABLE DATA; Schema: neon_auth; Owner: -
--

COPY neon_auth."user" (id, name, email, "emailVerified", image, "createdAt", "updatedAt", role, banned, "banReason", "banExpires") FROM stdin;
\.


--
-- Data for Name: verification; Type: TABLE DATA; Schema: neon_auth; Owner: -
--

COPY neon_auth.verification (id, identifier, value, "expiresAt", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: AuditLog; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."AuditLog" (id, "userId", action, "entityType", "entityId", metadata, "ipAddress", "userAgent", "createdAt") FROM stdin;
01a072db-3ea4-7757-bfbd-e678906abf64	01a0620d-18d3-7402-97c6-e064a80b34e6	cms.industries.created	industries	01a072db-3e9a-731e-9737-0d78143aad1c	\N	\N	\N	2026-09-06 00:06:06.166004+05:30
01a09a05-2665-745a-ab59-9939f6411767	01a0620d-18d3-7402-97c6-e064a80b34e6	cms.industries.updated	industries	01a072db-3e9a-731e-9737-0d78143aad1c	\N	\N	\N	2026-09-13 14:37:03.848865+05:30
01a09a05-3590-7396-80ee-4a06ade57647	01a0620d-18d3-7402-97c6-e064a80b34e6	cms.industries.updated	industries	01a072db-3e9a-731e-9737-0d78143aad1c	\N	\N	\N	2026-09-13 14:37:07.782074+05:30
01a09a05-382c-73e1-9486-6dd2085db268	01a0620d-18d3-7402-97c6-e064a80b34e6	cms.industries.updated	industries	01a072db-3e9a-731e-9737-0d78143aad1c	\N	\N	\N	2026-09-13 14:37:08.456105+05:30
01a09a05-3a53-7437-9f3e-2770f21aacd6	01a0620d-18d3-7402-97c6-e064a80b34e6	cms.industries.updated	industries	01a072db-3e9a-731e-9737-0d78143aad1c	\N	\N	\N	2026-09-13 14:37:09.010286+05:30
01a09a05-3c25-73c0-a4c1-fe4d859b9094	01a0620d-18d3-7402-97c6-e064a80b34e6	cms.industries.updated	industries	01a072db-3e9a-731e-9737-0d78143aad1c	\N	\N	\N	2026-09-13 14:37:09.47428+05:30
01a09a05-3ce5-73a6-be09-757cb716c575	01a0620d-18d3-7402-97c6-e064a80b34e6	cms.industries.updated	industries	01a072db-3e9a-731e-9737-0d78143aad1c	\N	\N	\N	2026-09-13 14:37:09.667122+05:30
01a09a05-3da8-71eb-9da5-6ad37991e039	01a0620d-18d3-7402-97c6-e064a80b34e6	cms.industries.updated	industries	01a072db-3e9a-731e-9737-0d78143aad1c	\N	\N	\N	2026-09-13 14:37:09.86181+05:30
01a09a05-3e78-7674-ac72-cea9523cc5a8	01a0620d-18d3-7402-97c6-e064a80b34e6	cms.industries.updated	industries	01a072db-3e9a-731e-9737-0d78143aad1c	\N	\N	\N	2026-09-13 14:37:10.063164+05:30
01a09a05-3f27-7534-b5cd-9ddf9bc2ce81	01a0620d-18d3-7402-97c6-e064a80b34e6	cms.industries.updated	industries	01a072db-3e9a-731e-9737-0d78143aad1c	\N	\N	\N	2026-09-13 14:37:10.245394+05:30
01a09a05-3fdc-7673-b2f9-23685bffa262	01a0620d-18d3-7402-97c6-e064a80b34e6	cms.industries.updated	industries	01a072db-3e9a-731e-9737-0d78143aad1c	\N	\N	\N	2026-09-13 14:37:10.426478+05:30
01a09a05-4099-7368-aca6-bd36b52162a9	01a0620d-18d3-7402-97c6-e064a80b34e6	cms.industries.updated	industries	01a072db-3e9a-731e-9737-0d78143aad1c	\N	\N	\N	2026-09-13 14:37:10.615204+05:30
01a09a05-415b-74c6-9f08-227744a72d62	01a0620d-18d3-7402-97c6-e064a80b34e6	cms.industries.updated	industries	01a072db-3e9a-731e-9737-0d78143aad1c	\N	\N	\N	2026-09-13 14:37:10.807595+05:30
01a09a05-4225-7428-9dbc-14878b4cc963	01a0620d-18d3-7402-97c6-e064a80b34e6	cms.industries.updated	industries	01a072db-3e9a-731e-9737-0d78143aad1c	\N	\N	\N	2026-09-13 14:37:11.007306+05:30
01a09a05-92bc-762c-ba8f-7e058476e134	01a0620d-18d3-7402-97c6-e064a80b34e6	cms.project-categories.created	project-categories	01a09a05-92b5-777d-a107-5510158dc555	\N	\N	\N	2026-09-13 14:37:31.636396+05:30
\.


--
-- Data for Name: BlogCategory; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."BlogCategory" (id, name, slug, description, "order", "createdAt", "updatedAt") FROM stdin;
5d7bc85f-1352-4023-b541-4638697710ca	Architecture & Strategy	architecture-strategy	Insights on technical planning, discovery methodology, and enterprise software architecture.	1	2026-09-13 14:41:03.715426+05:30	2026-09-13 14:41:03.715426+05:30
9e7b62db-9a28-4816-8f34-77a49b2b87d8	Product Design	product-design	Deep dives into UX engineering, operational density, and scalable design systems.	2	2026-09-13 14:41:03.757956+05:30	2026-09-13 14:41:03.757956+05:30
049c888e-7c45-4314-9293-7230d0d92332	Frontend Engineering	frontend-engineering	Sub-second web performance, modern Next.js frameworks, and reactive client architecture.	3	2026-09-13 14:41:03.759551+05:30	2026-09-13 14:41:03.759551+05:30
82260cc4-d60f-4fd3-bb01-d37fc4caa3bc	Full-Stack Development	full-stack-development	Building scalable custom applications, secure backend services, and relational architectures.	4	2026-09-13 14:41:03.762124+05:30	2026-09-13 14:41:03.762124+05:30
de9f674e-df9a-4ca1-be78-8fe91d8877be	Cloud & DevOps	cloud-devops	Infrastructure as code, containerization with Docker, and automated release pipelines.	5	2026-09-13 14:41:03.763439+05:30	2026-09-13 14:41:03.763439+05:30
d439828a-7ca1-403e-a68d-8fd2228aa941	AI & Intelligent Systems	ai-intelligent-systems	Applied artificial intelligence, LLM orchestration, and low-latency automated workflows.	6	2026-09-13 14:41:03.764519+05:30	2026-09-13 14:41:03.764519+05:30
a864e3e0-ebb5-42bf-9577-c299f4bb8636	Data & Systems	data-systems	Event-driven integrations, API contract design, and resilient third-party data synchronization.	7	2026-09-13 14:41:03.765522+05:30	2026-09-13 14:41:03.765522+05:30
1f1dd912-c29f-47dd-a376-263ce8e365fb	Continuous Engineering	continuous-engineering	Proactive telemetry, runtime observability, automated testing, and ongoing codebase evolution.	8	2026-09-13 14:41:03.766539+05:30	2026-09-13 14:41:03.766539+05:30
\.


--
-- Data for Name: BlogPost; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."BlogPost" (id, title, slug, excerpt, content, "authorId", "categoryId", "coverMediaId", status, "publishedAt", "seoTitle", "seoDescription", "createdAt", "updatedAt") FROM stdin;
e48da80d-675d-4d82-be51-574aef3b6e84	Architecting for the Real World: Why Software Initiatives Fail at Discovery, Not Delivery	architecting-real-world-software-discovery-vs-delivery	Why the most catastrophic software failures stem from misunderstood business workflows rather than engineering execution, and how structured discovery bridges the divide.	Most software failures do not happen in the IDE. They happen weeks before the first repository is initialized, inside conference rooms and slide decks where assumptions are mistaken for technical requirements.\n\nWhen an engineering team builds the wrong architecture brilliantly, the outcome is still a failed product. A microservices topology cannot save an unvalidated business process. A distributed database cannot compensate for conflicting domain models. The fundamental discipline of software development is not writing code as quickly as possible — it is ensuring every line of code addresses an operational reality.\n\nThe Anatomy of Discovery\nAt MarineCloudX, our Strategy & Discovery capability is designed to de-risk investments before technical execution begins. We treat discovery as an investigative engineering phase, not a speculative marketing exercise.\n\n1. Operational Workflow Mapping\nEvery business operates on implicit knowledge — undocumented workarounds, manual spreadsheets, and ad-hoc communication channels that keep operations moving. When migrating to custom software, failing to identify these hidden workflows creates resistance and system rejection. We shadow operational teams, interview multi-role stakeholders, and map every data handoff to document actual business constraints.\n\n2. Defining Strict Data Boundaries\nSoftware fragmentation occurs when entity boundaries are poorly defined. Is a customer record shared across admissions, billing, and support? Who owns the state transitions? By formalizing domain-driven entity boundaries early, we prevent relational integrity corruption and avoid monolithic schema sprawl.\n\n3. Technical Feasibility & Constraint Scoping\nNot every problem requires a custom distributed system. We evaluate existing infrastructure, regulatory compliance demands (such as data residency and role-based privacy), and integration latency tolerances. This yields a deterministic technical blueprint rather than an open-ended wish list.\n\nThe Deliverable: A Decision Matrix, Not a Wish List\nThe output of structured discovery is a Technical Architecture Blueprint and Staged Milestone Roadmap. This documents exact API contracts, schema structures, third-party dependencies, and an incremental delivery schedule. By confronting architectural trade-offs upfront, engineering teams build with velocity and clarity, ensuring capital is invested where it produces measurable operational leverage.	01a0620d-18d3-7402-97c6-e064a80b34e6	5d7bc85f-1352-4023-b541-4638697710ca	6a61b0ef-9111-418c-a8e4-61ae504cc6f8	PUBLISHED	2026-09-05 14:41:03.802+05:30	Architecting for the Real World: Technical Discovery vs Delivery	An in-depth guide on why software projects fail at discovery, and how disciplined requirements engineering prevents costly technical debt.	2026-09-13 14:41:03.809305+05:30	2026-09-13 14:41:03.809305+05:30
d1acee9e-b936-4f75-bcc5-711fb7e719fc	Designing for Operational Density: UX Principles for High-Stakes Business Systems	designing-for-operational-density-high-stakes-ux	Consumer design paradigms collapse in dense operational environments. Here is how we engineer task-centered UX and design systems that scale across enterprise workflows.	A common mistake in enterprise software design is treating complex operational tools like consumer lifestyle applications. Oversized hero cards, excessive whitespace, and hidden navigation patterns look clean in portfolio mockups, but they cripple daily operators who process hundreds of complex records every hour.\n\nIn high-stakes business environments — whether hospital management, school admissions, or manufacturing logistics — interface efficiency is directly tied to business throughput and error reduction.\n\nThe Principles of Operational Density\n\n1. Information Hierarchy Over Emptiness\nOperators do not want endless scrolling; they need relevant contextual data accessible within single-click workflows. Dense interfaces must balance scanning speed with visual calm. We achieve this through typographic precision, micro-contrast hairlines, and structured tabular views with inline action triggers.\n\n2. Predictable State and Ergonomic Feedback\nEvery interactive element must provide instant visual confirmation. When an administrator approves an inquiry, updates a ledger, or triggers a batch notification, ambiguity leads to duplicated submissions or panic. We enforce strict state conventions: loading skeletons that preserve scroll position, non-disruptive optimistic updates, and persistent status indicators.\n\n3. Tokenized Design Systems for Rapid Scale\nBuilding custom software without a unified design system guarantees UI fragmentation within six months. At MarineCloudX, we architect modular design token libraries across spacing, color luminances, type scales, and interaction states. Developers consume reusable, battle-tested UI components that ensure consistency across hundreds of views.\n\nValidation Through Interactive Prototyping\nStatic mockups hide edge cases. A design that looks pristine with 4-letter names breaks catastrophically when populated with 45-character strings, missing profile images, and edge-case pagination. We prototype real data flows early, validating keyboard navigation and workflow speed with actual users before backend integration starts.	01a0620d-18d3-7402-97c6-e064a80b34e6	9e7b62db-9a28-4816-8f34-77a49b2b87d8	1468eff6-ad01-4b04-827d-395fb902b305	PUBLISHED	2026-09-06 14:41:03.816+05:30	Designing for Operational Density: Enterprise UX & Design Systems	Explore task-centered UX principles, information hierarchy, and scalable design token architecture engineered for dense operational workflows.	2026-09-13 14:41:03.819097+05:30	2026-09-13 14:41:03.819097+05:30
4ccbb6db-b6f5-4267-897d-c5d742393892	Zero-Jank Web Engineering: Sub-Second Latency, Modern Next.js, and Core Web Vitals	zero-jank-web-engineering-nextjs-core-web-vitals	Building web platforms that feel native: achieving sub-second first contentful paint, eliminating layout shifts, and caching strategies that keep pages instant.	Modern web visitors expect instant responses. When a page stutters, shifts during load, or takes three seconds to display its primary heading, potential clients abandon the journey. Speed is not a cosmetic feature — it directly dictates search engine authority, user conversion, and brand credibility.\n\nEngineering a truly high-performance web platform requires eliminating the common anti-patterns that bloat modern JavaScript applications.\n\nThe Core Foundations of Sub-Second Web Performance\n\n1. Server-First Architecture with Next.js App Router\nClient-side rendering (CSR) forces the user's device to download megabytes of JavaScript before anything legible renders on screen. By leveraging React Server Components (RSC) within Next.js, we render semantic HTML on the server edge. The client receives pristine, pre-computed markup instantly, while interactive client bundles are deferred and code-split.\n\n2. Eliminating Cumulative Layout Shift (CLS)\nNothing degrades perceived quality faster than buttons jumping under a user's cursor as images or fonts load. We eliminate layout shift by enforcing strict aspect ratios on media containers, using font fallback metric overrides, and provisioning static layout scaffolding for dynamic feeds.\n\n3. GPU-Accelerated Visuals and Zero-Overhead Animation\nComplex ambient backgrounds, dynamic ribbons, and canvas effects often introduce severe frame drops when implemented naively. In MarineCloudX platforms, background visualizations are isolated onto dedicated composited layers or WebGL instances. By removing DOM mutations from the 60fps render loop, animations remain buttery smooth without degrading main-thread responsiveness.\n\n4. Intelligent Cache Invalidation via Webhooks\nA fast site that serves stale data is broken; a site that recalculates every request from scratch is sluggish. We utilize tagged fetch caching backed by instant revalidation webhooks. When an editor publishes an update in the admin CMS, an automated webhook purges the specific route cache across CDN edge nodes in milliseconds, delivering both instant performance and real-time freshness.	01a0620d-18d3-7402-97c6-e064a80b34e6	049c888e-7c45-4314-9293-7230d0d92332	621f738d-5ae7-4194-8103-535ed30d35a2	PUBLISHED	2026-09-07 14:41:03.822+05:30	Zero-Jank Web Engineering: Next.js Performance & Core Web Vitals	Learn how we engineer sub-second web experiences with Next.js App Router, asset optimization, and zero layout shift architectures.	2026-09-13 14:41:03.824683+05:30	2026-09-13 14:41:03.824683+05:30
f711d47f-edbd-4e81-afa1-fdc3f635e3b8	Engineering Resilient Enterprise Portals: Relational Integrity, RBAC, and Clean Architecture	engineering-resilient-enterprise-portals-rbac-relational-data	How we structure custom web applications and business portals with strict relational schemas, role-based authorization, and decoupled system boundaries.	When building core operational portals — whether customer self-service portals, administrative hubs, or multi-tenant SaaS platforms — engineering decisions made in the first month echo for years. Shortcuts in data integrity or ad-hoc authorization models inevitably culminate in security vulnerabilities and costly rewrites.\n\nAt MarineCloudX, our custom application development capability treats predictability, transactional safety, and clean decoupling as non-negotiable requirements.\n\nArchitectural Tenets for Mission-Critical Portals\n\n1. Relational Integrity Over Document Store Chaos\nWhile NoSQL databases offer tempting schema-free velocity during week one, business operations are fundamentally relational. Invoices link to clients, permissions map to roles, and status changes require audit trails. We anchor our enterprise applications in PostgreSQL, utilizing foreign key constraints, transactional isolation levels, and partial indexes to ensure that invalid business states can never exist in the database.\n\n2. Defense-in-Depth Authorization (RBAC)\nApplication security cannot rely on hidden frontend buttons. We implement multi-layered Role-Based Access Control (RBAC) where every API endpoint and database query validates identity, tenant boundaries, and specific permissions. Cryptographically signed, HTTP-only session cookies prevent token theft while protecting against Cross-Site Scripting (XSS) and CSRF attacks.\n\n3. Modular Decoupling and Clean Contracts\nTightly coupling frontend UI components directly to raw database columns creates brittle systems. We build clean RESTful and contract-driven API surfaces using TypeScript. Shared contract definitions guarantee that breaking changes are caught at compile time before code ever reaches a production deployment.\n\n4. Real-Time Operational Telemetry\nAdministrative dashboards are only valuable if they represent live reality. We design dashboard services with optimized aggregation queries, indexing strategies, and event hooks that stream critical updates without exhausting database connection pools.	01a0620d-18d3-7402-97c6-e064a80b34e6	82260cc4-d60f-4fd3-bb01-d37fc4caa3bc	3f8eaf33-ebcc-4f3f-ba76-003f6eb6b6b3	PUBLISHED	2026-09-08 14:41:03.827+05:30	Engineering Resilient Enterprise Portals: Relational Data & RBAC	A technical guide to building secure custom business portals, PostgreSQL relational integrity, and robust role-based access control.	2026-09-13 14:41:03.830249+05:30	2026-09-13 14:41:03.830249+05:30
4bd78ab1-8442-4393-910e-eee1998a23b3	Infrastructure as Discipline: Reproducible Containers, Automated CI/CD, and Production Reliability	infrastructure-as-discipline-containers-cicd-production-reliability	Eliminating 'works on my machine' forever. A practical blueprint for zero-downtime containerized deployments, automated CI/CD checks, and production hardening.	The days of manually copying files to a server via FTP or executing unrecorded terminal commands in production are long gone. In modern engineering, infrastructure is software. If an environment cannot be torn down and rebuilt identically from declarative scripts within minutes, it is not production-ready.\n\nOur Cloud & Infrastructure practice focuses on stability, automation, and deterministic release cycles.\n\nThe Pillars of Cloud Engineering Discipline\n\n1. Standardized Multi-Stage Containerization\nWe containerize services using Docker multi-stage builds. Development dependencies, linters, and compilers are stripped from final runtime images, drastically reducing attack surfaces and container footprints. The resulting lightweight image runs identically on an engineer's laptop, a staging server, and a production Kubernetes cluster.\n\n2. Automated CI/CD Verification Gates\nNo code reaches production without surviving an automated gauntlet. Every pull request triggers a continuous integration pipeline that runs static type checking, unit and integration suites, security dependency audits, and linting standards. Builds that fail any gate are rejected automatically, safeguarding production stability.\n\n3. Zero-Downtime Deployment Strategies\nDeploying new code should never require taking systems offline. Through rolling container updates, health check probes, and reverse proxy connection draining, newly spawned instances must pass health checks before receiving production traffic. If an error is detected post-deployment, automated rollbacks revert to the previous verified build in seconds.\n\n4. Infrastructure Security & TLS Hardening\nFrom automated Let's Encrypt TLS renewal and strict Content Security Policies (CSP) to rate-limiting and DDoS mitigation, security is built into the network topology. Secrets are injected via encrypted environment stores rather than checked into repositories, ensuring complete compliance with international data standards.	01a0620d-18d3-7402-97c6-e064a80b34e6	de9f674e-df9a-4ca1-be78-8fe91d8877be	5f05e285-2ef4-493d-bcd1-4abae18fc0b1	PUBLISHED	2026-09-09 14:41:03.834+05:30	Infrastructure as Discipline: Docker, CI/CD & Production Reliability	Best practices for containerized cloud architecture, automated CI/CD deployment pipelines, and zero-downtime production reliability.	2026-09-13 14:41:03.836416+05:30	2026-09-13 14:41:03.836416+05:30
a3b4c3c6-d3cf-405a-beee-bcea4178c05a	Practical AI in Enterprise Systems: Moving Beyond Toys to Resilient LLM Pipelines	practical-ai-enterprise-systems-resilient-llm-pipelines	How to integrate foundation models into real-world business workflows with streaming responses, automated validation, and provider-agnostic failover.	Generative AI has created immense excitement, but also a surplus of fragile prototypes. In a corporate environment, a chat interface that hallucinates financial figures or times out during high concurrency is worse than useless — it is a liability.\n\nMoving artificial intelligence from an interesting novelty to an enterprise asset requires rigorous software engineering around non-deterministic model outputs.\n\nHow We Engineer Production-Grade AI Systems\n\n1. Provider-Agnostic Integration Gateways\nLocking an entire product into a single proprietary AI model leaves the business vulnerable to rate-limiting, sudden API deprecations, or pricing shifts. We architect abstracted AI gateways that interface with leading foundation models (OpenAI, Anthropic, Gemini, or open-weight models). If one provider encounters elevated latency, requests automatically failover to secondary endpoints without disrupting end users.\n\n2. Low-Latency Response Streaming\nWaiting 15 seconds for a complete model generation destroys user trust. We build reactive user experiences powered by Server-Sent Events (SSE) and WebSockets, streaming tokens directly into the client interface with sub-500ms Time-to-First-Token (TTFT). Users read responses naturally as they generate, maintaining conversational engagement.\n\n3. Schema Enforcement and Structured JSON Outputs\nFree-form text generation is difficult to integrate into relational databases. We enforce strict schema validation on model outputs using structured function calling and runtime validation libraries (such as Zod). When extracting customer requirements or categorizing support tickets, the model must return strictly typed JSON that passes automated validation before touching database records.\n\n4. Guardrails, Auditing, and Data Privacy\nEnterprise data must remain confidential. We configure zero-retention API agreements and implement automated sanitization filters that scrub Personally Identifiable Information (PII) before model ingestion. Every automated decision is logged with token consumption metrics, latency benchmarks, and full auditability.	01a0620d-18d3-7402-97c6-e064a80b34e6	d439828a-7ca1-403e-a68d-8fd2228aa941	fd08997b-bff4-455f-9b7a-f4d09d62c90f	PUBLISHED	2026-09-10 14:41:03.839+05:30	Practical AI in Enterprise Systems: Resilient LLM Pipelines	How MarineCloudX engineers production AI: streaming LLM responses, schema-enforced JSON validation, and automated operational workflows.	2026-09-13 14:41:03.841879+05:30	2026-09-13 14:41:03.841879+05:30
84841fdf-17d2-470f-b3f0-ec95dad1fc4d	Event-Driven System Integration: Handling Webhooks, Retries, and Third-Party API Fragility	event-driven-system-integration-webhooks-resilient-apis	Third-party APIs will fail, rate-limit, and timeout. Here is how we architect asynchronous queues, idempotent webhook handlers, and verified data sync.	Modern business operations depend on an ecosystem of specialized external tools: payment gateways (Stripe, Razorpay), CRM platforms (HubSpot, Salesforce), shipping APIs, and ERP systems. However, relying on external services introduces distributed systems complexity: third-party servers go down, network sockets drop, and rate limits are hit without warning.\n\nIf your application relies on synchronous HTTP calls in the main request cycle, your system's uptime will never exceed the uptime of your least reliable integration.\n\nArchitecting for Resilient Interoperability\n\n1. Asynchronous Event Queuing\nWhen an external event occurs — such as an incoming payment or customer onboarding trigger — the primary application must never perform heavy external API synchronization during the active user request. Instead, we persist incoming payloads immediately to an internal event log, acknowledge receipt within 50ms, and offload processing to background worker queues.\n\n2. Idempotent Webhook Processing\nNetwork instability means third-party platforms will inevitably retry webhooks multiple times. If your webhook handler is not idempotent, a network retry can charge a customer twice or issue duplicate inventory orders. We implement deterministic idempotency keys and state checks, guaranteeing that an event processed ten times produces the exact same outcome as an event processed once.\n\n3. Exponential Backoff and Dead-Letter Queues\nWhen communicating with external APIs, transient network failures must be met with exponential backoff and jitter. If an external service is completely unresponsive after predetermined retry attempts, failed events are quarantined into a Dead-Letter Queue (DLQ). Engineering teams receive instant alerts with complete execution payloads, allowing one-click replay once the external vendor recovers.\n\n4. Reconciled Data Synchronization\nData drift between disparate systems is inevitable over time. We engineer automated reconciliation cron jobs that audit record states across internal databases and external platforms nightly, identifying and repairing discrepancies before business stakeholders notice.	01a0620d-18d3-7402-97c6-e064a80b34e6	a864e3e0-ebb5-42bf-9577-c299f4bb8636	34999dba-720c-409f-8849-00605e2df344	PUBLISHED	2026-09-11 14:41:03.843+05:30	Event-Driven System Integration: Webhooks & Resilient APIs	Architecting reliable system integrations: handling webhooks idempotently, managing distributed retries, and preventing data corruption.	2026-09-13 14:41:03.845911+05:30	2026-09-13 14:41:03.845911+05:30
26a2d041-729a-404f-b2f6-90cc3dfe3679	Beyond Day One: Continuous Observability, Proactive Telemetry, and Codebase Evolution	beyond-day-one-continuous-observability-codebase-evolution	Shipping v1.0 is only the starting line. Why proactive telemetry, automated error logging, and planned refactoring preserve long-term software health.	A pervasive myth in technology procurement is that software is a 'project' with a defined finish line. You design it, build it, launch it, and walk away. In reality, software is a living asset. The operating environment constantly shifts: browsers update, cloud platforms deprecate runtimes, security attack vectors evolve, and business models adapt.\n\nSoftware that is not continuously engineered begins accumulating technical debt the moment it launches, steadily degrading in speed, stability, and security until a painful rewrite becomes unavoidable.\n\nThe Discipline of Continuous Engineering\n\n1. Proactive Telemetry Over User Complaint Monitoring\nIf a customer has to email your support desk to inform you that your checkout page threw a 500 error, your observability has failed. We instrument applications with real-time error tracking (Sentry) and infrastructure telemetry. Unhandled exceptions, abnormal database query durations, and memory leak warnings trigger automated developer alerts within seconds of occurrence, allowing fixes before widespread user impact.\n\n2. Dependency Auditing and Security Patching\nOpen-source frameworks and libraries undergo continuous security scrutiny. Known vulnerabilities (CVEs) are published daily. Through automated dependency scans and scheduled engineering review cycles, we keep frameworks, runtime dependencies, and cryptographic packages up to date, eliminating security attack surfaces proactively.\n\n3. Performance Budgets and Continuous Optimization\nAs databases expand from 10,000 rows to 10 million rows, queries that took 5 milliseconds during launch can degrade into multi-second table scans. We monitor database slow query logs and API latency percentiles (p95, p99), proactively tuning database indexes, query shapes, and caching tiers before traffic spikes expose bottlenecks.\n\n4. Structured Evolution and Technical Alignment\nContinuous engineering is not just fixing bugs; it is aligning software capabilities with expanding business ambitions. Through structured sprint cycles, we work alongside our partners to iteratively release new features, refine existing user journeys, and scale infrastructure in lockstep with business growth.	01a0620d-18d3-7402-97c6-e064a80b34e6	1f1dd912-c29f-47dd-a376-263ce8e365fb	db0fce42-f6e5-4c69-9d2a-6cb5536794da	PUBLISHED	2026-09-12 14:41:03.848+05:30	Beyond Day One: Continuous Observability & Codebase Evolution	Discover how continuous engineering, real-time telemetry, error tracking, and disciplined codebase maintenance protect your software investment.	2026-09-13 14:41:03.850878+05:30	2026-09-13 14:41:03.850878+05:30
\.


--
-- Data for Name: BlogTag; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."BlogTag" (id, name, slug, "createdAt", "updatedAt") FROM stdin;
9b1d0fd8-5662-4d05-a349-8b5abb190b94	Strategy	strategy	2026-09-13 14:41:03.76984+05:30	2026-09-13 14:41:03.76984+05:30
d7677427-ec62-40c2-8b3c-6bd20cbf2c43	System Architecture	system-architecture	2026-09-13 14:41:03.771698+05:30	2026-09-13 14:41:03.771698+05:30
09bea620-3e94-4008-9798-1f2281fbb832	Discovery	discovery	2026-09-13 14:41:03.772836+05:30	2026-09-13 14:41:03.772836+05:30
f100da23-c2d8-4081-ae5b-ed8489899d1b	Product Engineering	product-engineering	2026-09-13 14:41:03.773796+05:30	2026-09-13 14:41:03.773796+05:30
89fb8a42-eecf-469d-ab96-1a0f6c585cd9	UX Design	ux-design	2026-09-13 14:41:03.774749+05:30	2026-09-13 14:41:03.774749+05:30
8703ea5b-847a-4360-931d-152b1d4f16dc	Design Systems	design-systems	2026-09-13 14:41:03.775807+05:30	2026-09-13 14:41:03.775807+05:30
84c8d7c3-063c-4520-87b1-3aa9a703fce3	Prototyping	prototyping	2026-09-13 14:41:03.776915+05:30	2026-09-13 14:41:03.776915+05:30
1acd2c7d-a649-43ef-b38d-7a2478b8b701	Information Architecture	information-architecture	2026-09-13 14:41:03.777925+05:30	2026-09-13 14:41:03.777925+05:30
996fb355-7477-47b4-bfcb-f20319fcf1b0	Next.js	next-js	2026-09-13 14:41:03.778821+05:30	2026-09-13 14:41:03.778821+05:30
12401e04-e5bd-4987-9faa-e912bcc651d0	React	react	2026-09-13 14:41:03.779707+05:30	2026-09-13 14:41:03.779707+05:30
32d87401-6d3a-4e46-ac9d-7a8001b88a96	TypeScript	typescript	2026-09-13 14:41:03.780516+05:30	2026-09-13 14:41:03.780516+05:30
dfd133de-3895-414a-847a-55897fdb5dae	Performance	performance	2026-09-13 14:41:03.781357+05:30	2026-09-13 14:41:03.781357+05:30
97c0ed4e-d5bd-46f1-a667-0f8078de6e19	Web Standards	web-standards	2026-09-13 14:41:03.782243+05:30	2026-09-13 14:41:03.782243+05:30
65fd48ff-2ac0-48c8-83fd-71f160e36cb8	Full-Stack	full-stack	2026-09-13 14:41:03.783126+05:30	2026-09-13 14:41:03.783126+05:30
901369ea-ce70-4253-9783-b147e3cb812e	PostgreSQL	postgresql	2026-09-13 14:41:03.784044+05:30	2026-09-13 14:41:03.784044+05:30
572e487f-8cc5-4f35-8771-4d07ff732b50	REST APIs	rest-apis	2026-09-13 14:41:03.785014+05:30	2026-09-13 14:41:03.785014+05:30
7b682f83-89e9-4b23-a15f-d5f7e2a1f351	Authentication	authentication	2026-09-13 14:41:03.786002+05:30	2026-09-13 14:41:03.786002+05:30
795f9571-b182-425f-82ef-d60eb250202b	Dashboards	dashboards	2026-09-13 14:41:03.786954+05:30	2026-09-13 14:41:03.786954+05:30
f026656c-e439-4eed-97e4-d723406cfc7d	Cloud	cloud	2026-09-13 14:41:03.78823+05:30	2026-09-13 14:41:03.78823+05:30
9e1cc5a2-0a24-4172-878a-308e26c507a2	Docker	docker	2026-09-13 14:41:03.789216+05:30	2026-09-13 14:41:03.789216+05:30
0f71c751-8aa8-4c74-abfb-929a38b90e19	CI/CD	ci-cd	2026-09-13 14:41:03.790096+05:30	2026-09-13 14:41:03.790096+05:30
3d757a67-70c1-40cb-9096-f28524c61182	Security	security	2026-09-13 14:41:03.790906+05:30	2026-09-13 14:41:03.790906+05:30
44305430-4a38-4638-82fe-93b02efa65b3	Infrastructure	infrastructure	2026-09-13 14:41:03.791651+05:30	2026-09-13 14:41:03.791651+05:30
5c52061a-719a-4d44-8954-7cb901f7643d	Artificial Intelligence	artificial-intelligence	2026-09-13 14:41:03.792428+05:30	2026-09-13 14:41:03.792428+05:30
e25038c7-0721-4df8-8e03-065fddefffb7	LLM APIs	llm-apis	2026-09-13 14:41:03.793403+05:30	2026-09-13 14:41:03.793403+05:30
1b9f5a04-a91e-474b-9f17-bbd834fc8ada	Streaming	streaming	2026-09-13 14:41:03.794338+05:30	2026-09-13 14:41:03.794338+05:30
2fc26cf1-a153-496c-a15c-37a5b132befd	Automation	automation	2026-09-13 14:41:03.79515+05:30	2026-09-13 14:41:03.79515+05:30
9f9d17f6-1c17-468f-a013-51ab308f6d77	API Integrations	api-integrations	2026-09-13 14:41:03.796023+05:30	2026-09-13 14:41:03.796023+05:30
8be158a3-ee57-4581-bbc1-8b96a1fb8ce4	Webhooks	webhooks	2026-09-13 14:41:03.796994+05:30	2026-09-13 14:41:03.796994+05:30
2cc3065b-b60c-4b03-aa6e-5df691375623	Data Synchronization	data-synchronization	2026-09-13 14:41:03.797876+05:30	2026-09-13 14:41:03.797876+05:30
2368bb55-a68a-4d73-8c2d-54b20a215e36	Architecture	architecture	2026-09-13 14:41:03.798775+05:30	2026-09-13 14:41:03.798775+05:30
b63daa02-a68d-4211-be25-fe32c7f4c0e5	DevOps	devops	2026-09-13 14:41:03.79961+05:30	2026-09-13 14:41:03.79961+05:30
276ee5d2-5575-4dda-82dc-afd39e61e3a7	Monitoring	monitoring	2026-09-13 14:41:03.800938+05:30	2026-09-13 14:41:03.800938+05:30
299eb9b9-b683-4c83-b8c4-ac71521b0d85	Maintenance	maintenance	2026-09-13 14:41:03.80191+05:30	2026-09-13 14:41:03.80191+05:30
2a3815ba-3141-4625-b6fa-15da2aff2a57	Software Engineering	software-engineering	2026-09-13 14:41:03.803014+05:30	2026-09-13 14:41:03.803014+05:30
\.


--
-- Data for Name: CaseStudy; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."CaseStudy" (id, "projectId", challenge, approach, solution, implementation, results, status, "publishedAt", "seoTitle", "seoDescription", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Contact; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Contact" (id, "firstName", "lastName", email, phone, company, "jobTitle", website, notes, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Conversation; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Conversation" (id, "sessionId", status, "leadId", metadata, "startedAt", "endedAt", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: ConversationQualification; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."ConversationQualification" (id, "conversationId", "serviceId", "industryId", intent, requirement, "budgetMin", "budgetMax", "budgetCurrency", timeline, score, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Faq; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Faq" (id, question, answer, category, status, "order", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Industry; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Industry" (id, name, slug, description, "order", "isActive", "createdAt", "updatedAt") FROM stdin;
01a072db-3e9a-731e-9737-0d78143aad1c	Interiors	interiors-section	Architecture, residential interiors, commercial spaces, and turnkey studio solutions.	1	t	2026-09-06 00:06:06.166004+05:30	2026-09-13 16:21:37.741845+05:30
b15ade6f-05cd-43ec-853c-910a5ccb5197	Education & EdTech	education-edtech	Academic institutions, multi-branch school networks, e-learning platforms, and student CRMs.	2	t	2026-09-13 15:34:03.886041+05:30	2026-09-13 16:21:37.748733+05:30
b5589b77-a3ae-47b0-a617-7009b5a37a43	Agritech & Fresh Produce	agritech-fresh-produce	B2B agriculture supply chains, cold-chain logistics, mandi distribution, and farm-to-warehouse ERPs.	3	t	2026-09-13 15:34:03.889195+05:30	2026-09-13 16:21:37.751069+05:30
\.


--
-- Data for Name: Lead; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Lead" (id, "contactId", "companyName", "sourceId", "pipelineStageId", "assignedUserId", "serviceId", "industryId", status, priority, "qualificationScore", requirement, "budgetMin", "budgetMax", "budgetCurrency", timeline, "closedAt", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: LeadActivity; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."LeadActivity" (id, "leadId", "userId", type, description, metadata, "occurredAt", "createdAt") FROM stdin;
\.


--
-- Data for Name: LeadNote; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."LeadNote" (id, "leadId", "authorId", content, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: LeadSource; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."LeadSource" (id, name, slug, description, "isActive", "isSystem", "order", "createdAt", "updatedAt") FROM stdin;
01a0620c-8d03-77bf-855d-e9903a8e68ad	Website Form	website-form	\N	t	t	10	2026-09-02 17:46:24.836751+05:30	2026-09-02 17:46:24.835+05:30
01a0620c-8d0a-760e-a08f-083feda83016	Start a Project	start-project	\N	t	t	20	2026-09-02 17:46:24.844002+05:30	2026-09-02 17:46:24.842+05:30
01a0620c-8d10-7744-b1c1-72872ff34a25	AI Chatbot	ai-chatbot	\N	t	t	30	2026-09-02 17:46:24.84993+05:30	2026-09-02 17:46:24.848+05:30
01a0620c-8d14-75c4-a174-77e3c5f23f49	WhatsApp	whatsapp	\N	t	t	40	2026-09-02 17:46:24.854111+05:30	2026-09-02 17:46:24.852+05:30
01a0620c-8d18-76e0-ad40-49cc963e9eba	Referral	referral	\N	t	t	50	2026-09-02 17:46:24.858074+05:30	2026-09-02 17:46:24.856+05:30
01a0620c-8d1d-71c5-9c87-4189cc0d40d6	Campaign	campaign	\N	t	t	60	2026-09-02 17:46:24.862307+05:30	2026-09-02 17:46:24.861+05:30
01a0620c-8d22-70a2-9fb4-8d005abfd6a6	Service Page	service-page	\N	t	t	70	2026-09-02 17:46:24.867832+05:30	2026-09-02 17:46:24.866+05:30
01a0620c-8d26-77a1-9b21-560af7d275c7	Portfolio	portfolio	\N	t	t	80	2026-09-02 17:46:24.871673+05:30	2026-09-02 17:46:24.87+05:30
01a0620c-8d2a-7425-86e6-7c5e672f5941	Other	other	\N	t	t	90	2026-09-02 17:46:24.875789+05:30	2026-09-02 17:46:24.874+05:30
\.


--
-- Data for Name: Media; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Media" (id, filename, "originalFilename", "storageKey", url, type, "mimeType", size, width, height, "altText", metadata, "uploadedById", "createdAt", "updatedAt") FROM stdin;
6a61b0ef-9111-418c-a8e4-61ae504cc6f8	strategy-discovery.jpg	strategy-discovery.jpg	blog/strategy-discovery.jpg	/images/blog/strategy-discovery.jpg	IMAGE	image/jpeg	\N	\N	\N	Strategy & Discovery Software Architecture	\N	\N	2026-09-13 15:02:40.120612+05:30	2026-09-13 15:02:40.120612+05:30
1468eff6-ad01-4b04-827d-395fb902b305	product-ux-design.jpg	product-ux-design.jpg	blog/product-ux-design.jpg	/images/blog/product-ux-design.jpg	IMAGE	image/jpeg	\N	\N	\N	Product & UX Design Systems	\N	\N	2026-09-13 15:02:40.140029+05:30	2026-09-13 15:02:40.140029+05:30
621f738d-5ae7-4194-8103-535ed30d35a2	web-digital-experiences.jpg	web-digital-experiences.jpg	blog/web-digital-experiences.jpg	/images/blog/web-digital-experiences.jpg	IMAGE	image/jpeg	\N	\N	\N	Web & Digital Experiences Engineering	\N	\N	2026-09-13 15:02:40.144185+05:30	2026-09-13 15:02:40.144185+05:30
3f8eaf33-ebcc-4f3f-ba76-003f6eb6b6b3	application-development.jpg	application-development.jpg	blog/application-development.jpg	/images/blog/application-development.jpg	IMAGE	image/jpeg	\N	\N	\N	Custom Application Development & Portals	\N	\N	2026-09-13 15:02:40.149184+05:30	2026-09-13 15:02:40.149184+05:30
5f05e285-2ef4-493d-bcd1-4abae18fc0b1	cloud-infrastructure.jpg	cloud-infrastructure.jpg	blog/cloud-infrastructure.jpg	/images/blog/cloud-infrastructure.jpg	IMAGE	image/jpeg	\N	\N	\N	Cloud & Infrastructure DevOps	\N	\N	2026-09-13 15:02:40.152891+05:30	2026-09-13 15:02:40.152891+05:30
fd08997b-bff4-455f-9b7a-f4d09d62c90f	ai-intelligent-automation.jpg	ai-intelligent-automation.jpg	blog/ai-intelligent-automation.jpg	/images/blog/ai-intelligent-automation.jpg	IMAGE	image/jpeg	\N	\N	\N	AI & Intelligent Automation Systems	\N	\N	2026-09-13 15:02:40.15673+05:30	2026-09-13 15:02:40.15673+05:30
34999dba-720c-409f-8849-00605e2df344	data-integrations-systems.jpg	data-integrations-systems.jpg	blog/data-integrations-systems.jpg	/images/blog/data-integrations-systems.jpg	IMAGE	image/jpeg	\N	\N	\N	Data Pipelines & System Integrations	\N	\N	2026-09-13 15:02:40.160495+05:30	2026-09-13 15:02:40.160495+05:30
db0fce42-f6e5-4c69-9d2a-6cb5536794da	deployment-support-continuous-engineering.jpg	deployment-support-continuous-engineering.jpg	blog/deployment-support-continuous-engineering.jpg	/images/blog/deployment-support-continuous-engineering.jpg	IMAGE	image/jpeg	\N	\N	\N	Deployment & Continuous Engineering	\N	\N	2026-09-13 15:02:40.164388+05:30	2026-09-13 15:02:40.164388+05:30
805856c9-54e3-4eb8-ad81-088320b0c427	agrifresh-fruits-supply.jpg	agrifresh-fruits-supply.jpg	projects/agrifresh-fruits-supply.jpg	/images/projects/agrifresh-fruits-supply.jpg	IMAGE	image/jpeg	\N	\N	\N	AgriFresh Global B2B Wholesale Fruit Supply & Cold-Chain Portal	\N	\N	2026-09-13 15:34:45.64405+05:30	2026-09-13 15:34:45.64405+05:30
c4228f80-9af0-47f8-949a-ec07446f2b9e	royal-harvest-dry-fruits.jpg	royal-harvest-dry-fruits.jpg	projects/royal-harvest-dry-fruits.jpg	/images/projects/royal-harvest-dry-fruits.jpg	IMAGE	image/jpeg	\N	\N	\N	Royal Harvest Premium Dry Fruits & Wholesale Portal Homepage	\N	\N	2026-09-13 15:56:24.103032+05:30	2026-09-13 15:56:24.103032+05:30
79a34360-6f50-404e-ab1e-b9a9998d09cc	sm-interiors.png	sm-interiors.png	projects/sm-interiors.png	/images/projects/sm-interiors.png	IMAGE	image/png	\N	\N	\N	SM Interiors Architectural Studio & Home Platform	\N	\N	2026-09-13 15:34:45.639735+05:30	2026-09-13 16:21:37.834267+05:30
5c4b602f-6109-4768-9fd1-019ed3cd32d2	edusmart-school-crm.jpg	edusmart-school-crm.jpg	projects/edusmart-school-crm.jpg	/images/projects/edusmart-school-crm.jpg	IMAGE	image/jpeg	\N	\N	\N	Apex School Management & AI Fee Recovery CRM Dashboard	\N	\N	2026-09-13 15:34:45.642173+05:30	2026-09-13 16:21:37.836606+05:30
761cc3c5-cb29-492b-a016-2c40c74ecac1	vijaya-dry-fruits.jpg	vijaya-dry-fruits.jpg	projects/vijaya-dry-fruits.jpg	/images/projects/vijaya-dry-fruits.jpg	IMAGE	image/jpeg	\N	\N	\N	Vijaya Premium Dry Fruits & Wholesale Portal Homepage	\N	\N	2026-09-13 16:21:37.839854+05:30	2026-09-13 16:21:37.839854+05:30
\.


--
-- Data for Name: Message; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Message" (id, "conversationId", role, content, metadata, "createdAt") FROM stdin;
\.


--
-- Data for Name: Notification; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Notification" (id, channel, status, recipient, "userId", "leadId", subject, body, payload, attempts, "sentAt", "failedAt", "errorMessage", "readAt", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: PipelineStage; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."PipelineStage" (id, name, slug, description, "order", "isActive", "isSystem", "isWon", "isLost", "createdAt", "updatedAt") FROM stdin;
01a0620c-8cc2-71f5-9efb-dd6e25159e8a	New	new	\N	10	t	t	f	f	2026-09-02 17:46:24.772098+05:30	2026-09-02 17:46:24.77+05:30
01a0620c-8ccd-75dd-ab00-2141d95e4917	Contacted	contacted	\N	20	t	t	f	f	2026-09-02 17:46:24.782558+05:30	2026-09-02 17:46:24.781+05:30
01a0620c-8cd2-7551-a731-34c52eff47af	Qualified	qualified	\N	30	t	t	f	f	2026-09-02 17:46:24.788411+05:30	2026-09-02 17:46:24.787+05:30
01a0620c-8cd8-73f5-b6ca-381a49de4e56	Consultation	consultation	\N	40	t	t	f	f	2026-09-02 17:46:24.79403+05:30	2026-09-02 17:46:24.792+05:30
01a0620c-8ce1-7498-bcb0-1f38920a96c8	Proposal	proposal	\N	50	t	t	f	f	2026-09-02 17:46:24.802741+05:30	2026-09-02 17:46:24.801+05:30
01a0620c-8ce6-72fe-953f-bc4d82d6fd1f	Negotiation	negotiation	\N	60	t	t	f	f	2026-09-02 17:46:24.808347+05:30	2026-09-02 17:46:24.806+05:30
01a0620c-8cee-71f6-b598-70c8aeca1d25	Won	won	\N	70	t	t	t	f	2026-09-02 17:46:24.815999+05:30	2026-09-02 17:46:24.814+05:30
01a0620c-8cf4-72fd-b70a-66126ec7f7fc	Lost	lost	\N	80	t	t	f	t	2026-09-02 17:46:24.821727+05:30	2026-09-02 17:46:24.82+05:30
\.


--
-- Data for Name: Project; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Project" (id, title, slug, "shortDescription", "fullDescription", "categoryId", "publicationStatus", "publishedAt", status, featured, "order", "liveUrl", "seoTitle", "seoDescription", "coverMediaId", "createdAt", "updatedAt") FROM stdin;
f54858f8-be16-4b74-a6c1-6b141c529f01	SM Interiors — High-End Studio & Architectural Platform	sm-interiors	Full-stack architectural & interior design platform featuring AWS Lambda deployment, WhatsApp automation, interactive live maps, email templates, and AI growth recommendations.	SM Interiors is an architectural and interior design studio delivering turnkey luxury living spaces and modern commercial environments. MarineCloudX engineered, deployed, and currently maintains the complete digital platform.\n\n### Architecture & Cloud Deployment\n- **AWS Lambda Serverless Infrastructure**: Scalable cloud deployment leveraging AWS Lambda and cloud edge networks for ultra-low latency, zero server maintenance overhead, and dynamic resource scaling.\n- **Custom Admin Control Center**: Bespoke CMS and business administration panel enabling the studio team to curate portfolio projects, manage incoming client consultations, and control active inquiries.\n- **Dynamic Business Recommendations**: Integrated AI recommendation engine in the admin panel analyzing visitor engagement patterns, lead momentum, and inquiry trends to provide actionable recommendations for growing the business.\n\n### Client Experience & Automation\n- **WhatsApp Business Automation**: End-to-end automated WhatsApp integration delivering instant inquiry confirmations, project status updates, and direct-to-designer chat triggers.\n- **AI Agent Calling Integration (Scoping / In Discussion)**: Conversational voice AI agent under architectural alignment to handle after-hours client qualification, design preference intake, and consultation booking.\n- **Interactive Live Maps & Geolocation**: Live studio location integration with interactive maps guiding visiting clients effortlessly to the Bhimavaram design hub.\n- **Branded Transactional Email Templates**: High-fidelity, responsive HTML email automation for design estimates, consultation confirmations, and portfolio showcases.\n- **Active System Maintenance**: Ongoing SLAs, security patching, cloud performance monitoring, and continuous product enhancements provided by MarineCloudX DevOps team.	01a09a05-92b5-777d-a107-5510158dc555	PUBLISHED	2026-09-13 15:34:45.663041+05:30	COMPLETED	t	1	https://sminteriors47.in/	SM Interiors — Architectural Studio & Custom Interior Platform	Case study of SM Interiors: AWS Lambda cloud deployment, WhatsApp automation, custom admin panel, and AI business recommendations engineered by MarineCloudX.	79a34360-6f50-404e-ab1e-b9a9998d09cc	2026-09-13 15:34:45.663041+05:30	2026-09-13 16:21:37.880187+05:30
54772693-51af-408d-937c-dc728dee4832	Apex School Management & AI Fee Recovery CRM	apex-school-management-crm	Comprehensive educational CRM with standard-wise student categorization, annual fee lifecycle management, and predictive AI payment recommendations with automated WhatsApp & email alerts.	Apex School Management CRM is an enterprise-grade academic administration platform built to modernize institution operations, student records, and annual fee lifecycles across multiple grades and branches.\n\n### Academic & Student Segregation\n- **Standard & Grade-Wise Classification**: Distinct hierarchy managing students from kindergarten through higher secondary, with automated section allocation, guardian contact mapping, and academic performance history.\n- **Annual Fee Lifecycle Architecture**: Multi-tier fee structuring supporting annual tuition, transport fees, laboratory dues, and extracurriculars with fine-tuned installment schedules.\n\n### AI Fee Recovery & Multi-Channel Communications\n- **AI Payment Propensity Recommendations**: Predictive machine learning model analyzing past payment patterns, reminder interactions, and seasonal trends to highlight guardians most likely to need follow-ups.\n- **Automated WhatsApp Reminders**: Direct-to-guardian WhatsApp notification workflows dispatching personalized due-date reminders, payment links, and digitally generated fee receipts.\n- **Smart Email Follow-Ups**: Scheduled, automated email escalations with PDF invoice attachments, preventing administrative overhead for accounts staff.\n- **Multi-Role Administrative Hierarchy**: Tailored dashboards for principals, accountants, teachers, and system administrators with fine-grained role-based access control.\n\n### Current Milestone: UI & Experience Design\n- The project is currently in the active **UI/UX Design & Prototyping Stage**, finalizing component libraries, design systems, and mobile-first parent communication workflows before full cloud provisioning.	26e26ac6-8761-4564-957b-7778368f49ae	PUBLISHED	2026-09-13 15:34:45.708599+05:30	IN_PROGRESS	t	2	\N	Apex School Management CRM with AI Fee Recovery Automation	School administration CRM with standard-wise student segregation, annual fee tracking, and automated AI WhatsApp reminders to parents.	5c4b602f-6109-4768-9fd1-019ed3cd32d2	2026-09-13 15:34:45.708599+05:30	2026-09-13 16:21:37.897923+05:30
6147d6b8-bde1-446d-b478-870c7ea0679e	Vijaya — Premium Dry Fruits & B2B Wholesale Portal	vijaya-dry-fruits	Direct-from-orchard dry fruits e-commerce storefront and wholesale administrative portal committed for development with B2B bulk orders, gift box customization, and inventory controls.	Vijaya Dry Fruits is a high-end gourmet dry fruits and nuts enterprise delivering nature's best almonds, walnuts, cashews, pistachios, and saffron across both direct-to-consumer (D2C) and wholesale distribution channels. MarineCloudX has been committed and contracted to engineer the complete consumer web storefront and backend administrative portal.\n\n### Storefront & Consumer Commerce\n- **Luxury D2C E-Commerce Experience**: Immersive digital shopping destination with curated collections, bespoke gift-box builders, vacuum-nitrogen sealed freshness badges, and instant checkout.\n- **Dynamic B2B Wholesale Quoting**: Dedicated portal for bulk buyers, retailers, and corporate gifting clients to calculate volume-based tier pricing, generate pro-forma invoices, and schedule freight shipments.\n- **Direct Orchard Provenance & Batch Traceability**: Customer-facing transparency showing harvest origin (Kashmir, California, Afghanistan, Iran) with batch testing certificates.\n\n### Administration & Operations Portal\n- **Warehouse & Cold-Storage Inventory Hub**: Real-time stock tracking across warehouse bays with automated alerts for reorder thresholds and packaging supplies.\n- **Multi-Channel Order Fulfillment Pipeline**: Unified order management syncing web sales, wholesale contract dispatches, and courier tracking integrations.\n- **Customer Relationship & Reorder CRM**: Segmented customer profiles enabling automated seasonal gifting reminders and personalized discount incentives for recurring B2B accounts.\n\n### Engagement Status: Committed & Under Active Development\n- Formal engagement has been **committed and scheduled for full development**, with MarineCloudX engineering teams currently building the responsive Next.js frontend, backend database schemas, and admin CRM panels.	abf3e5ea-b416-42dd-8c38-c64a9d571fc5	PUBLISHED	2026-09-13 16:21:37.913023+05:30	IN_PROGRESS	t	3	\N	Vijaya Dry Fruits — E-Commerce & Wholesale B2B Portal	Luxury dry fruits storefront and admin CRM portal engineered for farm-direct retail and wholesale distribution.	761cc3c5-cb29-492b-a016-2c40c74ecac1	2026-09-13 16:21:37.913023+05:30	2026-09-13 16:21:37.913023+05:30
\.


--
-- Data for Name: ProjectCategory; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."ProjectCategory" (id, name, slug, description, "order", "createdAt", "updatedAt") FROM stdin;
01a09a05-92b5-777d-a107-5510158dc555	Interiors	interiors	Architectural and luxury interior digital platforms.	1	2026-09-13 14:37:31.636396+05:30	2026-09-13 16:21:37.761517+05:30
26e26ac6-8761-4564-957b-7778368f49ae	Enterprise SaaS & CRM	enterprise-saas-crm	Institutional management systems, student/client relationship platforms, and workflow automation.	2	2026-09-13 15:34:45.58461+05:30	2026-09-13 16:21:37.764526+05:30
abf3e5ea-b416-42dd-8c38-c64a9d571fc5	B2B Supply Chain & Logistics	b2b-supply-chain-logistics	Wholesale procurement portals, fleet management, and cold storage telemetry.	3	2026-09-13 15:34:45.586556+05:30	2026-09-13 16:21:37.766714+05:30
\.


--
-- Data for Name: ProjectMedia; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."ProjectMedia" (id, "projectId", "mediaId", role, caption, "order", "createdAt") FROM stdin;
\.


--
-- Data for Name: Role; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Role" (id, name, slug, description, level, "isSystem", "createdAt", "updatedAt") FROM stdin;
01a0620c-8c6d-76ad-8b50-10467597ea66	Super Admin	super-admin	Full access to every area of the system.	0	t	2026-09-02 17:46:24.686866+05:30	2026-09-02 17:46:24.686+05:30
01a0620c-8c9d-70a4-9a5b-d922e2d84348	Admin	admin	Manages the CMS and the CRM.	10	t	2026-09-02 17:46:24.734477+05:30	2026-09-02 17:46:24.733+05:30
01a0620c-8ca4-7556-8b2f-907b1cbda150	Manager	manager	Oversees the sales pipeline and the team's workload.	20	t	2026-09-02 17:46:24.7416+05:30	2026-09-02 17:46:24.74+05:30
01a0620c-8cab-726d-af84-7f4f19125f05	Sales	sales	Works assigned leads, tasks and follow-ups.	30	t	2026-09-02 17:46:24.749163+05:30	2026-09-02 17:46:24.747+05:30
01a0620c-8cb2-778e-8af0-6135779abd0a	Content Manager	content-manager	Manages website content only.	30	t	2026-09-02 17:46:24.755905+05:30	2026-09-02 17:46:24.754+05:30
\.


--
-- Data for Name: Service; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Service" (id, name, slug, "shortDescription", "fullDescription", status, "publishedAt", "order", "seoTitle", "seoDescription", "coverMediaId", "createdAt", "updatedAt") FROM stdin;
ec8154aa-f496-4ad8-af16-3f4b7dab9825	Strategy & Architecture	strategy-architecture	Technical roadmap, system design, data modeling, and enterprise feasibility discovery.	\N	PUBLISHED	2026-09-13 15:34:45.595156+05:30	1	\N	\N	\N	2026-09-13 15:34:45.595156+05:30	2026-09-13 16:21:37.778683+05:30
a0d6855f-6a38-427c-b7e1-2713cee73b14	Product & UX Design	product-ux-design	High-density SaaS dashboards, interactive prototypes, and scalable component design systems.	\N	PUBLISHED	2026-09-13 15:34:45.59793+05:30	2	\N	\N	\N	2026-09-13 15:34:45.59793+05:30	2026-09-13 16:21:37.780411+05:30
5684258f-07e9-44ec-bf91-bd87f01fb159	Full-Stack Web & Mobile	web-mobile-engineering	Modern reactive web apps, customer portals, and high-performance server-rendered frontends.	\N	PUBLISHED	2026-09-13 15:34:45.599647+05:30	3	\N	\N	\N	2026-09-13 15:34:45.599647+05:30	2026-09-13 16:21:37.782248+05:30
58581d9e-dc81-4741-aeb7-bf9c0f45cddd	Cloud & Serverless Infrastructure	cloud-serverless-infra	AWS Lambda, edge compute, serverless deployment pipelines, and zero-downtime scalability.	\N	PUBLISHED	2026-09-13 15:34:45.602406+05:30	4	\N	\N	\N	2026-09-13 15:34:45.602406+05:30	2026-09-13 16:21:37.785012+05:30
37b66e0b-b5ae-433a-bdc2-7cfe1c31163f	Applied AI & Automation	applied-ai-automation	Predictive recommendations, WhatsApp workflow triggers, LLM orchestration, and AI voice agents.	\N	PUBLISHED	2026-09-13 15:34:45.604949+05:30	5	\N	\N	\N	2026-09-13 15:34:45.604949+05:30	2026-09-13 16:21:37.787075+05:30
b10220a0-08dc-4599-b2c2-a3471a153cfe	CRM & Enterprise Platforms	crm-enterprise-platforms	Bespoke administrative control centers, multi-role RBAC, and transactional operations hubs.	\N	PUBLISHED	2026-09-13 15:34:45.60622+05:30	6	\N	\N	\N	2026-09-13 15:34:45.60622+05:30	2026-09-13 16:21:37.788864+05:30
814cb5fa-27c2-4a31-b386-da110e744bef	DevOps & Continuous Engineering	devops-continuous-engineering	Automated CI/CD release gates, containerized microservices, and proactive production SLAs.	\N	PUBLISHED	2026-09-13 15:34:45.607676+05:30	7	\N	\N	\N	2026-09-13 15:34:45.607676+05:30	2026-09-13 16:21:37.791276+05:30
\.


--
-- Data for Name: ServiceFeature; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."ServiceFeature" (id, "serviceId", name, description, "order", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Task; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Task" (id, "leadId", "assignedUserId", "createdById", title, description, status, priority, "dueAt", "completedAt", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Technology; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Technology" (id, name, slug, category, "order", "isActive", "createdAt", "updatedAt") FROM stdin;
72f8b569-b585-4abe-b53c-0502978c9984	Next.js	nextjs	FRONTEND	0	t	2026-09-13 15:34:45.614762+05:30	2026-09-13 16:21:37.800871+05:30
02d4451f-113a-4959-befc-eb8ec2cfd5ed	React	react	FRONTEND	0	t	2026-09-13 15:34:45.616969+05:30	2026-09-13 16:21:37.803247+05:30
b4c52bb8-abe2-4968-b3e9-8316edf93088	TypeScript	typescript	FRONTEND	0	t	2026-09-13 15:34:45.618708+05:30	2026-09-13 16:21:37.805039+05:30
a3f6fe27-64aa-47c2-8893-441bb72f44f6	Tailwind CSS	tailwind-css	FRONTEND	0	t	2026-09-13 15:34:45.620645+05:30	2026-09-13 16:21:37.80767+05:30
16df03fd-41bd-4bf1-bf7d-7bd7be3abdff	Node.js / NestJS	nodejs-nestjs	BACKEND	0	t	2026-09-13 15:34:45.621807+05:30	2026-09-13 16:21:37.80975+05:30
268d1e9e-b6cd-4d6c-851d-ad73926e7911	PostgreSQL	postgresql	DATABASE	0	t	2026-09-13 15:34:45.623056+05:30	2026-09-13 16:21:37.811553+05:30
0504badc-b3d6-469c-8ec1-56185af16f91	AWS Lambda	aws-lambda	CLOUD	0	t	2026-09-13 15:34:45.624381+05:30	2026-09-13 16:21:37.813135+05:30
e2eb4c84-4587-47f3-a0c5-8e614d517348	WhatsApp Automation API	whatsapp-automation	AUTOMATION	0	t	2026-09-13 15:34:45.625807+05:30	2026-09-13 16:21:37.814923+05:30
602478de-2f1a-458e-b264-fccd5dd944de	AI Agent Calling & Voice AI	ai-agent-calling	AI	0	t	2026-09-13 15:34:45.627293+05:30	2026-09-13 16:21:37.817543+05:30
943d4218-0c11-4674-95c9-2d082a761681	LLM Recommendation Engine	llm-recommendation-engine	AI	0	t	2026-09-13 15:34:45.628635+05:30	2026-09-13 16:21:37.81935+05:30
e0454e6b-fda8-4558-83c2-d4a2ac29d119	Redis	redis	DATABASE	0	t	2026-09-13 15:34:45.629956+05:30	2026-09-13 16:21:37.821648+05:30
07c707c5-33eb-43a3-94f1-bd01134ec913	Docker	docker	DEVOPS	0	t	2026-09-13 15:34:45.631172+05:30	2026-09-13 16:21:37.824413+05:30
\.


--
-- Data for Name: Testimonial; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Testimonial" (id, "authorName", "authorRole", "companyName", content, rating, "photoMediaId", "projectId", status, "publishedAt", "order", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."User" (id, name, email, phone, status, "passwordHash", "emailVerifiedAt", "lastLoginAt", "roleId", "createdAt", "updatedAt") FROM stdin;
01a0620d-18d3-7402-97c6-e064a80b34e6	Development Admin	admin@marinecloudex.local	\N	ACTIVE	$2b$12$.QA/GIjH2CfmX5Ht1YiRWO0JxNH7PmZslyejd2oXDSIQIXakRA4yO	\N	2026-09-13 15:37:39.081+05:30	01a0620c-8c6d-76ad-8b50-10467597ea66	2026-09-02 17:47:00.627317+05:30	2026-09-02 17:47:00.627+05:30
\.


--
-- Data for Name: _BlogPostToBlogTag; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."_BlogPostToBlogTag" ("A", "B") FROM stdin;
e48da80d-675d-4d82-be51-574aef3b6e84	9b1d0fd8-5662-4d05-a349-8b5abb190b94
e48da80d-675d-4d82-be51-574aef3b6e84	d7677427-ec62-40c2-8b3c-6bd20cbf2c43
e48da80d-675d-4d82-be51-574aef3b6e84	09bea620-3e94-4008-9798-1f2281fbb832
e48da80d-675d-4d82-be51-574aef3b6e84	f100da23-c2d8-4081-ae5b-ed8489899d1b
d1acee9e-b936-4f75-bcc5-711fb7e719fc	89fb8a42-eecf-469d-ab96-1a0f6c585cd9
d1acee9e-b936-4f75-bcc5-711fb7e719fc	8703ea5b-847a-4360-931d-152b1d4f16dc
d1acee9e-b936-4f75-bcc5-711fb7e719fc	84c8d7c3-063c-4520-87b1-3aa9a703fce3
d1acee9e-b936-4f75-bcc5-711fb7e719fc	1acd2c7d-a649-43ef-b38d-7a2478b8b701
4ccbb6db-b6f5-4267-897d-c5d742393892	996fb355-7477-47b4-bfcb-f20319fcf1b0
4ccbb6db-b6f5-4267-897d-c5d742393892	12401e04-e5bd-4987-9faa-e912bcc651d0
4ccbb6db-b6f5-4267-897d-c5d742393892	32d87401-6d3a-4e46-ac9d-7a8001b88a96
4ccbb6db-b6f5-4267-897d-c5d742393892	dfd133de-3895-414a-847a-55897fdb5dae
4ccbb6db-b6f5-4267-897d-c5d742393892	97c0ed4e-d5bd-46f1-a667-0f8078de6e19
f711d47f-edbd-4e81-afa1-fdc3f635e3b8	65fd48ff-2ac0-48c8-83fd-71f160e36cb8
f711d47f-edbd-4e81-afa1-fdc3f635e3b8	901369ea-ce70-4253-9783-b147e3cb812e
f711d47f-edbd-4e81-afa1-fdc3f635e3b8	572e487f-8cc5-4f35-8771-4d07ff732b50
f711d47f-edbd-4e81-afa1-fdc3f635e3b8	7b682f83-89e9-4b23-a15f-d5f7e2a1f351
f711d47f-edbd-4e81-afa1-fdc3f635e3b8	795f9571-b182-425f-82ef-d60eb250202b
4bd78ab1-8442-4393-910e-eee1998a23b3	f026656c-e439-4eed-97e4-d723406cfc7d
4bd78ab1-8442-4393-910e-eee1998a23b3	9e1cc5a2-0a24-4172-878a-308e26c507a2
4bd78ab1-8442-4393-910e-eee1998a23b3	0f71c751-8aa8-4c74-abfb-929a38b90e19
4bd78ab1-8442-4393-910e-eee1998a23b3	3d757a67-70c1-40cb-9096-f28524c61182
4bd78ab1-8442-4393-910e-eee1998a23b3	44305430-4a38-4638-82fe-93b02efa65b3
a3b4c3c6-d3cf-405a-beee-bcea4178c05a	5c52061a-719a-4d44-8954-7cb901f7643d
a3b4c3c6-d3cf-405a-beee-bcea4178c05a	e25038c7-0721-4df8-8e03-065fddefffb7
a3b4c3c6-d3cf-405a-beee-bcea4178c05a	1b9f5a04-a91e-474b-9f17-bbd834fc8ada
a3b4c3c6-d3cf-405a-beee-bcea4178c05a	2fc26cf1-a153-496c-a15c-37a5b132befd
84841fdf-17d2-470f-b3f0-ec95dad1fc4d	9f9d17f6-1c17-468f-a013-51ab308f6d77
84841fdf-17d2-470f-b3f0-ec95dad1fc4d	8be158a3-ee57-4581-bbc1-8b96a1fb8ce4
84841fdf-17d2-470f-b3f0-ec95dad1fc4d	2cc3065b-b60c-4b03-aa6e-5df691375623
84841fdf-17d2-470f-b3f0-ec95dad1fc4d	2368bb55-a68a-4d73-8c2d-54b20a215e36
26a2d041-729a-404f-b2f6-90cc3dfe3679	b63daa02-a68d-4211-be25-fe32c7f4c0e5
26a2d041-729a-404f-b2f6-90cc3dfe3679	276ee5d2-5575-4dda-82dc-afd39e61e3a7
26a2d041-729a-404f-b2f6-90cc3dfe3679	299eb9b9-b683-4c83-b8c4-ac71521b0d85
26a2d041-729a-404f-b2f6-90cc3dfe3679	2a3815ba-3141-4625-b6fa-15da2aff2a57
\.


--
-- Data for Name: _IndustryToProject; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."_IndustryToProject" ("A", "B") FROM stdin;
01a072db-3e9a-731e-9737-0d78143aad1c	f54858f8-be16-4b74-a6c1-6b141c529f01
b15ade6f-05cd-43ec-853c-910a5ccb5197	54772693-51af-408d-937c-dc728dee4832
b5589b77-a3ae-47b0-a617-7009b5a37a43	6147d6b8-bde1-446d-b478-870c7ea0679e
\.


--
-- Data for Name: _IndustryToService; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."_IndustryToService" ("A", "B") FROM stdin;
\.


--
-- Data for Name: _ProjectToService; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."_ProjectToService" ("A", "B") FROM stdin;
f54858f8-be16-4b74-a6c1-6b141c529f01	5684258f-07e9-44ec-bf91-bd87f01fb159
f54858f8-be16-4b74-a6c1-6b141c529f01	58581d9e-dc81-4741-aeb7-bf9c0f45cddd
f54858f8-be16-4b74-a6c1-6b141c529f01	37b66e0b-b5ae-433a-bdc2-7cfe1c31163f
54772693-51af-408d-937c-dc728dee4832	a0d6855f-6a38-427c-b7e1-2713cee73b14
54772693-51af-408d-937c-dc728dee4832	b10220a0-08dc-4599-b2c2-a3471a153cfe
54772693-51af-408d-937c-dc728dee4832	37b66e0b-b5ae-433a-bdc2-7cfe1c31163f
6147d6b8-bde1-446d-b478-870c7ea0679e	ec8154aa-f496-4ad8-af16-3f4b7dab9825
6147d6b8-bde1-446d-b478-870c7ea0679e	5684258f-07e9-44ec-bf91-bd87f01fb159
6147d6b8-bde1-446d-b478-870c7ea0679e	b10220a0-08dc-4599-b2c2-a3471a153cfe
\.


--
-- Data for Name: _ProjectToTechnology; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."_ProjectToTechnology" ("A", "B") FROM stdin;
f54858f8-be16-4b74-a6c1-6b141c529f01	72f8b569-b585-4abe-b53c-0502978c9984
f54858f8-be16-4b74-a6c1-6b141c529f01	02d4451f-113a-4959-befc-eb8ec2cfd5ed
f54858f8-be16-4b74-a6c1-6b141c529f01	b4c52bb8-abe2-4968-b3e9-8316edf93088
f54858f8-be16-4b74-a6c1-6b141c529f01	0504badc-b3d6-469c-8ec1-56185af16f91
f54858f8-be16-4b74-a6c1-6b141c529f01	e2eb4c84-4587-47f3-a0c5-8e614d517348
f54858f8-be16-4b74-a6c1-6b141c529f01	602478de-2f1a-458e-b264-fccd5dd944de
f54858f8-be16-4b74-a6c1-6b141c529f01	16df03fd-41bd-4bf1-bf7d-7bd7be3abdff
f54858f8-be16-4b74-a6c1-6b141c529f01	268d1e9e-b6cd-4d6c-851d-ad73926e7911
54772693-51af-408d-937c-dc728dee4832	02d4451f-113a-4959-befc-eb8ec2cfd5ed
54772693-51af-408d-937c-dc728dee4832	b4c52bb8-abe2-4968-b3e9-8316edf93088
54772693-51af-408d-937c-dc728dee4832	72f8b569-b585-4abe-b53c-0502978c9984
54772693-51af-408d-937c-dc728dee4832	943d4218-0c11-4674-95c9-2d082a761681
54772693-51af-408d-937c-dc728dee4832	e2eb4c84-4587-47f3-a0c5-8e614d517348
54772693-51af-408d-937c-dc728dee4832	268d1e9e-b6cd-4d6c-851d-ad73926e7911
6147d6b8-bde1-446d-b478-870c7ea0679e	72f8b569-b585-4abe-b53c-0502978c9984
6147d6b8-bde1-446d-b478-870c7ea0679e	02d4451f-113a-4959-befc-eb8ec2cfd5ed
6147d6b8-bde1-446d-b478-870c7ea0679e	b4c52bb8-abe2-4968-b3e9-8316edf93088
6147d6b8-bde1-446d-b478-870c7ea0679e	16df03fd-41bd-4bf1-bf7d-7bd7be3abdff
6147d6b8-bde1-446d-b478-870c7ea0679e	268d1e9e-b6cd-4d6c-851d-ad73926e7911
6147d6b8-bde1-446d-b478-870c7ea0679e	a3f6fe27-64aa-47c2-8893-441bb72f44f6
\.


--
-- Data for Name: _ServiceToTechnology; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."_ServiceToTechnology" ("A", "B") FROM stdin;
\.


--
-- Data for Name: _migrations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public._migrations (id, "timestamp", name) FROM stdin;
1	1786000000000	Baseline1786000000000
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
\.


--
-- Name: _migrations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public._migrations_id_seq', 1, true);


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
-- Name: _migrations PK_52c0aa36ad15cc87e5bab334659; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public._migrations
    ADD CONSTRAINT "PK_52c0aa36ad15cc87e5bab334659" PRIMARY KEY (id);


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

\unrestrict ypyZTAUMcXNYxVX5wXqNU4ihNA2UcWtsymijhzB0YenwQNn6bv3bsGDRSDcXhsz

