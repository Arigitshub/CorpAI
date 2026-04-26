create table if not exists intake_submissions (
  id integer primary key autoincrement,
  created_at text not null default current_timestamp,
  name text not null,
  email text not null,
  company text,
  team_size text,
  current_tools text,
  target_workflow text not null,
  monthly_volume text,
  biggest_pain text,
  timeline text,
  source text not null default 'corpai-portal',
  status text not null default 'new'
);

create index if not exists idx_intake_submissions_created_at
  on intake_submissions(created_at desc);

create index if not exists idx_intake_submissions_email
  on intake_submissions(email);
