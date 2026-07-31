"use client";

import { Plus, RefreshCw, Save, Trash2 } from "lucide-react";
import { FormEvent, useCallback, useEffect, useState } from "react";
import ui from "../../components/os/CoreUI.module.css";
import { useOSProperty } from "../../lib/os/useOSProperty";

type RoomType = {
  id: string;
  name: string;
  code: string | null;
  description: string | null;
  max_adults: number;
  max_children: number;
  max_occupancy: number;
  standard_rate: number | null;
  minimum_rate: number | null;
  maximum_rate: number | null;
  is_active: boolean;
  sort_order: number;
};

type Room = {
  id: string;
  room_number: string;
  room_name: string;
  room_type_id: string | null;
  floor: string | null;
  operational_status: string;
  housekeeping_status: string;
  notes: string | null;
  is_active: boolean;
  sort_order: number;
};

const blankType = {
  name: "",
  code: "",
  description: "",
  max_adults: 2,
  max_children: 0,
  max_occupancy: 2,
  standard_rate: "",
  minimum_rate: "",
  maximum_rate: "",
};

const blankRoom = {
  room_number: "",
  room_name: "",
  room_type_id: "",
  floor: "",
  operational_status: "operational",
  housekeeping_status: "clean",
  notes: "",
};

export default function RoomsManager() {
  const { supabase, property, loading: propertyLoading, error: propertyError } = useOSProperty();
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [typeForm, setTypeForm] = useState(blankType);
  const [roomForm, setRoomForm] = useState(blankRoom);
  const [tab, setTab] = useState<"rooms" | "types">("rooms");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const load = useCallback(async () => {
    if (!property) return;
    setLoading(true);
    setError("");

    const [typesResult, roomsResult] = await Promise.all([
      supabase
        .from("os_room_types")
        .select("id,name,code,description,max_adults,max_children,max_occupancy,standard_rate,minimum_rate,maximum_rate,is_active,sort_order")
        .eq("property_id", property.id)
        .order("sort_order")
        .order("name"),
      supabase
        .from("os_rooms")
        .select("id,room_number,room_name,room_type_id,floor,operational_status,housekeeping_status,notes,is_active,sort_order")
        .eq("property_id", property.id)
        .order("sort_order")
        .order("room_number"),
    ]);

    if (typesResult.error) setError(typesResult.error.message);
    else setRoomTypes((typesResult.data ?? []) as RoomType[]);

    if (roomsResult.error) setError(roomsResult.error.message);
    else setRooms((roomsResult.data ?? []) as Room[]);

    setLoading(false);
  }, [property, supabase]);

  useEffect(() => {
    void load();
  }, [load]);

  async function addType(event: FormEvent) {
    event.preventDefault();
    if (!property || !typeForm.name.trim()) return;
    setSaving(true);
    setError("");
    setSuccess("");

    const { error: insertError } = await supabase.from("os_room_types").insert({
      property_id: property.id,
      name: typeForm.name.trim(),
      code: typeForm.code.trim() || null,
      description: typeForm.description.trim() || null,
      max_adults: Number(typeForm.max_adults),
      max_children: Number(typeForm.max_children),
      max_occupancy: Number(typeForm.max_occupancy),
      standard_rate: typeForm.standard_rate === "" ? null : Number(typeForm.standard_rate),
      minimum_rate: typeForm.minimum_rate === "" ? null : Number(typeForm.minimum_rate),
      maximum_rate: typeForm.maximum_rate === "" ? null : Number(typeForm.maximum_rate),
      sort_order: roomTypes.length + 1,
      is_active: true,
    });

    if (insertError) setError(insertError.message);
    else {
      setTypeForm(blankType);
      setSuccess("Room type added.");
      await load();
    }
    setSaving(false);
  }

  async function addRoom(event: FormEvent) {
    event.preventDefault();
    if (!property || !roomForm.room_number.trim()) return;
    setSaving(true);
    setError("");
    setSuccess("");

    const { error: insertError } = await supabase.from("os_rooms").insert({
      property_id: property.id,
      room_number: roomForm.room_number.trim(),
      room_name: roomForm.room_name.trim() || `Room ${roomForm.room_number.trim()}`,
      room_type_id: roomForm.room_type_id || null,
      floor: roomForm.floor.trim() || null,
      operational_status: roomForm.operational_status,
      housekeeping_status: roomForm.housekeeping_status,
      notes: roomForm.notes.trim() || null,
      sort_order: rooms.length + 1,
      is_active: true,
    });

    if (insertError) setError(insertError.message);
    else {
      setRoomForm(blankRoom);
      setSuccess("Room added.");
      await load();
    }
    setSaving(false);
  }

  async function updateRoom(id: string, changes: Partial<Room>) {
    setError("");
    const { error: updateError } = await supabase
      .from("os_rooms")
      .update({ ...changes, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (updateError) setError(updateError.message);
    else await load();
  }

  async function deleteRoom(id: string) {
    if (!window.confirm("Deactivate this room?")) return;
    await updateRoom(id, { is_active: false });
  }

  if (propertyLoading || loading) return <div className={ui.loading}>Loading room inventoryâ€¦</div>;
  if (propertyError || error) return <div className={ui.error}>{propertyError || error}</div>;

  return (
    <div className={ui.page}>
      <div className={ui.toolbar}>
        <div>
          <h2>{property?.hotel_name}</h2>
          <p>{rooms.filter((room) => room.is_active).length} active rooms â€¢ {roomTypes.filter((type) => type.is_active).length} room types</p>
        </div>
        <button className={ui.secondary} onClick={() => void load()}>
          <RefreshCw size={15} /> Refresh
        </button>
      </div>

      <div className={ui.tabs}>
        <button className={tab === "rooms" ? ui.activeTab : ""} onClick={() => setTab("rooms")}>Rooms</button>
        <button className={tab === "types" ? ui.activeTab : ""} onClick={() => setTab("types")}>Room Types & Rates</button>
      </div>

      {success ? <div className={ui.success}>{success}</div> : null}

      {tab === "rooms" ? (
        <div className={`${ui.grid} ${ui.twoColumn}`}>
          <section className={ui.card}>
            <div className={ui.cardHeader}>
              <div><h3>Add room</h3><p>Create one room and assign its type.</p></div>
            </div>
            <form className={ui.formGrid} onSubmit={addRoom}>
              <label className={ui.field}><span>Room number</span><input value={roomForm.room_number} onChange={(e) => setRoomForm({ ...roomForm, room_number: e.target.value })} required /></label>
              <label className={ui.field}><span>Room name</span><input value={roomForm.room_name} onChange={(e) => setRoomForm({ ...roomForm, room_name: e.target.value })} placeholder="Room 01" /></label>
              <label className={ui.field}><span>Room type</span><select value={roomForm.room_type_id} onChange={(e) => setRoomForm({ ...roomForm, room_type_id: e.target.value })}><option value="">Unassigned</option>{roomTypes.filter((item) => item.is_active).map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
              <label className={ui.field}><span>Floor / area</span><input value={roomForm.floor} onChange={(e) => setRoomForm({ ...roomForm, floor: e.target.value })} /></label>
              <label className={ui.field}><span>Operational status</span><select value={roomForm.operational_status} onChange={(e) => setRoomForm({ ...roomForm, operational_status: e.target.value })}><option value="operational">Operational</option><option value="maintenance">Maintenance</option><option value="out_of_order">Out of order</option></select></label>
              <label className={ui.field}><span>Housekeeping</span><select value={roomForm.housekeeping_status} onChange={(e) => setRoomForm({ ...roomForm, housekeeping_status: e.target.value })}><option value="clean">Clean</option><option value="dirty">Dirty</option><option value="inspected">Inspected</option><option value="in_progress">In progress</option></select></label>
              <label className={`${ui.field} ${ui.fieldWide}`}><span>Notes</span><textarea value={roomForm.notes} onChange={(e) => setRoomForm({ ...roomForm, notes: e.target.value })} /></label>
              <button className={ui.primary} disabled={saving}><Plus size={15} /> Add room</button>
            </form>
          </section>

          <section className={ui.card}>
            <div className={ui.cardHeader}><div><h3>Room inventory</h3><p>Update live room status directly.</p></div></div>
            <div className={ui.list}>
              {rooms.length === 0 ? <div className={ui.empty}>No rooms configured.</div> : rooms.map((room) => {
                const type = roomTypes.find((item) => item.id === room.room_type_id);
                return (
                  <div className={ui.listRow} key={room.id}>
                    <div><strong>{room.room_name || `Room ${room.room_number}`}</strong><small>{room.room_number} â€¢ {type?.name || "Unassigned"}</small></div>
                    <select value={room.operational_status} onChange={(e) => void updateRoom(room.id, { operational_status: e.target.value })}><option value="operational">Operational</option><option value="maintenance">Maintenance</option><option value="out_of_order">Out of order</option></select>
                    <select value={room.housekeeping_status} onChange={(e) => void updateRoom(room.id, { housekeeping_status: e.target.value })}><option value="clean">Clean</option><option value="dirty">Dirty</option><option value="inspected">Inspected</option><option value="in_progress">In progress</option></select>
                    <span className={`${ui.badge} ${room.is_active ? ui.successBadge : ""}`}>{room.is_active ? "Active" : "Inactive"}</span>
                    <button className={ui.smallButton} onClick={() => void deleteRoom(room.id)}><Trash2 size={14} /></button>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      ) : (
        <div className={`${ui.grid} ${ui.twoColumn}`}>
          <section className={ui.card}>
            <div className={ui.cardHeader}><div><h3>Add room type</h3><p>Capacity and commercial rate limits.</p></div></div>
            <form className={ui.formGrid} onSubmit={addType}>
              <label className={ui.field}><span>Name</span><input value={typeForm.name} onChange={(e) => setTypeForm({ ...typeForm, name: e.target.value })} required /></label>
              <label className={ui.field}><span>Code</span><input value={typeForm.code} onChange={(e) => setTypeForm({ ...typeForm, code: e.target.value })} /></label>
              <label className={ui.field}><span>Adults</span><input type="number" min="1" value={typeForm.max_adults} onChange={(e) => setTypeForm({ ...typeForm, max_adults: Number(e.target.value) })} /></label>
              <label className={ui.field}><span>Children</span><input type="number" min="0" value={typeForm.max_children} onChange={(e) => setTypeForm({ ...typeForm, max_children: Number(e.target.value) })} /></label>
              <label className={ui.field}><span>Total occupancy</span><input type="number" min="1" value={typeForm.max_occupancy} onChange={(e) => setTypeForm({ ...typeForm, max_occupancy: Number(e.target.value) })} /></label>
              <label className={ui.field}><span>Standard rate</span><input type="number" min="0" value={typeForm.standard_rate} onChange={(e) => setTypeForm({ ...typeForm, standard_rate: e.target.value })} /></label>
              <label className={ui.field}><span>Minimum rate</span><input type="number" min="0" value={typeForm.minimum_rate} onChange={(e) => setTypeForm({ ...typeForm, minimum_rate: e.target.value })} /></label>
              <label className={ui.field}><span>Maximum rate</span><input type="number" min="0" value={typeForm.maximum_rate} onChange={(e) => setTypeForm({ ...typeForm, maximum_rate: e.target.value })} /></label>
              <label className={`${ui.field} ${ui.fieldWide}`}><span>Description</span><textarea value={typeForm.description} onChange={(e) => setTypeForm({ ...typeForm, description: e.target.value })} /></label>
              <button className={ui.primary} disabled={saving}><Save size={15} /> Save room type</button>
            </form>
          </section>

          <section className={ui.card}>
            <div className={ui.cardHeader}><div><h3>Room types</h3><p>Current capacity and rate boundaries.</p></div></div>
            <div className={ui.list}>
              {roomTypes.length === 0 ? <div className={ui.empty}>No room types configured.</div> : roomTypes.map((item) => (
                <div className={ui.listRow} key={item.id}>
                  <div><strong>{item.name}</strong><small>{item.code || "No code"} â€¢ {item.max_occupancy} guests</small></div>
                  <span className={ui.badge}>Min {property?.currency} {item.minimum_rate ?? "â€”"}</span>
                  <span className={ui.badge}>Std {property?.currency} {item.standard_rate ?? "â€”"}</span>
                  <span className={ui.badge}>Max {property?.currency} {item.maximum_rate ?? "â€”"}</span>
                  <span className={`${ui.badge} ${item.is_active ? ui.successBadge : ""}`}>{item.is_active ? "Active" : "Inactive"}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

