alter table public.posts
  add column map_lat double precision,
  add column map_lng double precision,
  add constraint posts_public_map_pin_bounds check (
    (map_lat is null and map_lng is null)
    or (map_lat is not null and map_lng is not null and map_lat between 20 and 27 and map_lng between 87 and 93)
  );

grant select (map_lat,map_lng) on public.posts to anon,authenticated;
grant insert (map_lat,map_lng), update (map_lat,map_lng) on public.posts to authenticated;
