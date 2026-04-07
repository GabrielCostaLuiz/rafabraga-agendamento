'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import SectionHeader from '@/components/section-header';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { submitContactForm } from '@/app/actions/contact';
import { RAFA_BRAGA_DATA } from '@/lib/constants';

const formSchema = z.object({
  name: z.string().min(3, { message: 'Mínimo 3 letras.' }),
  phone: z
    .string()
    .min(10, { message: 'Mínimo 10 números.' })
    .max(15, { message: 'Celular inválido.' })
    .regex(/^\d+$/, { message: 'Apenas números.' }),
  cep: z.string().optional(),
  location: z.string().min(3, { message: 'Localização obrigatória.' }),
  houseNumber: z.string().optional(),
  showDate: z.string().min(1, { message: 'Data obrigatória.' }).refine((val) => {
    if (!val) return false;
    const date = new Date(val);
    // Impede datas irreais e anos com mais de 4 dígitos (ex: 27576)
    const year = date.getFullYear();
    const isFourDigits = val.split('-')[0].length === 4;
    
    // Impede datas passadas
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(val);
    selectedDate.setHours(0, 0, 0, 0);

    return year > 2000 && year < 10000 && isFourDigits && selectedDate >= today;
  }, { message: 'Data deve ser hoje ou no futuro.' }),
  musicians: z.string().optional(),
  style: z.array(z.string()).min(1, { message: 'Selecione ao menos um estilo.' }),
  acoustics: z.string().min(1, { message: 'Selecione a limitação acústica.' }),
  infra: z.array(z.string()).optional(),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const INFRA_OPTIONS = ['Som Completo (PA)', 'Mesa de Som', 'Banda Base', 'Técnico de Som', 'Van/Transporte', 'Alimentação'];
const STYLE_OPTIONS = ['Samba Raiz & Pagode Clássico', 'Pagode de Mesa Animado', 'Acústico / Voz e Violão', 'Eclético (Mix Completo)'];

function FieldLabel({ label, error, htmlFor }: { label: string; error?: string; htmlFor?: string }) {
  return (
    <div className="flex items-center justify-between mb-2">
      <label htmlFor={htmlFor} className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/50">
        {label}
      </label>
      <AnimatePresence mode="wait">
        {error && (
          <motion.span
            key={error}
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            className="text-[10px] text-red-400 font-medium"
          >
            {error}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}

const inputBase =
  'w-full px-4 py-3.5 rounded-xl bg-white/4 border border-white/10 text-white text-sm placeholder-white/20 outline-none transition-all duration-200 focus:border-red-500/60 focus:bg-white/7 focus:ring-1 focus:ring-red-500/20';
const inputError = 'border-red-500/40 focus:border-red-500/60';

function CheckPill({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border text-sm transition-all duration-200 text-left ${
        checked
          ? 'border-red-500/60 bg-red-600/15 text-white'
          : 'border-white/10 bg-white/3 text-white/50 hover:border-white/25 hover:text-white/80'
      }`}
    >
      <span
        className={`w-4 h-4 rounded-md shrink-0 flex items-center justify-center transition-all ${
          checked ? 'bg-red-600' : 'bg-white/10'
        }`}
      >
        {checked && (
          <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3.5" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </span>
      {label}
    </button>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Contact() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [lastFormData, setLastFormData] = useState<FormValues | null>(null);
  const [locationMode, setLocationMode] = useState<'cep' | 'manual'>('cep');
  const [isFetchingCep, setIsFetchingCep] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting, isValid },
    reset,
    trigger,
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    mode: 'onChange',
    defaultValues: { name: '', phone: '', cep: '', location: '', houseNumber: '', showDate: '', musicians: '', style: [], acoustics: '', infra: [], notes: '' },
  });

  const watchStyle = watch('style') ?? [];
  const watchInfra = watch('infra') ?? [];
  const watchAcoustics = watch('acoustics');

  const toggleArray = (field: 'style' | 'infra', value: string) => {
    const current = (field === 'style' ? watchStyle : watchInfra) as string[];
    const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
    setValue(field, next, { shouldValidate: true });
  };

  const handlePhoneInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue('phone', e.target.value.replace(/\D/g, ''), { shouldValidate: true });
  };

  const handleCepBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
    const cep = e.target.value.replace(/\D/g, '');
    if (cep.length !== 8) return;
    setIsFetchingCep(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await res.json();
      if (!data.erro) {
        // Agora o input location fica preenchido e não mais editável se for CEP
        setValue('location', `${data.logradouro}, ${data.bairro} - ${data.localidade}, ${data.uf}`, { shouldValidate: true });
      } else {
        trigger('location');
      }
    } catch {
      /* silent */
    } finally {
      setIsFetchingCep(false);
    }
  };

  const onSubmit = async (data: FormValues) => {
    setError(null);
    try {
      const response = await submitContactForm(data);
      if (response.success) {
        setSuccess(true);
        setLastFormData(data);
        setShowModal(true);
        reset();
        setTimeout(() => setSuccess(false), 12000);
      } else if (response.error) {
        setError(response.error);
      }
    } catch {
      setError("Ocorreu um erro ao enviar sua solicitação. Tente novamente.");
    }
  };

  const generateWhatsAppLink = () => {
    if (!lastFormData) return "#";
    const d = lastFormData;
    const msg = `Olá Rafa Braga! Acabei de solicitar um orçamento pelo site e gostaria de agilizar o contato:
    
 *Cliente:* ${d.name}
 *Telefone:* ${d.phone}
 *Data:* ${d.showDate || 'A definir'}
 *Local:* ${d.location}${d.houseNumber ? `, ${d.houseNumber}` : ''}
 *Músicos:* ${d.musicians || 'Não informado'}
 *Estilos:* ${d.style.join(', ')}
 *Acústica:* ${d.acoustics}
 *Infra:* ${d.infra?.join(', ') || 'Nenhuma selecionada'}
 *Obs:* ${d.notes || 'Nenhuma'}`;

    return `https://wa.me/${RAFA_BRAGA_DATA.whatsapp.number}?text=${encodeURIComponent(msg)}`;
  };

  const ACOUSTICS_OPTIONS = [
    { value: 'livre',       label: 'Livre',      desc: 'Som aberto e forte' },
    { value: 'controlado',  label: 'Controlado', desc: 'Ambiente familiar' },
    { value: 'baixo',       label: 'Restrito',   desc: 'Sem percussão pesada' },
  ];

  const MUSICIAN_OPTIONS = [
    { value: '1-3', label: '1-3 Músicos' },
    { value: '3-5', label: '3-5 Músicos' },
    { value: '5+', label: '5+ Músicos' },
    { value: 'escolha', label: 'À escolha do músico' },
  ];

  const waLink = RAFA_BRAGA_DATA.socials.find(s => s.label === 'WhatsApp')?.href || "#";
  const igLink = RAFA_BRAGA_DATA.socials.find(s => s.label === 'Instagram')?.href || "#";

  return (
    <section className="relative py-24 bg-brand-dark px-6 md:px-16 overflow-hidden" id="contato">

      {/* Ambient glow */}
      <div className="absolute top-40 right-[-5%] w-[600px] h-[600px] bg-red-600/8 blur-[160px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-[10%] w-[400px] h-[300px] bg-red-600/5 blur-[120px] rounded-full pointer-events-none" />

      <SectionHeader
        titlePart1="VAMOS"
        titlePart2="FAZER HISTÓRIA"
        subtitle="Escolha a forma mais rápida ou preencha nosso formulário exclusivo de orçamento."
        className="mb-16 md:mb-20 relative z-10"
      />

      <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* ── LEFT SIDEBAR ── */}
        <motion.aside
          initial={{ opacity: 0, x: -24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-4 flex flex-col gap-6"
        >
          {/* Card contato direto */}
          <div className="rounded-2xl border border-white/8 bg-white/3 p-8 flex flex-col gap-6 backdrop-blur-sm">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/30 mb-2">Contato direto</p>
              <h3 className="text-xl font-bold text-white font-outfit leading-tight">
                Resposta rápida,<br />decisão na hora.
              </h3>
            </div>
            <p className="text-white/45 text-sm leading-relaxed" style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 300 }}>
              Precisa de uma resposta pra ontem? Mande mensagem diretamente nas redes.
            </p>

            <div className="flex flex-col gap-3 mt-auto">
              {/* WhatsApp */}
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between p-4 rounded-xl border border-white/8 bg-white/3 hover:border-[#25D366]/40 hover:bg-[#25D366]/8 transition-all duration-300"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#25D366]/15 flex items-center justify-center text-[#25D366] group-hover:scale-105 transition-transform shrink-0">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.488-1.761-1.663-2.06-.175-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
                    </svg>
                  </div>
                  <div>
                    <p className="text-white text-sm font-semibold leading-none mb-0.5">WhatsApp</p>
                    <p className="text-white/40 text-xs">Respostas rápidas</p>
                  </div>
                </div>
                <svg className="w-4 h-4 text-white/20 group-hover:text-[#25D366] group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
                </svg>
              </a>

              {/* Instagram */}
              <a
                href={igLink}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between p-4 rounded-xl border border-white/8 bg-white/3 hover:border-[#E1306C]/40 hover:bg-[#E1306C]/8 transition-all duration-300"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#E1306C]/15 flex items-center justify-center text-[#E1306C] group-hover:scale-105 transition-transform shrink-0">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                    </svg>
                  </div>
                  <div>
                    <p className="text-white text-sm font-semibold leading-none mb-0.5">Instagram</p>
                    <p className="text-white/40 text-xs">Siga a rotina</p>
                  </div>
                </div>
                <svg className="w-4 h-4 text-white/20 group-hover:text-[#E1306C] group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Info card */}
          <div className="rounded-2xl border border-white/8 bg-white/3 p-6 backdrop-blur-sm">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/25 mb-4">Como funciona</p>
            <div className="flex flex-col gap-4">
              {[
                { n: '01', label: 'Preencha o formulário', desc: 'Com os detalhes do seu evento.' },
                { n: '02', label: 'Receba o orçamento', desc: 'No seu WhatsApp.' },
                { n: '03', label: 'Confirme e celebre', desc: 'Fechamos tudo e é só curtir.' },
              ].map((step) => (
                <div key={step.n} className="flex items-start gap-3">
                  <span className="text-[10px] font-black text-red-500/60 mt-0.5 shrink-0 w-5">{step.n}</span>
                  <div>
                    <p className="text-white/70 text-xs font-semibold">{step.label}</p>
                    <p className="text-white/30 text-xs mt-0.5" style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 300 }}>{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.aside>

        {/* ── FORM ── */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-8"
        >
          <div className="rounded-2xl border border-white/8 bg-white/3 p-6 md:p-10 backdrop-blur-sm">
            {/* Form header */}
            <div className="mb-8 pb-6 border-b border-white/8">
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-red-500/70 mb-2">Formulário de orçamento</p>
              <h3 className="text-2xl font-bold text-white font-outfit">Monte o ambiente perfeito</h3>
              <p className="text-white/40 text-sm mt-1" style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 300 }}>
                Conta pra gente como vai ser o seu show e a gente cuida do resto.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-7">

              {/* ── Dados do cliente ── */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/25 mb-4">Seus dados</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <FieldLabel label="Nome / Empresa" error={errors.name?.message} htmlFor="name" />
                    <input {...register('name')} id="name" type="text" placeholder="Seu nome ou empresa"
                      className={`${inputBase} ${errors.name ? inputError : ''}`} />
                  </div>
                  <div>
                    <FieldLabel label="Celular / WhatsApp" error={errors.phone?.message} htmlFor="phone" />
                    <input {...register('phone')} id="phone" onChange={handlePhoneInput} type="tel" placeholder="11900000000"
                      className={`${inputBase} ${errors.phone ? inputError : ''}`} />
                  </div>
                  <div className="md:col-span-2">
                    <FieldLabel label="Data Desejada para o Show" error={errors.showDate?.message} htmlFor="showDate" />
                    <input 
                      {...register('showDate')} 
                      id="showDate"
                      type="date" 
                      min={new Date().toISOString().split('T')[0]}
                      max="9999-12-31"
                      className={`${inputBase} ${errors.showDate ? inputError : ''} scheme-dark`} 
                    />
                  </div>
                </div>
              </div>

              {/* ── Localização ── */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/25 mb-4">Local do evento</p>

                {/* Mode toggle */}
                <div className="flex items-center gap-1 p-1 rounded-xl bg-white/4 border border-white/8 w-fit mb-4">
                  {(['cep', 'manual'] as const).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setLocationMode(mode)}
                      className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                        locationMode === mode
                          ? 'bg-red-600 text-white shadow-sm'
                          : 'text-white/40 hover:text-white/70'
                      }`}
                    >
                      {mode === 'cep' ? 'Buscar por CEP' : 'Digitar Endereço'}
                    </button>
                  ))}
                </div>

                <div className="flex flex-col gap-4">
                  {locationMode === 'cep' ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="md:col-span-1">
                        <FieldLabel label="CEP do Evento" htmlFor="cep" />
                        <div className="relative">
                          <input {...register('cep')} id="cep" onBlur={handleCepBlur} type="text" placeholder="01001000" maxLength={9}
                            className={inputBase} />
                          {isFetchingCep && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                              <svg className="animate-spin w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                              </svg>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="md:col-span-2">
                        <FieldLabel
                          label="Endereço (Auto-preenchido via CEP)"
                          error={errors.location?.message}
                          htmlFor="location"
                        />
                        <input 
                          {...register('location')} 
                          id="location"
                          type="text"
                          readOnly
                          placeholder="Preencha o CEP ao lado..."
                          className={`${inputBase} opacity-70 cursor-not-allowed`} 
                        />
                      </div>
                    </div>
                  ) : (
                    <div>
                      <FieldLabel label="Local do Evento" error={errors.location?.message} htmlFor="location_manual" />
                      <input {...register('location')} id="location_manual" type="text" placeholder="Bairro, Casa de Show ou Cidade"
                        className={`${inputBase} ${errors.location ? inputError : ''}`} />
                    </div>
                  )}
                  
                  <div>
                    <FieldLabel label="Número / Complemento (Opcional)" error={errors.houseNumber?.message} htmlFor="houseNumber" />
                    <input {...register('houseNumber')} id="houseNumber" type="text" placeholder="Ex: 123, Ap 42"
                      className={inputBase} />
                  </div>
                </div>
              </div>

              {/* ── Estilo Musical ── */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/25">Estilo Musical</p>
                  {errors.style && (
                    <span className="text-[10px] text-red-400 font-medium">{errors.style.message}</span>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {STYLE_OPTIONS.map((item) => (
                    <CheckPill
                      key={item}
                      label={item}
                      checked={watchStyle.includes(item)}
                      onChange={() => toggleArray('style', item)}
                    />
                  ))}
                </div>
              </div>

              {/* ── Acústica ── */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/25">Limitação Acústica</p>
                  {errors.acoustics && (
                    <span className="text-[10px] text-red-400 font-medium">{errors.acoustics.message}</span>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {ACOUSTICS_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setValue('acoustics', opt.value, { shouldValidate: true })}
                      className={`flex flex-col gap-0.5 px-4 py-3 rounded-xl border text-left transition-all duration-200 ${
                        watchAcoustics === opt.value
                          ? 'border-red-500/60 bg-red-600/15 text-white'
                          : 'border-white/10 bg-white/3 text-white/50 hover:border-white/25 hover:text-white/80'
                      }`}
                    >
                      <span className="text-sm font-semibold">{opt.label}</span>
                      <span className="text-[11px] opacity-60" style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 300 }}>{opt.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* ── Músicos ── */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/25 mb-4">
                  Quantidade de Músicos (Opcional)
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                  {MUSICIAN_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setValue('musicians', opt.value, { shouldValidate: true })}
                      className={`px-4 py-2.5 rounded-xl border text-sm transition-all duration-200 text-left ${
                        watch('musicians') === opt.value
                          ? 'border-red-500/60 bg-red-600/15 text-white'
                          : 'border-white/10 bg-white/3 text-white/50 hover:border-white/25 hover:text-white/80'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* ── Infraestrutura ── */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/25 mb-4">
                  O que tem disponível no local?
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {INFRA_OPTIONS.map((item) => (
                    <CheckPill
                      key={item}
                      label={item}
                      checked={watchInfra.includes(item)}
                      onChange={() => toggleArray('infra', item)}
                    />
                  ))}
                </div>
              </div>

              {/* ── Observações ── */}
              <div>
                <FieldLabel label="Observações / Detalhes Adicionais" htmlFor="notes" />
                <textarea
                  {...register('notes')}
                  id="notes"
                  rows={3}
                  placeholder="Exigências especiais, cronograma, repertório específico..."
                  className={`${inputBase} resize-none`}
                />
              </div>

              {/* ── Success banner ── */}
              <AnimatePresence mode="wait">
                {success && (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, y: -8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-3 p-4 rounded-xl bg-green-500/10 border border-green-500/25 text-green-400 text-sm"
                  >
                    <div className="w-7 h-7 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"/>
                      </svg>
                    </div>
                    Orçamento solicitado com sucesso! Nossa equipe entrará em contato pelo whatsapp em breve.
                  </motion.div>
                )}
                {error && (
                  <motion.div
                    key="error"
                    initial={{ opacity: 0, y: -8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-sm"
                  >
                    <div className="w-7 h-7 rounded-full bg-red-500/20 flex items-center justify-center shrink-0 mt-0.5">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                      </svg>
                    </div>
                    <div className="flex flex-col gap-1 w-full">
                      <span className="font-bold">Atenção</span>
                      <p className="leading-relaxed">{error}</p>
                      
                      {error.includes('WhatsApp') && (
                        <motion.a
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          href={waLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-3 flex items-center justify-center gap-2 w-full py-2.5 bg-[#25D366] hover:bg-[#20ba59] text-white rounded-xl font-bold text-[10px] uppercase tracking-wider transition-all shadow-md group"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="group-hover:scale-110 transition-transform">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.488-1.761-1.663-2.06-.175-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
                          </svg>
                          Falar direto no WhatsApp
                        </motion.a>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ── Submit ── */}
              <button
                type="submit"
                disabled={isSubmitting || success || !isValid || isFetchingCep}
                className={`relative mt-1 w-full py-4 rounded-xl font-bold text-sm uppercase tracking-[0.15em] flex items-center justify-center gap-3 transition-all duration-200 overflow-hidden ${
                  !isValid
                    ? 'bg-white/5 text-white/25 cursor-not-allowed border border-white/8'
                    : isSubmitting || success || isFetchingCep
                    ? 'bg-red-600/60 text-white/60 cursor-not-allowed'
                    : 'bg-red-600 text-white hover:bg-red-500 hover:scale-[1.01] active:scale-[0.99] shadow-[0_8px_30px_rgba(220,38,38,0.3)]'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    Enviando...
                  </>
                ) : success ? (
                  'Solicitação Enviada!'
                ) : (
                  <>
                    Solicitar Orçamento
                  </>
                )}
              </button>
            </form>
          </div>
        </motion.div>
      </div>

      {/* ── SUCCESS MODAL ── */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-100 flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-zinc-900 border border-white/10 rounded-[32px] p-8 md:p-12 shadow-2xl overflow-hidden text-center"
            >
              {/* Glow decoration */}
              <div className="absolute -top-24 -left-24 w-48 h-48 bg-red-600/20 blur-[60px] rounded-full pointer-events-none" />
              <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-red-600/10 blur-[60px] rounded-full pointer-events-none" />

              <div className="relative z-10">
                <div className="w-16 h-16 bg-green-500/15 rounded-full flex items-center justify-center mx-auto mb-6 text-green-500 border border-green-500/20 shadow-[0_0_20px_rgba(34,197,94,0.15)]">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                  </svg>
                </div>

                <h3 className="text-2xl md:text-3xl font-bold text-white font-outfit mb-4">
                  Sucesso! Orçamento Recebido.
                </h3>
                
                <p className="text-white/50 text-base leading-relaxed mb-10" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                  Sua solicitação já está em nosso banco de dados. Entraremos em contato via WhatsApp o mais breve possível.
                </p>

                <div className="space-y-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-red-500/60 mb-2">
                    Quer acelerar o atendimento?
                  </p>
                  
                  <a
                    href={generateWhatsAppLink()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-3 w-full py-4 bg-[#25D366] hover:bg-[#20ba59] text-white rounded-2xl font-bold text-sm uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-[0.98] shadow-[0_10px_25px_rgba(37,211,102,0.25)]"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.488-1.761-1.663-2.06-.175-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
                    </svg>
                    Enviar via WhatsApp
                  </a>

                  <button
                    onClick={() => setShowModal(false)}
                    className="w-full py-3.5 bg-white/5 hover:bg-white/10 text-white/50 hover:text-white rounded-2xl font-bold text-[10px] uppercase tracking-[0.2em] transition-all"
                  >
                    Fechar e continuar navegando
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}