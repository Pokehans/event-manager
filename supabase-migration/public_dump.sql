--
-- PostgreSQL database dump
--

\restrict 4Qs2BgULH8P06s4DmFkac65s95zabrQIC8WeMlqyfu5KtmMQBx5fKNf8DxjJhUz

-- Dumped from database version 17.6
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

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA public;


--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON SCHEMA public IS 'standard public schema';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: departments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.departments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    color text NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);


--
-- Name: event_debriefings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.event_debriefings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    event_id uuid NOT NULL,
    user_id uuid,
    text text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    rating text,
    issues text,
    learnings text,
    CONSTRAINT event_debriefings_rating_check CHECK ((rating = ANY (ARRAY['sehr_gut'::text, 'gut'::text, 'neutral'::text, 'schlecht'::text])))
);


--
-- Name: event_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.event_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    event_id uuid NOT NULL,
    user_id uuid,
    change text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.events (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title text NOT NULL,
    status text DEFAULT 'Anfrage'::text NOT NULL,
    date date NOT NULL,
    company_name text,
    firstname text,
    lastname text,
    notes text,
    created_by uuid NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    phone text,
    email text,
    adults integer,
    children integer,
    address text,
    tech text,
    infrastructure text,
    schedule text,
    food text,
    drinks text,
    payment_type text,
    billing_company_name text,
    billing_firstname text,
    billing_lastname text,
    billing_address text,
    billing_email text,
    billing_phone text,
    room_id_1 uuid,
    room_id_2 uuid,
    CONSTRAINT events_adults_check CHECK (((adults IS NULL) OR (adults >= 0))),
    CONSTRAINT events_children_check CHECK (((children IS NULL) OR (children >= 0)))
);


--
-- Name: holidays; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.holidays (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    date date NOT NULL,
    type text DEFAULT 'holiday'::text NOT NULL,
    scope text DEFAULT 'company'::text NOT NULL,
    country_code text DEFAULT 'CH'::text,
    region_code text,
    canton_code text,
    color text DEFAULT '#dc2626'::text NOT NULL,
    background_color text DEFAULT '#fee2e2'::text NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    is_public_holiday boolean DEFAULT false NOT NULL,
    is_company_holiday boolean DEFAULT true NOT NULL,
    notes text,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT holidays_scope_check CHECK ((scope = ANY (ARRAY['global'::text, 'country'::text, 'region'::text, 'canton'::text, 'company'::text]))),
    CONSTRAINT holidays_type_check CHECK ((type = ANY (ARRAY['holiday'::text, 'company_holiday'::text, 'closing_day'::text, 'special_day'::text])))
);


--
-- Name: offer_categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.offer_categories (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    parent_id uuid,
    name text NOT NULL,
    slug text NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: offer_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.offer_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    category_id uuid NOT NULL,
    name text NOT NULL,
    description text,
    unit text NOT NULL,
    price numeric(10,2) DEFAULT 0 NOT NULL,
    item_type text DEFAULT 'item'::text NOT NULL,
    tax_rate numeric(5,2) DEFAULT 8.10 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT offer_items_item_type_check CHECK ((item_type = ANY (ARRAY['item'::text, 'package'::text]))),
    CONSTRAINT offer_items_unit_check CHECK ((unit = ANY (ARRAY['person'::text, 'piece'::text, 'bottle'::text, 'liter'::text, 'day'::text, 'half_day'::text, 'flat'::text, 'portion'::text])))
);


--
-- Name: room_documents; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.room_documents (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    room_id uuid NOT NULL,
    file_path text NOT NULL,
    file_name text NOT NULL,
    file_type text,
    description text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: room_images; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.room_images (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    room_id uuid NOT NULL,
    file_path text NOT NULL,
    file_name text NOT NULL,
    alt_text text,
    sort_order integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: room_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.room_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    room_id uuid NOT NULL,
    user_id uuid,
    change text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: rooms; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.rooms (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    capacity integer,
    function_description text,
    status text DEFAULT 'active'::text NOT NULL,
    equipment text[] DEFAULT '{}'::text[] NOT NULL,
    internal_notes text,
    sort_order integer DEFAULT 0 NOT NULL,
    created_by uuid,
    updated_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id uuid NOT NULL,
    email text NOT NULL,
    role text DEFAULT 'reader'::text NOT NULL,
    active boolean DEFAULT true NOT NULL,
    area text,
    created_at timestamp with time zone DEFAULT now(),
    department text,
    department_id uuid,
    must_change_password boolean DEFAULT true NOT NULL,
    password_changed_at timestamp with time zone
);


--
-- Data for Name: departments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.departments (id, name, color, created_at) FROM stdin;
273d0ad9-1cc2-4e12-91eb-470866e99fe4	Geschäftsleitung	#db8e22	2026-04-17 08:51:44.618115+00
34bf43e2-ea57-4310-959c-f6ad9549ab2a	Gastronomie	#1a677b	2026-04-17 08:51:44.618115+00
63d47b39-2fe9-4cf8-b298-cf7e5838c463	Aktivierung	#27ae60	2026-04-17 08:51:44.618115+00
c3399523-35e3-4a09-96a0-ffcaa9395f25	Pflege	#8E44AD	2026-04-17 08:51:44.618115+00
5d5aab76-07e7-432a-a565-2e787507902f	Verwaltungsrat	#34495E	2026-04-17 09:02:54.523564+00
be3b4fe9-5ef1-468a-b248-0f698ded90c8	Administration	#C0392B	2026-04-17 09:02:19.930549+00
\.


--
-- Data for Name: event_debriefings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.event_debriefings (id, event_id, user_id, text, created_at, rating, issues, learnings) FROM stdin;
f83747b2-9e18-4692-8594-701cbee3a6e7	718debe5-e652-4602-b1e6-8eb2a0823c14	f5387d03-dff3-433b-a833-303b21bfa8e6	Debrief Test	2026-04-30 15:08:30.91042+00	\N	\N	\N
97067c6a-38b1-49f8-af49-24157ef64d4a	44784d18-3ff3-4187-ae0f-4a24170a2ea3	f5387d03-dff3-433b-a833-303b21bfa8e6	Debrief Test	2026-04-30 15:15:07.517371+00	\N	\N	\N
b702953f-36b0-4a36-90e3-295529cc6b45	dac875d2-1870-45e3-8a28-b42b0faf3f6c	f5387d03-dff3-433b-a833-303b21bfa8e6	Debrief Test	2026-04-30 15:24:05.53331+00	\N	\N	\N
a128bb55-ab1c-495d-860a-a7cba2956208	453a8b3f-d7cb-435f-a3c9-d753a7a994d4	f5387d03-dff3-433b-a833-303b21bfa8e6	Dies ist ein Debrieftest	2026-05-01 19:03:10.623095+00	\N	\N	\N
9b42267e-2245-43bd-88e9-0ecc9533f515	5e7e6b78-a11b-4137-97d5-23f9bf61267c	f5387d03-dff3-433b-a833-303b21bfa8e6	Bewertung: Sehr gut\n\nProbleme / Auffälligkeiten:\nZu wenig Personal für ersten Getränkeservice\n\nVerbesserungen / Learnings:\nfdsgsdfgfsdf	2026-05-01 19:14:40.086297+00	sehr_gut	Zu wenig Personal für ersten Getränkeservice	fdsgsdfgfsdf
2c36f255-d040-4c63-8af4-fffcddd1e7ba	e1ab1871-ac0b-4295-b702-f581a7d5a98a	f5387d03-dff3-433b-a833-303b21bfa8e6	Bewertung: Schlecht\n\nProbleme / Auffälligkeiten:\nKeine besonderen Probleme erfasst.\n\nVerbesserungen / Learnings:\nWir testen mal wieder	2026-05-01 19:28:54.509109+00	schlecht	\N	Wir testen mal wieder
9ee985a6-a4ad-4100-87d1-bf15f901378e	f2439fd8-8ed2-437b-b157-bae24e9c3b50	f5387d03-dff3-433b-a833-303b21bfa8e6	Bewertung: Schlecht\n\nProbleme / Auffälligkeiten:\nKeine besonderen Probleme erfasst.\n\nVerbesserungen / Learnings:\nweiterer archiv test	2026-05-01 19:29:31.009623+00	schlecht	\N	weiterer archiv test
10c0fd3f-2e24-4a13-9b80-e7a836ada1b7	7e37a6a8-9977-402a-a929-c52d57d2b5e5	f5387d03-dff3-433b-a833-303b21bfa8e6	Bewertung: Gut\n\nProbleme / Auffälligkeiten:\nKeine besonderen Probleme erfasst.\n\nVerbesserungen / Learnings:\nNeuer archiv test 1	2026-05-01 19:32:16.41125+00	gut	\N	Neuer archiv test 1
18660392-aaf2-46c7-88ab-28972c006442	20f75990-7507-44c9-aaf1-569c12bb7ab6	f5387d03-dff3-433b-a833-303b21bfa8e6	Bewertung: Sehr gut\n\nProbleme / Auffälligkeiten:\nWir testen weiter\n\nVerbesserungen / Learnings:\nWir testen weiter	2026-05-01 19:33:09.651393+00	sehr_gut	Wir testen weiter	Wir testen weiter
27f82f73-f634-4b9f-9848-59ccd4662da5	2e091c7c-ab9e-44fb-9bad-02bfcac71ae8	f5387d03-dff3-433b-a833-303b21bfa8e6	Bewertung: Sehr gut\n\nProbleme / Auffälligkeiten:\nKeine besonderen Probleme erfasst.\n\nVerbesserungen / Learnings:\nKeine Learnings erfasst.	2026-05-02 05:33:36.034231+00	sehr_gut	\N	
bc2e6843-e7f3-48cd-946b-200b2b16f211	cc5c0e9d-9474-4da0-b350-b714139183ce	f5387d03-dff3-433b-a833-303b21bfa8e6	Bewertung: Neutral\n\nProbleme / Auffälligkeiten:\nKeine besonderen Probleme erfasst.\n\nVerbesserungen / Learnings:\nKeine Learnings erfasst.	2026-05-02 05:33:49.835741+00	neutral	\N	
0ec862b1-a0c0-4550-93b8-3270183b4994	4ac01621-068f-4662-95b0-495ea4b8708d	f5387d03-dff3-433b-a833-303b21bfa8e6	Bewertung: Gut\n\nProbleme / Auffälligkeiten:\nKeine besonderen Probleme erfasst.\n\nVerbesserungen / Learnings:\nKeine Learnings erfasst.	2026-05-02 05:34:01.566755+00	gut	\N	
d6973bf7-e15f-416d-b844-6bfb30598110	39389d94-497e-4c0e-87c1-3f5bc2ea082b	f5387d03-dff3-433b-a833-303b21bfa8e6	Bewertung: Sehr Gut\n\nProbleme / Auffälligkeiten:\nKeine besonderen Probleme erfasst.\n\nVerbesserungen / Learnings:\nweiterer archiv test	2026-05-02 06:22:47.523081+00	schlecht	\N	\N
ff75a145-f1bb-4098-ace1-598162fa77dd	4a3cfec8-d304-4161-8b1c-7a21f30c0ee6	f5387d03-dff3-433b-a833-303b21bfa8e6	Bewertung: Sehr Gut\n\nProbleme / Auffälligkeiten:\nKeine besonderen Probleme erfasst.\n\nVerbesserungen / Learnings:\nweiterer archiv test	2026-05-02 06:21:58.550156+00	schlecht	\N	\N
2969b75c-32f7-4d79-86ef-1e1840e47ef8	8ae25656-0ffe-41e7-baf1-fc8a36dc9175	f5387d03-dff3-433b-a833-303b21bfa8e6	Bewertung: Sehr Gut\n\nProbleme / Auffälligkeiten:\nTest\n\nVerbesserungen / Learnings:\nDies ist nur ein Test	2026-05-02 06:02:55.174637+00	schlecht	Test	Dies ist nur ein Test
\.


--
-- Data for Name: event_logs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.event_logs (id, event_id, user_id, change, created_at) FROM stdin;
a71541d0-278a-4fce-a83c-5c25b42bc4b6	fe50b63e-3a68-4c18-b568-547d8a2d7b95	f5387d03-dff3-433b-a833-303b21bfa8e6	Event bearbeitet	2026-04-20 18:39:09.973768+00
cc0389aa-1ff6-4c48-bc11-960fbf4ccd72	fe50b63e-3a68-4c18-b568-547d8a2d7b95	f5387d03-dff3-433b-a833-303b21bfa8e6	Event bearbeitet	2026-04-20 18:45:33.763124+00
6fe20f57-c3b0-4038-86e3-aa1eff00fef2	fe50b63e-3a68-4c18-b568-547d8a2d7b95	f5387d03-dff3-433b-a833-303b21bfa8e6	Event bearbeitet	2026-04-20 18:45:48.495334+00
db93d0d5-46f8-4933-ba21-d3a5fa820ede	fe50b63e-3a68-4c18-b568-547d8a2d7b95	f5387d03-dff3-433b-a833-303b21bfa8e6	Event bearbeitet	2026-04-20 18:46:03.547601+00
bb516c0f-53e7-41f6-8804-6844e6ca70d6	c4662fb8-a4f0-453f-9e11-e2f773bd8b1f	f5387d03-dff3-433b-a833-303b21bfa8e6	Event bearbeitet	2026-04-20 19:30:25.494043+00
b8f17803-6036-4bc1-b4ed-525ed15db794	a6f79bbb-d065-4587-a102-70d71827f3d6	f5387d03-dff3-433b-a833-303b21bfa8e6	Event bearbeitet	2026-04-20 19:47:55.566198+00
9fc4533e-67b8-4874-93c5-bb02162f1a8d	e1ab1871-ac0b-4295-b702-f581a7d5a98a	f5387d03-dff3-433b-a833-303b21bfa8e6	Event bearbeitet	2026-04-21 03:11:50.073488+00
0e8e3567-927b-4c61-a7bd-826d28a17a40	36c40a11-649c-43c9-bd16-cf57070cd05c	f5387d03-dff3-433b-a833-303b21bfa8e6	Vorname geändert (— → Max), Nachname geändert (— → Mustermann)	2026-04-22 06:38:24.780393+00
13b19789-b9fd-427b-bed8-13f9107738e2	36c40a11-649c-43c9-bd16-cf57070cd05c	f5387d03-dff3-433b-a833-303b21bfa8e6	Erwachsene geändert (— → 8)	2026-04-22 06:38:54.069182+00
04492549-e357-4886-a532-40c99edf701f	36c40a11-649c-43c9-bd16-cf57070cd05c	f5387d03-dff3-433b-a833-303b21bfa8e6	Raum geändert (Restaurant → Terrasse), Notizen geändert	2026-04-22 06:39:11.400522+00
2a11d396-8603-4f48-9975-be1ad7916d4a	2e091c7c-ab9e-44fb-9bad-02bfcac71ae8	f5387d03-dff3-433b-a833-303b21bfa8e6	Status geändert Alt: Anfrage, Neu: In Bearbeitung, Firma geändert Alt: Muster AG, Neu: Muster GmbH	2026-04-22 07:00:05.057769+00
6adba117-210f-4889-b3be-33f3ff6812c1	2e091c7c-ab9e-44fb-9bad-02bfcac71ae8	f5387d03-dff3-433b-a833-303b21bfa8e6	Erwachsene geändert Alt: 2, Neu: 4	2026-04-22 07:00:20.789346+00
be81aee2-e1b2-419f-a81a-d9b4e5d262a9	2e091c7c-ab9e-44fb-9bad-02bfcac71ae8	f5387d03-dff3-433b-a833-303b21bfa8e6	Vorname geändert Alt: Max, Neu: Hugo, Telefon geändert Alt: 041 123 45 67, Neu: 041 123 45 68, Kinder geändert Alt: 0, Neu: 2, Raum geändert Alt: Irgendwo, Neu: Seminarraum	2026-04-22 07:06:01.861553+00
014d2ace-b50a-47fb-9fc8-684cba864cd3	ac2bdbcd-c991-4b88-8482-e10e31702ea6	f5387d03-dff3-433b-a833-303b21bfa8e6	Status geändert Neu: Anfrage\nFirma geändert Neu: Muster GmbH\nTelefon geändert Neu: 041 123 45 67\nE-Mail geändert Neu: sandro@localhost.ch\nAdresse geändert Neu: Musterstr. 1, 1234 Musterhausen\nRaum geändert Neu: Restaurant\nTechnik geändert	2026-04-22 07:17:45.603414+00
4832720d-0ac9-42a2-82e2-c9a85b9ce2f0	2f4697ac-abd5-4d08-91ba-7a8e0353ae5d	f5387d03-dff3-433b-a833-303b21bfa8e6	Vorname geändert Neu: Hugo\nNachname geändert Neu: Mustermann\nTelefon geändert Neu: 041 123 45 67\nAdresse geändert Neu: fdgg 67, 6589 sdfs\nRaum geändert Neu: Saal	2026-04-22 07:19:26.083908+00
0fa3d199-de0e-4c3f-aa54-885dc1a60edc	453a8b3f-d7cb-435f-a3c9-d753a7a994d4	f5387d03-dff3-433b-a833-303b21bfa8e6	Firma geändert Neu: Muster AG\nVorname geändert Neu: Maximilian\nErwachsene geändert Neu: 98\nAdresse geändert Neu: Musterstr. 1, 1234 Musterhausen\nRaum geändert Neu: Saal\nInfrastruktur geändert\nNotizen geändert	2026-04-22 07:34:05.807783+00
e3785deb-8cce-4a7d-8bc4-4d8d3cf13091	4ac01621-068f-4662-95b0-495ea4b8708d	f5387d03-dff3-433b-a833-303b21bfa8e6	Titel geändert Neu: Delete Test	2026-04-22 13:51:24.357799+00
b342b4c3-50c0-4fcd-810f-96532e1138b6	2f4697ac-abd5-4d08-91ba-7a8e0353ae5d	fc7864a9-82db-416f-97db-a4217b72b41e	Titel geändert Neu: VR Abendessen	2026-04-22 14:09:02.827698+00
49a4c726-1948-41cf-9a1a-0f87857196fe	20f75990-7507-44c9-aaf1-569c12bb7ab6	f5387d03-dff3-433b-a833-303b21bfa8e6	Raum geändert Neu: Restaurant	2026-04-26 07:00:40.436245+00
ccd49478-a932-4d75-ba58-935d1ac37e82	983ef76d-c04a-4367-a1e6-d226a303cce3	f5387d03-dff3-433b-a833-303b21bfa8e6	Status geändert Neu: Storniert	2026-04-26 07:02:30.739706+00
de2e9340-2ffd-4a31-85de-a90a2eb54448	44784d18-3ff3-4187-ae0f-4a24170a2ea3	f5387d03-dff3-433b-a833-303b21bfa8e6	Event archiviert	2026-04-30 14:30:00.236707+00
fb6841e2-1740-4c4b-bca1-a7e6d57abc28	718debe5-e652-4602-b1e6-8eb2a0823c14	f5387d03-dff3-433b-a833-303b21bfa8e6	Event archiviert	2026-04-30 14:46:20.586296+00
1bdd5732-cc87-408b-b958-7c7f0406a229	718debe5-e652-4602-b1e6-8eb2a0823c14	f5387d03-dff3-433b-a833-303b21bfa8e6	Event archiviert	2026-04-30 15:08:31.04262+00
b540732a-fabe-4aa4-b9b0-c79a023b434f	44784d18-3ff3-4187-ae0f-4a24170a2ea3	f5387d03-dff3-433b-a833-303b21bfa8e6	Event archiviert	2026-04-30 15:15:07.655068+00
b4a1f429-54aa-4e7b-8f63-afb1ec560810	dac875d2-1870-45e3-8a28-b42b0faf3f6c	f5387d03-dff3-433b-a833-303b21bfa8e6	Event archiviert	2026-04-30 15:24:05.659816+00
32661c9c-389a-4600-a425-62ff29fd7485	59853152-4ca9-4212-9fcf-b46bc1214960	f5387d03-dff3-433b-a833-303b21bfa8e6	Status geändert Neu: In Bearbeitung	2026-05-01 12:32:05.110362+00
61d70e79-0d0b-4b0c-ad17-9e43b217254d	59853152-4ca9-4212-9fcf-b46bc1214960	f5387d03-dff3-433b-a833-303b21bfa8e6	Firma geändert Neu: Muster GmbH	2026-05-01 12:32:16.80467+00
4f03fc81-4784-46e3-bfb2-aef2cb62fac4	59853152-4ca9-4212-9fcf-b46bc1214960	f5387d03-dff3-433b-a833-303b21bfa8e6	Raum geändert Neu: Saal	2026-05-01 12:32:27.754154+00
222a0711-de25-43ff-9e3b-b2acd0e641cd	59853152-4ca9-4212-9fcf-b46bc1214960	f5387d03-dff3-433b-a833-303b21bfa8e6	Zahlungsart geändert Neu: Barzahlung	2026-05-01 12:32:39.848723+00
b2b30bc3-1602-4d38-8ae6-0642a1d17a63	453a8b3f-d7cb-435f-a3c9-d753a7a994d4	f5387d03-dff3-433b-a833-303b21bfa8e6	Event archiviert	2026-05-01 19:03:10.755398+00
1ac9d24e-1c1e-413b-a00e-74a451a81592	5e7e6b78-a11b-4137-97d5-23f9bf61267c	f5387d03-dff3-433b-a833-303b21bfa8e6	Event archiviert	2026-05-01 19:14:40.196971+00
4a168006-1882-4e2f-9e9a-a64c02018483	e1ab1871-ac0b-4295-b702-f581a7d5a98a	f5387d03-dff3-433b-a833-303b21bfa8e6	Event archiviert	2026-05-01 19:28:54.623769+00
31acfe74-cd93-41d8-88bf-22c95aed5808	f2439fd8-8ed2-437b-b157-bae24e9c3b50	f5387d03-dff3-433b-a833-303b21bfa8e6	Event archiviert	2026-05-01 19:29:31.138905+00
863bb8d6-f91c-4bd3-9087-b0230268aea4	7e37a6a8-9977-402a-a929-c52d57d2b5e5	f5387d03-dff3-433b-a833-303b21bfa8e6	Event archiviert	2026-05-01 19:32:16.523871+00
ea7a89e4-bff2-41b7-b613-e80ae87bbd23	20f75990-7507-44c9-aaf1-569c12bb7ab6	f5387d03-dff3-433b-a833-303b21bfa8e6	Event archiviert	2026-05-01 19:33:09.765645+00
9f58562a-34ac-4a2d-b392-a7a2ce6d4829	2e091c7c-ab9e-44fb-9bad-02bfcac71ae8	f5387d03-dff3-433b-a833-303b21bfa8e6	Event archiviert	2026-05-02 05:33:36.160704+00
6f91879d-1659-44b4-b901-b7ee468f15a5	cc5c0e9d-9474-4da0-b350-b714139183ce	f5387d03-dff3-433b-a833-303b21bfa8e6	Event archiviert	2026-05-02 05:33:49.950697+00
edc776c0-f0b3-4c83-863c-f0ce32df461c	4ac01621-068f-4662-95b0-495ea4b8708d	f5387d03-dff3-433b-a833-303b21bfa8e6	Event archiviert	2026-05-02 05:34:01.664807+00
091eec7a-3804-4fd2-a7b9-2c5b557d61e9	8ae25656-0ffe-41e7-baf1-fc8a36dc9175	f5387d03-dff3-433b-a833-303b21bfa8e6	Event archiviert	2026-05-02 06:02:55.296685+00
69ec21da-f7ac-4234-bc03-8a88cdcc68e5	f471502f-69bf-4a5c-81a9-24c24c890957	f5387d03-dff3-433b-a833-303b21bfa8e6	Zahlungsart geändert Neu: Rechnung\nRechnungsfirma geändert Neu: Muster AG\nRechnung Vorname geändert Neu: Hans\nRechnung Nachname geändert Neu: Muster\nRechnungsadresse geändert Neu: Musterhausen	2026-05-02 16:52:15.756602+00
14c7d6dc-2c85-4f2e-a17d-9c6a092e3467	a7b30f89-c5d6-443b-b45b-4d20ae754b10	f5387d03-dff3-433b-a833-303b21bfa8e6	Zahlungsart geändert Neu: Rechnung\nRechnungsfirma geändert Neu: Muster AG\nRechnung Vorname geändert Neu: FLorian\nRechnung Nachname geändert Neu: Becker\nRechnungsadresse geändert Neu: Biffig 1	2026-05-02 17:01:47.69903+00
f6c4a2cf-03fa-4765-8186-95ababb0748c	a7b30f89-c5d6-443b-b45b-4d20ae754b10	f5387d03-dff3-433b-a833-303b21bfa8e6	Zahlungsart geändert Neu: Barzahlung\nRechnungsfirma entfernt\nRechnung Vorname entfernt\nRechnung Nachname entfernt\nRechnungsadresse entfernt	2026-05-02 17:02:19.244352+00
84b161c2-10b7-43ae-8a69-a17be29d10fd	37f0ba38-49dd-46b2-afdd-c46e8f64b3ec	f5387d03-dff3-433b-a833-303b21bfa8e6	Zahlungsart geändert Neu: Rechnung\nRechnungsadresse geändert	2026-05-02 17:09:39.823668+00
f5106cea-3952-486f-89a3-f1df70166484	37f0ba38-49dd-46b2-afdd-c46e8f64b3ec	f5387d03-dff3-433b-a833-303b21bfa8e6	Zahlungsart geändert Neu: Barzahlung\nRechnungsadresse geändert	2026-05-02 17:09:56.076073+00
dc13dadd-86af-418e-a672-76334701da94	f471502f-69bf-4a5c-81a9-24c24c890957	f5387d03-dff3-433b-a833-303b21bfa8e6	Vorname geändert Neu: David\nNachname geändert Neu: Meier\nTelefon geändert Neu: 079 123 45 67\nE-Mail geändert Neu: dm@muster.ch\nAdresse geändert Neu: Musterstr. 1, 1234 Musterhausen\nRaum geändert Neu: Irgendwo\nRechnungsadresse geändert	2026-05-02 17:27:21.971945+00
be840d89-c701-4aaa-a74d-5009f62070b5	f471502f-69bf-4a5c-81a9-24c24c890957	f5387d03-dff3-433b-a833-303b21bfa8e6	Erwachsene geändert Neu: 89\nKinder geändert Neu: 15\nRaum geändert Neu: Restaurant\nTechnik geändert\nInfrastruktur geändert\nAblauf geändert\nEssen geändert\nGetränke geändert\nNotizen geändert\nRechnungsadresse geändert	2026-05-04 16:31:54.262349+00
73e29bae-c2c6-462a-ac92-ca8fcb7fe8dc	f471502f-69bf-4a5c-81a9-24c24c890957	f5387d03-dff3-433b-a833-303b21bfa8e6	Infrastruktur geändert	2026-05-04 17:27:39.135169+00
be5ec40e-6f9f-435a-b7cd-f9ad2e1b11fe	f471502f-69bf-4a5c-81a9-24c24c890957	f5387d03-dff3-433b-a833-303b21bfa8e6	Technik geändert\nInfrastruktur geändert	2026-05-04 17:37:35.243655+00
25b77b17-04d3-4764-b5e9-5e83ecd9cdb3	f471502f-69bf-4a5c-81a9-24c24c890957	f5387d03-dff3-433b-a833-303b21bfa8e6	Ablauf geändert	2026-05-04 17:45:43.553011+00
0b659245-958e-4b1a-ad79-26cc60ef1187	f471502f-69bf-4a5c-81a9-24c24c890957	f5387d03-dff3-433b-a833-303b21bfa8e6	Notizen geändert	2026-05-04 17:46:08.922232+00
c0babe65-d660-4823-9aa7-a6b5da321cc6	2968a113-dde3-45ae-af7d-fa650a635d54	f5387d03-dff3-433b-a833-303b21bfa8e6	Firma geändert Neu: Muster GmbH	2026-05-06 06:03:35.650254+00
0e66e007-ce36-4329-bf21-1c013a395a83	f3418ca0-d582-45e9-ac1b-31aed6c24469	f5387d03-dff3-433b-a833-303b21bfa8e6	Räume geändert Neu: 63306504-527d-44eb-a8bb-6867b0a41af0, 3046586e-b4c3-497a-a44b-d91e67fc2825	2026-05-08 17:15:07.891131+00
8ec4f2cd-2dbf-4b21-9e40-3afcda7a6bc2	f3418ca0-d582-45e9-ac1b-31aed6c24469	f5387d03-dff3-433b-a833-303b21bfa8e6	Räume geändert Neu: 63306504-527d-44eb-a8bb-6867b0a41af0	2026-05-08 17:15:54.297916+00
075b4416-d51f-4ac4-a63c-a9379f7592ee	f3418ca0-d582-45e9-ac1b-31aed6c24469	f5387d03-dff3-433b-a833-303b21bfa8e6	Räume geändert Neu: 63306504-527d-44eb-a8bb-6867b0a41af0, 3046586e-b4c3-497a-a44b-d91e67fc2825	2026-05-08 17:17:32.29488+00
e3251810-30fb-4bc4-8c98-eb2a70f0754c	f3418ca0-d582-45e9-ac1b-31aed6c24469	f5387d03-dff3-433b-a833-303b21bfa8e6	Räume geändert Neu: Testraum	2026-05-08 18:14:23.801921+00
\.


--
-- Data for Name: events; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.events (id, title, status, date, company_name, firstname, lastname, notes, created_by, created_at, phone, email, adults, children, address, tech, infrastructure, schedule, food, drinks, payment_type, billing_company_name, billing_firstname, billing_lastname, billing_address, billing_email, billing_phone, room_id_1, room_id_2) FROM stdin;
5e7e6b78-a11b-4137-97d5-23f9bf61267c	Essen Siva	Archiviert	2026-04-14	\N	Siva	Arulananthan	\N	f5387d03-dff3-433b-a833-303b21bfa8e6	2026-04-30 17:36:24.18332+00	079 123 45 67	\N	15	3	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
983ef76d-c04a-4367-a1e6-d226a303cce3	Hochzeit Felder	Storniert	2026-04-30	\N	Martina	Felder	Hochzeitsgesellschaft	f5387d03-dff3-433b-a833-303b21bfa8e6	2026-04-17 13:54:17.55685+00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
fe50b63e-3a68-4c18-b568-547d8a2d7b95	Firmenessen	In Bearbeitung	2026-04-07	Muster GmbH	Maximilian	Mustermann	Sind alle VIP	f5387d03-dff3-433b-a833-303b21bfa8e6	2026-04-20 17:02:29.170592+00	041 123 45 67	muster@muster.ch	89	2	Musterstr. 1, 1234 Musterhausen	Beamer\r\nMikrofon	Stehtische\r\nBühne	12.00 Essen\r\n13.00 Dessert	Salat\r\n***\r\nFleisch\r\nSauce\r\nBeilage\r\nGemüse\r\n***\r\nDessert	Bier\r\nOrangensaft\r\nWeisswein\r\nRotwein\r\nWasser mit & ohne	rechnung	\N	\N	\N	\N	\N	\N	\N	\N
c4662fb8-a4f0-453f-9e11-e2f773bd8b1f	Kundenevent Bewohnende	Anfrage	2026-04-23	Alpha AG	Nina	Huber	Technik einplanen	227dec70-2dbf-4472-af6b-f71353d3aefe	2026-04-17 08:30:45.282857+00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
a6f79bbb-d065-4587-a102-70d71827f3d6	testevent	Anfrage	2026-04-25	Test AG	Hugo	Koch	Badge test	f5387d03-dff3-433b-a833-303b21bfa8e6	2026-04-17 13:41:31.742454+00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
39389d94-497e-4c0e-87c1-3f5bc2ea082b	QM Test 3	Archiviert	2026-11-11	\N	Renzo	Smania	\N	f5387d03-dff3-433b-a833-303b21bfa8e6	2026-05-02 06:19:48.036351+00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
2f4697ac-abd5-4d08-91ba-7a8e0353ae5d	VR Abendessen	Anfrage	2026-04-01	Biffig AG	Hugo	Mustermann	Günstig	f5387d03-dff3-433b-a833-303b21bfa8e6	2026-04-17 14:25:02.738284+00	041 123 45 67	\N	\N	\N	fdgg 67, 6589 sdfs	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
36c40a11-649c-43c9-bd16-cf57070cd05c	Payment Check	Anfrage	2026-04-05	sdsf	Max	Mustermann	Durst	f5387d03-dff3-433b-a833-303b21bfa8e6	2026-04-19 18:23:56.237734+00	\N	\N	8	\N	\N	\N	\N	\N	sdfsdf	sdfsdf	intern_aktivierung	\N	\N	\N	\N	\N	\N	\N	\N
dc5d5b37-30e6-4cf1-9266-317e4f3fb89d	Jassen	Anfrage	2026-04-30	Zwäg Schötz	\N	\N	Cacke	f5387d03-dff3-433b-a833-303b21bfa8e6	2026-04-17 14:24:32.521043+00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
8caf17a8-6685-4fe7-bbc2-7c41b24f90ed	Fasnachtsball	Anfrage	2026-04-30	Zwäg Schötz	\N	\N	\N	f5387d03-dff3-433b-a833-303b21bfa8e6	2026-04-17 14:27:25.914494+00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
bfd6fbb6-303c-4a12-a79a-6a0348a86ef9	create test	Anfrage	2026-06-14	Biffig AG	\N	\N	\N	f5387d03-dff3-433b-a833-303b21bfa8e6	2026-04-24 18:40:49.963909+00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
ec64a60c-606b-449c-8631-ac4c67e121fe	Blabla	Anfrage	2026-04-30	Blabla	Max	Mustermann	lsdmflsdmflsfm	f5387d03-dff3-433b-a833-303b21bfa8e6	2026-04-17 14:27:48.729966+00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
4a3cfec8-d304-4161-8b1c-7a21f30c0ee6	QM Test 2	Archiviert	2026-09-19	\N	Mario	Smania	\N	f5387d03-dff3-433b-a833-303b21bfa8e6	2026-05-02 06:19:15.343796+00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
ac2bdbcd-c991-4b88-8482-e10e31702ea6	Teamevent	Anfrage	2026-04-12	Muster GmbH	Lukas	Meier	Raum noch offen	f5387d03-dff3-433b-a833-303b21bfa8e6	2026-04-17 08:30:45.282857+00	041 123 45 67	sandro@localhost.ch	\N	\N	Musterstr. 1, 1234 Musterhausen	BEamer	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
e1ab1871-ac0b-4295-b702-f581a7d5a98a	Testanlass Neue Felder	Archiviert	2026-04-22	Muster AG	Sandro	Smania	dsfsdfsf	f5387d03-dff3-433b-a833-303b21bfa8e6	2026-04-19 15:45:40.05314+00	079 626 61 49	systemadmin@test.com	6	58	fdgdfgdfgfdg	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
ff5ad0fc-2ddc-4dfa-a858-87fc1db80102	Abweichende Adresse	Bestätigt	2026-05-22	Muster AG	Mario	Smania	\N	f5387d03-dff3-433b-a833-303b21bfa8e6	2026-05-02 16:38:21.935586+00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	rechnung	Muster AG	Florian	Becker	\N	\N	\N	\N	\N
f2439fd8-8ed2-437b-b157-bae24e9c3b50	Zäme Zmittag	Archiviert	2026-04-06	Biffig AG	\N	\N	\N	f5387d03-dff3-433b-a833-303b21bfa8e6	2026-04-20 11:24:16.54055+00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
faea1b8f-b2d2-4874-9fb1-cdcdcb474111	Legend Test	Anfrage	2026-07-05	Biffig AG	\N	\N	\N	f5387d03-dff3-433b-a833-303b21bfa8e6	2026-04-25 04:34:23.083723+00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
de94fbc7-ac5b-4213-912a-dff36c6edf30	Legend Test	Anfrage	2026-07-01	Muster AG	\N	\N	\N	226fea10-3807-4558-b360-def98a79b64b	2026-04-25 04:32:50.283268+00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
097dafd1-1d7b-4aa4-81c8-485249342015	Legend Test	Anfrage	2026-07-02	Muster AG	\N	\N	\N	227dec70-2dbf-4472-af6b-f71353d3aefe	2026-04-25 04:33:16.991348+00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
6171e8c4-2d2e-47fe-95ec-6f69016a6eb7	Legend Test	Anfrage	2026-07-03	Muster AG	\N	\N	\N	516858b9-2a3a-4ed1-b220-7fca18e2e85c	2026-04-25 04:33:34.529755+00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
31a3019b-2359-49ef-b81b-2f930ffbdb95	Legend Test	Anfrage	2026-07-04	Muster AG	\N	\N	\N	7d0a01fd-4f9e-4d04-9f1c-14708a76001b	2026-04-25 04:33:55.382855+00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
e153b7e0-42f3-4e74-8373-bf11288d2cf0	Legend Test	Anfrage	2026-07-06	Muster AG	\N	\N	\N	fc7864a9-82db-416f-97db-a4217b72b41e	2026-04-25 04:34:34.551481+00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
8d44f424-4019-48e4-839c-8dd7dd3ac715	Holiday Check	Anfrage	2026-08-01	Muster AG	\N	\N	\N	f5387d03-dff3-433b-a833-303b21bfa8e6	2026-04-25 06:21:26.145281+00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
7412c420-b2b3-4eaf-b632-6564d461c425	Cockpit Check 2	Anfrage	2026-07-14	Muster GmbH	\N	\N	\N	f5387d03-dff3-433b-a833-303b21bfa8e6	2026-04-26 05:07:20.35698+00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
ff9c8607-5670-4b7e-a99f-7582e294bb54	Today 2	Anfrage	2026-04-26	Biffig AG	\N	\N	\N	f5387d03-dff3-433b-a833-303b21bfa8e6	2026-04-26 05:26:42.941038+00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
2968a113-dde3-45ae-af7d-fa650a635d54	Firmenessen Biffig AG	Anfrage	2026-05-25	Muster GmbH	Florian	Becker	8x Vegi\r\n1x Rollstuhl\r\n4x Glutenfrei\r\n2x Laktosefrei\r\n\r\nWollen nicht im stehen Apero	f5387d03-dff3-433b-a833-303b21bfa8e6	2026-05-02 19:36:36.84452+00	041 123 45 67	florian@test.ch	45	8	Biffig 1, 6247 Schötz	Mikrofon, Beamer, Leinwand	Stehtische, Raucher-Ecke	19:00 Apero\r\n18:00 VSP\r\n18:15 Ansprache\r\n18:30 HG	Blattsalat mit Corutons und Hausdressing\r\n***\r\nHackbraten\r\nPfeffersauce\r\nKartoffelstock\r\nMischgemüse\r\n***\r\nCaramelköpfli mit Rahm	Madame Rosmarie weiss & rot\r\nMineralwasser mit & ohne\r\nBier\r\nKaffee (inkl. Schnaps)	rechnung	Biffig AG	Stefan	Wülser	Biffig 1, 6247 Schötz	stefan@test.ch	079 123 45 67	\N	\N
7e37a6a8-9977-402a-a929-c52d57d2b5e5	Today 3	Archiviert	2026-04-26	Muster AG	\N	\N	\N	f5387d03-dff3-433b-a833-303b21bfa8e6	2026-04-26 05:27:00.200253+00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
2e091c7c-ab9e-44fb-9bad-02bfcac71ae8	Status Check	Archiviert	2026-04-24	Muster GmbH	Hugo	Mustermann	VIP	f5387d03-dff3-433b-a833-303b21bfa8e6	2026-04-22 06:46:15.686687+00	041 123 45 68	muster@muster.ch	4	2	Musterstr. 1, 1234 Musterhausen	Beamer	Podest	12.00 Essen	Hackbraten	Wein	rechnung	\N	\N	\N	\N	\N	\N	\N	\N
718debe5-e652-4602-b1e6-8eb2a0823c14	New Fields	Archiviert	2026-04-04	kjh,l	\N	\N	\N	f5387d03-dff3-433b-a833-303b21bfa8e6	2026-04-19 18:01:32.427975+00	\N	\N	\N	\N	\N	ghdffg	dfgdfgdfg	dfgdfgdfg	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
44784d18-3ff3-4187-ae0f-4a24170a2ea3	dslfm	Archiviert	2026-04-28	Biffig AG	\N	\N	\N	f5387d03-dff3-433b-a833-303b21bfa8e6	2026-04-24 18:40:13.562312+00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
dac875d2-1870-45e3-8a28-b42b0faf3f6c	Sommerfest	Archiviert	2026-04-17	\N	Sandro	Smania	Erste Anfrage	f5387d03-dff3-433b-a833-303b21bfa8e6	2026-04-17 08:30:45.282857+00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
cc5c0e9d-9474-4da0-b350-b714139183ce	Frühlingsbrunch	Archiviert	2026-04-08	Muster AG	Anna	Keller	VIP-Gruppe	fc7864a9-82db-416f-97db-a4217b72b41e	2026-04-17 08:30:45.282857+00	\N	\N	\N	\N	fdgdfg 10, 6589 dfs	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
4ac01621-068f-4662-95b0-495ea4b8708d	Delete Test	Archiviert	2026-04-03	sdsdf	fdgvd	sd<	cvfv	f5387d03-dff3-433b-a833-303b21bfa8e6	2026-04-19 17:29:20.304259+00	079 626 61 49	sandro@localhost.ch	6	8	fdgg 67, 6589 sdfs	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
59853152-4ca9-4212-9fcf-b46bc1214960	Filter Test	In Bearbeitung	2026-06-11	Muster GmbH	Max	Mustermann	\N	f5387d03-dff3-433b-a833-303b21bfa8e6	2026-04-24 18:39:03.391134+00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	barzahlung	\N	\N	\N	\N	\N	\N	\N	\N
453a8b3f-d7cb-435f-a3c9-d753a7a994d4	Auditlog Test	Archiviert	2026-04-09	Muster AG	Maximilian	Mustermann	VIP, Günstig	f5387d03-dff3-433b-a833-303b21bfa8e6	2026-04-22 07:28:58.134635+00	041 123 45 67	sandro@localhost.ch	98	0	Musterstr. 1, 1234 Musterhausen	Mikro	Stehtisch, Podest	15.00 Apero	Hackbraten	Wein	intern_aktivierung	\N	\N	\N	\N	\N	\N	\N	\N
8ae25656-0ffe-41e7-baf1-fc8a36dc9175	QM Test 1	Archiviert	2026-05-01	QM AG	\N	\N	\N	f5387d03-dff3-433b-a833-303b21bfa8e6	2026-05-02 06:02:33.491367+00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
37f0ba38-49dd-46b2-afdd-c46e8f64b3ec	Payment Log	Anfrage	2026-05-15	Muster GmbH	Maximilian	Felder	\N	f5387d03-dff3-433b-a833-303b21bfa8e6	2026-05-02 17:09:12.535525+00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	barzahlung	\N	\N	\N	\N	\N	\N	\N	\N
a7b30f89-c5d6-443b-b45b-4d20ae754b10	Adress CHeck	Anfrage	2026-05-14	Muster AG	Max	Mustermann	\N	f5387d03-dff3-433b-a833-303b21bfa8e6	2026-05-02 17:01:11.848617+00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	barzahlung	\N	\N	\N	\N	\N	\N	\N	\N
20f75990-7507-44c9-aaf1-569c12bb7ab6	Today	Archiviert	2026-04-26	Blabla	\N	\N	\N	f5387d03-dff3-433b-a833-303b21bfa8e6	2026-04-26 05:08:34.53471+00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	099c7c04-4691-4f73-a9e2-b221cfbbfef7	\N
f471502f-69bf-4a5c-81a9-24c24c890957	Cockpit Check	In Bearbeitung	2026-05-12	Muster AG	David	Meier	Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.	f5387d03-dff3-433b-a833-303b21bfa8e6	2026-04-26 05:06:50.430992+00	079 123 45 67	dm@muster.ch	89	15	Musterstr. 1, 1234 Musterhausen	\N	\N	Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.	Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.  \r\n\r\nDuis autem vel eum iriure dolor in hendrerit in vulputate velit esse molestie consequat, vel illum dolore eu feugiat nulla facilisis at vero eros et accumsan et iusto odio dignissim qui blandit praesent luptatum zzril delenit augue duis dolore te feugait nulla facilisi. Lorem ipsum dolor sit amet, consectetuer	Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.  \r\n\r\nDuis autem vel eum iriure dolor in hendrerit in vulputate velit esse molestie consequat, vel illum dolore eu feugiat nulla facilisis at vero eros et accumsan et iusto odio dignissim qui blandit praesent luptatum zzril delenit augue duis dolore te feugait nulla facilisi. Lorem ipsum dolor sit amet, consectetuer	rechnung	Muster AG	Hans	Muster	Musterstr. 1, 1234 Musterhausen	hm@muster.ch	079 123 45 67	\N	\N
f3418ca0-d582-45e9-ac1b-31aed6c24469	Romm Test	Anfrage	2026-05-26	Muster AG	\N	\N	\N	f5387d03-dff3-433b-a833-303b21bfa8e6	2026-05-08 17:14:45.124303+00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	63306504-527d-44eb-a8bb-6867b0a41af0	\N
\.


--
-- Data for Name: holidays; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.holidays (id, name, date, type, scope, country_code, region_code, canton_code, color, background_color, is_active, is_public_holiday, is_company_holiday, notes, created_by, created_at, updated_at) FROM stdin;
07d33da1-4902-4b94-bcbd-321aec75bfc4	Nationalfeiertag	2026-08-01	holiday	country	CH	\N	\N	#dc2626	#fee2e2	t	t	f	\N	\N	2026-04-25 06:14:23.398037+00	2026-04-25 06:14:23.398037+00
ead17b97-86b0-4e50-8e64-2aea89fc96fb	Neujahr	2026-01-01	holiday	country	CH	\N	\N	#dc2626	#fee2e2	t	t	f	\N	\N	2026-04-25 06:22:41.176993+00	2026-04-25 06:22:41.176993+00
aab982c5-9eba-4077-96c0-164e6022a5c6	Karfreitag	2026-04-03	holiday	country	CH	\N	\N	#dc2626	#fee2e2	t	t	f	\N	\N	2026-04-25 06:23:18.517902+00	2026-04-25 06:23:18.517902+00
35724efe-7536-4d36-a91b-30c872a3ea34	Ostermontag	2026-04-06	holiday	country	CH	\N	\N	#dc2626	#fee2e2	t	t	f	\N	\N	2026-04-25 06:23:37.538502+00	2026-04-25 06:23:37.538502+00
\.


--
-- Data for Name: offer_categories; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.offer_categories (id, parent_id, name, slug, sort_order, is_active, created_at, updated_at) FROM stdin;
24098290-ea1c-4738-94a2-f22faee47496	\N	Food	food	10	t	2026-05-09 17:14:34.345063+00	2026-05-09 17:14:34.345063+00
b3fb7d2f-cdc3-42e7-968f-4cd3732b308b	\N	Getränke	getraenke	20	t	2026-05-09 17:14:34.345063+00	2026-05-09 17:14:34.345063+00
e0b7a744-2072-4091-a2f5-d707e4bcaeda	\N	Seminare	seminare	30	t	2026-05-09 17:14:34.345063+00	2026-05-09 17:14:34.345063+00
db149f9b-c08b-41aa-8293-a9841bb52bff	\N	Räume	raeume	40	t	2026-05-09 17:14:34.345063+00	2026-05-09 17:14:34.345063+00
06cdda63-0bff-4a67-87b4-af0f5d4ea070	\N	Technik	technik	50	t	2026-05-09 17:14:34.345063+00	2026-05-09 17:14:34.345063+00
30b1e193-4de1-42a4-b82f-5b285de7e594	\N	Extras	extras	60	t	2026-05-09 17:14:34.345063+00	2026-05-09 17:14:34.345063+00
46f14378-c385-49e7-9fb0-460cb4ad0b1e	24098290-ea1c-4738-94a2-f22faee47496	Vorspeisen	food-vorspeisen	10	t	2026-05-09 17:14:34.345063+00	2026-05-09 17:14:34.345063+00
e4240252-09b7-42d5-b7cd-b039ed088faa	24098290-ea1c-4738-94a2-f22faee47496	Suppen	food-suppen	20	t	2026-05-09 17:14:34.345063+00	2026-05-09 17:14:34.345063+00
a480c93b-5784-4a43-8175-27ab2a6fef2f	24098290-ea1c-4738-94a2-f22faee47496	Hauptgänge	food-hauptgaenge	30	t	2026-05-09 17:14:34.345063+00	2026-05-09 17:14:34.345063+00
1580cc3d-9b07-4e10-9c44-0e254a2011c3	24098290-ea1c-4738-94a2-f22faee47496	Beilagen	food-beilagen	40	t	2026-05-09 17:14:34.345063+00	2026-05-09 17:14:34.345063+00
352503f6-e1d8-4212-8f7b-1def7466eea8	24098290-ea1c-4738-94a2-f22faee47496	Desserts	food-desserts	50	t	2026-05-09 17:14:34.345063+00	2026-05-09 17:14:34.345063+00
747e56e3-a01e-4319-9109-adc4ee588722	24098290-ea1c-4738-94a2-f22faee47496	Extras	food-extras	60	t	2026-05-09 17:14:34.345063+00	2026-05-09 17:14:34.345063+00
99fa6184-e2d0-4965-89e2-0125627f8313	a480c93b-5784-4a43-8175-27ab2a6fef2f	Schwein	food-hauptgaenge-schwein	10	t	2026-05-09 17:14:34.345063+00	2026-05-09 17:14:34.345063+00
b4da48cd-23c9-412e-89e0-7bb72400e58b	a480c93b-5784-4a43-8175-27ab2a6fef2f	Rind	food-hauptgaenge-rind	20	t	2026-05-09 17:14:34.345063+00	2026-05-09 17:14:34.345063+00
e515743b-983a-4fc2-b4f4-d0311e17045a	a480c93b-5784-4a43-8175-27ab2a6fef2f	Kalb	food-hauptgaenge-kalb	30	t	2026-05-09 17:14:34.345063+00	2026-05-09 17:14:34.345063+00
ec3b4b0a-0e01-4d4e-a0f7-a20a2617eaa4	a480c93b-5784-4a43-8175-27ab2a6fef2f	Geflügel	food-hauptgaenge-gefluegel	40	t	2026-05-09 17:14:34.345063+00	2026-05-09 17:14:34.345063+00
c4bb3496-7740-4e11-88f0-8b925da2c90f	a480c93b-5784-4a43-8175-27ab2a6fef2f	Fisch	food-hauptgaenge-fisch	50	t	2026-05-09 17:14:34.345063+00	2026-05-09 17:14:34.345063+00
c62410b0-f3a7-4a5a-b6fe-e618931030a8	a480c93b-5784-4a43-8175-27ab2a6fef2f	Vegetarisch	food-hauptgaenge-vegetarisch	60	t	2026-05-09 17:14:34.345063+00	2026-05-09 17:14:34.345063+00
36325604-9dde-458c-9a80-b3b98db2d3ba	1580cc3d-9b07-4e10-9c44-0e254a2011c3	Stärkebeilagen	food-beilagen-staerke	10	t	2026-05-09 17:14:34.345063+00	2026-05-09 17:14:34.345063+00
d3524e12-03f9-415d-b2a1-a17a9e2179df	1580cc3d-9b07-4e10-9c44-0e254a2011c3	Gemüsebeilagen	food-beilagen-gemuese	20	t	2026-05-09 17:14:34.345063+00	2026-05-09 17:14:34.345063+00
51a21161-8dc1-495a-b2df-bf4af007ba87	e0b7a744-2072-4091-a2f5-d707e4bcaeda	Kaffeepausen	seminare-kaffeepausen	10	t	2026-05-09 17:14:34.345063+00	2026-05-09 17:14:34.345063+00
64992a17-6565-498e-aa67-433bff03e644	e0b7a744-2072-4091-a2f5-d707e4bcaeda	Seminarpauschalen	seminare-pauschalen	20	t	2026-05-09 17:14:34.345063+00	2026-05-09 17:14:34.345063+00
c45fca25-2d40-49e6-acb4-6b70af176bf7	e0b7a744-2072-4091-a2f5-d707e4bcaeda	Seminar-Extras	seminare-extras	30	t	2026-05-09 17:14:34.345063+00	2026-05-09 17:14:34.345063+00
e837eee1-b2d4-43fb-85c4-50ee30a41f41	b3fb7d2f-cdc3-42e7-968f-4cd3732b308b	Warme Getränke	getraenke-warm	10	t	2026-05-09 17:14:34.345063+00	2026-05-09 17:14:34.345063+00
23f319ce-8b45-4248-a3ba-d160bb8a621a	b3fb7d2f-cdc3-42e7-968f-4cd3732b308b	Kalte Getränke	getraenke-kalt	20	t	2026-05-09 17:14:34.345063+00	2026-05-09 17:14:34.345063+00
60171e51-2025-460e-b71d-b0b28702ce25	b3fb7d2f-cdc3-42e7-968f-4cd3732b308b	Bier / Most	getraenke-bier-most	30	t	2026-05-09 17:14:34.345063+00	2026-05-09 17:14:34.345063+00
349045ba-a876-4210-b147-b5fdb4df4a9a	b3fb7d2f-cdc3-42e7-968f-4cd3732b308b	Aperitif	getraenke-aperitif	40	t	2026-05-09 17:14:34.345063+00	2026-05-09 17:14:34.345063+00
aa93b115-9d08-4650-8328-887dd43b5991	b3fb7d2f-cdc3-42e7-968f-4cd3732b308b	Spirituosen	getraenke-spirituosen	50	t	2026-05-09 17:14:34.345063+00	2026-05-09 17:14:34.345063+00
1d41b419-997f-4cc3-8e61-29c1f7bdbb01	b3fb7d2f-cdc3-42e7-968f-4cd3732b308b	Offenausschank	getraenke-offenausschank	60	t	2026-05-09 17:14:34.345063+00	2026-05-09 17:14:34.345063+00
fe9a42c1-b73b-4537-86e5-38140dd6bfb1	b3fb7d2f-cdc3-42e7-968f-4cd3732b308b	Flaschenweine	getraenke-flaschenweine	70	t	2026-05-09 17:14:34.345063+00	2026-05-09 17:14:34.345063+00
\.


--
-- Data for Name: offer_items; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.offer_items (id, category_id, name, description, unit, price, item_type, tax_rate, is_active, sort_order, created_at, updated_at) FROM stdin;
f88e0e85-ab28-4c19-8484-87900c2d8956	46f14378-c385-49e7-9fb0-460cb4ad0b1e	Knackiger Blattsalat mit Kräutercroutons	\N	person	8.00	item	8.10	t	0	2026-05-09 17:16:44.561456+00	2026-05-09 17:16:44.561456+00
2ff51d98-c7ed-49e9-8a6b-3d58b33970e2	46f14378-c385-49e7-9fb0-460cb4ad0b1e	Gemischter Salat nach Saison	\N	person	9.00	item	8.10	t	0	2026-05-09 17:16:44.561456+00	2026-05-09 17:16:44.561456+00
9e098e0f-2509-4fd0-8b8e-707e4c473288	46f14378-c385-49e7-9fb0-460cb4ad0b1e	Nüsslisalat mit Speck, Ei und Croutons	\N	person	16.00	item	8.10	t	0	2026-05-09 17:16:44.561456+00	2026-05-09 17:16:44.561456+00
53c3fd1c-930e-4734-a151-229e04880236	e4240252-09b7-42d5-b7cd-b039ed088faa	Pastinaken-Apfel-Suppe	\N	person	10.50	item	8.10	t	0	2026-05-09 17:17:46.975273+00	2026-05-09 17:17:46.975273+00
9e4a3cc3-40e7-4d16-8776-8030d404cf72	e4240252-09b7-42d5-b7cd-b039ed088faa	Tagessuppe	\N	person	7.50	item	8.10	t	0	2026-05-09 17:17:46.975273+00	2026-05-09 17:17:46.975273+00
fd5c39e8-7b88-40ff-87ee-3b640f005b0b	99fa6184-e2d0-4965-89e2-0125627f8313	Rahmschnitzel an Pilzsauce	\N	person	24.00	item	8.10	t	0	2026-05-09 17:18:01.273774+00	2026-05-09 17:18:01.273774+00
ff03ab9c-8f95-4052-a92d-8cf897655bb9	99fa6184-e2d0-4965-89e2-0125627f8313	Paniertes Schnitzel	\N	person	26.00	item	8.10	t	0	2026-05-09 17:18:01.273774+00	2026-05-09 17:18:01.273774+00
203a0818-8582-4f3a-98ea-a350ba644cc0	b4da48cd-23c9-412e-89e0-7bb72400e58b	Gespickter Schmorbraten	\N	person	32.00	item	8.10	t	0	2026-05-09 17:18:07.627751+00	2026-05-09 17:18:07.627751+00
0405ced7-0013-4f38-8c02-78a5da14a600	b4da48cd-23c9-412e-89e0-7bb72400e58b	Roastbeef an Bernaisesauce	\N	person	39.00	item	8.10	t	0	2026-05-09 17:18:07.627751+00	2026-05-09 17:18:07.627751+00
89138c5b-bf07-4a8e-b1cd-fda76f414301	c62410b0-f3a7-4a5a-b6fe-e618931030a8	Zucchetti Piccata	\N	person	23.00	item	8.10	t	0	2026-05-09 17:18:16.781147+00	2026-05-09 17:18:16.781147+00
9e0cb6bd-ebec-45a2-bf5c-9145228c3273	c62410b0-f3a7-4a5a-b6fe-e618931030a8	Gemüsestrudel mit Sauerrahmdipp	\N	person	24.00	item	8.10	t	0	2026-05-09 17:18:16.781147+00	2026-05-09 17:18:16.781147+00
e8c4f71e-2a4f-4664-851a-665d500405d5	36325604-9dde-458c-9a80-b3b98db2d3ba	Pommes Frites	\N	portion	0.00	item	8.10	t	0	2026-05-09 17:18:24.414031+00	2026-05-09 17:18:24.414031+00
d7ecc176-16ef-4ef5-b8ce-412020a53f33	d3524e12-03f9-415d-b2a1-a17a9e2179df	Ratatouille	\N	portion	0.00	item	8.10	t	0	2026-05-09 17:18:24.414031+00	2026-05-09 17:18:24.414031+00
3174e5c2-9a6f-452c-82a7-d00ec66c8aa3	747e56e3-a01e-4319-9109-adc4ee588722	Zusätzliche Beilage	\N	person	4.50	item	8.10	t	0	2026-05-09 17:18:31.900608+00	2026-05-09 17:18:31.900608+00
0084ff2f-d0ab-4bd9-a782-2a5efb7541e3	64992a17-6565-498e-aa67-433bff03e644	Seminarpauschale Klein	\N	person	68.00	package	8.10	t	0	2026-05-09 17:18:38.95488+00	2026-05-09 17:18:38.95488+00
93af9bab-2952-4613-bc77-268abe50f770	64992a17-6565-498e-aa67-433bff03e644	Seminarpauschale Mittel	\N	person	75.00	package	8.10	t	0	2026-05-09 17:18:38.95488+00	2026-05-09 17:18:38.95488+00
c2ced37f-987b-4c2d-bbe8-03b14606a947	64992a17-6565-498e-aa67-433bff03e644	Seminarpauschale Gross	\N	person	85.00	package	8.10	t	0	2026-05-09 17:18:38.95488+00	2026-05-09 17:18:38.95488+00
2d871641-bc21-41dc-88f8-831204342199	e837eee1-b2d4-43fb-85c4-50ee30a41f41	Kaffee Crème	\N	piece	4.20	item	8.10	t	0	2026-05-10 14:45:52.826105+00	2026-05-10 14:45:52.826105+00
c1956243-32ba-47ca-bfb6-efeea4f6f4ef	e837eee1-b2d4-43fb-85c4-50ee30a41f41	Cappuccino	\N	piece	4.50	item	8.10	t	0	2026-05-10 14:45:52.826105+00	2026-05-10 14:45:52.826105+00
8b7c3804-8cca-4dfa-8d7b-fb2b7ff0c129	23f319ce-8b45-4248-a3ba-d160bb8a621a	Mineralwasser 0.5l	\N	bottle	4.50	item	8.10	t	0	2026-05-10 14:46:01.465717+00	2026-05-10 14:46:01.465717+00
fa2a557d-7963-494e-8ee6-5e726e95f2a2	23f319ce-8b45-4248-a3ba-d160bb8a621a	Cola 0.5l	\N	bottle	5.00	item	8.10	t	0	2026-05-10 14:46:01.465717+00	2026-05-10 14:46:01.465717+00
bab5ce6b-8fd3-481b-810c-2cabd9582275	60171e51-2025-460e-b71d-b0b28702ce25	Eichhof Lager 3.3dl	\N	bottle	4.50	item	8.10	t	0	2026-05-10 14:46:10.457593+00	2026-05-10 14:46:10.457593+00
155b9ba8-0871-4657-a06a-53947086f71e	1d41b419-997f-4cc3-8e61-29c1f7bdbb01	Weisswein 1dl	\N	portion	5.50	item	8.10	t	0	2026-05-10 14:46:19.589232+00	2026-05-10 14:46:19.589232+00
3b5194c5-ddd9-4d81-aa2f-6a73d081b550	fe9a42c1-b73b-4537-86e5-38140dd6bfb1	Piacere VdP Suisse 75cl	\N	bottle	38.00	item	8.10	t	0	2026-05-10 14:46:27.507117+00	2026-05-10 14:46:27.507117+00
13b6ba51-13a7-421b-8f70-fdf5ee840142	352503f6-e1d8-4212-8f7b-1def7466eea8	Gebrannte Creme mit Kirsch	\N	person	9.00	item	8.10	t	0	2026-05-10 14:49:34.873615+00	2026-05-10 14:49:34.873615+00
f5f034f2-6031-44d4-82e0-221f6506adb2	352503f6-e1d8-4212-8f7b-1def7466eea8	Panna Cotta mit Fruchtsauce	\N	person	9.50	item	8.10	t	0	2026-05-10 14:49:34.873615+00	2026-05-10 14:49:34.873615+00
6e27f591-3ffe-46f6-bfc9-75e200f2bb2a	352503f6-e1d8-4212-8f7b-1def7466eea8	Tobleronemousse	\N	person	12.50	item	8.10	t	0	2026-05-10 14:49:34.873615+00	2026-05-10 14:49:34.873615+00
62edddfd-bfe4-4e98-b791-d94ce1316731	e4240252-09b7-42d5-b7cd-b039ed088faa	Bouillon mit Einlage	\N	person	7.50	item	8.10	t	0	2026-05-09 17:17:46.975273+00	2026-05-09 17:17:46.975273+00
\.


--
-- Data for Name: room_documents; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.room_documents (id, room_id, file_path, file_name, file_type, description, created_at) FROM stdin;
275b2504-cfaa-4611-bbe2-4d2775b72bd8	3046586e-b4c3-497a-a44b-d91e67fc2825	rooms/3046586e-b4c3-497a-a44b-d91e67fc2825/documents/1778225760957-eventhochzeitrita.pdf	event_Hochzeit_Rita.pdf	\N	\N	2026-05-08 07:36:01.04565+00
\.


--
-- Data for Name: room_images; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.room_images (id, room_id, file_path, file_name, alt_text, sort_order, created_at) FROM stdin;
608e00e2-9f09-440d-9ce2-92ec23275bb9	63306504-527d-44eb-a8bb-6867b0a41af0	rooms/63306504-527d-44eb-a8bb-6867b0a41af0/1778054363253-semi1-min.jpg	semi1-min.jpg	semi1-min.jpg	0	2026-05-06 07:59:24.305706+00
fb2bc10c-c0bf-4430-b9df-2a03ff8d36c3	63306504-527d-44eb-a8bb-6867b0a41af0	rooms/63306504-527d-44eb-a8bb-6867b0a41af0/1778054364118-semi2-min.jpg	semi2-min.jpg	semi2-min.jpg	0	2026-05-06 07:59:24.696843+00
20b625bc-0b1a-45d5-811d-1ff50da82a8d	63306504-527d-44eb-a8bb-6867b0a41af0	rooms/63306504-527d-44eb-a8bb-6867b0a41af0/1778054364489-semi3-min.jpg	semi3-min.jpg	semi3-min.jpg	0	2026-05-06 07:59:25.5513+00
0a7ab32e-3ef0-4634-b1f5-ad70259f8699	d06fbc54-41c4-43a5-a16d-1edc7d84b9f4	rooms/d06fbc54-41c4-43a5-a16d-1edc7d84b9f4/1778070673595-semi1-min.jpg	semi1-min.jpg	semi1-min.jpg	0	2026-05-06 12:31:14.548475+00
4811c082-168c-4c2e-a9ef-62127e7f1c8a	8876f6d9-efd0-4aa4-9aa8-683838c8508c	rooms/8876f6d9-efd0-4aa4-9aa8-683838c8508c/1778072467226-semi1-min.jpg	semi1-min.jpg	semi1-min.jpg	0	2026-05-06 13:01:08.567692+00
c43622ef-317c-4258-b67d-49c30d492a96	8876f6d9-efd0-4aa4-9aa8-683838c8508c	rooms/8876f6d9-efd0-4aa4-9aa8-683838c8508c/1778072468332-semi2-min.jpg	semi2-min.jpg	semi2-min.jpg	0	2026-05-06 13:01:08.97548+00
a3734b84-7ec6-4488-9aac-f55c41b8f493	8876f6d9-efd0-4aa4-9aa8-683838c8508c	rooms/8876f6d9-efd0-4aa4-9aa8-683838c8508c/1778072468945-semi3-min.jpg	semi3-min.jpg	semi3-min.jpg	0	2026-05-06 13:01:09.651284+00
\.


--
-- Data for Name: room_logs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.room_logs (id, room_id, user_id, change, created_at) FROM stdin;
5a2a9bad-3e3b-44a9-b10b-a4bc85feff45	63306504-527d-44eb-a8bb-6867b0a41af0	f5387d03-dff3-433b-a833-303b21bfa8e6	Raum erstellt	2026-05-06 04:44:11.070518+00
31f7207d-a7bc-4b9e-a815-135c30551221	099c7c04-4691-4f73-a9e2-b221cfbbfef7	f5387d03-dff3-433b-a833-303b21bfa8e6	Raum erstellt	2026-05-06 04:52:03.686419+00
6efc9ace-c6d8-43b7-834a-a0aa861a86da	df0cebd5-9d85-4b66-970f-35a15c055499	f5387d03-dff3-433b-a833-303b21bfa8e6	Raum erstellt	2026-05-06 04:57:34.224675+00
db2dd107-9b6d-4dc9-8166-378e5d78a730	df0cebd5-9d85-4b66-970f-35a15c055499	f5387d03-dff3-433b-a833-303b21bfa8e6	Raum bearbeitet	2026-05-06 05:37:27.606515+00
31caecc6-8617-4abf-8536-0e9814b4a8e4	df0cebd5-9d85-4b66-970f-35a15c055499	f5387d03-dff3-433b-a833-303b21bfa8e6	Name geändert Neu: tztrzrrtz	2026-05-06 06:41:18.470576+00
67f21ecf-8050-4646-bf7c-5fc5021c27e1	d06fbc54-41c4-43a5-a16d-1edc7d84b9f4	f5387d03-dff3-433b-a833-303b21bfa8e6	Raum erstellt	2026-05-06 12:31:14.616796+00
691bfd63-3ce7-4a67-8923-0ab6471017aa	8876f6d9-efd0-4aa4-9aa8-683838c8508c	f5387d03-dff3-433b-a833-303b21bfa8e6	Raum erstellt	2026-05-06 13:01:09.706221+00
cde35576-1dcd-4379-a066-b84375c749e7	3046586e-b4c3-497a-a44b-d91e67fc2825	f5387d03-dff3-433b-a833-303b21bfa8e6	Raum erstellt	2026-05-08 07:36:01.123482+00
324392e4-8c4d-489f-92f2-59709f0a9bfe	63306504-527d-44eb-a8bb-6867b0a41af0	f5387d03-dff3-433b-a833-303b21bfa8e6	Dokument hochgeladen Neu: laufzettel-firmenessen-biffig-ag.pdf	2026-05-08 07:42:44.27165+00
5cc91e9a-f2e1-468f-8363-75026749ab2c	63306504-527d-44eb-a8bb-6867b0a41af0	f5387d03-dff3-433b-a833-303b21bfa8e6	Dokument gelöscht Neu: laufzettel-firmenessen-biffig-ag.pdf	2026-05-08 08:07:03.231701+00
d686d18c-3dc7-446b-b9a8-f6af49369207	df0cebd5-9d85-4b66-970f-35a15c055499	f5387d03-dff3-433b-a833-303b21bfa8e6	Bild hochgeladen Neu: Screenshot 2026-05-06 091137.png	2026-05-08 15:07:36.149746+00
e36da53a-5dd0-4b7e-9280-6393e9792f19	df0cebd5-9d85-4b66-970f-35a15c055499	f5387d03-dff3-433b-a833-303b21bfa8e6	Bild gelöscht Neu: Screenshot 2026-05-06 091137.png	2026-05-08 15:07:52.080797+00
\.


--
-- Data for Name: rooms; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.rooms (id, name, capacity, function_description, status, equipment, internal_notes, sort_order, created_by, updated_by, created_at, updated_at) FROM stdin;
099c7c04-4691-4f73-a9e2-b221cfbbfef7	Testresti	100	Test	active	{Test}	Test	0	f5387d03-dff3-433b-a833-303b21bfa8e6	f5387d03-dff3-433b-a833-303b21bfa8e6	2026-05-06 04:52:03.619654+00	2026-05-06 04:52:03.619654+00
d06fbc54-41c4-43a5-a16d-1edc7d84b9f4	Single Bild test	435	dsfsdf	active	{sdafsa}	saefdsdf	0	f5387d03-dff3-433b-a833-303b21bfa8e6	f5387d03-dff3-433b-a833-303b21bfa8e6	2026-05-06 12:31:14.001504+00	2026-05-06 12:31:14.001504+00
8876f6d9-efd0-4aa4-9aa8-683838c8508c	sdnfk	45	qerf	active	{efsf}	dfgd	0	f5387d03-dff3-433b-a833-303b21bfa8e6	f5387d03-dff3-433b-a833-303b21bfa8e6	2026-05-06 13:01:07.429939+00	2026-05-06 13:46:36.889+00
3046586e-b4c3-497a-a44b-d91e67fc2825	Testraum 2	4455	\N	active	{}	\N	0	f5387d03-dff3-433b-a833-303b21bfa8e6	f5387d03-dff3-433b-a833-303b21bfa8e6	2026-05-08 07:36:00.600153+00	2026-05-08 07:36:00.600153+00
63306504-527d-44eb-a8bb-6867b0a41af0	Testraum	100	Testraum	active	{Testepipment}	Testraum	0	f5387d03-dff3-433b-a833-303b21bfa8e6	f5387d03-dff3-433b-a833-303b21bfa8e6	2026-05-06 04:44:10.9766+00	2026-05-08 08:07:02.894+00
df0cebd5-9d85-4b66-970f-35a15c055499	tztrzrrtz	85	sdfsd,f	active	{awedasd}	dfsgsdfg	0	f5387d03-dff3-433b-a833-303b21bfa8e6	f5387d03-dff3-433b-a833-303b21bfa8e6	2026-05-06 04:57:34.167744+00	2026-05-08 15:07:51.331+00
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, email, role, active, area, created_at, department, department_id, must_change_password, password_changed_at) FROM stdin;
f5387d03-dff3-433b-a833-303b21bfa8e6	systemadmin@test.com	systemadmin	t	Geschäftsleitung	2026-04-17 06:33:53.766042+00	Geschäftsleitung	34bf43e2-ea57-4310-959c-f6ad9549ab2a	f	\N
226fea10-3807-4558-b360-def98a79b64b	reader@test.com	reader	t	Verwaltungsrat	2026-04-17 06:33:53.766042+00	Verwaltungsrat	5d5aab76-07e7-432a-a565-2e787507902f	f	\N
227dec70-2dbf-4472-af6b-f71353d3aefe	admin@test.com	admin	t	Gastronomie	2026-04-17 06:33:53.766042+00	Gastronomie	34bf43e2-ea57-4310-959c-f6ad9549ab2a	f	\N
7d0a01fd-4f9e-4d04-9f1c-14708a76001b	s.smania@hotmail.com	systemadmin	t	Aktivierung	2026-04-23 14:37:15.622502+00	Aktivierung	63d47b39-2fe9-4cf8-b298-cf7e5838c463	f	2026-04-23 17:04:27.412+00
fc7864a9-82db-416f-97db-a4217b72b41e	editor@test.com	editor	t	Administration	2026-04-17 06:33:53.766042+00	Administration	be3b4fe9-5ef1-468a-b248-0f698ded90c8	f	\N
516858b9-2a3a-4ed1-b220-7fca18e2e85c	pflege@test.com	reader	t	Pflege & Betreuung	2026-04-25 04:43:28.815979+00	Pflege & Betreuung	c3399523-35e3-4a09-96a0-ffcaa9395f25	f	\N
\.


--
-- Name: departments departments_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_name_key UNIQUE (name);


--
-- Name: departments departments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_pkey PRIMARY KEY (id);


--
-- Name: event_debriefings event_debriefings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.event_debriefings
    ADD CONSTRAINT event_debriefings_pkey PRIMARY KEY (id);


--
-- Name: event_logs event_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.event_logs
    ADD CONSTRAINT event_logs_pkey PRIMARY KEY (id);


--
-- Name: events events_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_pkey PRIMARY KEY (id);


--
-- Name: holidays holidays_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.holidays
    ADD CONSTRAINT holidays_pkey PRIMARY KEY (id);


--
-- Name: offer_categories offer_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.offer_categories
    ADD CONSTRAINT offer_categories_pkey PRIMARY KEY (id);


--
-- Name: offer_categories offer_categories_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.offer_categories
    ADD CONSTRAINT offer_categories_slug_key UNIQUE (slug);


--
-- Name: offer_items offer_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.offer_items
    ADD CONSTRAINT offer_items_pkey PRIMARY KEY (id);


--
-- Name: room_documents room_documents_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.room_documents
    ADD CONSTRAINT room_documents_pkey PRIMARY KEY (id);


--
-- Name: room_images room_images_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.room_images
    ADD CONSTRAINT room_images_pkey PRIMARY KEY (id);


--
-- Name: room_logs room_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.room_logs
    ADD CONSTRAINT room_logs_pkey PRIMARY KEY (id);


--
-- Name: rooms rooms_name_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rooms
    ADD CONSTRAINT rooms_name_unique UNIQUE (name);


--
-- Name: rooms rooms_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rooms
    ADD CONSTRAINT rooms_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: event_logs_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX event_logs_created_at_idx ON public.event_logs USING btree (created_at DESC);


--
-- Name: event_logs_event_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX event_logs_event_id_idx ON public.event_logs USING btree (event_id);


--
-- Name: holidays_active_date_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX holidays_active_date_idx ON public.holidays USING btree (is_active, date);


--
-- Name: holidays_date_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX holidays_date_idx ON public.holidays USING btree (date);


--
-- Name: holidays_unique_active_date_name_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX holidays_unique_active_date_name_idx ON public.holidays USING btree (date, lower(name)) WHERE (is_active = true);


--
-- Name: offer_categories_parent_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX offer_categories_parent_id_idx ON public.offer_categories USING btree (parent_id);


--
-- Name: offer_items_category_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX offer_items_category_id_idx ON public.offer_items USING btree (category_id);


--
-- Name: offer_items_is_active_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX offer_items_is_active_idx ON public.offer_items USING btree (is_active);


--
-- Name: room_documents_room_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX room_documents_room_id_idx ON public.room_documents USING btree (room_id);


--
-- Name: event_debriefings event_debriefings_event_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.event_debriefings
    ADD CONSTRAINT event_debriefings_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE CASCADE;


--
-- Name: event_debriefings event_debriefings_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.event_debriefings
    ADD CONSTRAINT event_debriefings_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: event_logs event_logs_event_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.event_logs
    ADD CONSTRAINT event_logs_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE CASCADE;


--
-- Name: event_logs event_logs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.event_logs
    ADD CONSTRAINT event_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: events events_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: events events_room_id_1_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_room_id_1_fkey FOREIGN KEY (room_id_1) REFERENCES public.rooms(id);


--
-- Name: events events_room_id_2_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_room_id_2_fkey FOREIGN KEY (room_id_2) REFERENCES public.rooms(id);


--
-- Name: holidays holidays_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.holidays
    ADD CONSTRAINT holidays_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: offer_categories offer_categories_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.offer_categories
    ADD CONSTRAINT offer_categories_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.offer_categories(id) ON DELETE RESTRICT;


--
-- Name: offer_items offer_items_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.offer_items
    ADD CONSTRAINT offer_items_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.offer_categories(id) ON DELETE RESTRICT;


--
-- Name: room_documents room_documents_room_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.room_documents
    ADD CONSTRAINT room_documents_room_id_fkey FOREIGN KEY (room_id) REFERENCES public.rooms(id) ON DELETE CASCADE;


--
-- Name: room_images room_images_room_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.room_images
    ADD CONSTRAINT room_images_room_id_fkey FOREIGN KEY (room_id) REFERENCES public.rooms(id) ON DELETE CASCADE;


--
-- Name: room_logs room_logs_room_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.room_logs
    ADD CONSTRAINT room_logs_room_id_fkey FOREIGN KEY (room_id) REFERENCES public.rooms(id) ON DELETE CASCADE;


--
-- Name: room_logs room_logs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.room_logs
    ADD CONSTRAINT room_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: rooms rooms_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rooms
    ADD CONSTRAINT rooms_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: rooms rooms_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rooms
    ADD CONSTRAINT rooms_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: users users_department_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id) ON DELETE SET NULL;


--
-- Name: users Allow authenticated users to read users; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow authenticated users to read users" ON public.users FOR SELECT TO authenticated USING (true);


--
-- Name: users Allow read for authenticated users; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow read for authenticated users" ON public.users FOR SELECT USING (true);


--
-- Name: users Users can update own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE TO authenticated USING ((auth.uid() = id)) WITH CHECK ((auth.uid() = id));


--
-- Name: offer_categories admin delete offer categories; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "admin delete offer categories" ON public.offer_categories FOR DELETE TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.users
  WHERE ((users.id = auth.uid()) AND (users.role = ANY (ARRAY['admin'::text, 'systemadmin'::text]))))));


--
-- Name: offer_items admin delete offer items; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "admin delete offer items" ON public.offer_items FOR DELETE TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.users
  WHERE ((users.id = auth.uid()) AND (users.role = ANY (ARRAY['admin'::text, 'systemadmin'::text]))))));


--
-- Name: offer_categories admin insert offer categories; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "admin insert offer categories" ON public.offer_categories FOR INSERT TO authenticated WITH CHECK ((EXISTS ( SELECT 1
   FROM public.users
  WHERE ((users.id = auth.uid()) AND (users.role = ANY (ARRAY['admin'::text, 'systemadmin'::text]))))));


--
-- Name: offer_items admin insert offer items; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "admin insert offer items" ON public.offer_items FOR INSERT TO authenticated WITH CHECK ((EXISTS ( SELECT 1
   FROM public.users
  WHERE ((users.id = auth.uid()) AND (users.role = ANY (ARRAY['admin'::text, 'systemadmin'::text]))))));


--
-- Name: offer_categories admin update offer categories; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "admin update offer categories" ON public.offer_categories FOR UPDATE TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.users
  WHERE ((users.id = auth.uid()) AND (users.role = ANY (ARRAY['admin'::text, 'systemadmin'::text]))))));


--
-- Name: offer_items admin update offer items; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "admin update offer items" ON public.offer_items FOR UPDATE TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.users
  WHERE ((users.id = auth.uid()) AND (users.role = ANY (ARRAY['admin'::text, 'systemadmin'::text]))))));


--
-- Name: event_debriefings admins can delete event_debriefings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "admins can delete event_debriefings" ON public.event_debriefings FOR DELETE TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.users
  WHERE ((users.id = auth.uid()) AND (users.role = ANY (ARRAY['admin'::text, 'systemadmin'::text]))))));


--
-- Name: event_logs admins can delete event_logs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "admins can delete event_logs" ON public.event_logs FOR DELETE TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.users
  WHERE ((users.id = auth.uid()) AND (users.role = ANY (ARRAY['admin'::text, 'systemadmin'::text]))))));


--
-- Name: events admins can delete events; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "admins can delete events" ON public.events FOR DELETE TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.users
  WHERE ((users.id = auth.uid()) AND (users.role = ANY (ARRAY['admin'::text, 'systemadmin'::text]))))));


--
-- Name: room_documents admins can delete room_documents; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "admins can delete room_documents" ON public.room_documents FOR DELETE TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.users
  WHERE ((users.id = auth.uid()) AND (users.role = ANY (ARRAY['admin'::text, 'systemadmin'::text]))))));


--
-- Name: room_images admins can delete room_images; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "admins can delete room_images" ON public.room_images FOR DELETE TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.users
  WHERE ((users.id = auth.uid()) AND (users.role = ANY (ARRAY['admin'::text, 'systemadmin'::text]))))));


--
-- Name: room_logs admins can delete room_logs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "admins can delete room_logs" ON public.room_logs FOR DELETE TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.users
  WHERE ((users.id = auth.uid()) AND (users.role = ANY (ARRAY['admin'::text, 'systemadmin'::text]))))));


--
-- Name: rooms admins can delete rooms; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "admins can delete rooms" ON public.rooms FOR DELETE TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.users
  WHERE ((users.id = auth.uid()) AND (users.role = ANY (ARRAY['admin'::text, 'systemadmin'::text]))))));


--
-- Name: events authenticated users can insert events; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "authenticated users can insert events" ON public.events FOR INSERT TO authenticated WITH CHECK (((auth.uid() = created_by) AND (EXISTS ( SELECT 1
   FROM public.users
  WHERE ((users.id = auth.uid()) AND (users.role = ANY (ARRAY['editor'::text, 'admin'::text, 'systemadmin'::text])))))));


--
-- Name: event_debriefings; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.event_debriefings ENABLE ROW LEVEL SECURITY;

--
-- Name: event_debriefings event_debriefings_insert_authenticated; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY event_debriefings_insert_authenticated ON public.event_debriefings FOR INSERT TO authenticated WITH CHECK ((EXISTS ( SELECT 1
   FROM public.users
  WHERE ((users.id = auth.uid()) AND (users.role = ANY (ARRAY['editor'::text, 'admin'::text, 'systemadmin'::text]))))));


--
-- Name: event_debriefings event_debriefings_select_authenticated; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY event_debriefings_select_authenticated ON public.event_debriefings FOR SELECT TO authenticated USING (true);


--
-- Name: event_logs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.event_logs ENABLE ROW LEVEL SECURITY;

--
-- Name: event_logs event_logs_insert_authenticated; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY event_logs_insert_authenticated ON public.event_logs FOR INSERT TO authenticated WITH CHECK (true);


--
-- Name: event_logs event_logs_select_authenticated; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY event_logs_select_authenticated ON public.event_logs FOR SELECT TO authenticated USING (true);


--
-- Name: events; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

--
-- Name: holidays; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.holidays ENABLE ROW LEVEL SECURITY;

--
-- Name: offer_categories; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.offer_categories ENABLE ROW LEVEL SECURITY;

--
-- Name: offer_items; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.offer_items ENABLE ROW LEVEL SECURITY;

--
-- Name: offer_categories read offer categories; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "read offer categories" ON public.offer_categories FOR SELECT TO authenticated USING (true);


--
-- Name: offer_items read offer items; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "read offer items" ON public.offer_items FOR SELECT TO authenticated USING (true);


--
-- Name: room_documents; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.room_documents ENABLE ROW LEVEL SECURITY;

--
-- Name: room_documents room_documents_insert_authenticated; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY room_documents_insert_authenticated ON public.room_documents FOR INSERT TO authenticated WITH CHECK ((EXISTS ( SELECT 1
   FROM public.users
  WHERE ((users.id = auth.uid()) AND (users.role = ANY (ARRAY['admin'::text, 'systemadmin'::text]))))));


--
-- Name: room_documents room_documents_select_authenticated; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY room_documents_select_authenticated ON public.room_documents FOR SELECT TO authenticated USING (true);


--
-- Name: room_documents room_documents_update_authenticated; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY room_documents_update_authenticated ON public.room_documents FOR UPDATE TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.users
  WHERE ((users.id = auth.uid()) AND (users.role = ANY (ARRAY['admin'::text, 'systemadmin'::text])))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.users
  WHERE ((users.id = auth.uid()) AND (users.role = ANY (ARRAY['admin'::text, 'systemadmin'::text]))))));


--
-- Name: room_images; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.room_images ENABLE ROW LEVEL SECURITY;

--
-- Name: room_images room_images_insert_authenticated; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY room_images_insert_authenticated ON public.room_images FOR INSERT TO authenticated WITH CHECK ((EXISTS ( SELECT 1
   FROM public.users
  WHERE ((users.id = auth.uid()) AND (users.role = ANY (ARRAY['admin'::text, 'systemadmin'::text]))))));


--
-- Name: room_images room_images_select_authenticated; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY room_images_select_authenticated ON public.room_images FOR SELECT TO authenticated USING (true);


--
-- Name: room_images room_images_update_authenticated; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY room_images_update_authenticated ON public.room_images FOR UPDATE TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.users
  WHERE ((users.id = auth.uid()) AND (users.role = ANY (ARRAY['admin'::text, 'systemadmin'::text])))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.users
  WHERE ((users.id = auth.uid()) AND (users.role = ANY (ARRAY['admin'::text, 'systemadmin'::text]))))));


--
-- Name: room_logs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.room_logs ENABLE ROW LEVEL SECURITY;

--
-- Name: room_logs room_logs_insert_authenticated; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY room_logs_insert_authenticated ON public.room_logs FOR INSERT TO authenticated WITH CHECK ((EXISTS ( SELECT 1
   FROM public.users
  WHERE ((users.id = auth.uid()) AND (users.role = ANY (ARRAY['admin'::text, 'systemadmin'::text]))))));


--
-- Name: room_logs room_logs_select_authenticated; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY room_logs_select_authenticated ON public.room_logs FOR SELECT TO authenticated USING (true);


--
-- Name: rooms; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;

--
-- Name: rooms rooms_insert_authenticated; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY rooms_insert_authenticated ON public.rooms FOR INSERT TO authenticated WITH CHECK ((EXISTS ( SELECT 1
   FROM public.users
  WHERE ((users.id = auth.uid()) AND (users.role = ANY (ARRAY['admin'::text, 'systemadmin'::text]))))));


--
-- Name: rooms rooms_select_authenticated; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY rooms_select_authenticated ON public.rooms FOR SELECT TO authenticated USING (true);


--
-- Name: rooms rooms_update_authenticated; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY rooms_update_authenticated ON public.rooms FOR UPDATE TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.users
  WHERE ((users.id = auth.uid()) AND (users.role = ANY (ARRAY['admin'::text, 'systemadmin'::text])))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.users
  WHERE ((users.id = auth.uid()) AND (users.role = ANY (ARRAY['admin'::text, 'systemadmin'::text]))))));


--
-- Name: users; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

--
-- Name: events users can read events; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "users can read events" ON public.events FOR SELECT TO authenticated USING (true);


--
-- Name: holidays users can read holidays; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "users can read holidays" ON public.holidays FOR SELECT TO authenticated USING (true);


--
-- Name: events users can update events; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "users can update events" ON public.events FOR UPDATE TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.users
  WHERE ((users.id = auth.uid()) AND (users.role = ANY (ARRAY['editor'::text, 'admin'::text, 'systemadmin'::text])))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.users
  WHERE ((users.id = auth.uid()) AND (users.role = ANY (ARRAY['editor'::text, 'admin'::text, 'systemadmin'::text]))))));


--
-- PostgreSQL database dump complete
--

\unrestrict 4Qs2BgULH8P06s4DmFkac65s95zabrQIC8WeMlqyfu5KtmMQBx5fKNf8DxjJhUz

