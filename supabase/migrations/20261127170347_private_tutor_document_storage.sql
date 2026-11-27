insert into public.system_modules (module_key) values ('porai');

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('tutor-verification', 'tutor-verification', false, 5242880, array['application/pdf','image/jpeg','image/png']);

create policy shohojhub_tutor_document_insert on storage.objects
for insert to authenticated
with check (
  bucket_id = 'tutor-verification'
  and (storage.foldername(name))[1] = (select auth.uid())::text
  and array_length(storage.foldername(name), 1) = 1
  and lower(storage.extension(name)) in ('pdf','jpeg','jpg','png')
  and owner_id = (select auth.uid())::text
  and (select shohojhub_private.active_role()) = 'tutor'
  and exists (select from public.system_modules where module_key = 'porai' and enabled)
);

create policy shohojhub_tutor_document_read on storage.objects
for select to authenticated
using (
  bucket_id = 'tutor-verification'
  and exists (select from public.system_modules where module_key = 'porai' and enabled)
  and (
    ((select shohojhub_private.active_role()) = 'tutor' and owner_id = (select auth.uid())::text
      and (storage.foldername(name))[1] = (select auth.uid())::text)
    or (select shohojhub_private.active_role()) in ('admin', 'founder')
  )
);

create policy shohojhub_tutor_document_delete on storage.objects
for delete to authenticated
using (
  bucket_id = 'tutor-verification'
  and owner_id = (select auth.uid())::text
  and (storage.foldername(name))[1] = (select auth.uid())::text
  and (select shohojhub_private.active_role()) = 'tutor'
  and exists (select from public.system_modules where module_key = 'porai' and enabled)
);
