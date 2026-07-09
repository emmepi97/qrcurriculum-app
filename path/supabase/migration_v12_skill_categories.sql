-- QR Curriculum V12 - international reduced skill categories + migration

alter table public.skills alter column category set default 'Industry Expertise';

update public.skills
set category = case
  when category in ('Leadership','Leadership & People Management','Leadership & Management','Education & Training') then 'Leadership & Management'
  when category in ('Operations','Operations & Process Improvement') then 'Operations'
  when category in ('Gestione Progetti','Project Management','Project & Process Management') then 'Project Management'
  when category in ('Digital & Data','Data Analysis & Reporting','Data & Analytics') then 'Data & Analytics'
  when category in ('Digital','Digital, AI & Automazione','Information Technology','Technology') then 'Technology'
  when category in ('Engineering','Engineering & Technical') then 'Engineering'
  when category in ('Finance, Legal & Business','Finance & Business') then 'Finance & Business'
  when category in ('Sales, Marketing & Personal Branding','Sales & Marketing') then 'Sales & Marketing'
  when category in ('Comunicazione','Comunicazione & Public Speaking','Communication & Collaboration','Communication','Languages') then 'Communication'
  when category in ('Supply Chain','Supply Chain & Logistics') then 'Supply Chain'
  when category in ('Analisi & Problem Solving','Problem Solving & Continuous Improvement','Quality Management','Quality & Improvement') then 'Quality & Improvement'
  when category in ('Tecniche di Settore','Fashion, Product & Manufacturing','Creatività & Design','Creatività, Design & UX','Research & Innovation','Industry Specific','Industry Expertise','Altro','Altro / Settoriale') then 'Industry Expertise'
  when category is null or trim(category)='' then 'Industry Expertise'
  else 'Industry Expertise'
end;

create index if not exists idx_skills_user_category_v12 on public.skills(user_id, category);
create index if not exists idx_skills_user_acquired_v12 on public.skills(user_id, acquired_date);