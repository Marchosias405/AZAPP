create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.questions (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid references public.users(id) on delete set null,

  external_key text unique,
  source_kind text not null default 'generated'
    check (source_kind in ('local', 'generated', 'imported')),

  domain text not null
    check (
      domain in (
        'Describe cloud concepts',
        'Describe Azure architecture and services',
        'Describe Azure management and governance'
      )
    ),

  topic text not null
    check (length(trim(topic)) > 0),

  difficulty text not null
    check (difficulty in ('beginner', 'standard', 'challenging')),

  question_type text not null
    check (
      question_type in (
        'single-answer',
        'choose-2',
        'choose-3',
        'scenario',
        'common-confusion'
      )
    ),

  question_text text not null
    check (length(trim(question_text)) > 0),

  select_count smallint not null
    check (select_count between 1 and 3),

  correct_answer_ids text[] not null
    check (cardinality(correct_answer_ids) = select_count),

  explanation text not null
    check (length(trim(explanation)) > 0),

  memory_hook text not null
    check (length(trim(memory_hook)) > 0),

  why_wrong_options_are_wrong jsonb not null default '{}'::jsonb,
  source_basis text not null
    check (length(trim(source_basis)) > 0),

  tags text[] not null default '{}',

  validation_status text not null default 'pending'
    check (
      validation_status in (
        'pending',
        'valid',
        'invalid',
        'needs-review'
      )
    ),

  quality_score numeric(5, 2)
    check (
      quality_score is null or
      quality_score between 0 and 100
    ),

  confidence_score numeric(5, 2)
    check (
      confidence_score is null or
      confidence_score between 0 and 100
    ),

  hallucination_risk text not null default 'unknown'
    check (
      hallucination_risk in (
        'unknown',
        'low',
        'medium',
        'high'
      )
    ),

  is_active boolean not null default true,

  times_seen integer not null default 0
    check (times_seen >= 0),

  times_correct integer not null default 0
    check (times_correct >= 0),

  times_wrong integer not null default 0
    check (times_wrong >= 0),

  mastery_status text not null default 'learning'
    check (
      mastery_status in (
        'learning',
        'review',
        'mastered'
      )
    ),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.question_options (
  id uuid primary key default gen_random_uuid(),

  question_id uuid not null
    references public.questions(id)
    on delete cascade,

  option_id text not null
    check (option_id ~ '^[A-Z]$'),

  option_text text not null
    check (length(trim(option_text)) > 0),

  is_correct boolean not null default false,

  sort_order smallint not null
    check (sort_order >= 0),

  created_at timestamptz not null default now(),

  unique (question_id, option_id),
  unique (question_id, option_text),
  unique (question_id, sort_order)
);

create table public.exam_sessions (
  id uuid primary key default gen_random_uuid(),

  user_id uuid references public.users(id) on delete cascade,

  mode text not null
    check (
      mode in (
        'mock-exam',
        'mistakes-only'
      )
    ),

  started_at timestamptz not null default now(),
  completed_at timestamptz,

  total_questions integer not null default 0
    check (total_questions >= 0),

  correct_count integer not null default 0
    check (correct_count >= 0),

  wrong_count integer not null default 0
    check (wrong_count >= 0),

  score_percent numeric(5, 2)
    check (
      score_percent is null or
      score_percent between 0 and 100
    ),

  duration_seconds integer
    check (
      duration_seconds is null or
      duration_seconds >= 0
    ),

  metadata jsonb not null default '{}'::jsonb,

  created_at timestamptz not null default now(),

  check (correct_count + wrong_count <= total_questions),
  check (completed_at is null or completed_at >= started_at)
);

create table public.exam_answers (
  id uuid primary key default gen_random_uuid(),

  session_id uuid not null
    references public.exam_sessions(id)
    on delete cascade,

  question_id uuid not null
    references public.questions(id)
    on delete restrict,

  selected_answer_ids text[] not null default '{}',
  is_correct boolean not null,

  time_spent_seconds integer
    check (
      time_spent_seconds is null or
      time_spent_seconds >= 0
    ),

  answered_at timestamptz not null default now(),

  unique (session_id, question_id)
);

create table public.topic_stats (
  id uuid primary key default gen_random_uuid(),

  user_id uuid not null
    references public.users(id)
    on delete cascade,

  domain text not null
    check (
      domain in (
        'Describe cloud concepts',
        'Describe Azure architecture and services',
        'Describe Azure management and governance'
      )
    ),

  topic text not null
    check (length(trim(topic)) > 0),

  times_seen integer not null default 0
    check (times_seen >= 0),

  times_correct integer not null default 0
    check (times_correct >= 0),

  times_wrong integer not null default 0
    check (times_wrong >= 0),

  updated_at timestamptz not null default now(),

  unique (user_id, domain, topic)
);

create table public.generation_settings (
  id uuid primary key default gen_random_uuid(),

  user_id uuid not null
    references public.users(id)
    on delete cascade,

  name text not null
    check (length(trim(name)) > 0),

  provider text not null default 'gemini'
    check (provider in ('gemini', 'openai')),

  generation_model text not null
    check (length(trim(generation_model)) > 0),

  validation_model text
    check (
      validation_model is null or
      length(trim(validation_model)) > 0
    ),

  enable_ai_fact_checking boolean not null default false,
  constraints jsonb not null default '{}'::jsonb,
  is_default boolean not null default false,
  is_active boolean not null default true,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (user_id, name)
);

create table public.generation_runs (
  id uuid primary key default gen_random_uuid(),

  user_id uuid references public.users(id) on delete set null,

  settings_id uuid
    references public.generation_settings(id)
    on delete set null,

  provider text not null
    check (provider in ('gemini', 'openai')),

  model text not null
    check (length(trim(model)) > 0),

  status text not null default 'pending'
    check (
      status in (
        'pending',
        'running',
        'completed',
        'failed',
        'partially-valid'
      )
    ),

  requested_count integer not null
    check (requested_count > 0),

  generated_count integer not null default 0
    check (generated_count >= 0),

  valid_count integer not null default 0
    check (valid_count >= 0),

  invalid_count integer not null default 0
    check (invalid_count >= 0),

  prompt_version text,
  settings_snapshot jsonb not null default '{}'::jsonb,
  error_message text,

  started_at timestamptz not null default now(),
  completed_at timestamptz,

  check (generated_count <= requested_count),
  check (valid_count + invalid_count <= generated_count),
  check (completed_at is null or completed_at >= started_at)
);

create table public.question_reports (
  id uuid primary key default gen_random_uuid(),

  user_id uuid not null
    references public.users(id)
    on delete cascade,

  question_id uuid not null
    references public.questions(id)
    on delete cascade,

  reason text not null
    check (
      reason in (
        'wrong-answer',
        'confusing-wording',
        'too-hard',
        'duplicate',
        'bad-explanation',
        'other'
      )
    ),

  note text not null default '',

  status text not null default 'open'
    check (
      status in (
        'open',
        'resolved',
        'dismissed'
      )
    ),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  resolved_at timestamptz,

  unique (user_id, question_id)
);

create index questions_owner_user_id_idx
  on public.questions(owner_user_id);

create index questions_domain_topic_idx
  on public.questions(domain, topic);

create index questions_active_mastery_idx
  on public.questions(is_active, mastery_status);

create index questions_validation_status_idx
  on public.questions(validation_status);

create index question_options_question_id_idx
  on public.question_options(question_id);

create index exam_sessions_user_completed_idx
  on public.exam_sessions(user_id, completed_at desc);

create index exam_answers_session_id_idx
  on public.exam_answers(session_id);

create index exam_answers_question_id_idx
  on public.exam_answers(question_id);

create index topic_stats_user_id_idx
  on public.topic_stats(user_id);

create index generation_settings_user_id_idx
  on public.generation_settings(user_id);

create index generation_runs_user_started_idx
  on public.generation_runs(user_id, started_at desc);

create index question_reports_user_status_idx
  on public.question_reports(user_id, status);

create index question_reports_question_id_idx
  on public.question_reports(question_id);

create trigger users_set_updated_at
before update on public.users
for each row
execute function public.set_updated_at();

create trigger questions_set_updated_at
before update on public.questions
for each row
execute function public.set_updated_at();

create trigger topic_stats_set_updated_at
before update on public.topic_stats
for each row
execute function public.set_updated_at();

create trigger generation_settings_set_updated_at
before update on public.generation_settings
for each row
execute function public.set_updated_at();

create trigger question_reports_set_updated_at
before update on public.question_reports
for each row
execute function public.set_updated_at();

alter table public.users enable row level security;
alter table public.questions enable row level security;
alter table public.question_options enable row level security;
alter table public.exam_sessions enable row level security;
alter table public.exam_answers enable row level security;
alter table public.topic_stats enable row level security;
alter table public.generation_settings enable row level security;
alter table public.generation_runs enable row level security;
alter table public.question_reports enable row level security;

comment on table public.users is
  'Application profile records linked to Supabase Auth users.';

comment on table public.questions is
  'Validated AZ-900 questions and question-level study metadata.';

comment on table public.question_options is
  'Answer options belonging to AZ-900 questions.';

comment on table public.exam_sessions is
  'Completed or in-progress mock and mistakes-only exam sessions.';

comment on table public.exam_answers is
  'Individual answers submitted during an exam session.';

comment on table public.topic_stats is
  'Per-user aggregate performance by AZ-900 domain and topic.';

comment on table public.generation_settings is
  'Editable AI generation and validation guardrail settings.';

comment on table public.generation_runs is
  'Audit records for AI question-generation attempts.';

comment on table public.question_reports is
  'User-submitted reports for questionable or incorrect questions.';

comment on column public.questions.why_wrong_options_are_wrong is
  'JSON object mapping incorrect option IDs to short explanations.';

comment on column public.questions.correct_answer_ids is
  'Answer option IDs that form the exact correct answer set.';

comment on column public.questions.hallucination_risk is
  'Local or optional AI assessment of factual hallucination risk.';

comment on schema public is
  'Row-level security is enabled. Part 19 intentionally adds no browser access policies until authentication and ownership workflows are implemented.';