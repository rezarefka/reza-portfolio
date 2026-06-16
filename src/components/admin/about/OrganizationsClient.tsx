"use client";
import { useState } from "react";
import { Column, Row, Text, Button, Input, Line, Card } from "@once-ui-system/core";
import { createClient } from "@/lib/supabase/client";
import { ImageUpload } from "@/components/admin/ImageUpload";
import type { AboutOrganization } from "@/lib/types";
import { ConfirmModal } from "@/components/admin/ConfirmModal";

interface Props { initialData: AboutOrganization[]; }
const empty = (): Omit<AboutOrganization,"id"|"created_at"|"updated_at"> => ({
  name:"", role_id:"", role_en:"", year:"", description_id:"", description_en:"", logo:"", sort_order:0,
});

export function OrganizationsClient({ initialData }: Props) {
  const [items, setItems]     = useState<AboutOrganization[]>(initialData);
  const [editing, setEditing] = useState<Partial<AboutOrganization>|null>(null);
  const [isNew, setIsNew]     = useState(false);
  const [loading, setLoading] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [msg, setMsg]         = useState("");
  const set = (k:string,v:unknown) => setEditing((e) => e?{...e,[k]:v}:e);
  const ta = { background:"var(--neutral-background-medium)",border:"1px solid var(--neutral-alpha-medium)",
    borderRadius:8,padding:"10px 12px",color:"var(--neutral-on-background-strong)",fontSize:14,width:"100%",fontFamily:"inherit",resize:"vertical" as const };

  const handleSave = async () => {
    if (!editing?.name) { setMsg("Nama organisasi wajib."); return; }
    setLoading(true); setMsg("");
    const supabase = createClient();
    const payload = { ...editing, updated_at: new Date().toISOString() };
    if (isNew) {
      const { data, error } = await supabase.from("about_organizations")
        .insert([{...payload,created_at:new Date().toISOString()}]).select().single();
      if (error) setMsg(error.message);
      else { setItems((p)=>[...p,data]); setEditing(null); }
    } else {
      const { error } = await supabase.from("about_organizations").update(payload).eq("id",editing.id!);
      if (error) setMsg(error.message);
      else { setItems((p)=>p.map((x)=>x.id===editing.id?{...x,...editing} as AboutOrganization:x)); setEditing(null); }
    }
    setLoading(false);
  };

  const handleDelete = (id: string) => { setConfirmDeleteId(id); };

  const doDeleteOrg = async (id: string) => {
    setConfirmDeleteId(null);
    const { error } = await createClient().from("about_organizations").delete().eq("id",id);
    if (error) { setMsg(`Gagal menghapus: ${error.message}`); return; }
    setItems((p)=>p.filter((x)=>x.id!==id));
    if (editing?.id===id) setEditing(null);
  };

  if (editing!==null) return (
    <Column fillWidth gap="l" paddingBottom="80">
      <Column gap="m" border="neutral-alpha-weak" radius="l" padding="l" background="surface">
        <Text variant="label-strong-m">{isNew?"Tambah Organisasi":"Edit Organisasi"}</Text>
        <Line background="neutral-alpha-weak" />
        <Column gap="s"><Text variant="label-strong-s">Nama Organisasi *</Text>
          <Input id="nm" value={editing.name??""} onChange={(e:React.ChangeEvent<HTMLInputElement>)=>set("name",e.target.value)} placeholder="BEM Fakultas Teknik" /></Column>
        <Row gap="m" s={{direction:"column"}}>
          <Column gap="s" flex={1}><Text variant="label-strong-s">Jabatan (ID)</Text>
            <Input id="ri" value={editing.role_id??""} onChange={(e:React.ChangeEvent<HTMLInputElement>)=>set("role_id",e.target.value)} placeholder="Ketua Divisi IT" /></Column>
          <Column gap="s" flex={1}><Text variant="label-strong-s">Role (EN)</Text>
            <Input id="re" value={editing.role_en??""} onChange={(e:React.ChangeEvent<HTMLInputElement>)=>set("role_en",e.target.value)} placeholder="Head of IT Division" /></Column>
        </Row>
        <Column gap="s"><Text variant="label-strong-s">Tahun Aktif</Text>
          <Input id="yr" value={editing.year??""} onChange={(e:React.ChangeEvent<HTMLInputElement>)=>set("year",e.target.value)} placeholder="2022–2023" /></Column>
        <Column gap="s"><Text variant="label-strong-s">Deskripsi (ID)</Text>
          <textarea value={editing.description_id??""} onChange={(e)=>set("description_id",e.target.value)} rows={3} placeholder="Deskripsi kegiatan dan kontribusi..." style={ta} /></Column>
        <Column gap="s"><Text variant="label-strong-s">Description (EN)</Text>
          <textarea value={editing.description_en??""} onChange={(e)=>set("description_en",e.target.value)} rows={3} style={ta} /></Column>
      </Column>
      <Column gap="m" border="neutral-alpha-weak" radius="l" padding="l" background="surface">
        <Text variant="label-strong-m">Logo Organisasi</Text>
        <Line background="neutral-alpha-weak" />
        <ImageUpload bucket="media" value={editing.logo??""} onChange={(url)=>set("logo",url)} />
      </Column>
      {msg && <Text variant="body-default-s" onBackground="danger-strong">{msg}</Text>}
      <Row gap="m" wrap>
        <Button onClick={handleSave} variant="primary" size="m" loading={loading}>{isNew?"Tambah":"Simpan"}</Button>
        <Button onClick={()=>setEditing(null)} variant="secondary" size="m">Batal</Button>
        {!isNew && <Button onClick={()=>handleDelete(editing.id!)} variant="danger" size="m" style={{marginLeft:"auto"}}>Hapus</Button>}
      </Row>
    </Column>
  );

  return (
    <>
        <Column fillWidth gap="m">
      <Button onClick={()=>{setEditing(empty());setIsNew(true);}} variant="primary" size="m" prefixIcon="plus">Tambah Organisasi</Button>
      {items.length===0 && (
        <Card border="neutral-alpha-weak" background="surface" padding="xl" radius="l">
          <Column gap="m" horizontal="center" align="center">
            <Text style={{fontSize:48}}>🏛️</Text>
            <Text variant="heading-strong-m">Belum ada organisasi</Text>
          </Column>
        </Card>
      )}
      {items.map((org) => (
        <Card key={org.id} fillWidth border="neutral-alpha-weak" background="surface" padding="m" radius="l"
          onClick={()=>{setEditing(org);setIsNew(false);}} style={{cursor:"pointer"}}>
          <Row fillWidth gap="m" vertical="center">
            {org.logo
              ? <img src={org.logo} alt={org.name} style={{width:44,height:44,borderRadius:8,objectFit:"contain",flexShrink:0}} />
              : <Text style={{fontSize:28,flexShrink:0}}>🏛️</Text>}
            <Column flex={1} gap="4">
              <Text variant="heading-strong-m">{org.name}</Text>
              <Text variant="body-default-s" onBackground="brand-weak">{org.role_id}</Text>
              <Text variant="body-default-xs" onBackground="neutral-weak">{org.year}</Text>
            </Column>
            <Text variant="body-default-xs" onBackground="neutral-weak">Edit →</Text>
          </Row>
        </Card>
      ))}
    </Column>
      {msg && <Text variant="body-default-s" onBackground="danger-strong">{msg}</Text>}
      <ConfirmModal
        open={!!confirmDeleteId}
        title="Hapus Organisasi?"
        message="Data organisasi ini akan dihapus permanen."
        confirmLabel="Ya, Hapus"
        onConfirm={() => confirmDeleteId && doDeleteOrg(confirmDeleteId)}
        onCancel={() => setConfirmDeleteId(null)}
      />
    </>
  );
}