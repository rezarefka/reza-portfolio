"use client";
import { useState } from "react";
import { Column, Row, Text, Button, Input, Line, Card } from "@once-ui-system/core";
import { createClient } from "@/lib/supabase/client";
import type { AboutExperience } from "@/lib/types";
import { ConfirmModal } from "@/components/admin/ConfirmModal";

interface Props { initialData: AboutExperience[]; }

const empty = (): Omit<AboutExperience, "id"|"created_at"|"updated_at"> => ({
  company:"", role_id:"", role_en:"", timeframe:"",
  description_id:"", description_en:"", sort_order: 0,
});

export function ExperienceClient({ initialData }: Props) {
  const [items, setItems]     = useState<AboutExperience[]>(initialData);
  const [editing, setEditing] = useState<Partial<AboutExperience>|null>(null);
  const [isNew, setIsNew]     = useState(false);
  const [loading, setLoading] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [msg, setMsg]         = useState("");

  const set = (k: string, v: unknown) => setEditing((e) => e ? {...e,[k]:v} : e);
  const ta = { background:"var(--neutral-background-medium)", border:"1px solid var(--neutral-alpha-medium)",
    borderRadius:8, padding:"10px 12px", color:"var(--neutral-on-background-strong)",
    fontSize:14, width:"100%", fontFamily:"inherit", resize:"vertical" as const };

  const handleSave = async () => {
    if (!editing?.company) { setMsg("Nama perusahaan wajib diisi."); return; }
    setLoading(true); setMsg("");
    const supabase = createClient();
    const payload = { ...editing, updated_at: new Date().toISOString() };
    if (isNew) {
      const { data, error } = await supabase.from("about_experiences")
        .insert([{ ...payload, created_at: new Date().toISOString() }]).select().single();
      if (error) setMsg(error.message);
      else { setItems((p) => [...p, data]); setEditing(null); }
    } else {
      const { error } = await supabase.from("about_experiences").update(payload).eq("id", editing.id!);
      if (error) setMsg(error.message);
      else { setItems((p) => p.map((x) => x.id===editing.id ? {...x,...editing} as AboutExperience : x)); setEditing(null); }
    }
    setLoading(false);
  };

  const handleDelete = (id: string) => { setConfirmDeleteId(id); };

  const doDeleteExp = async (id: string) => {
    setConfirmDeleteId(null);
    const { error } = await createClient().from("about_experiences").delete().eq("id", id);
    if (error) { setMsg(`Gagal menghapus: ${error.message}`); return; }
    setItems((p) => p.filter((x) => x.id !== id));
    if (editing?.id === id) setEditing(null);
  };

  if (editing !== null) return (
    <Column fillWidth gap="l" paddingBottom="80">
      <Column gap="m" border="neutral-alpha-weak" radius="l" padding="l" background="surface">
        <Text variant="label-strong-m">{isNew ? "Tambah Pengalaman" : "Edit Pengalaman"}</Text>
        <Line background="neutral-alpha-weak" />
        <Column gap="s"><Text variant="label-strong-s">Nama Perusahaan / Instansi *</Text>
          <Input id="co" value={editing.company??""} onChange={(e:React.ChangeEvent<HTMLInputElement>) => set("company",e.target.value)} placeholder="PT. Example Indonesia" /></Column>
        <Row gap="m" s={{direction:"column"}}>
          <Column gap="s" flex={1}><Text variant="label-strong-s">Jabatan (ID)</Text>
            <Input id="rid" value={editing.role_id??""} onChange={(e:React.ChangeEvent<HTMLInputElement>) => set("role_id",e.target.value)} placeholder="Full Stack Developer" /></Column>
          <Column gap="s" flex={1}><Text variant="label-strong-s">Role (EN)</Text>
            <Input id="ren" value={editing.role_en??""} onChange={(e:React.ChangeEvent<HTMLInputElement>) => set("role_en",e.target.value)} placeholder="Full Stack Developer" /></Column>
        </Row>
        <Column gap="s"><Text variant="label-strong-s">Periode</Text>
          <Input id="tf" value={editing.timeframe??""} onChange={(e:React.ChangeEvent<HTMLInputElement>) => set("timeframe",e.target.value)} placeholder="2022 – Sekarang" /></Column>
        <Column gap="s"><Text variant="label-strong-s">Deskripsi (ID)</Text>
          <textarea value={editing.description_id??""} onChange={(e) => set("description_id",e.target.value)} rows={4} placeholder="Tugas, pencapaian, kontribusi..." style={ta} /></Column>
        <Column gap="s"><Text variant="label-strong-s">Description (EN)</Text>
          <textarea value={editing.description_en??""} onChange={(e) => set("description_en",e.target.value)} rows={4} placeholder="Tasks, achievements..." style={ta} /></Column>
      </Column>
      {msg && <Text variant="body-default-s" onBackground="danger-strong">{msg}</Text>}
      <Row gap="m" wrap>
        <Button onClick={handleSave} variant="primary" size="m" loading={loading}>{isNew?"Tambah":"Simpan"}</Button>
        <Button onClick={() => setEditing(null)} variant="secondary" size="m">Batal</Button>
        {!isNew && <Button onClick={() => handleDelete(editing.id!)} variant="danger" size="m" style={{marginLeft:"auto"}}>Hapus</Button>}
      </Row>
    </Column>
  );

  return (
    <>
        <Column fillWidth gap="m">
      <Button onClick={() => { setEditing(empty()); setIsNew(true); }} variant="primary" size="m" prefixIcon="plus">Tambah Pengalaman</Button>
      {items.length === 0 && (
        <Card border="neutral-alpha-weak" background="surface" padding="xl" radius="l">
          <Column gap="m" horizontal="center" align="center">
            <Text style={{fontSize:48}}>💼</Text>
            <Text variant="heading-strong-m">Belum ada pengalaman kerja</Text>
          </Column>
        </Card>
      )}
      {items.map((exp) => (
        <Card key={exp.id} fillWidth border="neutral-alpha-weak" background="surface" padding="m" radius="l"
          onClick={() => { setEditing(exp); setIsNew(false); }} style={{cursor:"pointer"}}>
          <Row fillWidth horizontal="between" vertical="center" wrap gap="8">
            <Column flex={1} gap="4">
              <Text variant="heading-strong-m">{exp.company}</Text>
              <Text variant="body-default-s" onBackground="brand-weak">{exp.role_id}</Text>
              <Text variant="body-default-xs" onBackground="neutral-weak">{exp.timeframe}</Text>
            </Column>
            <Text variant="body-default-xs" onBackground="neutral-weak">Edit →</Text>
          </Row>
        </Card>
      ))}
    </Column>
      {msg && <Text variant="body-default-s" onBackground="danger-strong">{msg}</Text>}
      <ConfirmModal
        open={!!confirmDeleteId}
        title="Hapus Pengalaman?"
        message="Data pengalaman kerja ini akan dihapus permanen."
        confirmLabel="Ya, Hapus"
        onConfirm={() => confirmDeleteId && doDeleteExp(confirmDeleteId)}
        onCancel={() => setConfirmDeleteId(null)}
      />
    </>
  );
}