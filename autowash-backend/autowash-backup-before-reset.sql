--
-- PostgreSQL database dump
--

\restrict onBKRj8OeNPJ8zrmefHXVOjSsLD6UK46YBADtVzociPXjDsy0HHGHPg2jhbXPzr

-- Dumped from database version 17.10
-- Dumped by pg_dump version 17.10

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
-- Name: public; Type: SCHEMA; Schema: -; Owner: autowash
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO autowash;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: auth_google_tickets; Type: TABLE; Schema: public; Owner: autowash
--

CREATE TABLE public.auth_google_tickets (
    id uuid NOT NULL,
    state character varying(255) NOT NULL,
    return_url character varying(500) NOT NULL,
    status character varying(30) NOT NULL,
    provider_subject character varying(255),
    provider_email character varying(255),
    provider_full_name character varying(100),
    provider_avatar_url character varying(500),
    user_id uuid,
    expires_at timestamp with time zone NOT NULL,
    consumed_at timestamp with time zone,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.auth_google_tickets OWNER TO autowash;

--
-- Name: auth_users; Type: TABLE; Schema: public; Owner: autowash
--

CREATE TABLE public.auth_users (
    id uuid NOT NULL,
    full_name character varying(100) NOT NULL,
    phone character varying(10) NOT NULL,
    email character varying(255),
    password_hash character varying(255) NOT NULL,
    role character varying(20) NOT NULL,
    status character varying(20) NOT NULL,
    tier character varying(20) NOT NULL,
    is_new_customer boolean NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    language character varying(10) DEFAULT 'VI'::character varying NOT NULL,
    theme character varying(20) DEFAULT 'LIGHT'::character varying NOT NULL,
    notifications_enabled boolean DEFAULT true NOT NULL,
    email_notifications boolean DEFAULT false NOT NULL,
    sms_notifications boolean DEFAULT true NOT NULL,
    auth_provider character varying(20) DEFAULT 'LOCAL'::character varying NOT NULL,
    oauth_subject character varying(255),
    email_verified boolean DEFAULT false NOT NULL,
    avatar_url character varying(500)
);


ALTER TABLE public.auth_users OWNER TO autowash;

--
-- Name: booking_addons; Type: TABLE; Schema: public; Owner: autowash
--

CREATE TABLE public.booking_addons (
    id uuid NOT NULL,
    booking_id character varying(50) NOT NULL,
    addon_id character varying(50) NOT NULL,
    addon_name character varying(100) NOT NULL,
    addon_price bigint NOT NULL
);


ALTER TABLE public.booking_addons OWNER TO autowash;

--
-- Name: booking_otp_audit_logs; Type: TABLE; Schema: public; Owner: autowash
--

CREATE TABLE public.booking_otp_audit_logs (
    id uuid NOT NULL,
    booking_id character varying(50) NOT NULL,
    event_type character varying(50) NOT NULL,
    attempt_count integer NOT NULL,
    delivery_email character varying(255),
    request_ip character varying(64),
    user_agent character varying(500),
    message character varying(500),
    created_at timestamp with time zone NOT NULL
);


ALTER TABLE public.booking_otp_audit_logs OWNER TO autowash;

--
-- Name: booking_otp_challenges; Type: TABLE; Schema: public; Owner: autowash
--

CREATE TABLE public.booking_otp_challenges (
    id uuid NOT NULL,
    booking_id character varying(50) NOT NULL,
    code_hash character varying(255) NOT NULL,
    status character varying(30) NOT NULL,
    attempts integer NOT NULL,
    delivery_email character varying(255) NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    sent_at timestamp with time zone NOT NULL,
    verified_at timestamp with time zone,
    invalidated_at timestamp with time zone,
    locked_at timestamp with time zone
);


ALTER TABLE public.booking_otp_challenges OWNER TO autowash;

--
-- Name: booking_staff_transfer_audits; Type: TABLE; Schema: public; Owner: autowash
--

CREATE TABLE public.booking_staff_transfer_audits (
    id uuid NOT NULL,
    booking_id character varying(40) NOT NULL,
    wash_session_id uuid,
    from_staff_id uuid,
    to_staff_id uuid NOT NULL,
    actor_id uuid NOT NULL,
    reason character varying(500),
    created_at timestamp without time zone NOT NULL
);


ALTER TABLE public.booking_staff_transfer_audits OWNER TO autowash;

--
-- Name: customer_bookings; Type: TABLE; Schema: public; Owner: autowash
--

CREATE TABLE public.customer_bookings (
    id character varying(50) NOT NULL,
    customer_id uuid NOT NULL,
    vehicle_id uuid NOT NULL,
    package_id character varying(50),
    combo_id character varying(50),
    voucher_code character varying(50),
    booking_date date NOT NULL,
    booking_time time without time zone NOT NULL,
    payment_method character varying(30) NOT NULL,
    payment_status character varying(30) NOT NULL,
    status character varying(30) NOT NULL,
    base_price bigint NOT NULL,
    addons_total bigint NOT NULL,
    voucher_discount bigint NOT NULL,
    final_amount bigint NOT NULL,
    estimated_duration_minutes integer NOT NULL,
    created_at timestamp with time zone NOT NULL,
    cancelled_at timestamp with time zone,
    refund_amount bigint,
    refund_status character varying(30),
    cancel_reason character varying(500),
    points_redeemed integer DEFAULT 0 NOT NULL,
    points_discount bigint DEFAULT 0 NOT NULL,
    assigned_staff_id uuid,
    confirmation_status character varying(30) DEFAULT 'VERIFIED'::character varying NOT NULL,
    confirmation_expires_at timestamp with time zone,
    confirmed_at timestamp with time zone
);


ALTER TABLE public.customer_bookings OWNER TO autowash;

--
-- Name: customer_combo_usages; Type: TABLE; Schema: public; Owner: autowash
--

CREATE TABLE public.customer_combo_usages (
    id uuid NOT NULL,
    customer_combo_id character varying(50) NOT NULL,
    booking_id character varying(50) NOT NULL,
    used_at timestamp with time zone NOT NULL,
    service_date date NOT NULL,
    created_at timestamp with time zone NOT NULL
);


ALTER TABLE public.customer_combo_usages OWNER TO autowash;

--
-- Name: customer_combos; Type: TABLE; Schema: public; Owner: autowash
--

CREATE TABLE public.customer_combos (
    id character varying(50) NOT NULL,
    customer_id uuid NOT NULL,
    combo_id character varying(50) NOT NULL,
    purchase_booking_id character varying(50),
    status character varying(20) NOT NULL,
    total_usages integer NOT NULL,
    remaining_usages integer NOT NULL,
    activated_at timestamp with time zone NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    last_used_at timestamp with time zone,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.customer_combos OWNER TO autowash;

--
-- Name: customer_vehicles; Type: TABLE; Schema: public; Owner: autowash
--

CREATE TABLE public.customer_vehicles (
    id uuid NOT NULL,
    owner_user_id uuid NOT NULL,
    plate character varying(20) NOT NULL,
    type character varying(20) NOT NULL,
    brand character varying(50) NOT NULL,
    model character varying(50) NOT NULL,
    vehicle_year integer NOT NULL,
    color character varying(30),
    status character varying(20) NOT NULL,
    is_primary boolean NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.customer_vehicles OWNER TO autowash;

--
-- Name: flyway_schema_history; Type: TABLE; Schema: public; Owner: autowash
--

CREATE TABLE public.flyway_schema_history (
    installed_rank integer NOT NULL,
    version character varying(50),
    description character varying(200) NOT NULL,
    type character varying(20) NOT NULL,
    script character varying(1000) NOT NULL,
    checksum integer,
    installed_by character varying(100) NOT NULL,
    installed_on timestamp without time zone DEFAULT now() NOT NULL,
    execution_time integer NOT NULL,
    success boolean NOT NULL
);


ALTER TABLE public.flyway_schema_history OWNER TO autowash;

--
-- Name: loyalty_accounts; Type: TABLE; Schema: public; Owner: autowash
--

CREATE TABLE public.loyalty_accounts (
    id uuid NOT NULL,
    customer_id uuid NOT NULL,
    current_points integer NOT NULL,
    tier character varying(20) NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.loyalty_accounts OWNER TO autowash;

--
-- Name: otp_audit_logs; Type: TABLE; Schema: public; Owner: autowash
--

CREATE TABLE public.otp_audit_logs (
    id uuid NOT NULL,
    user_id uuid,
    purpose character varying(50) NOT NULL,
    event_type character varying(50) NOT NULL,
    delivery_address character varying(255),
    attempt_count integer NOT NULL,
    request_ip character varying(64),
    user_agent character varying(500),
    device_fingerprint character varying(255),
    message character varying(500),
    created_at timestamp with time zone NOT NULL
);


ALTER TABLE public.otp_audit_logs OWNER TO autowash;

--
-- Name: otp_records; Type: TABLE; Schema: public; Owner: autowash
--

CREATE TABLE public.otp_records (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    purpose character varying(50) NOT NULL,
    code character varying(255) NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    attempts integer NOT NULL,
    verified boolean NOT NULL,
    created_at timestamp with time zone NOT NULL,
    delivery_address character varying(255) NOT NULL,
    invalidated_at timestamp with time zone,
    locked_at timestamp with time zone
);


ALTER TABLE public.otp_records OWNER TO autowash;

--
-- Name: point_transactions; Type: TABLE; Schema: public; Owner: autowash
--

CREATE TABLE public.point_transactions (
    id uuid NOT NULL,
    customer_id uuid NOT NULL,
    type character varying(30) NOT NULL,
    points integer NOT NULL,
    balance_after integer NOT NULL,
    reason character varying(255) NOT NULL,
    reference_id character varying(100),
    created_at timestamp with time zone NOT NULL
);


ALTER TABLE public.point_transactions OWNER TO autowash;

--
-- Name: promotions; Type: TABLE; Schema: public; Owner: autowash
--

CREATE TABLE public.promotions (
    id character varying(50) NOT NULL,
    name character varying(120) NOT NULL,
    description character varying(500),
    discount_type character varying(20) NOT NULL,
    discount_value integer NOT NULL,
    start_date timestamp with time zone NOT NULL,
    end_date timestamp with time zone NOT NULL,
    targeting_mode character varying(30) NOT NULL,
    applicable_tiers_csv character varying(100),
    max_usage_per_customer integer,
    status character varying(20) NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.promotions OWNER TO autowash;

--
-- Name: refresh_tokens; Type: TABLE; Schema: public; Owner: autowash
--

CREATE TABLE public.refresh_tokens (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    token character varying(255) NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    revoked_at timestamp with time zone,
    created_at timestamp with time zone NOT NULL
);


ALTER TABLE public.refresh_tokens OWNER TO autowash;

--
-- Name: service_addons; Type: TABLE; Schema: public; Owner: autowash
--

CREATE TABLE public.service_addons (
    id character varying(50) NOT NULL,
    name character varying(100) NOT NULL,
    description character varying(500),
    price bigint NOT NULL,
    duration_minutes integer NOT NULL,
    category character varying(30) NOT NULL,
    image_url character varying(255),
    applicable_packages_csv character varying(500),
    status character varying(20) NOT NULL
);


ALTER TABLE public.service_addons OWNER TO autowash;

--
-- Name: service_combos; Type: TABLE; Schema: public; Owner: autowash
--

CREATE TABLE public.service_combos (
    id character varying(50) NOT NULL,
    name character varying(100) NOT NULL,
    description character varying(500),
    base_price bigint NOT NULL,
    duration_days integer NOT NULL,
    max_services integer NOT NULL,
    benefits_csv character varying(1000),
    image_url character varying(255),
    is_active boolean NOT NULL,
    can_upgrade boolean NOT NULL,
    upgrade_price_from bigint NOT NULL
);


ALTER TABLE public.service_combos OWNER TO autowash;

--
-- Name: service_packages; Type: TABLE; Schema: public; Owner: autowash
--

CREATE TABLE public.service_packages (
    id character varying(50) NOT NULL,
    name character varying(100) NOT NULL,
    description character varying(500),
    base_price bigint NOT NULL,
    duration_minutes integer NOT NULL,
    category character varying(30) NOT NULL,
    features_csv character varying(1000),
    image_url character varying(255),
    status character varying(20) NOT NULL,
    popularity character varying(20) NOT NULL
);


ALTER TABLE public.service_packages OWNER TO autowash;

--
-- Name: vouchers; Type: TABLE; Schema: public; Owner: autowash
--

CREATE TABLE public.vouchers (
    code character varying(50) NOT NULL,
    discount_type character varying(20) NOT NULL,
    discount_value integer NOT NULL,
    min_amount bigint NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    active boolean NOT NULL,
    new_customer_only boolean NOT NULL,
    target_tiers_csv character varying(100)
);


ALTER TABLE public.vouchers OWNER TO autowash;

--
-- Name: wash_sessions; Type: TABLE; Schema: public; Owner: autowash
--

CREATE TABLE public.wash_sessions (
    id uuid NOT NULL,
    booking_id character varying(50) NOT NULL,
    status character varying(30) NOT NULL,
    notes character varying(500),
    fee_amount bigint,
    fee_currency character varying(10),
    projected_loyalty_points integer,
    awarded_loyalty_points integer,
    created_at timestamp with time zone NOT NULL,
    queued_at timestamp with time zone,
    checked_in_at timestamp with time zone,
    started_at timestamp with time zone,
    completed_at timestamp with time zone,
    assigned_staff_id uuid
);


ALTER TABLE public.wash_sessions OWNER TO autowash;

--
-- Data for Name: auth_google_tickets; Type: TABLE DATA; Schema: public; Owner: autowash
--

COPY public.auth_google_tickets (id, state, return_url, status, provider_subject, provider_email, provider_full_name, provider_avatar_url, user_id, expires_at, consumed_at, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: auth_users; Type: TABLE DATA; Schema: public; Owner: autowash
--

COPY public.auth_users (id, full_name, phone, email, password_hash, role, status, tier, is_new_customer, created_at, updated_at, language, theme, notifications_enabled, email_notifications, sms_notifications, auth_provider, oauth_subject, email_verified, avatar_url) FROM stdin;
c5c8f8e0-a8d0-4f51-b8d9-a47738b7e28b	Admin User	0987654321	admin@autowash.com	$2a$10$wPt1MGOmvrP1rGyMo3uiOuu0pwSutpIXRJ3csObnud8t06utM9/Ty	ADMIN	ACTIVE	MEMBER	f	2026-05-31 10:26:53.111493+07	2026-05-31 10:26:53.111493+07	VI	LIGHT	t	f	t	LOCAL	\N	f	\N
b5c8f8e0-a8d0-4f51-b8d9-a47738b7e28c	Staff User	0912345678	staff@autowash.com	$2a$10$wPt1MGOmvrP1rGyMo3uiOuu0pwSutpIXRJ3csObnud8t06utM9/Ty	STAFF	ACTIVE	MEMBER	f	2026-05-31 10:26:53.111493+07	2026-05-31 10:26:53.111493+07	VI	LIGHT	t	f	t	LOCAL	\N	f	\N
d5c8f8e0-a8d0-4f51-b8d9-a47738b7e28d	Customer Nguyen	0909111222	customer@gmail.com	$2a$10$wPt1MGOmvrP1rGyMo3uiOuu0pwSutpIXRJ3csObnud8t06utM9/Ty	CUSTOMER	ACTIVE	GOLD	f	2026-05-31 10:26:53.111493+07	2026-05-31 10:26:53.111493+07	VI	LIGHT	t	f	t	LOCAL	\N	f	\N
11c8f8e0-a8d0-4f51-b8d9-a47738b7e28e	John Doe	0901234567	johndoe@email.com	$2a$10$wPt1MGOmvrP1rGyMo3uiOuu0pwSutpIXRJ3csObnud8t06utM9/Ty	CUSTOMER	ACTIVE	MEMBER	t	2026-05-31 10:26:53.121067+07	2026-05-31 10:26:53.121067+07	VI	LIGHT	t	f	t	LOCAL	\N	f	\N
22c8f8e0-a8d0-4f51-b8d9-a47738b7e28e	Jane Smith	0907654321	janesmith@email.com	$2a$10$wPt1MGOmvrP1rGyMo3uiOuu0pwSutpIXRJ3csObnud8t06utM9/Ty	CUSTOMER	ACTIVE	SILVER	f	2026-05-31 10:26:53.121067+07	2026-05-31 10:26:53.121067+07	VI	LIGHT	t	f	t	LOCAL	\N	f	\N
33c8f8e0-a8d0-4f51-b8d9-a47738b7e28e	Bob Wilson	0905556666	bobw@email.com	$2a$10$wPt1MGOmvrP1rGyMo3uiOuu0pwSutpIXRJ3csObnud8t06utM9/Ty	CUSTOMER	ACTIVE	PLATINUM	f	2026-05-31 10:26:53.121067+07	2026-05-31 10:26:53.121067+07	VI	LIGHT	t	f	t	LOCAL	\N	f	\N
a1c8f8e0-a8d0-4f51-b8d9-a47738b7e28a	Hoang Le	0911223344	hoang@email.com	$2a$10$wPt1MGOmvrP1rGyMo3uiOuu0pwSutpIXRJ3csObnud8t06utM9/Ty	CUSTOMER	ACTIVE	MEMBER	f	2026-05-31 10:26:53.137408+07	2026-05-31 10:26:53.137408+07	VI	LIGHT	t	f	t	LOCAL	\N	f	\N
a2c8f8e0-a8d0-4f51-b8d9-a47738b7e28b	Tuan Tran	0922334455	tuan@email.com	$2a$10$wPt1MGOmvrP1rGyMo3uiOuu0pwSutpIXRJ3csObnud8t06utM9/Ty	CUSTOMER	ACTIVE	SILVER	f	2026-05-31 10:26:53.137408+07	2026-05-31 10:26:53.137408+07	VI	LIGHT	t	f	t	LOCAL	\N	f	\N
a3c8f8e0-a8d0-4f51-b8d9-a47738b7e28c	Mai Nguyen	0933445566	mai@email.com	$2a$10$wPt1MGOmvrP1rGyMo3uiOuu0pwSutpIXRJ3csObnud8t06utM9/Ty	CUSTOMER	ACTIVE	GOLD	f	2026-05-31 10:26:53.137408+07	2026-05-31 10:26:53.137408+07	VI	LIGHT	t	f	t	LOCAL	\N	f	\N
a4c8f8e0-a8d0-4f51-b8d9-a47738b7e28d	Linh Pham	0944556677	linh@email.com	$2a$10$wPt1MGOmvrP1rGyMo3uiOuu0pwSutpIXRJ3csObnud8t06utM9/Ty	CUSTOMER	ACTIVE	PLATINUM	f	2026-05-31 10:26:53.137408+07	2026-05-31 10:26:53.137408+07	VI	LIGHT	t	f	t	LOCAL	\N	f	\N
a5c8f8e0-a8d0-4f51-b8d9-a47738b7e28e	Duc Bui	0955667788	duc@email.com	$2a$10$wPt1MGOmvrP1rGyMo3uiOuu0pwSutpIXRJ3csObnud8t06utM9/Ty	CUSTOMER	ACTIVE	MEMBER	t	2026-05-31 10:26:53.137408+07	2026-05-31 10:26:53.137408+07	VI	LIGHT	t	f	t	LOCAL	\N	f	\N
a1111111-1111-1111-1111-111111111111	Linh Pham Staff	0911111111	staff.linh@autowash.com	$2a$10$wPt1MGOmvrP1rGyMo3uiOuu0pwSutpIXRJ3csObnud8t06utM9/Ty	STAFF	ACTIVE	MEMBER	f	2026-06-10 00:27:26.594295+07	2026-06-10 00:27:26.594295+07	VI	LIGHT	t	f	t	LOCAL	\N	f	\N
a2222222-2222-2222-2222-222222222222	Minh Tran Staff	0922222222	staff.minh@autowash.com	$2a$10$wPt1MGOmvrP1rGyMo3uiOuu0pwSutpIXRJ3csObnud8t06utM9/Ty	STAFF	ACTIVE	MEMBER	f	2026-06-10 00:27:26.594295+07	2026-06-10 00:27:26.594295+07	VI	LIGHT	t	f	t	LOCAL	\N	f	\N
\.


--
-- Data for Name: booking_addons; Type: TABLE DATA; Schema: public; Owner: autowash
--

COPY public.booking_addons (id, booking_id, addon_id, addon_name, addon_price) FROM stdin;
a5c8f8e0-a8d0-4f51-b8d9-a47738b7e28a	BK_1717000000001	addon_001	Interior Deep Clean	150000
a6c8f8e0-a8d0-4f51-b8d9-a47738b7e28a	BK_1717000000005	addon_002	Wax Coating	200000
21111111-1111-1111-1111-000000000201	BK_1716000000201	addon_003	Ozone Odor Removal	100000
21111111-1111-1111-1111-000000000203	BK_1716000000203	addon_004	Glass Polishing	150000
21111111-1111-1111-1111-000000000204	BK_1716000000204	addon_005	Tire Pressure Check	20000
\.


--
-- Data for Name: booking_otp_audit_logs; Type: TABLE DATA; Schema: public; Owner: autowash
--

COPY public.booking_otp_audit_logs (id, booking_id, event_type, attempt_count, delivery_email, request_ip, user_agent, message, created_at) FROM stdin;
\.


--
-- Data for Name: booking_otp_challenges; Type: TABLE DATA; Schema: public; Owner: autowash
--

COPY public.booking_otp_challenges (id, booking_id, code_hash, status, attempts, delivery_email, expires_at, sent_at, verified_at, invalidated_at, locked_at) FROM stdin;
\.


--
-- Data for Name: booking_staff_transfer_audits; Type: TABLE DATA; Schema: public; Owner: autowash
--

COPY public.booking_staff_transfer_audits (id, booking_id, wash_session_id, from_staff_id, to_staff_id, actor_id, reason, created_at) FROM stdin;
\.


--
-- Data for Name: customer_bookings; Type: TABLE DATA; Schema: public; Owner: autowash
--

COPY public.customer_bookings (id, customer_id, vehicle_id, package_id, combo_id, voucher_code, booking_date, booking_time, payment_method, payment_status, status, base_price, addons_total, voucher_discount, final_amount, estimated_duration_minutes, created_at, cancelled_at, refund_amount, refund_status, cancel_reason, points_redeemed, points_discount, assigned_staff_id, confirmation_status, confirmation_expires_at, confirmed_at) FROM stdin;
BK_1717000000001	d5c8f8e0-a8d0-4f51-b8d9-a47738b7e28d	f5c8f8e0-a8d0-4f51-b8d9-a47738b7e28f	pkg_001	\N	\N	2026-05-31	10:00:00	BANK_TRANSFER	PAID	COMPLETED	150000	0	0	150000	45	2026-05-31 10:26:53.111493+07	\N	\N	\N	\N	0	0	b5c8f8e0-a8d0-4f51-b8d9-a47738b7e28c	VERIFIED	\N	\N
BK_1717000000002	d5c8f8e0-a8d0-4f51-b8d9-a47738b7e28d	f5c8f8e0-a8d0-4f51-b8d9-a47738b7e28f	pkg_002	\N	WELCOME20	2026-06-01	14:30:00	E_WALLET	PENDING	PENDING	250000	50000	25000	275000	90	2026-05-31 10:26:53.111493+07	\N	\N	\N	\N	0	0	a1111111-1111-1111-1111-111111111111	PENDING	\N	\N
BK_1717000000006	11c8f8e0-a8d0-4f51-b8d9-a47738b7e28e	44c8f8e0-a8d0-4f51-b8d9-a47738b7e28f	pkg_001	\N	\N	2026-06-01	15:00:00	CASH_AT_COUNTER	PENDING	PENDING	150000	0	0	150000	30	2026-05-31 10:26:53.121067+07	\N	\N	\N	\N	0	0	a1111111-1111-1111-1111-111111111111	PENDING	\N	\N
BK_1717000000003	11c8f8e0-a8d0-4f51-b8d9-a47738b7e28e	44c8f8e0-a8d0-4f51-b8d9-a47738b7e28f	pkg_002	\N	\N	2026-05-29	09:00:00	BANK_TRANSFER	PAID	COMPLETED	350000	0	0	350000	60	2026-05-29 10:26:53.121067+07	\N	\N	\N	\N	0	0	a2222222-2222-2222-2222-222222222222	VERIFIED	\N	\N
BK_1717000000007	22c8f8e0-a8d0-4f51-b8d9-a47738b7e28e	55c8f8e0-a8d0-4f51-b8d9-a47738b7e28f	pkg_002	\N	\N	2026-05-26	08:00:00	CASH_AT_COUNTER	PAID	COMPLETED	350000	0	0	350000	60	2026-05-26 10:26:53.121067+07	\N	\N	\N	\N	0	0	a2222222-2222-2222-2222-222222222222	VERIFIED	\N	\N
BK_1717000000004	22c8f8e0-a8d0-4f51-b8d9-a47738b7e28e	55c8f8e0-a8d0-4f51-b8d9-a47738b7e28f	pkg_001	\N	\N	2026-05-30	14:30:00	E_WALLET	REFUNDED	CANCELLED	150000	0	15000	135000	30	2026-05-30 10:26:53.121067+07	2026-05-31 10:26:53.121067+07	\N	\N	Changed mind	0	0	a1111111-1111-1111-1111-111111111111	CANCELLED	\N	\N
BK_1716000000101	d5c8f8e0-a8d0-4f51-b8d9-a47738b7e28d	f5c8f8e0-a8d0-4f51-b8d9-a47738b7e28f	pkg_001	\N	\N	2026-04-01	09:00:00	BANK_TRANSFER	PAID	COMPLETED	150000	0	0	150000	45	2026-04-01 10:26:53.129239+07	\N	\N	\N	\N	0	0	b5c8f8e0-a8d0-4f51-b8d9-a47738b7e28c	VERIFIED	\N	\N
BK_1716000000102	11c8f8e0-a8d0-4f51-b8d9-a47738b7e28e	44c8f8e0-a8d0-4f51-b8d9-a47738b7e28f	pkg_002	\N	\N	2026-04-06	10:30:00	E_WALLET	PAID	COMPLETED	350000	0	0	350000	60	2026-04-06 10:26:53.129239+07	\N	\N	\N	\N	0	0	b5c8f8e0-a8d0-4f51-b8d9-a47738b7e28c	VERIFIED	\N	\N
BK_1716000000103	22c8f8e0-a8d0-4f51-b8d9-a47738b7e28e	55c8f8e0-a8d0-4f51-b8d9-a47738b7e28f	pkg_001	\N	\N	2026-04-11	14:00:00	BANK_TRANSFER	REFUNDED	CANCELLED	150000	0	0	150000	45	2026-04-11 10:26:53.129239+07	2026-04-12 10:26:53.129239+07	\N	\N	Bận việc đột xuất	0	0	b5c8f8e0-a8d0-4f51-b8d9-a47738b7e28c	CANCELLED	\N	\N
BK_1716000000104	33c8f8e0-a8d0-4f51-b8d9-a47738b7e28e	66c8f8e0-a8d0-4f51-b8d9-a47738b7e28f	pkg_002	\N	\N	2026-04-16	15:30:00	CASH_AT_COUNTER	PAID	COMPLETED	350000	0	0	350000	60	2026-04-16 10:26:53.129239+07	\N	\N	\N	\N	0	0	b5c8f8e0-a8d0-4f51-b8d9-a47738b7e28c	VERIFIED	\N	\N
BK_1716000000105	d5c8f8e0-a8d0-4f51-b8d9-a47738b7e28d	f5c8f8e0-a8d0-4f51-b8d9-a47738b7e28f	pkg_001	\N	\N	2026-04-21	08:00:00	E_WALLET	PAID	COMPLETED	150000	0	0	150000	45	2026-04-21 10:26:53.129239+07	\N	\N	\N	\N	0	0	b5c8f8e0-a8d0-4f51-b8d9-a47738b7e28c	VERIFIED	\N	\N
BK_1716000000106	11c8f8e0-a8d0-4f51-b8d9-a47738b7e28e	44c8f8e0-a8d0-4f51-b8d9-a47738b7e28f	pkg_002	\N	\N	2026-04-26	16:00:00	CASH_AT_COUNTER	PENDING	CANCELLED	350000	0	0	350000	60	2026-04-26 10:26:53.129239+07	2026-04-27 10:26:53.129239+07	\N	\N	Không còn nhu cầu	0	0	b5c8f8e0-a8d0-4f51-b8d9-a47738b7e28c	CANCELLED	\N	\N
BK_1716000000107	22c8f8e0-a8d0-4f51-b8d9-a47738b7e28e	55c8f8e0-a8d0-4f51-b8d9-a47738b7e28f	pkg_001	\N	\N	2026-05-01	09:30:00	BANK_TRANSFER	PAID	COMPLETED	150000	0	0	150000	45	2026-05-01 10:26:53.129239+07	\N	\N	\N	\N	0	0	b5c8f8e0-a8d0-4f51-b8d9-a47738b7e28c	VERIFIED	\N	\N
BK_1716000000108	33c8f8e0-a8d0-4f51-b8d9-a47738b7e28e	66c8f8e0-a8d0-4f51-b8d9-a47738b7e28f	pkg_002	\N	\N	2026-05-03	11:00:00	E_WALLET	PAID	COMPLETED	350000	0	0	350000	60	2026-05-03 10:26:53.129239+07	\N	\N	\N	\N	0	0	b5c8f8e0-a8d0-4f51-b8d9-a47738b7e28c	VERIFIED	\N	\N
BK_1716000000109	d5c8f8e0-a8d0-4f51-b8d9-a47738b7e28d	f5c8f8e0-a8d0-4f51-b8d9-a47738b7e28f	pkg_001	\N	\N	2026-05-06	13:30:00	CASH_AT_COUNTER	PAID	COMPLETED	150000	0	0	150000	45	2026-05-06 10:26:53.129239+07	\N	\N	\N	\N	0	0	b5c8f8e0-a8d0-4f51-b8d9-a47738b7e28c	VERIFIED	\N	\N
BK_1716000000110	11c8f8e0-a8d0-4f51-b8d9-a47738b7e28e	44c8f8e0-a8d0-4f51-b8d9-a47738b7e28f	pkg_002	\N	\N	2026-05-11	15:00:00	BANK_TRANSFER	REFUNDED	CANCELLED	350000	0	0	350000	60	2026-05-11 10:26:53.129239+07	2026-05-11 10:26:53.129239+07	\N	\N	Thay đổi lịch trình	0	0	b5c8f8e0-a8d0-4f51-b8d9-a47738b7e28c	CANCELLED	\N	\N
BK_1716000000111	22c8f8e0-a8d0-4f51-b8d9-a47738b7e28e	55c8f8e0-a8d0-4f51-b8d9-a47738b7e28f	pkg_001	\N	\N	2026-05-13	10:00:00	E_WALLET	PAID	COMPLETED	150000	0	0	150000	45	2026-05-13 10:26:53.129239+07	\N	\N	\N	\N	0	0	b5c8f8e0-a8d0-4f51-b8d9-a47738b7e28c	VERIFIED	\N	\N
BK_1716000000112	33c8f8e0-a8d0-4f51-b8d9-a47738b7e28e	66c8f8e0-a8d0-4f51-b8d9-a47738b7e28f	pkg_002	\N	\N	2026-05-16	14:30:00	CASH_AT_COUNTER	PAID	COMPLETED	350000	0	0	350000	60	2026-05-16 10:26:53.129239+07	\N	\N	\N	\N	0	0	b5c8f8e0-a8d0-4f51-b8d9-a47738b7e28c	VERIFIED	\N	\N
BK_1716000000113	d5c8f8e0-a8d0-4f51-b8d9-a47738b7e28d	f5c8f8e0-a8d0-4f51-b8d9-a47738b7e28f	pkg_001	\N	\N	2026-05-19	09:00:00	BANK_TRANSFER	PAID	COMPLETED	150000	0	0	150000	45	2026-05-19 10:26:53.129239+07	\N	\N	\N	\N	0	0	b5c8f8e0-a8d0-4f51-b8d9-a47738b7e28c	VERIFIED	\N	\N
BK_1716000000114	11c8f8e0-a8d0-4f51-b8d9-a47738b7e28e	44c8f8e0-a8d0-4f51-b8d9-a47738b7e28f	pkg_002	\N	\N	2026-05-21	16:30:00	E_WALLET	PENDING	CANCELLED	350000	0	0	350000	60	2026-05-21 10:26:53.129239+07	2026-05-22 10:26:53.129239+07	\N	\N	Xe bị hỏng	0	0	b5c8f8e0-a8d0-4f51-b8d9-a47738b7e28c	CANCELLED	\N	\N
BK_1716000000115	22c8f8e0-a8d0-4f51-b8d9-a47738b7e28e	55c8f8e0-a8d0-4f51-b8d9-a47738b7e28f	pkg_001	\N	\N	2026-05-23	11:30:00	CASH_AT_COUNTER	PAID	COMPLETED	150000	0	0	150000	45	2026-05-23 10:26:53.129239+07	\N	\N	\N	\N	0	0	b5c8f8e0-a8d0-4f51-b8d9-a47738b7e28c	VERIFIED	\N	\N
BK_1716000000116	33c8f8e0-a8d0-4f51-b8d9-a47738b7e28e	66c8f8e0-a8d0-4f51-b8d9-a47738b7e28f	pkg_002	\N	\N	2026-05-24	13:00:00	BANK_TRANSFER	PAID	COMPLETED	350000	0	0	350000	60	2026-05-24 10:26:53.129239+07	\N	\N	\N	\N	0	0	b5c8f8e0-a8d0-4f51-b8d9-a47738b7e28c	VERIFIED	\N	\N
BK_1716000000117	d5c8f8e0-a8d0-4f51-b8d9-a47738b7e28d	f5c8f8e0-a8d0-4f51-b8d9-a47738b7e28f	pkg_001	\N	\N	2026-05-26	08:30:00	E_WALLET	PAID	COMPLETED	150000	0	0	150000	45	2026-05-26 10:26:53.129239+07	\N	\N	\N	\N	0	0	b5c8f8e0-a8d0-4f51-b8d9-a47738b7e28c	VERIFIED	\N	\N
BK_1716000000118	11c8f8e0-a8d0-4f51-b8d9-a47738b7e28e	44c8f8e0-a8d0-4f51-b8d9-a47738b7e28f	pkg_002	\N	\N	2026-05-27	10:00:00	CASH_AT_COUNTER	PENDING	CANCELLED	350000	0	0	350000	60	2026-05-27 10:26:53.129239+07	2026-05-27 10:26:53.129239+07	\N	\N	Trời mưa không muốn rửa xe	0	0	b5c8f8e0-a8d0-4f51-b8d9-a47738b7e28c	CANCELLED	\N	\N
BK_1716000000119	22c8f8e0-a8d0-4f51-b8d9-a47738b7e28e	55c8f8e0-a8d0-4f51-b8d9-a47738b7e28f	pkg_001	\N	\N	2026-05-28	14:00:00	BANK_TRANSFER	PAID	COMPLETED	150000	0	0	150000	45	2026-05-28 10:26:53.129239+07	\N	\N	\N	\N	0	0	b5c8f8e0-a8d0-4f51-b8d9-a47738b7e28c	VERIFIED	\N	\N
BK_1716000000120	33c8f8e0-a8d0-4f51-b8d9-a47738b7e28e	66c8f8e0-a8d0-4f51-b8d9-a47738b7e28f	pkg_002	\N	\N	2026-05-29	15:30:00	E_WALLET	PAID	COMPLETED	350000	0	0	350000	60	2026-05-29 10:26:53.129239+07	\N	\N	\N	\N	0	0	b5c8f8e0-a8d0-4f51-b8d9-a47738b7e28c	VERIFIED	\N	\N
BK_1716000000201	a1c8f8e0-a8d0-4f51-b8d9-a47738b7e28a	b1c8f8e0-a8d0-4f51-b8d9-a47738b7e28a	pkg_003	\N	DISCOUNT50K	2026-05-21	10:00:00	E_WALLET	PAID	COMPLETED	200000	100000	50000	250000	65	2026-05-21 10:26:53.137408+07	\N	\N	\N	\N	0	0	b5c8f8e0-a8d0-4f51-b8d9-a47738b7e28c	VERIFIED	\N	\N
BK_1716000000202	a2c8f8e0-a8d0-4f51-b8d9-a47738b7e28b	b2c8f8e0-a8d0-4f51-b8d9-a47738b7e28b	\N	combo_003	\N	2026-05-26	14:30:00	BANK_TRANSFER	PAID	COMPLETED	2000000	0	0	2000000	120	2026-05-26 10:26:53.137408+07	\N	\N	\N	\N	0	0	b5c8f8e0-a8d0-4f51-b8d9-a47738b7e28c	VERIFIED	\N	\N
BK_1716000000203	a3c8f8e0-a8d0-4f51-b8d9-a47738b7e28c	b3c8f8e0-a8d0-4f51-b8d9-a47738b7e28c	pkg_004	\N	SUMMER30	2026-05-29	09:00:00	CASH_AT_COUNTER	PAID	COMPLETED	800000	150000	285000	665000	150	2026-05-29 10:26:53.137408+07	\N	\N	\N	\N	0	0	b5c8f8e0-a8d0-4f51-b8d9-a47738b7e28c	VERIFIED	\N	\N
BK_1716000000204	a4c8f8e0-a8d0-4f51-b8d9-a47738b7e28d	b4c8f8e0-a8d0-4f51-b8d9-a47738b7e28d	pkg_003	\N	\N	2026-06-01	15:30:00	E_WALLET	PENDING	CONFIRMED	200000	20000	0	220000	50	2026-05-31 10:26:53.137408+07	\N	\N	\N	\N	0	0	b5c8f8e0-a8d0-4f51-b8d9-a47738b7e28c	VERIFIED	\N	\N
BK_1716000000205	a5c8f8e0-a8d0-4f51-b8d9-a47738b7e28e	b5c8f8e0-a8d0-4f51-b8d9-a47738b7e28e	pkg_001	\N	\N	2026-05-30	08:00:00	BANK_TRANSFER	REFUNDED	CANCELLED	150000	0	0	150000	30	2026-05-30 10:26:53.137408+07	2026-05-31 10:26:53.137408+07	\N	\N	Not available	0	0	b5c8f8e0-a8d0-4f51-b8d9-a47738b7e28c	CANCELLED	\N	\N
BK_1780198659549	d5c8f8e0-a8d0-4f51-b8d9-a47738b7e28d	f5c8f8e0-a8d0-4f51-b8d9-a47738b7e28f	\N	combo_003	\N	2026-06-01	14:00:00	E_WALLET	CONFIRMED	CONFIRMED	2000000	0	0	2000000	0	2026-05-31 10:37:39.549039+07	\N	\N	\N	\N	0	0	b5c8f8e0-a8d0-4f51-b8d9-a47738b7e28c	VERIFIED	\N	\N
BK_1717000000005	33c8f8e0-a8d0-4f51-b8d9-a47738b7e28e	66c8f8e0-a8d0-4f51-b8d9-a47738b7e28f	pkg_002	\N	\N	2026-05-31	11:00:00	BANK_TRANSFER	PAID	COMPLETED	350000	200000	0	550000	75	2026-05-31 10:26:53.121067+07	\N	\N	\N	\N	0	0	b5c8f8e0-a8d0-4f51-b8d9-a47738b7e28c	VERIFIED	\N	\N
\.


--
-- Data for Name: customer_combo_usages; Type: TABLE DATA; Schema: public; Owner: autowash
--

COPY public.customer_combo_usages (id, customer_combo_id, booking_id, used_at, service_date, created_at) FROM stdin;
\.


--
-- Data for Name: customer_combos; Type: TABLE DATA; Schema: public; Owner: autowash
--

COPY public.customer_combos (id, customer_id, combo_id, purchase_booking_id, status, total_usages, remaining_usages, activated_at, expires_at, last_used_at, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: customer_vehicles; Type: TABLE DATA; Schema: public; Owner: autowash
--

COPY public.customer_vehicles (id, owner_user_id, plate, type, brand, model, vehicle_year, color, status, is_primary, created_at, updated_at, deleted_at) FROM stdin;
f5c8f8e0-a8d0-4f51-b8d9-a47738b7e28f	d5c8f8e0-a8d0-4f51-b8d9-a47738b7e28d	51G-12345	CAR	Toyota	Camry	2023	Black	ACTIVE	t	2026-05-31 10:26:53.111493+07	2026-05-31 10:26:53.111493+07	\N
44c8f8e0-a8d0-4f51-b8d9-a47738b7e28f	11c8f8e0-a8d0-4f51-b8d9-a47738b7e28e	29A-11111	SUV	Honda	CR-V	2021	White	ACTIVE	t	2026-05-31 10:26:53.121067+07	2026-05-31 10:26:53.121067+07	\N
55c8f8e0-a8d0-4f51-b8d9-a47738b7e28f	22c8f8e0-a8d0-4f51-b8d9-a47738b7e28e	51H-22222	CAR	Mazda	3	2022	Red	ACTIVE	t	2026-05-31 10:26:53.121067+07	2026-05-31 10:26:53.121067+07	\N
66c8f8e0-a8d0-4f51-b8d9-a47738b7e28f	33c8f8e0-a8d0-4f51-b8d9-a47738b7e28e	60A-33333	TRUCK	Ford	Ranger	2020	Blue	ACTIVE	t	2026-05-31 10:26:53.121067+07	2026-05-31 10:26:53.121067+07	\N
b1c8f8e0-a8d0-4f51-b8d9-a47738b7e28a	a1c8f8e0-a8d0-4f51-b8d9-a47738b7e28a	29B-12345	CAR	Kia	Morning	2019	Yellow	ACTIVE	t	2026-05-31 10:26:53.137408+07	2026-05-31 10:26:53.137408+07	\N
b2c8f8e0-a8d0-4f51-b8d9-a47738b7e28b	a2c8f8e0-a8d0-4f51-b8d9-a47738b7e28b	51C-54321	SUV	Toyota	Fortuner	2020	Silver	ACTIVE	t	2026-05-31 10:26:53.137408+07	2026-05-31 10:26:53.137408+07	\N
b3c8f8e0-a8d0-4f51-b8d9-a47738b7e28c	a3c8f8e0-a8d0-4f51-b8d9-a47738b7e28c	60D-99887	CAR	Mercedes	C200	2023	Black	ACTIVE	t	2026-05-31 10:26:53.137408+07	2026-05-31 10:26:53.137408+07	\N
b4c8f8e0-a8d0-4f51-b8d9-a47738b7e28d	a4c8f8e0-a8d0-4f51-b8d9-a47738b7e28d	51F-77665	SUV	BMW	X5	2022	White	ACTIVE	t	2026-05-31 10:26:53.137408+07	2026-05-31 10:26:53.137408+07	\N
b5c8f8e0-a8d0-4f51-b8d9-a47738b7e28e	a5c8f8e0-a8d0-4f51-b8d9-a47738b7e28e	30G-33221	CAR	Hyundai	Accent	2021	Red	ACTIVE	t	2026-05-31 10:26:53.137408+07	2026-05-31 10:26:53.137408+07	\N
\.


--
-- Data for Name: flyway_schema_history; Type: TABLE DATA; Schema: public; Owner: autowash
--

COPY public.flyway_schema_history (installed_rank, version, description, type, script, checksum, installed_by, installed_on, execution_time, success) FROM stdin;
2	2	add user preferences to auth users	SQL	V2__add_user_preferences_to_auth_users.sql	-213957433	postgres	2026-05-31 10:26:53.043061	2	t
3	3	create customer vehicles	SQL	V3__create_customer_vehicles.sql	-1125861585	postgres	2026-05-31 10:26:53.051199	3	t
4	4	create catalog and bookings	SQL	V4__create_catalog_and_bookings.sql	23899934	postgres	2026-05-31 10:26:53.059112	14	t
5	5	create wash sessions	SQL	V5__create_wash_sessions.sql	-1638011917	postgres	2026-05-31 10:26:53.078535	4	t
6	6	add voucher tier targeting	SQL	V6__add_voucher_tier_targeting.sql	1090365835	postgres	2026-05-31 10:26:53.085591	2	t
7	7	create loyalty tables	SQL	V7__create_loyalty_tables.sql	-955923253	postgres	2026-05-31 10:26:53.090865	8	t
8	8	create promotions	SQL	V8__create_promotions.sql	576844940	postgres	2026-05-31 10:26:53.102426	4	t
9	9	seed demo data	SQL	V9__seed_demo_data.sql	-920295571	postgres	2026-05-31 10:26:53.109495	6	t
10	10	seed more demo data	SQL	V10__seed_more_demo_data.sql	-2014485114	postgres	2026-05-31 10:26:53.118812	2	t
11	11	seed 20 past bookings	SQL	V11__seed_20_past_bookings.sql	1706640563	postgres	2026-05-31 10:26:53.125481	3	t
12	12	seed additional mock data	SQL	V12__seed_additional_mock_data.sql	-301713516	postgres	2026-05-31 10:26:53.134119	7	t
1	1	create auth tables	SQL	V1__create_auth_tables.sql	63860444	postgres	2026-05-31 10:26:53.019569	10	t
13	13	add assigned staff to wash sessions	SQL	V13__add_assigned_staff_to_wash_sessions.sql	-237242644	autowash	2026-06-10 00:27:26.475726	38	t
14	14	add booking points redemption	SQL	V14__add_booking_points_redemption.sql	1503830034	autowash	2026-06-10 00:27:26.526432	4	t
15	15	seed customer loyalty demo data	SQL	V15__seed_customer_loyalty_demo_data.sql	2029044721	autowash	2026-06-10 00:27:26.534359	12	t
16	16	add google auth fields	SQL	V16__add_google_auth_fields.sql	25655564	autowash	2026-06-10 00:27:26.55512	6	t
17	17	create customer combos	SQL	V17__create_customer_combos.sql	1707482432	autowash	2026-06-10 00:27:26.565569	4	t
18	18	seed more customer home combos	SQL	V18__seed_more_customer_home_combos.sql	-995654785	autowash	2026-06-10 00:27:26.573756	2	t
19	19	staff booking assignment and transfer audit	SQL	V19__staff_booking_assignment_and_transfer_audit.sql	1212155259	autowash	2026-06-10 00:27:26.579499	9	t
20	20	seed staff assignment demo data	SQL	V20__seed_staff_assignment_demo_data.sql	514466055	autowash	2026-06-10 00:27:26.591782	4	t
21	21	allow direct customer combo purchases	SQL	V21__allow_direct_customer_combo_purchases.sql	-369689311	autowash	2026-06-10 00:27:26.599428	3	t
22	22	email registration otp audit	SQL	V22__email_registration_otp_audit.sql	-156716606	autowash	2026-06-10 00:27:26.604963	7	t
23	23	booking otp confirmation	SQL	V23__booking_otp_confirmation.sql	-761585619	autowash	2026-06-10 00:27:26.615806	11	t
\.


--
-- Data for Name: loyalty_accounts; Type: TABLE DATA; Schema: public; Owner: autowash
--

COPY public.loyalty_accounts (id, customer_id, current_points, tier, created_at, updated_at) FROM stdin;
41111111-1111-1111-1111-000000000201	a1c8f8e0-a8d0-4f51-b8d9-a47738b7e28a	25	MEMBER	2026-05-21 10:26:53.137408+07	2026-05-21 10:26:53.137408+07
41111111-1111-1111-1111-000000000202	a2c8f8e0-a8d0-4f51-b8d9-a47738b7e28b	200	SILVER	2026-05-26 10:26:53.137408+07	2026-05-26 10:26:53.137408+07
41111111-1111-1111-1111-000000000203	a3c8f8e0-a8d0-4f51-b8d9-a47738b7e28c	66	GOLD	2026-05-29 10:26:53.137408+07	2026-05-29 10:26:53.137408+07
dee89d99-219a-4db0-9fd2-4bbca8554674	33c8f8e0-a8d0-4f51-b8d9-a47738b7e28e	55	MEMBER	2026-05-31 10:40:19.618329+07	2026-05-31 10:40:19.622334+07
61111111-1111-1111-1111-000000000100	d5c8f8e0-a8d0-4f51-b8d9-a47738b7e28d	1780	GOLD	2026-04-01 00:27:26.540966+07	2026-06-10 00:27:26.540966+07
\.


--
-- Data for Name: otp_audit_logs; Type: TABLE DATA; Schema: public; Owner: autowash
--

COPY public.otp_audit_logs (id, user_id, purpose, event_type, delivery_address, attempt_count, request_ip, user_agent, device_fingerprint, message, created_at) FROM stdin;
\.


--
-- Data for Name: otp_records; Type: TABLE DATA; Schema: public; Owner: autowash
--

COPY public.otp_records (id, user_id, purpose, code, expires_at, attempts, verified, created_at, delivery_address, invalidated_at, locked_at) FROM stdin;
\.


--
-- Data for Name: point_transactions; Type: TABLE DATA; Schema: public; Owner: autowash
--

COPY public.point_transactions (id, customer_id, type, points, balance_after, reason, reference_id, created_at) FROM stdin;
51111111-1111-1111-1111-000000000201	a1c8f8e0-a8d0-4f51-b8d9-a47738b7e28a	EARN	25	25	Wash completed	31111111-1111-1111-1111-000000000201	2026-05-21 10:26:53.137408+07
51111111-1111-1111-1111-000000000202	a2c8f8e0-a8d0-4f51-b8d9-a47738b7e28b	EARN	200	200	Wash completed	31111111-1111-1111-1111-000000000202	2026-05-26 10:26:53.137408+07
51111111-1111-1111-1111-000000000203	a3c8f8e0-a8d0-4f51-b8d9-a47738b7e28c	EARN	66	66	Wash completed	31111111-1111-1111-1111-000000000203	2026-05-29 10:26:53.137408+07
3fc72674-6840-4950-a471-4a2e1da168b0	33c8f8e0-a8d0-4f51-b8d9-a47738b7e28e	EARN	55	55	Wash completed	88c8f8e0-a8d0-4f51-b8d9-a47738b7e28f	2026-05-31 10:40:19.622334+07
61111111-1111-1111-1111-000000000101	d5c8f8e0-a8d0-4f51-b8d9-a47738b7e28d	EARN	300	300	Wash completed	61111111-1111-1111-1111-000000000001	2026-04-01 00:27:26.540966+07
61111111-1111-1111-1111-000000000102	d5c8f8e0-a8d0-4f51-b8d9-a47738b7e28d	EARN	250	550	Wash completed	11111111-1111-1111-1111-000000000101	2026-04-11 00:27:26.540966+07
61111111-1111-1111-1111-000000000103	d5c8f8e0-a8d0-4f51-b8d9-a47738b7e28d	EARN	320	870	Wash completed	11111111-1111-1111-1111-000000000105	2026-05-01 00:27:26.540966+07
61111111-1111-1111-1111-000000000104	d5c8f8e0-a8d0-4f51-b8d9-a47738b7e28d	EARN	330	1200	Wash completed	11111111-1111-1111-1111-000000000109	2026-05-16 00:27:26.540966+07
61111111-1111-1111-1111-000000000105	d5c8f8e0-a8d0-4f51-b8d9-a47738b7e28d	EARN	350	1550	Wash completed	11111111-1111-1111-1111-000000000113	2026-05-29 00:27:26.540966+07
61111111-1111-1111-1111-000000000106	d5c8f8e0-a8d0-4f51-b8d9-a47738b7e28d	EARN	380	1930	Wash completed	11111111-1111-1111-1111-000000000117	2026-06-05 00:27:26.540966+07
61111111-1111-1111-1111-000000000107	d5c8f8e0-a8d0-4f51-b8d9-a47738b7e28d	REDEEM	-150	1780	Points redeemed	loyalty-voucher:gold-150	2026-06-09 00:27:26.540966+07
\.


--
-- Data for Name: promotions; Type: TABLE DATA; Schema: public; Owner: autowash
--

COPY public.promotions (id, name, description, discount_type, discount_value, start_date, end_date, targeting_mode, applicable_tiers_csv, max_usage_per_customer, status, created_at, updated_at) FROM stdin;
promo_welcome20	WELCOME20	20% welcome promotion for member tier	PERCENT	20	2026-01-01 07:00:00+07	2027-01-01 06:59:59+07	SELECTED_TIERS	MEMBER	1	ACTIVE	2026-05-31 10:26:53.104038+07	2026-05-31 10:26:53.104038+07
promo_gold15	GOLD15	15% off for Gold and Platinum members	PERCENT	15	2026-01-01 07:00:00+07	2027-01-01 06:59:59+07	SELECTED_TIERS	GOLD,PLATINUM	\N	ACTIVE	2026-05-31 10:26:53.104038+07	2026-05-31 10:26:53.104038+07
promo_old10	OLD10	Expired promotion fixture	PERCENT	10	2025-01-01 07:00:00+07	2026-01-01 06:59:59+07	ALL_TIERS	\N	\N	INACTIVE	2026-05-31 10:26:53.104038+07	2026-05-31 14:35:35.916166+07
promo_all10	ALL10	\N	PERCENT	10	2026-01-01 07:00:00+07	2027-01-01 06:59:00+07	ALL_TIERS	\N	\N	INACTIVE	2026-05-31 10:26:53.104038+07	2026-06-01 20:22:26.288513+07
promo_a1c4878152894bc0bdedf041b3844333	HUYGIAUVL	\N	PERCENT	100	2026-05-31 14:04:00+07	2026-06-01 21:30:00+07	ALL_TIERS	\N	10	ACTIVE	2026-05-31 14:06:35.596229+07	2026-06-01 20:59:55.320282+07
\.


--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: public; Owner: autowash
--

COPY public.refresh_tokens (id, user_id, token, expires_at, revoked_at, created_at) FROM stdin;
7148a79c-f5e9-44de-ae5d-fb95185c473b	c5c8f8e0-a8d0-4f51-b8d9-a47738b7e28b	9d7499fb-c6ca-4f95-b256-86c1aa3aa02d	2026-06-30 10:28:48.152035+07	\N	2026-05-31 10:28:48.152035+07
bd7b8a74-bb3d-4486-9c1f-b94e6b3cbc2e	c5c8f8e0-a8d0-4f51-b8d9-a47738b7e28b	82327fb6-fe6a-4b40-88f3-71c7403a3e92	2026-06-30 10:32:36.626468+07	\N	2026-05-31 10:32:36.626468+07
9d874f82-b974-4ff1-b4b3-d717afd15856	d5c8f8e0-a8d0-4f51-b8d9-a47738b7e28d	290827d6-ddd5-4441-be99-4201266955fa	2026-06-30 10:36:47.335677+07	2026-05-31 10:38:05.578072+07	2026-05-31 10:36:47.335677+07
e3e5e9b9-b2b6-4e7e-913d-9d79214cf986	b5c8f8e0-a8d0-4f51-b8d9-a47738b7e28c	8a834ec1-2dec-4528-b6c2-11061763ab55	2026-06-30 10:38:14.96378+07	\N	2026-05-31 10:38:14.96378+07
a7e6a7fe-9592-449d-8984-5ba5e36bb93f	c5c8f8e0-a8d0-4f51-b8d9-a47738b7e28b	f3039144-9bf7-4a57-8c74-e1cac02a3b40	2026-06-30 10:40:44.266386+07	\N	2026-05-31 10:40:44.266386+07
2680ebf2-d309-4b44-8624-ac0a75fdddb7	c5c8f8e0-a8d0-4f51-b8d9-a47738b7e28b	2a81a713-eee4-4adc-8089-9805d1f158fa	2026-06-30 12:09:54.953376+07	\N	2026-05-31 12:09:54.953376+07
787da509-65f7-45e3-af85-93fa9c7c7e4d	c5c8f8e0-a8d0-4f51-b8d9-a47738b7e28b	e9bc7639-cb81-4101-b550-4d9bbc47806a	2026-06-30 12:10:14.645955+07	\N	2026-05-31 12:10:14.645955+07
7f3a6766-1189-4df1-9367-1985d7ba902c	c5c8f8e0-a8d0-4f51-b8d9-a47738b7e28b	22204efb-aea0-4fe2-b776-43ff58439d5c	2026-06-30 12:10:14.987558+07	\N	2026-05-31 12:10:14.987558+07
cb420a9e-ab7d-441c-ae84-d2de19ac1bed	c5c8f8e0-a8d0-4f51-b8d9-a47738b7e28b	75c99fdb-6349-43ab-8483-95d6e1449183	2026-06-30 12:10:37.741514+07	\N	2026-05-31 12:10:37.741514+07
932c7f1c-09c9-4fc8-b7d7-8255e58279a3	c5c8f8e0-a8d0-4f51-b8d9-a47738b7e28b	d3b0f0a0-7641-4d08-9354-22ad46cf5017	2026-06-30 13:57:05.240561+07	\N	2026-05-31 13:57:05.240561+07
d8e02792-8bb4-464e-b5bd-05d30a0e3985	c5c8f8e0-a8d0-4f51-b8d9-a47738b7e28b	ede58967-7266-4d3f-baf7-dabd89fa14c0	2026-06-30 14:01:47.671118+07	\N	2026-05-31 14:01:47.671118+07
32e81b51-e2de-4d2d-9309-1be20cbbd675	c5c8f8e0-a8d0-4f51-b8d9-a47738b7e28b	e9a970bc-327b-4030-98c7-2fcf2f9bf3a9	2026-06-30 15:08:19.677327+07	\N	2026-05-31 15:08:19.677327+07
01a3e8e2-81e0-447b-bfa1-904bf42dfefc	c5c8f8e0-a8d0-4f51-b8d9-a47738b7e28b	f30b7bb8-c7c7-4e8e-841f-49076d5d1c74	2026-07-01 19:33:28.974208+07	\N	2026-06-01 19:33:28.974208+07
47d25536-1909-47ca-b097-6adaf1143bd6	c5c8f8e0-a8d0-4f51-b8d9-a47738b7e28b	cf119f05-865c-48a6-8144-a8252383ee2b	2026-07-01 19:33:48.664807+07	\N	2026-06-01 19:33:48.664807+07
90152a31-51df-4e46-9314-89c902abd2a7	c5c8f8e0-a8d0-4f51-b8d9-a47738b7e28b	0ca07381-b433-4c2d-9b17-0cfa62491ed6	2026-07-01 20:58:37.870072+07	\N	2026-06-01 20:58:37.870072+07
39762349-e550-479f-9324-1cbf260b4100	c5c8f8e0-a8d0-4f51-b8d9-a47738b7e28b	d96c94ba-4d74-492c-a626-412143faf241	2026-07-07 12:13:36.474521+07	\N	2026-06-07 12:13:36.474521+07
b6da1535-65b4-418c-b714-16983baddc6d	c5c8f8e0-a8d0-4f51-b8d9-a47738b7e28b	7698bdbd-a2be-41d6-8111-2f308bcdca4f	2026-07-07 13:26:23.927318+07	\N	2026-06-07 13:26:23.927318+07
46641e99-109e-4c10-aa77-6fd1ced758ca	c5c8f8e0-a8d0-4f51-b8d9-a47738b7e28b	025b05ae-c831-4e95-bfe6-93ce624c809e	2026-07-08 15:08:59.617006+07	\N	2026-06-08 15:08:59.617006+07
a017514e-0744-4aa1-b43c-f4bfdb601ebb	c5c8f8e0-a8d0-4f51-b8d9-a47738b7e28b	526b75d7-4428-484c-af36-ad3ce3d705c5	2026-07-08 15:08:59.617006+07	\N	2026-06-08 15:08:59.617006+07
ad1f2cdb-38c1-4789-8343-e93c9ff6e7af	c5c8f8e0-a8d0-4f51-b8d9-a47738b7e28b	8b0d212a-cbcc-49d4-b29e-afaf9d4ef3b8	2026-07-08 15:16:20.317219+07	\N	2026-06-08 15:16:20.317219+07
13348a0c-6c41-4a4a-b4cf-ddd2e6f50052	c5c8f8e0-a8d0-4f51-b8d9-a47738b7e28b	14582a80-3a32-4880-ba4f-130bbb895c1f	2026-07-08 15:24:40.648798+07	\N	2026-06-08 15:24:40.648798+07
200aadf4-b866-4dbe-873c-db095c040cc0	c5c8f8e0-a8d0-4f51-b8d9-a47738b7e28b	acc068b6-1f45-48a6-9372-068516b2f989	2026-07-10 00:28:02.894478+07	\N	2026-06-10 00:28:02.894478+07
9b2c9009-6895-4690-8ab8-0debf4360dfb	c5c8f8e0-a8d0-4f51-b8d9-a47738b7e28b	a488bfce-f165-4430-82c3-074fbc6b4c32	2026-07-10 00:31:25.831527+07	\N	2026-06-10 00:31:25.831527+07
c6ecd2b4-8249-48b0-acb9-e55833197a28	d5c8f8e0-a8d0-4f51-b8d9-a47738b7e28d	22ce4d94-ca0d-496c-aa9a-c6172ecf2fe5	2026-07-10 00:35:17.146069+07	\N	2026-06-10 00:35:17.146069+07
\.


--
-- Data for Name: service_addons; Type: TABLE DATA; Schema: public; Owner: autowash
--

COPY public.service_addons (id, name, description, price, duration_minutes, category, image_url, applicable_packages_csv, status) FROM stdin;
addon_001	Interior Deep Clean	Deep carpet and upholstery cleaning	150000	30	INTERIOR	https://example.com/addons/interior-deep-clean.jpg	pkg_001|pkg_002	ACTIVE
addon_002	Wax Coating	Protective wax coating for exterior	200000	15	PROTECTION	https://example.com/addons/wax-coating.jpg	pkg_002	ACTIVE
addon_003	Ozone Odor Removal	Remove all bad odors inside the car	100000	20	INTERIOR	https://example.com/addons/ozone.jpg	pkg_001|pkg_002|pkg_003|pkg_004	ACTIVE
addon_004	Glass Polishing	Remove water spots from windows	150000	30	EXTERIOR	https://example.com/addons/glass.jpg	pkg_001|pkg_002|pkg_003|pkg_004	ACTIVE
addon_005	Tire Pressure Check	Check and inflate tires	20000	5	MAINTENANCE	https://example.com/addons/tire.jpg	pkg_001|pkg_002|pkg_003|pkg_004	ACTIVE
\.


--
-- Data for Name: service_combos; Type: TABLE DATA; Schema: public; Owner: autowash
--

COPY public.service_combos (id, name, description, base_price, duration_days, max_services, benefits_csv, image_url, is_active, can_upgrade, upgrade_price_from) FROM stdin;
combo_001	Monthly Unlimited	Unlimited wash services for one month	500000	30	4	Unlimited basic wash|Priority scheduling|5% loyalty bonus	https://example.com/combos/monthly-unlimited.jpg	t	f	0
combo_002	Wash & Odor Removal	Basic wash with ozone treatment	220000	1	1	Basic Wash|Ozone Odor Removal	https://example.com/combos/wash-odor.jpg	t	f	0
combo_003	3-Month Comprehensive	Monthly detailing for 3 months	2000000	90	3	VIP Detailing x3	https://example.com/combos/3-month.jpg	t	f	0
combo_004	Express Shield	Fast exterior wash with quick protection	280000	1	1	Quick Wash|Protective spray	https://example.com/combos/express-shield.jpg	t	f	390000
combo_005	Gloss Restore	Deep clean with gloss finish	420000	7	2	Premium Clean|Gloss finish	https://example.com/combos/gloss-restore.jpg	t	f	590000
combo_006	Urban Refresh	Best for city drivers with frequent visits	360000	14	2	Interior vacuum|Tire shine	https://example.com/combos/urban-refresh.jpg	t	f	510000
combo_007	Elite Detail Duo	Two premium detailing sessions	890000	30	2	VIP Detailing x2	https://example.com/combos/elite-detail-duo.jpg	t	f	1240000
combo_008	Family SUV Care	Protection and maintenance for SUVs	650000	30	2	SUV deep wash|Wax coating	https://example.com/combos/family-suv-care.jpg	t	f	890000
combo_009	VIP Black Edition	High-gloss treatment for luxury vehicles	1150000	45	3	Black exterior polish|Glass treatment|Ceramic spray	https://example.com/combos/vip-black-edition.jpg	t	f	1590000
combo_010	Fleet Saver 5	Savings package for multi-vehicle owners	980000	60	5	5 washes|Fleet priority|Bonus inspection	https://example.com/combos/fleet-saver-5.jpg	t	f	1320000
\.


--
-- Data for Name: service_packages; Type: TABLE DATA; Schema: public; Owner: autowash
--

COPY public.service_packages (id, name, description, base_price, duration_minutes, category, features_csv, image_url, status, popularity) FROM stdin;
pkg_001	Basic Wash	Standard wash and dry	150000	30	BASIC	Exterior wash|Dry|Vacuum interior	https://example.com/packages/basic-wash.jpg	ACTIVE	HIGH
pkg_002	Premium Clean	Comprehensive cleaning service	350000	60	PREMIUM	Exterior wash|Interior vacuum|Window cleaning|Dashboard polish	https://example.com/packages/premium-clean.jpg	ACTIVE	MEDIUM
pkg_003	Standard Wash	Standard exterior wash with basic interior clean	200000	45	BASIC	Exterior wash|Dry|Vacuum interior|Tire shine	https://example.com/packages/standard-wash.jpg	ACTIVE	HIGH
pkg_004	VIP Detailing	Full service detailing	800000	120	PREMIUM	Exterior wash|Deep interior|Engine bay|Wax coating	https://example.com/packages/vip-detailing.jpg	ACTIVE	LOW
\.


--
-- Data for Name: vouchers; Type: TABLE DATA; Schema: public; Owner: autowash
--

COPY public.vouchers (code, discount_type, discount_value, min_amount, expires_at, active, new_customer_only, target_tiers_csv) FROM stdin;
WELCOME20	PERCENT	20	100000	2027-01-01 06:59:59+07	t	t	MEMBER
OLD10	PERCENT	10	100000	2025-01-01 07:00:00+07	t	f	MEMBER,SILVER,GOLD,PLATINUM
ALL10	PERCENT	10	100000	2027-01-01 06:59:59+07	t	f	MEMBER,SILVER,GOLD,PLATINUM
GOLD15	PERCENT	15	200000	2027-01-01 06:59:59+07	t	f	GOLD,PLATINUM
DISCOUNT50K	FIXED	50000	200000	2027-01-01 06:59:59+07	t	f	\N
SUMMER30	PERCENT	30	300000	2026-09-01 06:59:59+07	t	f	\N
MEMBER15	PERCENT	15	100000	2027-01-01 06:59:59+07	t	f	\N
\.


--
-- Data for Name: wash_sessions; Type: TABLE DATA; Schema: public; Owner: autowash
--

COPY public.wash_sessions (id, booking_id, status, notes, fee_amount, fee_currency, projected_loyalty_points, awarded_loyalty_points, created_at, queued_at, checked_in_at, started_at, completed_at, assigned_staff_id) FROM stdin;
11111111-1111-1111-1111-000000000102	BK_1716000000102	COMPLETED	\N	\N	\N	\N	\N	2026-04-06 10:26:53.129239+07	2026-04-06 10:26:53.129239+07	2026-04-06 10:26:53.129239+07	2026-04-06 10:26:53.129239+07	2026-04-06 10:26:53.129239+07	b5c8f8e0-a8d0-4f51-b8d9-a47738b7e28c
11111111-1111-1111-1111-000000000104	BK_1716000000104	COMPLETED	\N	\N	\N	\N	\N	2026-04-16 10:26:53.129239+07	2026-04-16 10:26:53.129239+07	2026-04-16 10:26:53.129239+07	2026-04-16 10:26:53.129239+07	2026-04-16 10:26:53.129239+07	b5c8f8e0-a8d0-4f51-b8d9-a47738b7e28c
11111111-1111-1111-1111-000000000107	BK_1716000000107	COMPLETED	\N	\N	\N	\N	\N	2026-05-01 10:26:53.129239+07	2026-05-01 10:26:53.129239+07	2026-05-01 10:26:53.129239+07	2026-05-01 10:26:53.129239+07	2026-05-01 10:26:53.129239+07	b5c8f8e0-a8d0-4f51-b8d9-a47738b7e28c
11111111-1111-1111-1111-000000000108	BK_1716000000108	COMPLETED	\N	\N	\N	\N	\N	2026-05-03 10:26:53.129239+07	2026-05-03 10:26:53.129239+07	2026-05-03 10:26:53.129239+07	2026-05-03 10:26:53.129239+07	2026-05-03 10:26:53.129239+07	b5c8f8e0-a8d0-4f51-b8d9-a47738b7e28c
11111111-1111-1111-1111-000000000111	BK_1716000000111	COMPLETED	\N	\N	\N	\N	\N	2026-05-13 10:26:53.129239+07	2026-05-13 10:26:53.129239+07	2026-05-13 10:26:53.129239+07	2026-05-13 10:26:53.129239+07	2026-05-13 10:26:53.129239+07	b5c8f8e0-a8d0-4f51-b8d9-a47738b7e28c
11111111-1111-1111-1111-000000000112	BK_1716000000112	COMPLETED	\N	\N	\N	\N	\N	2026-05-16 10:26:53.129239+07	2026-05-16 10:26:53.129239+07	2026-05-16 10:26:53.129239+07	2026-05-16 10:26:53.129239+07	2026-05-16 10:26:53.129239+07	b5c8f8e0-a8d0-4f51-b8d9-a47738b7e28c
11111111-1111-1111-1111-000000000115	BK_1716000000115	COMPLETED	\N	\N	\N	\N	\N	2026-05-23 10:26:53.129239+07	2026-05-23 10:26:53.129239+07	2026-05-23 10:26:53.129239+07	2026-05-23 10:26:53.129239+07	2026-05-23 10:26:53.129239+07	b5c8f8e0-a8d0-4f51-b8d9-a47738b7e28c
11111111-1111-1111-1111-000000000116	BK_1716000000116	COMPLETED	\N	\N	\N	\N	\N	2026-05-24 10:26:53.129239+07	2026-05-24 10:26:53.129239+07	2026-05-24 10:26:53.129239+07	2026-05-24 10:26:53.129239+07	2026-05-24 10:26:53.129239+07	b5c8f8e0-a8d0-4f51-b8d9-a47738b7e28c
11111111-1111-1111-1111-000000000119	BK_1716000000119	COMPLETED	\N	\N	\N	\N	\N	2026-05-28 10:26:53.129239+07	2026-05-28 10:26:53.129239+07	2026-05-28 10:26:53.129239+07	2026-05-28 10:26:53.129239+07	2026-05-28 10:26:53.129239+07	b5c8f8e0-a8d0-4f51-b8d9-a47738b7e28c
11111111-1111-1111-1111-000000000120	BK_1716000000120	COMPLETED	\N	\N	\N	\N	\N	2026-05-29 10:26:53.129239+07	2026-05-29 10:26:53.129239+07	2026-05-29 10:26:53.129239+07	2026-05-29 10:26:53.129239+07	2026-05-29 10:26:53.129239+07	b5c8f8e0-a8d0-4f51-b8d9-a47738b7e28c
31111111-1111-1111-1111-000000000201	BK_1716000000201	COMPLETED	\N	\N	\N	\N	25	2026-05-21 10:26:53.137408+07	2026-05-21 10:26:53.137408+07	2026-05-21 10:26:53.137408+07	2026-05-21 10:26:53.137408+07	2026-05-21 10:26:53.137408+07	b5c8f8e0-a8d0-4f51-b8d9-a47738b7e28c
31111111-1111-1111-1111-000000000202	BK_1716000000202	COMPLETED	\N	\N	\N	\N	200	2026-05-26 10:26:53.137408+07	2026-05-26 10:26:53.137408+07	2026-05-26 10:26:53.137408+07	2026-05-26 10:26:53.137408+07	2026-05-26 10:26:53.137408+07	b5c8f8e0-a8d0-4f51-b8d9-a47738b7e28c
31111111-1111-1111-1111-000000000203	BK_1716000000203	COMPLETED	\N	\N	\N	\N	66	2026-05-29 10:26:53.137408+07	2026-05-29 10:26:53.137408+07	2026-05-29 10:26:53.137408+07	2026-05-29 10:26:53.137408+07	2026-05-29 10:26:53.137408+07	b5c8f8e0-a8d0-4f51-b8d9-a47738b7e28c
11111111-1111-1111-1111-000000000101	BK_1716000000101	COMPLETED	\N	\N	\N	\N	250	2026-04-01 10:26:53.129239+07	2026-04-01 10:26:53.129239+07	2026-04-01 10:26:53.129239+07	2026-04-01 10:26:53.129239+07	2026-04-01 10:26:53.129239+07	b5c8f8e0-a8d0-4f51-b8d9-a47738b7e28c
11111111-1111-1111-1111-000000000105	BK_1716000000105	COMPLETED	\N	\N	\N	\N	320	2026-04-21 10:26:53.129239+07	2026-04-21 10:26:53.129239+07	2026-04-21 10:26:53.129239+07	2026-04-21 10:26:53.129239+07	2026-04-21 10:26:53.129239+07	b5c8f8e0-a8d0-4f51-b8d9-a47738b7e28c
11111111-1111-1111-1111-000000000109	BK_1716000000109	COMPLETED	\N	\N	\N	\N	330	2026-05-06 10:26:53.129239+07	2026-05-06 10:26:53.129239+07	2026-05-06 10:26:53.129239+07	2026-05-06 10:26:53.129239+07	2026-05-06 10:26:53.129239+07	b5c8f8e0-a8d0-4f51-b8d9-a47738b7e28c
11111111-1111-1111-1111-000000000113	BK_1716000000113	COMPLETED	\N	\N	\N	\N	350	2026-05-19 10:26:53.129239+07	2026-05-19 10:26:53.129239+07	2026-05-19 10:26:53.129239+07	2026-05-19 10:26:53.129239+07	2026-05-19 10:26:53.129239+07	b5c8f8e0-a8d0-4f51-b8d9-a47738b7e28c
11111111-1111-1111-1111-000000000117	BK_1716000000117	COMPLETED	\N	\N	\N	\N	380	2026-05-26 10:26:53.129239+07	2026-05-26 10:26:53.129239+07	2026-05-26 10:26:53.129239+07	2026-05-26 10:26:53.129239+07	2026-05-26 10:26:53.129239+07	b5c8f8e0-a8d0-4f51-b8d9-a47738b7e28c
77c8f8e0-a8d0-4f51-b8d9-a47738b7e28f	BK_1717000000003	COMPLETED	\N	\N	\N	\N	\N	2026-05-29 10:26:53.121067+07	2026-05-29 10:26:53.121067+07	2026-05-29 10:26:53.121067+07	2026-05-29 10:26:53.121067+07	2026-05-29 10:26:53.121067+07	a2222222-2222-2222-2222-222222222222
99c8f8e0-a8d0-4f51-b8d9-a47738b7e28f	BK_1717000000007	COMPLETED	\N	\N	\N	\N	\N	2026-05-26 10:26:53.121067+07	2026-05-26 10:26:53.121067+07	2026-05-26 10:26:53.121067+07	2026-05-26 10:26:53.121067+07	2026-05-26 10:26:53.121067+07	a2222222-2222-2222-2222-222222222222
88c8f8e0-a8d0-4f51-b8d9-a47738b7e28f	BK_1717000000005	COMPLETED	\N	\N	\N	\N	110	2026-05-31 10:26:53.121067+07	2026-05-31 10:26:53.121067+07	2026-05-31 10:26:53.121067+07	2026-05-31 10:26:53.121067+07	2026-05-31 10:40:19.608815+07	b5c8f8e0-a8d0-4f51-b8d9-a47738b7e28c
61111111-1111-1111-1111-000000000001	BK_1717000000001	COMPLETED	\N	\N	\N	\N	300	2026-04-01 00:27:26.540966+07	2026-04-01 00:27:26.540966+07	2026-04-01 00:27:26.540966+07	2026-04-01 00:27:26.540966+07	2026-04-01 00:27:26.540966+07	b5c8f8e0-a8d0-4f51-b8d9-a47738b7e28c
\.


--
-- Name: auth_google_tickets auth_google_tickets_pkey; Type: CONSTRAINT; Schema: public; Owner: autowash
--

ALTER TABLE ONLY public.auth_google_tickets
    ADD CONSTRAINT auth_google_tickets_pkey PRIMARY KEY (id);


--
-- Name: auth_google_tickets auth_google_tickets_state_key; Type: CONSTRAINT; Schema: public; Owner: autowash
--

ALTER TABLE ONLY public.auth_google_tickets
    ADD CONSTRAINT auth_google_tickets_state_key UNIQUE (state);


--
-- Name: auth_users auth_users_phone_key; Type: CONSTRAINT; Schema: public; Owner: autowash
--

ALTER TABLE ONLY public.auth_users
    ADD CONSTRAINT auth_users_phone_key UNIQUE (phone);


--
-- Name: auth_users auth_users_pkey; Type: CONSTRAINT; Schema: public; Owner: autowash
--

ALTER TABLE ONLY public.auth_users
    ADD CONSTRAINT auth_users_pkey PRIMARY KEY (id);


--
-- Name: booking_addons booking_addons_pkey; Type: CONSTRAINT; Schema: public; Owner: autowash
--

ALTER TABLE ONLY public.booking_addons
    ADD CONSTRAINT booking_addons_pkey PRIMARY KEY (id);


--
-- Name: booking_otp_audit_logs booking_otp_audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: autowash
--

ALTER TABLE ONLY public.booking_otp_audit_logs
    ADD CONSTRAINT booking_otp_audit_logs_pkey PRIMARY KEY (id);


--
-- Name: booking_otp_challenges booking_otp_challenges_pkey; Type: CONSTRAINT; Schema: public; Owner: autowash
--

ALTER TABLE ONLY public.booking_otp_challenges
    ADD CONSTRAINT booking_otp_challenges_pkey PRIMARY KEY (id);


--
-- Name: booking_staff_transfer_audits booking_staff_transfer_audits_pkey; Type: CONSTRAINT; Schema: public; Owner: autowash
--

ALTER TABLE ONLY public.booking_staff_transfer_audits
    ADD CONSTRAINT booking_staff_transfer_audits_pkey PRIMARY KEY (id);


--
-- Name: customer_bookings customer_bookings_pkey; Type: CONSTRAINT; Schema: public; Owner: autowash
--

ALTER TABLE ONLY public.customer_bookings
    ADD CONSTRAINT customer_bookings_pkey PRIMARY KEY (id);


--
-- Name: customer_combo_usages customer_combo_usages_pkey; Type: CONSTRAINT; Schema: public; Owner: autowash
--

ALTER TABLE ONLY public.customer_combo_usages
    ADD CONSTRAINT customer_combo_usages_pkey PRIMARY KEY (id);


--
-- Name: customer_combos customer_combos_pkey; Type: CONSTRAINT; Schema: public; Owner: autowash
--

ALTER TABLE ONLY public.customer_combos
    ADD CONSTRAINT customer_combos_pkey PRIMARY KEY (id);


--
-- Name: customer_vehicles customer_vehicles_pkey; Type: CONSTRAINT; Schema: public; Owner: autowash
--

ALTER TABLE ONLY public.customer_vehicles
    ADD CONSTRAINT customer_vehicles_pkey PRIMARY KEY (id);


--
-- Name: flyway_schema_history flyway_schema_history_pk; Type: CONSTRAINT; Schema: public; Owner: autowash
--

ALTER TABLE ONLY public.flyway_schema_history
    ADD CONSTRAINT flyway_schema_history_pk PRIMARY KEY (installed_rank);


--
-- Name: loyalty_accounts loyalty_accounts_customer_id_key; Type: CONSTRAINT; Schema: public; Owner: autowash
--

ALTER TABLE ONLY public.loyalty_accounts
    ADD CONSTRAINT loyalty_accounts_customer_id_key UNIQUE (customer_id);


--
-- Name: loyalty_accounts loyalty_accounts_pkey; Type: CONSTRAINT; Schema: public; Owner: autowash
--

ALTER TABLE ONLY public.loyalty_accounts
    ADD CONSTRAINT loyalty_accounts_pkey PRIMARY KEY (id);


--
-- Name: otp_audit_logs otp_audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: autowash
--

ALTER TABLE ONLY public.otp_audit_logs
    ADD CONSTRAINT otp_audit_logs_pkey PRIMARY KEY (id);


--
-- Name: otp_records otp_records_pkey; Type: CONSTRAINT; Schema: public; Owner: autowash
--

ALTER TABLE ONLY public.otp_records
    ADD CONSTRAINT otp_records_pkey PRIMARY KEY (id);


--
-- Name: point_transactions point_transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: autowash
--

ALTER TABLE ONLY public.point_transactions
    ADD CONSTRAINT point_transactions_pkey PRIMARY KEY (id);


--
-- Name: promotions promotions_pkey; Type: CONSTRAINT; Schema: public; Owner: autowash
--

ALTER TABLE ONLY public.promotions
    ADD CONSTRAINT promotions_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: autowash
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_token_key; Type: CONSTRAINT; Schema: public; Owner: autowash
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_token_key UNIQUE (token);


--
-- Name: service_addons service_addons_pkey; Type: CONSTRAINT; Schema: public; Owner: autowash
--

ALTER TABLE ONLY public.service_addons
    ADD CONSTRAINT service_addons_pkey PRIMARY KEY (id);


--
-- Name: service_combos service_combos_pkey; Type: CONSTRAINT; Schema: public; Owner: autowash
--

ALTER TABLE ONLY public.service_combos
    ADD CONSTRAINT service_combos_pkey PRIMARY KEY (id);


--
-- Name: service_packages service_packages_pkey; Type: CONSTRAINT; Schema: public; Owner: autowash
--

ALTER TABLE ONLY public.service_packages
    ADD CONSTRAINT service_packages_pkey PRIMARY KEY (id);


--
-- Name: point_transactions uq_point_transactions_type_reference; Type: CONSTRAINT; Schema: public; Owner: autowash
--

ALTER TABLE ONLY public.point_transactions
    ADD CONSTRAINT uq_point_transactions_type_reference UNIQUE (type, reference_id);


--
-- Name: vouchers vouchers_pkey; Type: CONSTRAINT; Schema: public; Owner: autowash
--

ALTER TABLE ONLY public.vouchers
    ADD CONSTRAINT vouchers_pkey PRIMARY KEY (code);


--
-- Name: wash_sessions wash_sessions_booking_id_key; Type: CONSTRAINT; Schema: public; Owner: autowash
--

ALTER TABLE ONLY public.wash_sessions
    ADD CONSTRAINT wash_sessions_booking_id_key UNIQUE (booking_id);


--
-- Name: wash_sessions wash_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: autowash
--

ALTER TABLE ONLY public.wash_sessions
    ADD CONSTRAINT wash_sessions_pkey PRIMARY KEY (id);


--
-- Name: flyway_schema_history_s_idx; Type: INDEX; Schema: public; Owner: autowash
--

CREATE INDEX flyway_schema_history_s_idx ON public.flyway_schema_history USING btree (success);


--
-- Name: idx_booking_otp_audit_logs_booking_event_created; Type: INDEX; Schema: public; Owner: autowash
--

CREATE INDEX idx_booking_otp_audit_logs_booking_event_created ON public.booking_otp_audit_logs USING btree (booking_id, event_type, created_at);


--
-- Name: idx_booking_otp_challenges_booking_status_sent; Type: INDEX; Schema: public; Owner: autowash
--

CREATE INDEX idx_booking_otp_challenges_booking_status_sent ON public.booking_otp_challenges USING btree (booking_id, status, sent_at DESC);


--
-- Name: idx_booking_otp_challenges_status_expires; Type: INDEX; Schema: public; Owner: autowash
--

CREATE INDEX idx_booking_otp_challenges_status_expires ON public.booking_otp_challenges USING btree (status, expires_at);


--
-- Name: idx_booking_staff_transfer_booking; Type: INDEX; Schema: public; Owner: autowash
--

CREATE INDEX idx_booking_staff_transfer_booking ON public.booking_staff_transfer_audits USING btree (booking_id);


--
-- Name: idx_booking_staff_transfer_created_at; Type: INDEX; Schema: public; Owner: autowash
--

CREATE INDEX idx_booking_staff_transfer_created_at ON public.booking_staff_transfer_audits USING btree (created_at DESC);


--
-- Name: idx_customer_bookings_assigned_staff_status; Type: INDEX; Schema: public; Owner: autowash
--

CREATE INDEX idx_customer_bookings_assigned_staff_status ON public.customer_bookings USING btree (assigned_staff_id, status);


--
-- Name: idx_customer_bookings_customer_status_date; Type: INDEX; Schema: public; Owner: autowash
--

CREATE INDEX idx_customer_bookings_customer_status_date ON public.customer_bookings USING btree (customer_id, status, booking_date, created_at);


--
-- Name: idx_customer_combo_usages_customer_combo; Type: INDEX; Schema: public; Owner: autowash
--

CREATE INDEX idx_customer_combo_usages_customer_combo ON public.customer_combo_usages USING btree (customer_combo_id);


--
-- Name: idx_customer_combos_customer_combo_status_expiry; Type: INDEX; Schema: public; Owner: autowash
--

CREATE INDEX idx_customer_combos_customer_combo_status_expiry ON public.customer_combos USING btree (customer_id, combo_id, status, expires_at);


--
-- Name: idx_customer_vehicles_owner_plate; Type: INDEX; Schema: public; Owner: autowash
--

CREATE INDEX idx_customer_vehicles_owner_plate ON public.customer_vehicles USING btree (owner_user_id, plate);


--
-- Name: idx_customer_vehicles_owner_status; Type: INDEX; Schema: public; Owner: autowash
--

CREATE INDEX idx_customer_vehicles_owner_status ON public.customer_vehicles USING btree (owner_user_id, status, created_at);


--
-- Name: idx_otp_audit_logs_delivery_event_created; Type: INDEX; Schema: public; Owner: autowash
--

CREATE INDEX idx_otp_audit_logs_delivery_event_created ON public.otp_audit_logs USING btree (purpose, event_type, delivery_address, created_at);


--
-- Name: idx_otp_audit_logs_ip_event_created; Type: INDEX; Schema: public; Owner: autowash
--

CREATE INDEX idx_otp_audit_logs_ip_event_created ON public.otp_audit_logs USING btree (purpose, event_type, request_ip, created_at);


--
-- Name: idx_point_transactions_customer_created_at; Type: INDEX; Schema: public; Owner: autowash
--

CREATE INDEX idx_point_transactions_customer_created_at ON public.point_transactions USING btree (customer_id, created_at);


--
-- Name: idx_promotions_status_dates; Type: INDEX; Schema: public; Owner: autowash
--

CREATE INDEX idx_promotions_status_dates ON public.promotions USING btree (status, start_date, end_date);


--
-- Name: idx_wash_sessions_assigned_staff; Type: INDEX; Schema: public; Owner: autowash
--

CREATE INDEX idx_wash_sessions_assigned_staff ON public.wash_sessions USING btree (assigned_staff_id);


--
-- Name: idx_wash_sessions_status_created_at; Type: INDEX; Schema: public; Owner: autowash
--

CREATE INDEX idx_wash_sessions_status_created_at ON public.wash_sessions USING btree (status, created_at);


--
-- Name: auth_google_tickets fk_auth_google_tickets_user; Type: FK CONSTRAINT; Schema: public; Owner: autowash
--

ALTER TABLE ONLY public.auth_google_tickets
    ADD CONSTRAINT fk_auth_google_tickets_user FOREIGN KEY (user_id) REFERENCES public.auth_users(id);


--
-- Name: booking_addons fk_booking_addons_addon; Type: FK CONSTRAINT; Schema: public; Owner: autowash
--

ALTER TABLE ONLY public.booking_addons
    ADD CONSTRAINT fk_booking_addons_addon FOREIGN KEY (addon_id) REFERENCES public.service_addons(id);


--
-- Name: booking_addons fk_booking_addons_booking; Type: FK CONSTRAINT; Schema: public; Owner: autowash
--

ALTER TABLE ONLY public.booking_addons
    ADD CONSTRAINT fk_booking_addons_booking FOREIGN KEY (booking_id) REFERENCES public.customer_bookings(id);


--
-- Name: booking_otp_audit_logs fk_booking_otp_audit_logs_booking; Type: FK CONSTRAINT; Schema: public; Owner: autowash
--

ALTER TABLE ONLY public.booking_otp_audit_logs
    ADD CONSTRAINT fk_booking_otp_audit_logs_booking FOREIGN KEY (booking_id) REFERENCES public.customer_bookings(id);


--
-- Name: booking_otp_challenges fk_booking_otp_challenges_booking; Type: FK CONSTRAINT; Schema: public; Owner: autowash
--

ALTER TABLE ONLY public.booking_otp_challenges
    ADD CONSTRAINT fk_booking_otp_challenges_booking FOREIGN KEY (booking_id) REFERENCES public.customer_bookings(id);


--
-- Name: booking_staff_transfer_audits fk_booking_staff_transfer_actor; Type: FK CONSTRAINT; Schema: public; Owner: autowash
--

ALTER TABLE ONLY public.booking_staff_transfer_audits
    ADD CONSTRAINT fk_booking_staff_transfer_actor FOREIGN KEY (actor_id) REFERENCES public.auth_users(id);


--
-- Name: booking_staff_transfer_audits fk_booking_staff_transfer_booking; Type: FK CONSTRAINT; Schema: public; Owner: autowash
--

ALTER TABLE ONLY public.booking_staff_transfer_audits
    ADD CONSTRAINT fk_booking_staff_transfer_booking FOREIGN KEY (booking_id) REFERENCES public.customer_bookings(id);


--
-- Name: booking_staff_transfer_audits fk_booking_staff_transfer_from_staff; Type: FK CONSTRAINT; Schema: public; Owner: autowash
--

ALTER TABLE ONLY public.booking_staff_transfer_audits
    ADD CONSTRAINT fk_booking_staff_transfer_from_staff FOREIGN KEY (from_staff_id) REFERENCES public.auth_users(id);


--
-- Name: booking_staff_transfer_audits fk_booking_staff_transfer_session; Type: FK CONSTRAINT; Schema: public; Owner: autowash
--

ALTER TABLE ONLY public.booking_staff_transfer_audits
    ADD CONSTRAINT fk_booking_staff_transfer_session FOREIGN KEY (wash_session_id) REFERENCES public.wash_sessions(id);


--
-- Name: booking_staff_transfer_audits fk_booking_staff_transfer_to_staff; Type: FK CONSTRAINT; Schema: public; Owner: autowash
--

ALTER TABLE ONLY public.booking_staff_transfer_audits
    ADD CONSTRAINT fk_booking_staff_transfer_to_staff FOREIGN KEY (to_staff_id) REFERENCES public.auth_users(id);


--
-- Name: customer_bookings fk_customer_bookings_assigned_staff; Type: FK CONSTRAINT; Schema: public; Owner: autowash
--

ALTER TABLE ONLY public.customer_bookings
    ADD CONSTRAINT fk_customer_bookings_assigned_staff FOREIGN KEY (assigned_staff_id) REFERENCES public.auth_users(id);


--
-- Name: customer_bookings fk_customer_bookings_combo; Type: FK CONSTRAINT; Schema: public; Owner: autowash
--

ALTER TABLE ONLY public.customer_bookings
    ADD CONSTRAINT fk_customer_bookings_combo FOREIGN KEY (combo_id) REFERENCES public.service_combos(id);


--
-- Name: customer_bookings fk_customer_bookings_customer; Type: FK CONSTRAINT; Schema: public; Owner: autowash
--

ALTER TABLE ONLY public.customer_bookings
    ADD CONSTRAINT fk_customer_bookings_customer FOREIGN KEY (customer_id) REFERENCES public.auth_users(id);


--
-- Name: customer_bookings fk_customer_bookings_package; Type: FK CONSTRAINT; Schema: public; Owner: autowash
--

ALTER TABLE ONLY public.customer_bookings
    ADD CONSTRAINT fk_customer_bookings_package FOREIGN KEY (package_id) REFERENCES public.service_packages(id);


--
-- Name: customer_bookings fk_customer_bookings_vehicle; Type: FK CONSTRAINT; Schema: public; Owner: autowash
--

ALTER TABLE ONLY public.customer_bookings
    ADD CONSTRAINT fk_customer_bookings_vehicle FOREIGN KEY (vehicle_id) REFERENCES public.customer_vehicles(id);


--
-- Name: customer_bookings fk_customer_bookings_voucher; Type: FK CONSTRAINT; Schema: public; Owner: autowash
--

ALTER TABLE ONLY public.customer_bookings
    ADD CONSTRAINT fk_customer_bookings_voucher FOREIGN KEY (voucher_code) REFERENCES public.vouchers(code);


--
-- Name: customer_combo_usages fk_customer_combo_usages_booking; Type: FK CONSTRAINT; Schema: public; Owner: autowash
--

ALTER TABLE ONLY public.customer_combo_usages
    ADD CONSTRAINT fk_customer_combo_usages_booking FOREIGN KEY (booking_id) REFERENCES public.customer_bookings(id);


--
-- Name: customer_combo_usages fk_customer_combo_usages_customer_combo; Type: FK CONSTRAINT; Schema: public; Owner: autowash
--

ALTER TABLE ONLY public.customer_combo_usages
    ADD CONSTRAINT fk_customer_combo_usages_customer_combo FOREIGN KEY (customer_combo_id) REFERENCES public.customer_combos(id);


--
-- Name: customer_combos fk_customer_combos_combo; Type: FK CONSTRAINT; Schema: public; Owner: autowash
--

ALTER TABLE ONLY public.customer_combos
    ADD CONSTRAINT fk_customer_combos_combo FOREIGN KEY (combo_id) REFERENCES public.service_combos(id);


--
-- Name: customer_combos fk_customer_combos_customer; Type: FK CONSTRAINT; Schema: public; Owner: autowash
--

ALTER TABLE ONLY public.customer_combos
    ADD CONSTRAINT fk_customer_combos_customer FOREIGN KEY (customer_id) REFERENCES public.auth_users(id);


--
-- Name: customer_vehicles fk_customer_vehicles_owner; Type: FK CONSTRAINT; Schema: public; Owner: autowash
--

ALTER TABLE ONLY public.customer_vehicles
    ADD CONSTRAINT fk_customer_vehicles_owner FOREIGN KEY (owner_user_id) REFERENCES public.auth_users(id);


--
-- Name: loyalty_accounts fk_loyalty_accounts_customer; Type: FK CONSTRAINT; Schema: public; Owner: autowash
--

ALTER TABLE ONLY public.loyalty_accounts
    ADD CONSTRAINT fk_loyalty_accounts_customer FOREIGN KEY (customer_id) REFERENCES public.auth_users(id);


--
-- Name: otp_audit_logs fk_otp_audit_logs_user; Type: FK CONSTRAINT; Schema: public; Owner: autowash
--

ALTER TABLE ONLY public.otp_audit_logs
    ADD CONSTRAINT fk_otp_audit_logs_user FOREIGN KEY (user_id) REFERENCES public.auth_users(id);


--
-- Name: otp_records fk_otp_records_user; Type: FK CONSTRAINT; Schema: public; Owner: autowash
--

ALTER TABLE ONLY public.otp_records
    ADD CONSTRAINT fk_otp_records_user FOREIGN KEY (user_id) REFERENCES public.auth_users(id);


--
-- Name: point_transactions fk_point_transactions_customer; Type: FK CONSTRAINT; Schema: public; Owner: autowash
--

ALTER TABLE ONLY public.point_transactions
    ADD CONSTRAINT fk_point_transactions_customer FOREIGN KEY (customer_id) REFERENCES public.auth_users(id);


--
-- Name: refresh_tokens fk_refresh_tokens_user; Type: FK CONSTRAINT; Schema: public; Owner: autowash
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT fk_refresh_tokens_user FOREIGN KEY (user_id) REFERENCES public.auth_users(id);


--
-- Name: wash_sessions fk_wash_sessions_assigned_staff; Type: FK CONSTRAINT; Schema: public; Owner: autowash
--

ALTER TABLE ONLY public.wash_sessions
    ADD CONSTRAINT fk_wash_sessions_assigned_staff FOREIGN KEY (assigned_staff_id) REFERENCES public.auth_users(id);


--
-- Name: wash_sessions fk_wash_sessions_booking; Type: FK CONSTRAINT; Schema: public; Owner: autowash
--

ALTER TABLE ONLY public.wash_sessions
    ADD CONSTRAINT fk_wash_sessions_booking FOREIGN KEY (booking_id) REFERENCES public.customer_bookings(id);


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO autowash;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO autowash;


--
-- PostgreSQL database dump complete
--

\unrestrict onBKRj8OeNPJ8zrmefHXVOjSsLD6UK46YBADtVzociPXjDsy0HHGHPg2jhbXPzr

