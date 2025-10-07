'use client';

import { useState } from 'react';
import { Plus, Trash2, Copy, CheckCircle } from 'lucide-react';
import DashboardCard from './DashboardCard';
import { DescriptionData, ProjectType, Room } from '@/types';

const defaultDescriptionData: DescriptionData = {
  projectType: 'both',
  coats: 2,
  exterior: {
    softWash: true,
    scraping: true,
    sanding: true,
    priming: true,
    areas: ['house'],
    components: ['trims', 'siding', 'windows', 'doors']
  },
  interior: {
    sanding: true,
    patching: true,
    crackRepair: true,
    rooms: [
      { id: '1', name: 'Living Room', components: ['walls', 'trims', 'ceiling'] },
      { id: '2', name: 'Kitchen', components: ['walls', 'trims', 'doors'] },
      { id: '3', name: 'Bedroom', components: ['walls', 'trims', 'ceiling'] }
    ]
  }
};

const exteriorAreas = ['house', 'shed', 'deck', 'garage', 'fence'];
const exteriorComponents = ['trims', 'siding', 'windows', 'gutters', 'shutters', 'doors', 'decking'];
const interiorComponents = ['walls', 'trims', 'doors', 'ceiling', 'closet', 'baseboards'];

export default function DescriptionGenerator() {
  const [data, setData] = useState<DescriptionData>(defaultDescriptionData);
  const [copied, setCopied] = useState(false);

  const updateExterior = (key: string, value: boolean | string[]) => {
    setData(prev => ({
      ...prev,
      exterior: { ...prev.exterior, [key]: value } as typeof prev.exterior
    }));
  };

  const updateInterior = (key: string, value: boolean | Room[]) => {
    setData(prev => ({
      ...prev,
      interior: { ...prev.interior, [key]: value } as typeof prev.interior
    }));
  };

  const addRoom = () => {
    const newRoom: Room = {
      id: Date.now().toString(),
      name: 'New Room',
      components: ['walls']
    };
    setData(prev => ({
      ...prev,
      interior: {
        ...prev.interior,
        rooms: [...prev.interior.rooms, newRoom]
      }
    }));
  };

  const updateRoom = (roomId: string, updates: Partial<Room>) => {
    setData(prev => ({
      ...prev,
      interior: {
        ...prev.interior,
        rooms: prev.interior.rooms.map(room =>
          room.id === roomId ? { ...room, ...updates } : room
        )
      }
    }));
  };

  const deleteRoom = (roomId: string) => {
    setData(prev => ({
      ...prev,
      interior: {
        ...prev.interior,
        rooms: prev.interior.rooms.filter(room => room.id !== roomId)
      }
    }));
  };

  const generateDescription = () => {
    let description = `Professional ${data.coats}-Coat Painting Project\n\n`;

    if (data.projectType === 'exterior' || data.projectType === 'both') {
      description += 'EXTERIOR WORK:\n';
      if (data.exterior.softWash) description += '• Power washing and surface preparation\n';
      if (data.exterior.scraping) description += '• Scraping of loose paint and debris\n';
      if (data.exterior.sanding) description += '• Sanding of rough surfaces\n';
      if (data.exterior.priming) description += '• Application of appropriate primers\n';

      description += `• Painting of ${data.exterior.areas.join(', ')}\n`;
      description += `• Including: ${data.exterior.components.join(', ')}\n\n`;
    }

    if (data.projectType === 'interior' || data.projectType === 'both') {
      description += 'INTERIOR WORK:\n';
      if (data.interior.sanding) description += '• Surface sanding and preparation\n';
      if (data.interior.patching) description += '• Patching and repair work\n';
      if (data.interior.crackRepair) description += '• Crack and hole repair\n\n';

      description += 'ROOM-BY-ROOM BREAKDOWN:\n';
      data.interior.rooms.forEach(room => {
        description += `• ${room.name}: ${room.components.join(', ')}\n`;
      });
    }

    return description;
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generateDescription());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div className="d-flex flex-column gap-4">
      {/* Project Type Selection */}
      <DashboardCard title="Project Configuration">
        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label fw-medium">
              Project Type
            </label>
            <select
              value={data.projectType}
              onChange={(e) => setData(prev => ({ ...prev, projectType: e.target.value as ProjectType }))}
              className="form-select"
              suppressHydrationWarning
            >
              <option value="exterior">Exterior Only</option>
              <option value="interior">Interior Only</option>
              <option value="both">Both Exterior & Interior</option>
            </select>
          </div>
          <div className="col-md-6">
            <label className="form-label fw-medium">
              Number of Coats
            </label>
            <select
              value={data.coats}
              onChange={(e) => setData(prev => ({ ...prev, coats: parseInt(e.target.value) }))}
              className="form-select"
              suppressHydrationWarning
            >
              <option value={1}>1 Coat</option>
              <option value={2}>2 Coats</option>
              <option value={3}>3 Coats</option>
            </select>
          </div>
        </div>
      </DashboardCard>

      {/* Exterior Services */}
      {(data.projectType === 'exterior' || data.projectType === 'both') && (
        <DashboardCard title="Exterior Services">
          <div className="mb-4">
            <h5 className="fw-medium mb-3">Preparation Steps</h5>
            <div className="row g-2">
              {[
                { key: 'softWash', label: 'Soft Wash' },
                { key: 'scraping', label: 'Scraping' },
                { key: 'sanding', label: 'Sanding' },
                { key: 'priming', label: 'Priming' }
              ].map(({ key, label }) => (
                <div key={key} className="col-md-6 col-lg-3">
                  <div className="form-check">
                    <input
                      type="checkbox"
                      checked={data.exterior[key as keyof typeof data.exterior] as boolean}
                      onChange={(e) => updateExterior(key, e.target.checked)}
                      className="form-check-input"
                      id={`exterior-${key}`}
                    />
                    <label className="form-check-label" htmlFor={`exterior-${key}`}>
                      {label}
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <h5 className="fw-medium mb-3">Areas</h5>
            <div className="row g-2">
              {exteriorAreas.map(area => (
                <div key={area} className="col-md-4">
                  <div className="form-check">
                    <input
                      type="checkbox"
                      checked={data.exterior.areas.includes(area)}
                      onChange={(e) => {
                        const newAreas = e.target.checked
                          ? [...data.exterior.areas, area]
                          : data.exterior.areas.filter(a => a !== area);
                        updateExterior('areas', newAreas);
                      }}
                      className="form-check-input"
                      id={`area-${area}`}
                    />
                    <label className="form-check-label text-capitalize" htmlFor={`area-${area}`}>
                      {area}
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h5 className="fw-medium mb-3">Components</h5>
            <div className="row g-2">
              {exteriorComponents.map(component => (
                <div key={component} className="col-md-4">
                  <div className="form-check">
                    <input
                      type="checkbox"
                      checked={data.exterior.components.includes(component)}
                      onChange={(e) => {
                        const newComponents = e.target.checked
                          ? [...data.exterior.components, component]
                          : data.exterior.components.filter(c => c !== component);
                        updateExterior('components', newComponents);
                      }}
                      className="form-check-input"
                      id={`component-${component}`}
                    />
                    <label className="form-check-label text-capitalize" htmlFor={`component-${component}`}>
                      {component}
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </DashboardCard>
      )}

      {/* Interior Services */}
      {(data.projectType === 'interior' || data.projectType === 'both') && (
        <DashboardCard title="Interior Services">
          <div className="mb-4">
            <h5 className="fw-medium mb-3">Preparation Steps</h5>
            <div className="row g-2">
              {[
                { key: 'sanding', label: 'Sanding' },
                { key: 'patching', label: 'Patching' },
                { key: 'crackRepair', label: 'Crack Repair' }
              ].map(({ key, label }) => (
                <div key={key} className="col-md-4">
                  <div className="form-check">
                    <input
                      type="checkbox"
                      checked={data.interior[key as keyof typeof data.interior] as boolean}
                      onChange={(e) => updateInterior(key, e.target.checked)}
                      className="form-check-input"
                      id={`interior-${key}`}
                    />
                    <label className="form-check-label" htmlFor={`interior-${key}`}>
                      {label}
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h5 className="fw-medium mb-0">Rooms</h5>
              <button
                onClick={addRoom}
                className="btn btn-primary btn-sm d-flex align-items-center gap-1"
              >
                <Plus style={{ width: '1rem', height: '1rem' }} />
                Add Room
              </button>
            </div>
            <div className="d-flex flex-column gap-3">
              {data.interior.rooms.map(room => (
                <div key={room.id} className="card">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <input
                        type="text"
                        value={room.name}
                        onChange={(e) => updateRoom(room.id, { name: e.target.value })}
                        className="form-control me-2"
                        placeholder="Room name"
                        suppressHydrationWarning
                      />
                      <button
                        onClick={() => deleteRoom(room.id)}
                        className="btn btn-outline-danger btn-sm"
                      >
                        <Trash2 style={{ width: '1rem', height: '1rem' }} />
                      </button>
                    </div>
                    <div className="row g-2">
                      {interiorComponents.map(component => (
                        <div key={component} className="col-md-4">
                          <div className="form-check">
                            <input
                              type="checkbox"
                              checked={room.components.includes(component)}
                              onChange={(e) => {
                                const newComponents = e.target.checked
                                  ? [...room.components, component]
                                  : room.components.filter(c => c !== component);
                                updateRoom(room.id, { components: newComponents });
                              }}
                              className="form-check-input"
                              id={`room-${room.id}-${component}`}
                            />
                            <label className="form-check-label text-capitalize" htmlFor={`room-${room.id}-${component}`}>
                              {component}
                            </label>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </DashboardCard>
      )}

      {/* Generated Description */}
      <DashboardCard title="Generated Job Description">
        <div className="d-flex flex-column gap-3">
          <div className="bg-light p-3 rounded border">
            <pre className="text-dark small font-monospace mb-0 whitespace-pre-wrap">
              {generateDescription()}
            </pre>
          </div>
          <button
            onClick={copyToClipboard}
            className="btn btn-primary d-flex align-items-center gap-2"
          >
            {copied ? (
              <>
                <CheckCircle style={{ width: '1.25rem', height: '1.25rem' }} />
                <span>Job Description Copied!</span>
              </>
            ) : (
              <>
                <Copy style={{ width: '1.25rem', height: '1.25rem' }} />
                <span>Copy Job Description</span>
              </>
            )}
          </button>
        </div>
      </DashboardCard>
    </div>
  );
}
