/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { PawPrint, Heart, Utensils, Sparkles, Stethoscope, RefreshCw } from 'lucide-react';
import { UserProfile } from '../types/game';
import { formatNaira, formatCAD } from '../utils/formatNaira';
import { getAuthBearerHeaders } from '../services/economyService';
import { PetViewport3D } from './PetViewport3D';

export interface PetsAppProps {
  userProfile?: UserProfile;
  currentStateId?: string;
  onUpdateProfile?: (updatedProfile: UserProfile) => void;
  onShowToast?: (msg: string) => void;
  triggerSound?: (type: 'coin' | 'stamp' | 'alert' | 'success') => void;
}

export const PetsApp: React.FC<PetsAppProps> = ({
  userProfile,
  currentStateId = 'lagos',
  onUpdateProfile,
  onShowToast,
  triggerSound,
}) => {
  const isCanada = currentStateId === 'canada' || userProfile?.currentCountry === 'canada';

  const [tab, setTab] = useState<'my_pets' | 'adopt'>('my_pets');
  const [catalog, setCatalog] = useState<any[]>([]);
  const [pets, setPets] = useState<any[]>([]);
  const [selectedPetId, setSelectedPetId] = useState<string>('');
  const [previewBreedId, setPreviewBreedId] = useState<string>('boerboel_mastiff');
  const [petNameInput, setPetNameInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const loadPets = useCallback(async () => {
    try {
      const headers = await getAuthBearerHeaders();
      const resp = await fetch('/api/pets/state', { headers });
      const data = await resp.json();
      if (resp.ok && data.success) {
        setCatalog(data.catalog || []);
        setPets(data.pets || []);
        if (data.pets?.length > 0 && !selectedPetId) {
          setSelectedPetId(data.pets[0].id);
        }
      }
    } finally {
      setLoading(false);
    }
  }, [selectedPetId]);

  useEffect(() => {
    loadPets();
  }, [loadPets]);

  const activePet = pets.find((p) => p.id === selectedPetId) || pets[0] || null;

  const handleAdopt = async (breedId: string) => {
    setBusy(true);
    try {
      const headers = await getAuthBearerHeaders();
      const resp = await fetch('/api/pets/buy', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          breedId,
          customName: petNameInput.trim() || undefined,
          currency: isCanada ? 'CAD' : 'NGN',
        }),
      });
      const data = await resp.json();
      if (!resp.ok) {
        onShowToast?.(data.error || 'Adoption failed.');
        triggerSound?.('alert');
        return;
      }
      if (data.account && userProfile && onUpdateProfile) {
        onUpdateProfile({
          ...userProfile,
          ngnKobo: data.account.ngnKobo,
          cadCents: data.account.cadCents,
          bankNaira: data.account.bankNaira,
          cashNaira: 0,
          bankCAD: data.account.bankCAD,
          receipts: data.account.receipts,
        });
      }
      setPetNameInput('');
      setSelectedPetId(data.pet.id);
      setTab('my_pets');
      onShowToast?.(`Adopted ${data.pet.name}! Drag to rotate in 3D.`);
      triggerSound?.('success');
      loadPets();
    } finally {
      setBusy(false);
    }
  };

  const handleCare = async (action: 'feed' | 'play' | 'groom' | 'vet') => {
    if (!activePet) return;
    setBusy(true);
    try {
      const headers = await getAuthBearerHeaders();
      const resp = await fetch(`/api/pets/${activePet.id}/care`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ action, currency: isCanada ? 'CAD' : 'NGN' }),
      });
      const data = await resp.json();
      if (!resp.ok) {
        onShowToast?.(data.error || 'Care action failed.');
        triggerSound?.('alert');
        return;
      }
      if (data.account && userProfile && onUpdateProfile) {
        onUpdateProfile({
          ...userProfile,
          ngnKobo: data.account.ngnKobo,
          cadCents: data.account.cadCents,
          bankNaira: data.account.bankNaira,
          cashNaira: 0,
          bankCAD: data.account.bankCAD,
          receipts: data.account.receipts,
        });
      }
      triggerSound?.('coin');
      loadPets();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="p-3 rounded-2xl bg-gradient-to-r from-orange-950/90 via-zinc-950 to-black border border-orange-500/40 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <PawPrint className="w-5 h-5 text-orange-400" />
          <div>
            <h3 className="text-xs font-black text-white">3D Pets &amp; Kennels</h3>
            <p className="text-[10px] text-orange-300 font-mono">Interactive 3D Companion Care</p>
          </div>
        </div>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => setTab('my_pets')}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer ${
              tab === 'my_pets' ? 'bg-orange-500 text-black font-black' : 'bg-zinc-900 text-zinc-400'
            }`}
          >
            My Pets ({pets.length})
          </button>
          <button
            type="button"
            onClick={() => setTab('adopt')}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer ${
              tab === 'adopt' ? 'bg-orange-500 text-black font-black' : 'bg-zinc-900 text-zinc-400'
            }`}
          >
            Adopt
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-10 text-center text-xs text-zinc-400 flex items-center justify-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin text-orange-400" /> Loading 3D Kennels...
        </div>
      ) : tab === 'my_pets' ? (
        pets.length === 0 ? (
          <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 text-center space-y-2">
            <p className="text-xs text-zinc-300 font-bold">You have not adopted a 3D pet yet.</p>
            <button
              type="button"
              onClick={() => setTab('adopt')}
              className="px-4 py-2 rounded-xl bg-orange-500 text-black font-black text-xs cursor-pointer"
            >
              Browse 3D Breeds
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {pets.length > 1 && (
              <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {pets.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSelectedPetId(p.id)}
                    className={`px-3 py-1 rounded-xl text-[10px] font-bold border whitespace-nowrap cursor-pointer ${
                      activePet?.id === p.id ? 'bg-orange-500 text-black border-orange-400 font-black' : 'bg-zinc-900 text-zinc-300 border-zinc-700'
                    }`}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            )}

            {activePet && (
              <>
                <PetViewport3D breedId={activePet.breedId} happiness={activePet.happiness} />

                <div className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-black text-white">{activePet.name}</span>
                    <span className="text-[10px] font-mono text-orange-300">{activePet.breedName}</span>
                  </div>
                  {[
                    { label: 'Hunger', val: activePet.hunger, color: 'bg-emerald-500' },
                    { label: 'Energy', val: activePet.energy, color: 'bg-sky-500' },
                    { label: 'Happiness', val: activePet.happiness, color: 'bg-amber-400' },
                    { label: 'Health', val: activePet.health, color: 'bg-rose-500' },
                  ].map((s) => (
                    <div key={s.label} className="space-y-0.5">
                      <div className="flex justify-between text-[10px] text-zinc-400 font-mono">
                        <span>{s.label}</span>
                        <span>{s.val}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                        <div className={`h-full ${s.color}`} style={{ width: `${s.val}%` }} />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {[
                    { act: 'feed' as const, label: 'Feed', icon: Utensils, costNGN: 2500, costCAD: 8 },
                    { act: 'play' as const, label: 'Play', icon: Heart, costNGN: 0, costCAD: 0 },
                    { act: 'groom' as const, label: 'Groom', icon: Sparkles, costNGN: 4500, costCAD: 15 },
                    { act: 'vet' as const, label: 'Vet Check', icon: Stethoscope, costNGN: 9000, costCAD: 30 },
                  ].map((b) => {
                    const Icon = b.icon;
                    const c = isCanada ? b.costCAD : b.costNGN;
                    return (
                      <button
                        key={b.act}
                        type="button"
                        disabled={busy}
                        onClick={() => handleCare(b.act)}
                        className="py-2 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-bold text-white flex items-center justify-between cursor-pointer"
                      >
                        <span className="flex items-center gap-1.5">
                          <Icon className="w-3.5 h-3.5 text-orange-400" /> {b.label}
                        </span>
                        <span className="text-[10px] font-mono text-zinc-400">
                          {c === 0 ? 'Free' : isCanada ? formatCAD(c) : formatNaira(c)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )
      ) : (
        <div className="space-y-3">
          <PetViewport3D breedId={previewBreedId} happiness={95} />
          <input
            type="text"
            value={petNameInput}
            onChange={(e) => setPetNameInput(e.target.value)}
            placeholder="Custom pet name (optional)..."
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white"
          />
          <div className="space-y-2">
            {catalog.map((item) => (
              <div
                key={item.id}
                onClick={() => setPreviewBreedId(item.id)}
                className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer ${
                  previewBreedId === item.id ? 'bg-orange-950/30 border-orange-400' : 'bg-zinc-950 border-zinc-800'
                }`}
              >
                <div>
                  <div className="text-xs font-black text-white">{item.name}</div>
                  <div className="text-[10px] text-zinc-400">{item.category} · {item.desc}</div>
                  <div className="text-[10px] font-mono text-orange-300 mt-0.5">
                    {isCanada ? formatCAD(item.priceCAD) : formatNaira(item.priceNGN)}
                  </div>
                </div>
                <button
                  type="button"
                  disabled={busy}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAdopt(item.id);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-orange-500 text-black font-black text-xs cursor-pointer"
                >
                  Adopt
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
