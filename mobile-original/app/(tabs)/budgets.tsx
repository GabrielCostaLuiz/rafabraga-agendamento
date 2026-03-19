import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Modal, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Phone, MessageCircle, Eye, X, Mail, MapPin, Music, Layout, Calendar, AlertCircle, RotateCw, Trash2 } from 'lucide-react-native';
import { budgetsService, Lead } from '../../services/budgetsService';

export default function BudgetsScreen() {
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [processingId, setProcessingId] = useState<string | number | null>(null);

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

  const updateLeadStatus = async (id: string | number) => {
    setProcessingId(id);
    try {
      await budgetsService.markAsRead(id.toString());
      setLeads(prev => prev.map(lead => lead.id === id ? { ...lead, status: 'Visto' } : lead));
    } catch(err) {
      console.error(err);
    } finally {
      setProcessingId(null);
    }
  }

  const handleWhatsApp = async (lead: Lead) => {
    if (lead.status === 'Novo' || lead.status === 'pending') {
      await updateLeadStatus(lead.id);
    }
    const message = encodeURIComponent(`Olá ${lead.name ? lead.name : 'tudo bem'}? Aqui é o Rafa Braga! Vi que você fez um orçamento e estou entrando em contato para acertarmos mais detalhes.`);
    Linking.openURL(`whatsapp://send?phone=55${lead.phone.replace(/\D/g, '')}&text=${message}`);
  }

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
            } catch(err) {
              console.error(err);
              Alert.alert('Erro', 'Não foi possível excluir o orçamento.');
            } finally {
              setProcessingId(null);
            }
          }
        }
      ]
    );
  }

  const openVisualizer = async (lead: Lead) => {
    if (lead.status === 'Novo' || lead.status === 'pending') {
      await updateLeadStatus(lead.id);
    }
    setSelectedLead({ ...lead, status: 'Visto' });
    setModalVisible(true);
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerSubtitle}>Gerenciar</Text>
          <Text style={styles.title}>Orçamentos</Text>
        </View>
        <TouchableOpacity 
          style={styles.addButton} 
          onPress={fetchLeads}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFF" size="small" />
          ) : (
            <RotateCw color="#FFF" size={24} />
          )}
        </TouchableOpacity>
      </View>

      {isLoading && leads.length === 0 ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#EF4444" />
        </View>
      ) : (
        <ScrollView 
          style={styles.list} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={leads.length === 0 && styles.emptyContainer}
        >
          {leads.length === 0 ? (
            <Text style={styles.emptyText}>Nenhum orçamento encontrado.</Text>
          ) : (
            leads.map((item) => (
              <View key={item.id} style={styles.item}>
                <View style={styles.itemHeader}>
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <Text style={styles.customerName} numberOfLines={1}>{item.name}</Text>
                    <Text style={styles.cityText} numberOfLines={1}>{item.location}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: (item.status === 'Novo' || item.status === 'pending') ? '#EF4444' : 'rgba(255,255,255,0.1)' }]}>
                    <Text style={styles.statusText}>{(item.status === 'Novo' || item.status === 'pending') ? 'NOVO' : 'VISTO'}</Text>
                  </View>
                </View>
                <Text style={styles.dateText}>{item.date || 'Recente'}</Text>
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

                {/* Grid de Contato */}
                <View style={styles.contactGrid}>
                   <View style={styles.contactItem}>
                      <Phone size={14} color="#EF4444" />
                      <Text style={styles.contactText}>{selectedLead.phone}</Text>
                   </View>
                </View>

                <View style={styles.infoSection}>
                   <View style={styles.sectionHeader}>
                      <Music size={16} color="#EF4444" />
                      <Text style={styles.sectionTitle}>Estilos Musicais</Text>
                   </View>
                   <View style={styles.tagWrap}>
                      {Array.isArray(selectedLead.style) ? selectedLead.style.map((s, i) => <View key={i} style={styles.tag}><Text style={styles.tagText}>{s}</Text></View>) : null}
                   </View>
                </View>
                
                <View style={styles.infoSection}>
                   <View style={styles.sectionHeader}>
                      <AlertCircle size={16} color="#EF4444" />
                      <Text style={styles.sectionTitle}>Limitações Acústicas</Text>
                   </View>
                   <Text style={styles.bodyText}>
                     {selectedLead.acoustics === 'livre' ? 'Livre - Som aberto e forte' : 
                      selectedLead.acoustics === 'controlado' ? 'Controlado - Ambiente familiar' :
                      selectedLead.acoustics === 'baixo' ? 'Restrito (Sem percussão pesada)' :
                      (selectedLead.acoustics || 'Não informado')}
                   </Text>
                </View>

                {Array.isArray(selectedLead.infra) && selectedLead.infra.length > 0 && (
                  <View style={styles.infoSection}>
                    <View style={styles.sectionHeader}>
                        <Layout size={16} color="#EF4444" />
                        <Text style={styles.sectionTitle}>O que disponibiliza</Text>
                    </View>
                    <View style={styles.tagWrap}>
                        {selectedLead.infra.map((s, i) => <View key={i} style={[styles.tag, {backgroundColor:'rgba(255,255,255,0.05)'}]}><Text style={styles.tagText}>{s}</Text></View>)}
                    </View>
                  </View>
                )}

                <View style={styles.infoSection}>
                   <View style={styles.sectionHeader}>
                      <Calendar size={16} color="#EF4444" />
                      <Text style={styles.sectionTitle}>Observações</Text>
                   </View>
                   <View style={styles.notesBox}>
                     <Text style={styles.notesText}>{selectedLead.notes || 'Sem observações adicionais.'}</Text>
                   </View>
                </View>

                <View style={{flexDirection: 'row', gap: 12, marginTop: 10}}>
                  <TouchableOpacity 
                     style={[styles.wppButton, {flex: 1}]}
                     onPress={() => handleWhatsApp(selectedLead)}
                     disabled={processingId === selectedLead.id}
                  >
                     {processingId === selectedLead.id ? <ActivityIndicator size="small" color="#FFF" /> : <MessageCircle size={20} color="#FFF" />}
                     <Text style={styles.wppButtonText}>Entrar em contato</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                     style={styles.deleteButton}
                     onPress={() => handleDelete(selectedLead)}
                     disabled={processingId === selectedLead.id}
                  >
                     {processingId === selectedLead.id ? <ActivityIndicator size="small" color="#EF4444" /> : <Trash2 size={24} color="#EF4444" />}
                  </TouchableOpacity>
                </View>
                <View style={{height:40}} />
              </ScrollView>
            )}
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
  addButton: { width: 52, height: 52, backgroundColor: '#EF4444', borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  list: { paddingHorizontal: 24 },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 100 },
  emptyText: { color: 'rgba(255,255,255,0.2)', fontSize: 14, fontFamily: 'Montserrat_400Regular' },
  item: { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 28, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  itemHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  customerName: { color: '#FFF', fontSize: 18, fontFamily: 'Outfit_700Bold' },
  cityText: { color: 'rgba(255,255,255,0.4)', fontSize: 12 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, alignSelf: 'flex-start' },
  statusText: { color: '#FFF', fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
  dateText: { color: 'rgba(255,255,255,0.2)', fontSize: 11, marginBottom: 16 },
  actions: { flexDirection: 'row', gap: 10 },
  actionButton: { flex: 1, flexDirection: 'row', height: 48, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 14, alignItems: 'center', justifyContent: 'center', gap: 8 },
  actionLabel: { color: '#FFF', fontSize: 13, fontWeight: 'bold' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#080808', height: '92%', borderTopLeftRadius: 36, borderTopRightRadius: 36, padding: 24 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { color: 'rgba(255,255,255,0.3)', fontSize: 10, fontFamily: 'Montserrat_700Bold', textTransform: 'uppercase', letterSpacing: 2 },
  mainInfo: { marginBottom: 24 },
  detailName: { color: '#FFF', fontSize: 32, fontFamily: 'Outfit_700Bold' },
  cityLabel: { color: 'rgba(255,255,255,0.4)', fontSize: 14 },
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
  deleteButton: { width: 60, height: 60, backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: 20, alignItems: 'center', justifyContent: 'center' }
});
