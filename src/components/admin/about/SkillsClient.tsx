"use client";
import { useState } from "react";
import { Column, Row, Text, Button, Input, Line, Card } from "@once-ui-system/core";
import { createClient } from "@/lib/supabase/client";
import { ImageUpload } from "@/components/admin/ImageUpload";
import type { AboutSkill } from "@/lib/types";
import { ConfirmModal } from "@/components/admin/ConfirmModal";

interface Props { initialData: AboutSkill[]; }
const empty = (): Omit<AboutSkill,"id"|"created_at"|"updated_at"> => ({
  title_id:"", title_en:"", description_id:"", description_en:"", icon:"", sort_order:0,
});

export function SkillsClient({ initialData }: Props) {
  const [items, setItems]     = useState<AboutSkill[]>(initialData);
  const [editing, setEditing] = useState<Partial<AboutSkill>|null>(null);
  const [isNew, setIsNew]     = useState(false);
  const [loading, setLoading] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [msg, setMsg]         = useState("");
  const set = (k:string,v:unknown) => setEditing((e) => e?{...e,[k]:v}:e);

  const handleSave = async () => {
    if (!editing?.title_id) { setMsg("Nama skill wajib diisi."); return; }
    setLoading(true); setMsg("");
    const supabase = createClient();
    const payload = { ...editing, updated_at: new Date().toISOString() };
    if (isNew) {
      const { data, error } = await supabase.from("about_skills")
        .insert([{...payload,created_at:new Date().toISOString()}]).select().single();
      if (error) setMsg(error.message);
      else { setItems((p)=>[...p,data]); setEditing(null); }
    } else {
      const { error } = await supabase.from("about_skills").update(payload).eq("id",editing.id!);
      if (error) setMsg(error.message);
      else { setItems((p)=>p.map((x)=>x.id===editing.id?{...x,...editing} as AboutSkill:x)); setEditing(null); }
    }
    setLoading(false);
  };

  const handleDelete = (id: string) => { setConfirmDeleteId(id); };

  const doDeleteSkill = async (id: string) => {
    setConfirmDeleteId(null);
    const { error } = await createClient().from("about_skills").delete().eq("id",id);
    if (error) { setMsg(`Gagal menghapus: ${error.message}`); return; }
    setItems((p)=>p.filter((x)=>x.id!==id));
    if (editing?.id===id) setEditing(null);
  };

  if (editing!==null) return (
    <Column fillWidth gap="l" paddingBottom="80">
      <Column gap="m" border="neutral-alpha-weak" radius="l" padding="l" background="surface">
        <Text variant="label-strong-m">{isNew?"Tambah Skill":"Edit Skill"}</Text>
        <Line background="neutral-alpha-weak" />

        <Row gap="m" s={{direction:"column"}}>
          <Column gap="s" flex={1}>
            <Text variant="label-strong-s">Nama Skill / Teknologi *</Text>
            <Input id="ti" value={editing.title_id??""} onChange={(e:React.ChangeEvent<HTMLInputElement>)=>set("title_id",e.target.value)} placeholder="React, Python, Figma..." />
          </Column>
          <Column gap="s" flex={1}>
            <Text variant="label-strong-s">Urutan Tampil</Text>
            <Input id="so" type="number" value={String(editing.sort_order??0)} onChange={(e:React.ChangeEvent<HTMLInputElement>)=>set("sort_order",parseInt(e.target.value)||0)} />
          </Column>
        </Row>

        {/* Logo upload - ini yang tampil sebagai ikon di marquee */}
        <Column gap="m" border="neutral-alpha-weak" radius="l" padding="l" background="surface">
          <Column gap="4">
            <Text variant="label-strong-m">Logo Skill</Text>
            <Text variant="body-default-xs" onBackground="neutral-weak">
              Upload logo teknologi (PNG transparan lebih bagus). Akan tampil di baris logo bergerak di halaman About.
            </Text>
          </Column>
          <Line background="neutral-alpha-weak" />
          <ImageUpload bucket="media" value={editing.icon??""} onChange={(url)=>set("icon",url)} />
        </Column>
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
      <Column gap="8">
        <Button onClick={()=>{setEditing(empty());setIsNew(true);}} variant="primary" size="m" prefixIcon="plus">
          Tambah Skill / Teknologi
        </Button>
        <Text variant="body-default-xs" onBackground="neutral-weak">
          Logo-logo ini akan tampil sebagai dua baris marquee bergerak di halaman About.
        </Text>
      </Column>

      {items.length===0 && (
        <Card border="neutral-alpha-weak" background="surface" padding="xl" radius="l">
          <Column gap="m" horizontal="center" align="center">
            <Text style={{fontSize:48}}>⚡</Text>
            <Text variant="heading-strong-m">Belum ada skill</Text>
            <Text variant="body-default-s" onBackground="neutral-weak">
              Tambahkan teknologi yang Anda kuasai beserta logo-nya.
            </Text>
          </Column>
        </Card>
      )}

      {/* Grid preview logo */}
      {items.length > 0 && (
        <Row wrap gap="m" style={{marginBottom: 8}}>
          {items.map((skill) => (
            <div key={skill.id} onClick={()=>{setEditing(skill);setIsNew(false);}}
              style={{
                display:"flex", flexDirection:"column", alignItems:"center", gap:8,
                padding:"12px 16px", borderRadius:12, cursor:"pointer",
                border:"1px solid var(--neutral-alpha-medium)",
                background:"var(--neutral-background-medium)",
                transition:"background 0.15s, transform 0.15s",
                minWidth: 90,
              }}
              onMouseEnter={(e)=>{e.currentTarget.style.background="var(--brand-alpha-weak)"; e.currentTarget.style.transform="translateY(-2px)";}}
              onMouseLeave={(e)=>{e.currentTarget.style.background="var(--neutral-background-medium)"; e.currentTarget.style.transform="translateY(0)";}}
            >
              {skill.icon
                ? <img src={skill.icon} alt={skill.title_id} style={{width:40,height:40,objectFit:"contain"}} />
                : <Text style={{fontSize:32}}>⚡</Text>
              }
              <Text variant="body-default-xs" align="center">{skill.title_id}</Text>
            </div>
          ))}
        </Row>
      )}
    </Column>
      {msg && <Text variant="body-default-s" onBackground="danger-strong">{msg}</Text>}
      <ConfirmModal
        open={!!confirmDeleteId}
        title="Hapus Skill?"
        message="Data skill ini akan dihapus permanen."
        confirmLabel="Ya, Hapus"
        onConfirm={() => confirmDeleteId && doDeleteSkill(confirmDeleteId)}
        onCancel={() => setConfirmDeleteId(null)}
      />
    </>
  );
}