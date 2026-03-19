'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import SectionHeader from '@/components/section-header';
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { submitContactForm } from "@/app/actions/contact";
import { toast } from "sonner";

const formSchema = z.object({
  name: z.string().min(3, { message: "O nome/empresa deve ter no mínimo 3 letras." }),
  phone: z.string()
    .min(10, { message: "O celular precisa ter pelo menos 10 números." })
    .max(15, { message: "Celular inválido." })
    .regex(/^\d+$/, { message: "Apenas números são permitidos." }),
  cep: z.string().optional(),
  location: z.string().min(3, { message: "A localização do evento é obrigatória." }),
  style: z.array(z.string()).min(1, { message: "Selecione pelo menos um estilo musical." }),
  acoustics: z.string().min(1, { message: "Selecione a limitação acústica." }),
  infra: z.array(z.string()).optional(),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const INFRA_OPTIONS = ['Som Completo (PA)', 'Mesa de Som', 'Banda Base', 'Técnico de Som', 'Van/Transporte', 'Alimentação'];
const STYLE_OPTIONS = ['Samba Raiz & Pagode Clássico', 'Pagode de Mesa Animado', 'Acústico / Voz e Violão', 'Eclético (Mix Completo)'];

export default function Contact() {
  const [success, setSuccess] = useState(false);
  const [locationMode, setLocationMode] = useState<'cep' | 'manual'>('cep');
  const [isFetchingCep, setIsFetchingCep] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting, isValid },
    reset,
    trigger
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      phone: "",
      cep: "",
      location: "",
      style: [],
      acoustics: "",
      infra: [],
      notes: "",
    },
  });

  const handlePhoneInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Remove qualquer caractere que não seja número
    const numericValue = e.target.value.replace(/\D/g, "");
    setValue("phone", numericValue, { shouldValidate: true });
  };

  const handleCepBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
    const cepValue = e.target.value.replace(/\D/g, "");
    if (cepValue.length === 8) {
      setIsFetchingCep(true);
      try {
        const res = await fetch(`https://viacep.com.br/ws/${cepValue}/json/`);
        const data = await res.json();
        
        if (!data.erro) {
          const fetchedLocation = `${data.logradouro}, ${data.bairro} - ${data.localidade}, ${data.uf}`;
          setValue("location", fetchedLocation, { shouldValidate: true });
        } else {
          // Keep whatever was typed or clear if desired. We'll just trigger validation as errored.
          trigger("location");
        }
      } catch (err) {
        console.error("Erro ao buscar CEP", err);
      } finally {
        setIsFetchingCep(false);
      }
    }
  };

  const onSubmit = async (data: FormValues) => {
    try {
      const response = await submitContactForm(data);

      if (response.success) {
        setSuccess(true);
        toast.success("Sucesso!", { description: "Orçamento solicitado com sucesso. Retornaremos em breve." });
        reset(); 
        
        setTimeout(() => {
          setSuccess(false);
        }, 5000);
      } else {
        toast.error("Falha ao Enviar", { description: response.error }); 
      }
    } catch (error) {
      console.error(error);
      toast.error("Erro Fatal", { description: "Erro fatal ao estabelecer conexão." });
    }
  };

  return (
    <section className="relative py-24 bg-brand-dark px-6 md:px-20 overflow-hidden" id="contato">

     
      <div className="absolute top-60 right-0 w-[500px] h-[500px] bg-red-600/10 blur-[150px] rounded-full pointer-events-none" />

      <SectionHeader
        titlePart1="VAMOS"
        titlePart2="FAZER HISTÓRIA"
        subtitle="Escolha a forma mais rápida ou preencha nosso formulário exclusivo de orçamento."
        className="mb-16 md:mb-20 relative z-10"
      />

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 relative z-10">
        
        <div className="lg:col-span-4 flex flex-col gap-8 h-fit">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex flex-col h-full bg-white/5 ring-1 ring-white/10 rounded-3xl p-8 md:p-10 backdrop-blur-md"
          >
            <h3 className="text-2xl md:text-3xl font-outfit font-bold text-white mb-4">
              CONTATO DIRETO
            </h3>
            <p className="text-white/60 mb-10 text-sm leading-relaxed">
              Precisa de uma resposta pra ontem ou quer bater um papo rápido para alinhar uma ideia exclusiva? Mande mensagem nas redes.
            </p>

            <div className="flex flex-col gap-4 mt-auto">
              <a href="https://wa.me/5511996142927" target="_blank" rel="noopener noreferrer" className="group flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-[#25D366]/20 ring-1 ring-white/10 hover:ring-[#25D366]/50 transition-all duration-300">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#25D366]/20 flex items-center justify-center text-[#25D366] group-hover:scale-110 transition-transform">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.488-1.761-1.663-2.06-.175-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
                  </div>
                  <div>
                    <h4 className="font-bold text-white uppercase tracking-wider text-xs">WhatsApp</h4>
                    <p className="text-white/60 text-sm">Respostas rápidas</p>
                  </div>
                </div>
                <svg className="w-5 h-5 text-white/30 group-hover:text-[#25D366] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
              </a>

              <a href="https://www.instagram.com/rafabragacantor" target="_blank" rel="noopener noreferrer" className="group flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-[#E1306C]/20 ring-1 ring-white/10 hover:ring-[#E1306C]/50 transition-all duration-300">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#E1306C]/20 flex items-center justify-center text-[#E1306C] group-hover:scale-110 transition-transform">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg>
                  </div>
                  <div>
                    <h4 className="font-bold text-white uppercase tracking-wider text-xs">Instagram</h4>
                    <p className="text-white/60 text-sm">Siga a rotina</p>
                  </div>
                </div>
                <svg className="w-5 h-5 text-white/30 group-hover:text-[#E1306C] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
              </a>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="lg:col-span-8 bg-white/[0.03] ring-1 ring-white/10 rounded-3xl p-8 md:p-12 backdrop-blur-md"
        >
          <div className="mb-8">
            <h3 className="text-2xl md:text-3xl font-outfit font-bold text-white mb-2">
              SOLICITAR ORÇAMENTO
            </h3>
            <p className="text-white/60 text-sm">
              Monte o ambiente perfeito. Conta pra gente como vai ser o seu show.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
            
            {/* Linha 1: Dados do Cliente */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <label className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold uppercase tracking-widest text-white/50 pl-1">Seu Nome / Empresa</span>
                  {errors.name && <span className="text-xs text-red-500 font-medium">{errors.name.message}</span>}
                </div>
                <input 
                  {...register("name")} 
                  type="text" 
                  placeholder="Seu nome" 
                  className={`px-5 py-4 rounded-xl bg-white/5 border ${errors.name ? 'border-red-500/50 focus:ring-red-500/50' : 'border-white/10 focus:border-red-500/50 focus:ring-red-500/50'} text-white placeholder-white/20 focus:ring-1 transition-all outline-none`} 
                />
              </label>

              <label className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold uppercase tracking-widest text-white/50 pl-1">Celular / WhatsApp (Apenas Números)</span>
                  {errors.phone && <span className="text-xs text-red-500 font-medium">{errors.phone.message}</span>}
                </div>
                <input 
                  {...register("phone")} 
                  onChange={(e) => {
                    handlePhoneInput(e);
                  }}
                  type="tel" 
                  placeholder="11900000000" 
                  className={`px-5 py-4 rounded-xl bg-white/5 border ${errors.phone ? 'border-red-500/50 focus:ring-red-500/50' : 'border-white/10 focus:border-red-500/50 focus:ring-red-500/50'} text-white placeholder-white/20 focus:ring-1 transition-all outline-none`} 
                />
              </label>
            </div>

            {/* Linha 2: CEP / Location Mode */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-4 border-b border-white/10 pb-4">
                <button 
                  type="button" 
                  onClick={() => setLocationMode('cep')}
                  className={`text-sm font-bold uppercase tracking-widest transition-colors ${locationMode === 'cep' ? 'text-red-500' : 'text-white/40 hover:text-white'}`}
                >
                  Buscar por CEP
                </button>
                <div className="w-[1px] h-4 bg-white/20" />
                <button 
                  type="button" 
                  onClick={() => setLocationMode('manual')}
                  className={`text-sm font-bold uppercase tracking-widest transition-colors ${locationMode === 'manual' ? 'text-red-500' : 'text-white/40 hover:text-white'}`}
                >
                  Digitar Endereço
                </button>
              </div>

              {locationMode === 'cep' && (
                <label className="flex flex-col gap-2 mb-2 w-full md:w-1/2">
                   <div className="flex space-between">
                     <span className="text-xs font-bold uppercase tracking-widest text-white/50 pl-1 flex-1">CEP do Evento</span>
                     {isFetchingCep && <span className="text-xs text-blue-400 font-medium animate-pulse">Buscando CEP...</span>}
                   </div>
                   <input 
                     {...register("cep")} 
                     onBlur={(e) => handleCepBlur(e)}
                     type="text" 
                     placeholder="Ex: 01001000" 
                     maxLength={9}
                     className="px-5 py-4 rounded-xl bg-white/5 border border-white/10 focus:border-red-500/50 focus:ring-red-500/50 focus:ring-1 text-white placeholder-white/20 transition-all outline-none"
                   />
                </label>
              )}

              <label className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold uppercase tracking-widest text-white/50 pl-1">{locationMode === 'cep' ? 'Endereço Completo & Complemento' : 'Local do Evento'}</span>
                  {errors.location && <span className="text-xs text-red-500 font-medium">{errors.location.message}</span>}
                </div>
                <input 
                  {...register("location")} 
                  type="text" 
                  placeholder={locationMode === 'cep' ? 'Adicione o número e complemento...' : 'Bairro, Casa de Show ou Cidade'}
                  className={`px-5 py-4 rounded-xl bg-white/5 border ${errors.location ? 'border-red-500/50 focus:ring-red-500/50' : 'border-white/10 focus:border-red-500/50 focus:ring-red-500/50'} text-white placeholder-white/20 focus:ring-1 transition-all outline-none`} 
                />
              </label>
            </div>

            {/* Linha 3: Estilos Musicais (Checkboxes) */}
            <div className="flex flex-col gap-3 mt-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold uppercase tracking-widest text-white/50 pl-1">Estilo Musical</span>
                {errors.style && <span className="text-xs text-red-500 font-medium">{errors.style.message}</span>}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-1">
                {STYLE_OPTIONS.map(item => (
                  <label key={item} className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative flex items-center justify-center w-5 h-5 rounded-md bg-white/5 border border-white/20 group-hover:border-red-500/50 transition-colors shrink-0">
                      <input type="checkbox" value={item} {...register("style")} className="peer absolute opacity-0 w-full h-full cursor-pointer" />
                      <div className="absolute inset-0 bg-red-600 rounded-md scale-0 peer-checked:scale-100 transition-transform flex items-center justify-center">
                        <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </div>
                    <span className="text-sm text-white/80 select-none group-hover:text-white transition-colors leading-tight">{item}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Linha 4: Limitações Acústicas */}
            <label className="flex flex-col gap-2 mt-2 border-t border-white/10 pt-6">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold uppercase tracking-widest text-white/50 pl-1">Limitações Acústicas</span>
                {errors.acoustics && <span className="text-xs text-red-500 font-medium">{errors.acoustics.message}</span>}
              </div>
              <div className="relative">
                <select 
                  {...register("acoustics")}
                  className={`w-full px-5 h-[58px] rounded-xl bg-brand-dark/50 border ${errors.acoustics ? 'border-red-500/50 focus:ring-red-500/50' : 'border-white/10 focus:border-red-500/50 focus:ring-red-500/50'} text-white hover:bg-white/5 transition-all outline-none appearance-none cursor-pointer`}
                >
                  <option value="" disabled className="bg-brand-dark text-white/50">Nível de barulho permitido no local...</option>
                  <option value="livre" className="bg-brand-dark text-white">Livre - Som aberto e forte</option>
                  <option value="controlado" className="bg-brand-dark text-white">Controlado - Ambiente familiar</option>
                  <option value="baixo" className="bg-brand-dark text-white">Restrito (Sem percussão pesada)</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-white/50">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/></svg>
                </div>
              </div>
            </label>

            {/* Checkboxes Premium */}
            <div className="flex flex-col gap-3">
              <span className="text-xs font-bold uppercase tracking-widest text-white/50 pl-1">O que tem disponível no local?</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-1">
                {INFRA_OPTIONS.map(item => (
                  <label key={item} className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative flex items-center justify-center w-5 h-5 rounded-md bg-white/5 border border-white/20 group-hover:border-red-500/50 transition-colors">
                      <input type="checkbox" value={item} {...register("infra")} className="peer absolute opacity-0 w-full h-full cursor-pointer" />
                      <div className="absolute inset-0 bg-red-600 rounded-md scale-0 peer-checked:scale-100 transition-transform flex items-center justify-center">
                        <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </div>
                    <span className="text-sm text-white/80 select-none group-hover:text-white transition-colors">{item}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Linha 6: Observações */}
            <label className="flex flex-col gap-2 mt-2">
              <span className="text-xs font-bold uppercase tracking-widest text-white/50 pl-1">Observações / Detalhes Adicionais</span>
              <textarea 
                {...register("notes")} 
                rows={3} 
                placeholder="Tem alguma exigência especial, cronograma ou repertório específico? Conta tudo aqui..." 
                className="px-5 py-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/20 focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 transition-all outline-none resize-none"
              ></textarea>
            </label>

            {/* Caixa de Sucesso Verde */}
            {success && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400 text-sm font-medium flex items-center justify-center gap-3">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
                Orçamento solicitado com sucesso! Nossa equipe entrará em contato.
              </motion.div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || success || !isValid || isFetchingCep}
              className={`mt-4 px-8 py-5 text-white rounded-xl font-bold uppercase tracking-widest transition-all outline-none flex items-center justify-center ${
                !isValid 
                ? 'bg-red-600/30 text-white/30 cursor-not-allowed border border-red-500/10' 
                : isSubmitting || success || isFetchingCep
                  ? 'opacity-70 cursor-not-allowed bg-red-600' 
                  : 'bg-red-600 hover:bg-red-500 hover:scale-[1.02] active:scale-[0.98]'
              }`}
            >
              {isSubmitting ? (
                <div className="flex items-center gap-3">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  ENVIANDO...
                </div>
              ) : (
                success ? 'SUCESSO!' : 'SOLICITAR ORÇAMENTO'
              )}
            </button>

          </form>
        </motion.div>
      </div>
    </section>
  );
}
