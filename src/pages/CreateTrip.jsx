import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, Trash2 } from 'lucide-react'
import { createTrip } from '../lib/supabase-crud'
import { supabase } from '../lib/supabase'
import { cn } from '../lib/utils'

const DEFAULT_FAMILY = {
  name: '',
  shortOrigin: '',
  origin: '',
  headcount: '',
  vehicle: '',
  responsibility: '',
}

export function CreateTrip() {
  const navigate = useNavigate()
  const [saving, setSaving] = useState(false)
  const [step, setStep] = useState(1)

  // Trip basics
  const [title, setTitle] = useState('')
  const [commandName, setCommandName] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [basecampAddress, setBasecampAddress] = useState('')

  // Families
  const [families, setFamilies] = useState([{ ...DEFAULT_FAMILY }])

  const addFamily = () => setFamilies((prev) => [...prev, { ...DEFAULT_FAMILY }])
  const removeFamily = (index) => setFamilies((prev) => prev.filter((_, i) => i !== index))
  const updateFamily = (index, field, value) => {
    setFamilies((prev) =>
      prev.map((f, i) => (i === index ? { ...f, [field]: value } : f))
    )
  }

  const handleSubmit = async () => {
    if (!title || !startDate || !endDate) return
    setSaving(true)

    try {
      const trip = await createTrip({
        title,
        command_name: commandName || title,
        start_date: startDate,
        end_date: endDate,
        basecamp_address: basecampAddress,
      })

      // Create families
      for (const family of families.filter((f) => f.name.trim())) {
        await supabase.from('families').insert({
          trip_id: trip.id,
          name: family.name,
          short_origin: family.shortOrigin,
          origin: family.origin,
          headcount: family.headcount,
          vehicle: family.vehicle,
          responsibility: family.responsibility,
        })
      }

      navigate(`/trips/${trip.id}`)
    } catch (err) {
      console.error('Failed to create trip:', err)
      alert('Failed to create trip: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  const canSubmit = title && startDate && endDate

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-bg-base font-sans text-text-primary antialiased">
      {/* Left rail */}
      <div className="flex w-64 flex-col border-r border-border-default bg-bg-panel">
        <div className="flex h-14 items-center border-b border-border-default px-6">
          <button
            onClick={() => navigate('/trips')}
            className="flex items-center gap-2 text-[11px] font-bold text-text-secondary transition-colors hover:text-text-primary"
          >
            <ArrowLeft size={14} />
            Back to Ops
          </button>
        </div>
        <div className="flex-1 p-4">
          <div className="text-[9px] font-black uppercase tracking-[0.2em] text-info mb-4">
            New Operation
          </div>
          <StepIndicator number={1} label="Trip Details" active={step >= 1} />
          <StepIndicator number={2} label="Family Units" active={step >= 2} />
          <StepIndicator number={3} label="Review & Launch" active={step >= 3} />
        </div>
      </div>

      {/* Main form */}
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex h-14 items-center border-b border-border-default bg-bg-surface px-8">
          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-success">
            UNCLASSIFIED // TRAKKA OPS
          </div>
        </div>

        <div className="flex-1 overflow-auto p-8">
          <div className="mx-auto max-w-2xl">
            {/* Step 1: Trip Details */}
            {step === 1 && (
              <div>
                <div className="mb-6">
                  <div className="text-[10px] font-black uppercase tracking-[0.22em] text-info">
                    Step 1
                  </div>
                  <h2 className="mt-1 text-[18px] font-black uppercase tracking-[0.08em] text-text-primary">
                    Trip Details
                  </h2>
                </div>

                <div className="space-y-4">
                  <Field label="Trip Name" required>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Jervis Bay Long Weekend"
                      className="w-full border border-border-default bg-bg-panel px-3 py-2 text-[12px] text-text-primary outline-none focus:border-info"
                    />
                  </Field>

                  <Field label="Command Centre Name">
                    <input
                      type="text"
                      value={commandName}
                      onChange={(e) => setCommandName(e.target.value)}
                      placeholder="e.g. Jervis Bay Command Centre"
                      className="w-full border border-border-default bg-bg-panel px-3 py-2 text-[12px] text-text-primary outline-none focus:border-info"
                    />
                  </Field>

                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Start Date" required>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full border border-border-default bg-bg-panel px-3 py-2 text-[12px] text-text-primary outline-none focus:border-info"
                      />
                    </Field>
                    <Field label="End Date" required>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full border border-border-default bg-bg-panel px-3 py-2 text-[12px] text-text-primary outline-none focus:border-info"
                      />
                    </Field>
                  </div>

                  <Field label="Basecamp Address">
                    <input
                      type="text"
                      value={basecampAddress}
                      onChange={(e) => setBasecampAddress(e.target.value)}
                      placeholder="e.g. Jervis Bay, NSW 2540"
                      className="w-full border border-border-default bg-bg-panel px-3 py-2 text-[12px] text-text-primary outline-none focus:border-info"
                    />
                  </Field>
                </div>

                <div className="mt-8 flex justify-end">
                  <button
                    onClick={() => setStep(2)}
                    disabled={!title || !startDate || !endDate}
                    className={cn(
                      'border px-6 py-2 text-[11px] font-black uppercase tracking-wider',
                      title && startDate && endDate
                        ? 'border-info bg-info-soft text-info hover:bg-info/20'
                        : 'border-border-default bg-bg-panel text-text-muted cursor-not-allowed'
                    )}
                  >
                    Next: Family Units
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Family Units */}
            {step === 2 && (
              <div>
                <div className="mb-6">
                  <div className="text-[10px] font-black uppercase tracking-[0.22em] text-info">
                    Step 2
                  </div>
                  <h2 className="mt-1 text-[18px] font-black uppercase tracking-[0.08em] text-text-primary">
                    Family Units
                  </h2>
                  <p className="mt-1 text-[11px] text-text-secondary">
                    Add the crews rolling out on this trip.
                  </p>
                </div>

                <div className="space-y-3">
                  {families.map((family, index) => (
                    <div key={index} className="border border-border-default bg-bg-surface p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-[10px] font-black uppercase tracking-wider text-text-secondary">
                          Unit {index + 1}
                        </div>
                        {families.length > 1 && (
                          <button
                            onClick={() => removeFamily(index)}
                            className="text-text-secondary hover:text-critical"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="text"
                          value={family.name}
                          onChange={(e) => updateFamily(index, 'name', e.target.value)}
                          placeholder="Family name (e.g. The Morrisons)"
                          className="col-span-2 border border-border-default bg-bg-panel px-3 py-2 text-[12px] text-text-primary outline-none focus:border-info"
                        />
                        <input
                          type="text"
                          value={family.shortOrigin}
                          onChange={(e) => updateFamily(index, 'shortOrigin', e.target.value)}
                          placeholder="Origin code (e.g. SYD)"
                          className="border border-border-default bg-bg-panel px-3 py-2 text-[12px] text-text-primary outline-none focus:border-info"
                        />
                        <input
                          type="text"
                          value={family.origin}
                          onChange={(e) => updateFamily(index, 'origin', e.target.value)}
                          placeholder="Origin city"
                          className="border border-border-default bg-bg-panel px-3 py-2 text-[12px] text-text-primary outline-none focus:border-info"
                        />
                        <input
                          type="text"
                          value={family.headcount}
                          onChange={(e) => updateFamily(index, 'headcount', e.target.value)}
                          placeholder="Headcount"
                          className="border border-border-default bg-bg-panel px-3 py-2 text-[12px] text-text-primary outline-none focus:border-info"
                        />
                        <input
                          type="text"
                          value={family.vehicle}
                          onChange={(e) => updateFamily(index, 'vehicle', e.target.value)}
                          placeholder="Vehicle"
                          className="border border-border-default bg-bg-panel px-3 py-2 text-[12px] text-text-primary outline-none focus:border-info"
                        />
                        <input
                          type="text"
                          value={family.responsibility}
                          onChange={(e) => updateFamily(index, 'responsibility', e.target.value)}
                          placeholder="Responsibility"
                          className="col-span-2 border border-border-default bg-bg-panel px-3 py-2 text-[12px] text-text-primary outline-none focus:border-info"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={addFamily}
                  className="mt-3 flex w-full items-center justify-center gap-2 border border-dashed border-border-default bg-bg-surface py-3 text-[11px] font-bold text-text-secondary transition-colors hover:border-info/50 hover:text-info"
                >
                  <Plus size={14} />
                  Add Another Unit
                </button>

                <div className="mt-8 flex justify-between">
                  <button
                    onClick={() => setStep(1)}
                    className="border border-border-default bg-bg-panel px-6 py-2 text-[11px] font-black uppercase tracking-wider text-text-secondary hover:text-text-primary"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setStep(3)}
                    className="border border-info bg-info-soft px-6 py-2 text-[11px] font-black uppercase tracking-wider text-info hover:bg-info/20"
                  >
                    Review
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Review */}
            {step === 3 && (
              <div>
                <div className="mb-6">
                  <div className="text-[10px] font-black uppercase tracking-[0.22em] text-info">
                    Step 3
                  </div>
                  <h2 className="mt-1 text-[18px] font-black uppercase tracking-[0.08em] text-text-primary">
                    Review & Launch
                  </h2>
                </div>

                <div className="border border-border-default bg-bg-surface p-4 mb-4">
                  <div className="text-[9px] font-black uppercase tracking-wider text-text-secondary mb-2">
                    Trip Summary
                  </div>
                  <div className="space-y-1 text-[12px]">
                    <div><span className="text-text-secondary">Name:</span> <span className="font-bold text-text-primary">{title}</span></div>
                    {commandName && <div><span className="text-text-secondary">Command:</span> <span className="font-bold text-text-primary">{commandName}</span></div>}
                    <div><span className="text-text-secondary">Dates:</span> <span className="font-bold text-text-primary">{startDate} → {endDate}</span></div>
                    {basecampAddress && <div><span className="text-text-secondary">Basecamp:</span> <span className="font-bold text-text-primary">{basecampAddress}</span></div>}
                  </div>
                </div>

                <div className="border border-border-default bg-bg-surface p-4">
                  <div className="text-[9px] font-black uppercase tracking-wider text-text-secondary mb-2">
                    Family Units ({families.filter((f) => f.name.trim()).length})
                  </div>
                  <div className="space-y-2">
                    {families.filter((f) => f.name.trim()).map((family, i) => (
                      <div key={i} className="text-[12px]">
                        <span className="font-bold text-text-primary">{family.name}</span>
                        <span className="text-text-secondary"> · {family.shortOrigin} · {family.headcount} · {family.vehicle}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-8 flex justify-between">
                  <button
                    onClick={() => setStep(2)}
                    className="border border-border-default bg-bg-panel px-6 py-2 text-[11px] font-black uppercase tracking-wider text-text-secondary hover:text-text-primary"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={!canSubmit || saving}
                    className={cn(
                      'border px-6 py-2 text-[11px] font-black uppercase tracking-wider',
                      canSubmit && !saving
                        ? 'border-success bg-success-soft text-success hover:bg-success/20'
                        : 'border-border-default bg-bg-panel text-text-muted cursor-not-allowed'
                    )}
                  >
                    {saving ? 'Launching...' : 'Launch Operation'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function Field({ label, required, children }) {
  return (
    <div>
      <label className="mb-1.5 block text-[10px] font-black uppercase tracking-wider text-text-secondary">
        {label}
        {required && <span className="text-critical ml-1">*</span>}
      </label>
      {children}
    </div>
  )
}

function StepIndicator({ number, label, active }) {
  return (
    <div className={cn('flex items-center gap-3 py-2', active ? 'opacity-100' : 'opacity-40')}>
      <div className={cn(
        'flex h-6 w-6 items-center justify-center text-[10px] font-black',
        active ? 'bg-info text-bg-base' : 'border border-border-default text-text-secondary'
      )}>
        {number}
      </div>
      <span className={cn('text-[11px] font-bold', active ? 'text-text-primary' : 'text-text-secondary')}>
        {label}
      </span>
    </div>
  )
}
