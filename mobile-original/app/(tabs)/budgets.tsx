import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Modal, ActivityIndicator, Alert, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Phone, MessageCircle, Eye, X, Music, Layout, Calendar, AlertCircle, RotateCw, Trash2, Plus, Search, ChevronDown } from 'lucide-react-native';
import { budgetsService, Lead } from '../../services/budgetsService';

type StatusFilter = 'Todos' | 'Novo' | 'Visto' | 'Fechado' | 'Cancelado';
const STATUS_FILTERS: StatusFilter[] = ['Todos', 'Novo', 'Visto', 'Fechado', 'Cancelado'];
const STATUS_OPTIONS = ['Novo', 'Visto', 'Fechado', 'Cancelado'];

const statusColors: Record<string, string> = {
  Novo: '#EF4444',
  pending: '#EF4444',
  Visto: 'rgba(255,255,255,0.15)',
  Fechado: '#22C55E',
  Cancelado: '#6B7280',
};

export default function BudgetsScreen() {
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [processingId, setProcessingId] = useState<string | number | null>(null);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [newLead, setNewLead] = useState<Partial<Lead>>({
    name: '', phone: '', location: '', showDate: '', notes: '', status: 'Novo', style: [], infra: []
  });

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<StatusFilter>('Todos');

  // Status selector in detail modal
  const [statusMenuVisible, setStatusMenuVisible] = useState(false);

  const fetchLeads = async () => {
    setIsLoading(true);
    try {
      const data = await budgetsService.getLeads();
      setLeads(data);
    } catch (error) {
      console.error(error);
      Alert.alert("Erro", "Não foi possível carregar os orçamentos.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  // Filtered & searched leads
  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      const matchesFilter = activeFilter === 'Todos' || lead.status === activeFilter || (activeFilter === 'Novo' && lead.status === 'pending');
      const query = searchQuery.toLowerCase();
      const matchesSearch = !query ||
        lead.name.toLowerCase().includes(query) ||
        lead.location.toLowerCase().includes(query) ||
        (lead.phone && lead.phone.includes(query));
      return matchesFilter && matchesSearch;
    });
  }, [leads, activeFilter, searchQuery]);

  const updateLeadStatus = async (id: string | number, status = 'Visto') => {
    setProcessingId(id);
    try {
      await budgetsService.updateStatus(id.toString(), status);
      setLeads(prev => prev.map(lead => lead.id === id ? { ...lead, status } : lead));
      if (selectedLead && selectedLead.id === id) {
        setSelectedLead(prev => prev ? { ...prev, status } : prev);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setProcessingId(null);
    }
  };

  const handleStatusChange = async (status: string) => {
    if (!selectedLead) return;
    setStatusMenuVisible(false);
    await updateLeadStatus(selectedLead.id, status);
  };

  const handleWhatsApp = async (lead: Lead) => {
    if (lead.status === 'Novo' || lead.status === 'pending') {
      await updateLeadStatus(lead.id, 'Visto');
    }

    const details = `
📊 *Detalhes do Pedido:*
📅 Data: ${lead.showDate || 'A definir'}
📍 Local: ${lead.location}${lead.houseNumber ? `, ${lead.houseNumber}` : ''}
🎵 Estilo: ${Array.isArray(lead.style) ? lead.style.join(', ') : (lead.style || 'Não informado')}
🎸 Músicos: ${lead.musicians || 'Não informado'}
🔊 Acústica: ${lead.acoustics || 'Não informado'}
📦 Infra: ${Array.isArray(lead.infra) ? lead.infra.join(', ') : 'Padrão'}
📝 Obs: ${lead.notes || 'Nenhuma'}`;

    const message = encodeURIComponent(`Olá ${lead.name}! Aqui é o Rafa Braga! Vi que você fez um orçamento pelo site e estou entrando em contato para acertarmos os detalhes do seu show.\n\n${details}`);
    Linking.openURL(`whatsapp://send?phone=55${lead.phone.replace(/\D/g, '')}&text=${message}`);
  };

  const handleAddLead = async () => {
    if (!newLead.name || !newLead.phone) {
      Alert.alert("Erro", "Nome e telefone são obrigatórios.");
      return;
    }
    setIsLoading(true);
    try {
      const res = await budgetsService.createLead(newLead);
      if (res.success) {
        Alert.alert("Sucesso", "Orçamento incluído manualmente.");
        setAddModalVisible(false);
        setNewLead({ name: '', phone: '', location: '', showDate: '', notes: '', status: 'Novo', style: [], infra: [] });
        fetchLeads();
      }
    } catch (error) {
      Alert.alert("Erro", "Falha ao criar orçamento.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = (lead: Lead) => {
    Alert.alert(
      "Excluir Orçamento",
      `Deseja realmente excluir o orçamento de ${lead.name}?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            setProcessingId(lead.id);
            try {
              await budgetsService.deleteLead(lead.id.toString());
              setLeads(prev => prev.filter(l => l.id !== lead.id));
              setModalVisible(false);
            } catch (err) {
              console.error(err);
              Alert.alert('Erro', 'Não foi possível excluir o orçamento.');
            } finally {
              setProcessingId(null);
            }
          }
        }
      ]
    );
  };

  const openVisualizer = async (lead: Lead) => {
    if (lead.status === 'Novo' || lead.status === 'pending') {
      await updateLeadStatus(lead.id, 'Visto');
    }
    setSelectedLead({ ...lead, status: lead.status === 'Novo' || lead.status === 'pending' ? 'Visto' : lead.status });
    setModalVisible(true);
  };

  const getStatusLabel = (status: string) => {
    if (status === 'pending') return 'NOVO';
    return status.toUpperCase();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerSubtitle}>Gerenciar</Text>
          <Text style={styles.title}>Orçamentos</Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <TouchableOpacity
            style={[styles.headerBtn, { backgroundColor: 'rgba(255,255,255,0.08)' }]}
            onPress={fetchLeads}
            disabled={isLoading}
          >
            <RotateCw color="#FFF" size={20} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.headerBtn, { backgroundColor: '#EF4444' }]}
            onPress={() => setAddModalVisible(true)}
          >
            <Plus color="#FFF" size={24} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchBar}>
        <Search size={16} color="rgba(255,255,255,0.3)" />
        <TextInput
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Buscar por nome, local ou telefone..."
          placeholderTextColor="rgba(255,255,255,0.2)"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <X size={16} color="rgba(255,255,255,0.3)" />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Chips */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        style={styles.filterRow} 
        contentContainerStyle={{ paddingHorizontal: 24, gap: 8, alignItems: 'center' }}
      >
        {STATUS_FILTERS.map(filter => (
          <TouchableOpacity
            key={filter}
            style={[styles.filterChip, activeFilter === filter && styles.filterChipActive]}
            onPress={() => setActiveFilter(filter)}
          >
            <Text style={[styles.filterChipText, activeFilter === filter && styles.filterChipTextActive]}>
              {filter}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* List */}
      {isLoading && leads.length === 0 ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#EF4444" />
        </View>
      ) : (
        <ScrollView
          style={styles.list}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={filteredLeads.length === 0 ? styles.emptyContainer : undefined}
        >
          {filteredLeads.length === 0 ? (
            <Text style={styles.emptyText}>
              {leads.length === 0 ? 'Nenhum orçamento encontrado.' : 'Nenhum resultado para os filtros selecionados.'}
            </Text>
          ) : (
            filteredLeads.map((item) => (
              <View key={item.id} style={styles.item}>
                <View style={styles.itemHeader}>
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <Text style={styles.customerName} numberOfLines={1}>{item.name}</Text>
                    <Text style={styles.cityTextSmall} numberOfLines={1}>{item.location}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: statusColors[item.status] || statusColors.Visto }]}>
                    <Text style={styles.statusText}>{getStatusLabel(item.status)}</Text>
                  </View>
                </View>
                <Text style={styles.dateTextSmall}>{item.date || 'Recente'}</Text>
                <View style={styles.actions}>
                  <TouchableOpacity style={styles.actionButton} onPress={() => openVisualizer(item)} disabled={processingId === item.id}>
                    {processingId === item.id ? <ActivityIndicator size="small" color="#FFF" /> : <Eye size={18} color="#FFF" />}
                    <Text style={styles.actionLabel}>Visualizar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#25D366' }]} onPress={() => handleWhatsApp(item)} disabled={processingId === item.id}>
                    {processingId === item.id ? <ActivityIndicator size="small" color="#FFF" /> : <MessageCircle size={18} color="#FFF" />}
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
          <View style={{ height: 100 }} />
        </ScrollView>
      )}

      {/* ── DETAIL MODAL ── */}
      <Modal animationType="slide" transparent visible={modalVisible}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Detalhes do Lead</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}><X color="#FFF" size={24} /></TouchableOpacity>
            </View>

            {selectedLead && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.mainInfo}>
                  <Text style={styles.detailName}>{selectedLead.name}</Text>
                  <Text style={styles.cityLabel}>{selectedLead.location}</Text>
                </View>

                {/* Status Selector */}
                <View style={styles.statusSelector}>
                  <Text style={styles.statusSelectorLabel}>STATUS</Text>
                  <TouchableOpacity style={styles.statusDropdown} onPress={() => setStatusMenuVisible(!statusMenuVisible)}>
                    <View style={[styles.statusDot, { backgroundColor: statusColors[selectedLead.status] || '#888' }]} />
                    <Text style={styles.statusDropdownText}>{getStatusLabel(selectedLead.status)}</Text>
                    <ChevronDown size={14} color="rgba(255,255,255,0.4)" />
                  </TouchableOpacity>
                  {statusMenuVisible && (
                    <View style={styles.statusMenu}>
                      {STATUS_OPTIONS.map(s => (
                        <TouchableOpacity key={s} style={styles.statusMenuItem} onPress={() => handleStatusChange(s)}>
                          <View style={[styles.statusDot, { backgroundColor: statusColors[s] }]} />
                          <Text style={[styles.statusMenuText, selectedLead.status === s && { color: '#FFF', fontWeight: '700' }]}>{s}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>

                {/* Contact */}
                <View style={styles.contactGrid}>
                  <View style={styles.contactItem}>
                    <Phone size={14} color="#EF4444" />
                    <Text style={styles.contactText}>{selectedLead.phone}</Text>
                  </View>
                  {selectedLead.showDate && (
                    <View style={styles.contactItem}>
                      <Calendar size={14} color="#EF4444" />
                      <Text style={styles.contactText}>{selectedLead.showDate}</Text>
                    </View>
                  )}
                  {selectedLead.musicians && (
                    <View style={styles.contactItem}>
                      <Music size={14} color="#EF4444" />
                      <Text style={styles.contactText}>{selectedLead.musicians} músicos</Text>
                    </View>
                  )}
                </View>

                {/* Musical Styles */}
                <View style={styles.infoSection}>
                  <View style={styles.sectionHeader}>
                    <Music size={16} color="#EF4444" />
                    <Text style={styles.sectionTitle}>Estilos Musicais</Text>
                  </View>
                  <View style={styles.tagWrap}>
                    {Array.isArray(selectedLead.style) ? selectedLead.style.map((s, i) => <View key={i} style={styles.tag}><Text style={styles.tagText}>{s}</Text></View>) : null}
                  </View>
                </View>

                {/* Acoustics */}
                <View style={styles.infoSection}>
                  <View style={styles.sectionHeader}>
                    <AlertCircle size={16} color="#EF4444" />
                    <Text style={styles.sectionTitle}>Limitações Acústicas</Text>
                  </View>
                  <Text style={styles.bodyText}>
                    {selectedLead.acoustics === 'livre' ? 'Livre - Sem restrições' :
                      selectedLead.acoustics === 'controlado' ? 'Controlado - Ambiente Familiar' :
                        selectedLead.acoustics === 'restrito' ? 'Restrito - Som Baixo / Coquetel' :
                          (selectedLead.acoustics || 'Não informado')}
                  </Text>
                </View>

                {/* Infra */}
                {Array.isArray(selectedLead.infra) && selectedLead.infra.length > 0 && (
                  <View style={styles.infoSection}>
                    <View style={styles.sectionHeader}>
                      <Layout size={16} color="#EF4444" />
                      <Text style={styles.sectionTitle}>O que disponibiliza</Text>
                    </View>
                    <View style={styles.tagWrap}>
                      {selectedLead.infra.map((s, i) => <View key={i} style={[styles.tag, { backgroundColor: 'rgba(255,255,255,0.05)' }]}><Text style={styles.tagText}>{s}</Text></View>)}
                    </View>
                  </View>
                )}

                {/* Notes */}
                <View style={styles.infoSection}>
                  <View style={styles.sectionHeader}>
                    <Calendar size={16} color="#EF4444" />
                    <Text style={styles.sectionTitle}>Observações</Text>
                  </View>
                  <View style={styles.notesBox}>
                    <Text style={styles.notesText}>{selectedLead.notes || 'Sem observações adicionais.'}</Text>
                  </View>
                </View>

                {/* Action Buttons */}
                <View style={{ gap: 12, marginTop: 10 }}>
                  <View style={{ flexDirection: 'row', gap: 12 }}>
                    {/* WhatsApp */}
                    <TouchableOpacity
                      style={[styles.wppButton, { flex: 1 }]}
                      onPress={() => handleWhatsApp(selectedLead)}
                      disabled={processingId === selectedLead.id}
                    >
                      {processingId === selectedLead.id ? <ActivityIndicator size="small" color="#FFF" /> : <MessageCircle size={20} color="#FFF" />}
                      <Text style={styles.wppButtonText}>Entrar em contato</Text>
                    </TouchableOpacity>

                    {/* Delete */}
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => handleDelete(selectedLead)}
                      disabled={processingId === selectedLead.id}
                    >
                      {processingId === selectedLead.id ? <ActivityIndicator size="small" color="#EF4444" /> : <Trash2 size={24} color="#EF4444" />}
                    </TouchableOpacity>
                  </View>
                </View>
                <View style={{ height: 40 }} />
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* ── ADD MODAL ── */}
      <Modal animationType="fade" transparent visible={addModalVisible}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { height: '85%' }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Novo Orçamento Manual</Text>
              <TouchableOpacity onPress={() => setAddModalVisible(false)}><X color="#FFF" size={24} /></TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Nome do Cliente</Text>
                <TextInput
                  style={styles.input}
                  value={newLead.name}
                  onChangeText={t => setNewLead({ ...newLead, name: t })}
                  placeholder="Ex: João Silva"
                  placeholderTextColor="rgba(255,255,255,0.2)"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>WhatsApp (com DDD)</Text>
                <TextInput
                  style={styles.input}
                  value={newLead.phone}
                  onChangeText={t => setNewLead({ ...newLead, phone: t.replace(/\D/g, '') })}
                  placeholder="11912345678"
                  keyboardType="numeric"
                  placeholderTextColor="rgba(255,255,255,0.2)"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Data do Show</Text>
                <TextInput
                  style={styles.input}
                  value={newLead.showDate}
                  onChangeText={t => setNewLead({ ...newLead, showDate: t })}
                  placeholder="Ex: 25/12/2024"
                  placeholderTextColor="rgba(255,255,255,0.2)"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Local / Cidade</Text>
                <TextInput
                  style={styles.input}
                  value={newLead.location}
                  onChangeText={t => setNewLead({ ...newLead, location: t })}
                  placeholder="Ex: São Paulo, SP"
                  placeholderTextColor="rgba(255,255,255,0.2)"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Observações</Text>
                <TextInput
                  style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
                  value={newLead.notes}
                  onChangeText={t => setNewLead({ ...newLead, notes: t })}
                  multiline
                  placeholder="Detalhes extras..."
                  placeholderTextColor="rgba(255,255,255,0.2)"
                />
              </View>

              <TouchableOpacity
                style={[styles.wppButton, { marginTop: 20 }]}
                onPress={handleAddLead}
                disabled={isLoading}
              >
                {isLoading ? <ActivityIndicator size="small" color="#FFF" /> : <Text style={styles.wppButtonText}>Salvar Orçamento</Text>}
              </TouchableOpacity>
              <View style={{ height: 40 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#010101' },
  header: { padding: 24, paddingTop: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerSubtitle: { color: 'rgba(255,255,255,0.4)', fontSize: 10, fontFamily: 'Montserrat_500Medium', textTransform: 'uppercase', letterSpacing: 2 },
  title: { color: '#FFF', fontSize: 28, fontFamily: 'Outfit_700Bold', textTransform: 'uppercase' },
  headerBtn: { width: 48, height: 48, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },

  // Search
  searchBar: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 24, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 16, paddingHorizontal: 16, height: 48, gap: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  searchInput: { flex: 1, color: '#FFF', fontSize: 14 },

  // Filters
  filterRow: { marginTop: 16, marginBottom: 16, height: 56 },
  filterChip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  filterChipActive: { backgroundColor: '#EF4444', borderColor: '#EF4444' },
  filterChipText: { color: 'rgba(255,255,255,0.5)', fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  filterChipTextActive: { color: '#FFF' },

  // List
  list: { paddingHorizontal: 24 },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 100 },
  emptyText: { color: 'rgba(255,255,255,0.2)', fontSize: 14, fontFamily: 'Montserrat_400Regular' },
  item: { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 28, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  itemHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  customerName: { color: '#FFF', fontSize: 18, fontFamily: 'Outfit_700Bold' },
  cityTextSmall: { color: 'rgba(255,255,255,0.4)', fontSize: 12 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, alignSelf: 'flex-start' },
  statusText: { color: '#FFF', fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
  dateTextSmall: { color: 'rgba(255,255,255,0.2)', fontSize: 11, marginBottom: 16 },
  actions: { flexDirection: 'row', gap: 10 },
  actionButton: { flex: 1, flexDirection: 'row', height: 48, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 14, alignItems: 'center', justifyContent: 'center', gap: 8 },
  actionLabel: { color: '#FFF', fontSize: 13, fontWeight: 'bold' },

  // Detail Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#080808', height: '92%', borderTopLeftRadius: 36, borderTopRightRadius: 36, padding: 24 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { color: 'rgba(255,255,255,0.3)', fontSize: 10, fontFamily: 'Montserrat_700Bold', textTransform: 'uppercase', letterSpacing: 2 },
  mainInfo: { marginBottom: 16 },
  detailName: { color: '#FFF', fontSize: 32, fontFamily: 'Outfit_700Bold' },
  cityLabel: { color: 'rgba(255,255,255,0.4)', fontSize: 14 },

  // Status Selector
  statusSelector: { marginBottom: 24 },
  statusSelectorLabel: { color: 'rgba(255,255,255,0.25)', fontSize: 9, fontWeight: '700', letterSpacing: 2, marginBottom: 8 },
  statusDropdown: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(255,255,255,0.05)', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  statusDropdownText: { flex: 1, color: '#FFF', fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  statusMenu: { marginTop: 8, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  statusMenuItem: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.04)' },
  statusMenuText: { color: 'rgba(255,255,255,0.6)', fontSize: 13 },

  // Contact
  contactGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 32 },
  contactItem: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(255,255,255,0.04)', padding: 12, borderRadius: 14 },
  contactText: { color: '#FFF', fontSize: 13 },
  infoSection: { marginBottom: 28 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  sectionTitle: { color: '#FFF', fontSize: 14, fontFamily: 'Outfit_700Bold', textTransform: 'uppercase' },
  tagWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: { backgroundColor: 'rgba(239,68,68,0.1)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  tagText: { color: '#FFF', fontSize: 12 },
  bodyText: { color: 'rgba(255,255,255,0.6)', fontSize: 14, lineHeight: 20 },
  notesBox: { backgroundColor: 'rgba(255,255,255,0.03)', padding: 16, borderRadius: 16, borderLeftWidth: 3, borderLeftColor: '#EF4444' },
  notesText: { color: 'rgba(255,255,255,0.8)', fontSize: 14, lineHeight: 22 },

  wppButton: { height: 60, backgroundColor: '#25D366', borderRadius: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  wppButtonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  deleteButton: { width: 60, height: 60, backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: 20, alignItems: 'center', justifyContent: 'center' },

  formGroup: { marginBottom: 20 },
  label: { color: 'rgba(255,255,255,0.5)', fontSize: 12, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 },
  input: { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 16, padding: 16, color: '#FFF', fontSize: 15, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }
});
