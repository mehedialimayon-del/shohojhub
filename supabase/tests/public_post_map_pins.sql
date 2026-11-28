begin;
insert into auth.users(id) values('61200000-0000-4000-8000-000000000001');
insert into public.posts(owner_id,title,body,category,contact_name,division,district,map_lat,map_lng)
values ('61200000-0000-4000-8000-000000000001','QA consent pin','Temporary post for checking map pin visibility.',
  'services','QA','ঢাকা','ঢাকা',23.875,90.390);

set local role anon;
do $$ begin
  if exists (select from public.posts where title='QA consent pin' and map_lat is not null) then
    raise exception 'Anonymous visitors saw the draft pin';
  end if;
end $$;

reset role;
update public.posts set status='published',published_at=now() where title='QA consent pin';
set local role anon;
do $$ begin
  if not exists (select from public.posts where title='QA consent pin' and map_lat=23.875 and map_lng=90.390) then
    raise exception 'Approved public pin is missing';
  end if;
end $$;
reset role;
do $$ begin
  begin
    update public.posts set map_lng=null where title='QA consent pin';
    raise exception 'Incomplete map pin was accepted';
  exception when check_violation then null;
  end;
end $$;
rollback;
select 'Public map pin constraints and draft visibility passed' as result;
