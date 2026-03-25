import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, KeyboardAvoidingView, Platform, ActivityIndicator, Alert, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MapPin, Plus, X, Calendar as CalendarIcon, Clock, Trash2, Search, Globe } from 'lucide-react-native';
import { useGlobalSearchParams, useRouter } from 'expo-router';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { agendaService, Show } from '../../services/agendaService';

export default function AgendaScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [isTimePickerVisible, setTimePickerVisibility] = useState(false);
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [loadingCep, setLoadingCep] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const params = useGlobalSearchParams();
  const router = useRouter();

  const [agenda, setAgenda] = useState<Show[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredAgenda = useMemo(() => {
    if (!searchQuery) return agenda;
    const q = searchQuery.toLowerCase();
    return agenda.filter(show =>
      show.event.toLowerCase().includes(q) ||
      show.city.toLowerCase().includes(q) ||
      (show.date + ' ' + (show.month || '')).toLowerCase().includes(q)
    );
  }, [agenda, searchQuery]);

  const fetchShows = async () => {
    setIsLoading(true);
    try {
      const shows = await agendaService.getShows();
      setAgenda(Array.isArray(shows) ? shows : []);
    } catch (error) {
      console.error(error);
      setAgenda([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchShows();
  }, []);

  const [formData, setFormData] = useState({
    date: new Date(),
    event: '',
    cep: '',
    street: '',
    number: '',
    city: '',
    time: new Date(),
    showOnSite: true,
  });

  const fetchCep = async (cep: string) => {
    if (cep.length === 8) {
      setLoadingCep(true);
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await response.json();
        if (!data.erro) {
          setFormData(prev => ({
            ...prev,
            street: data.logradouro,
            city: `${data.localidade}/${data.uf}`
          }));
        }
      } catch (error) {
        console.log("Erro ao buscar CEP", error);
      } finally {
        setLoadingCep(false);
      }
    }
  };

  const showDatePicker = () => setDatePickerVisibility(true);
  const hideDatePicker = () => setDatePickerVisibility(false);
  const handleDateConfirm = (date: Date) => {
    setFormData({ ...formData, date });
    hideDatePicker();
  };

  const showTimePicker = () => setTimePickerVisibility(true);
  const hideTimePicker = () => setTimePickerVisibility(false);
  const handleTimeConfirm = (time: Date) => {
    setFormData({ ...formData, time });
    hideTimePicker();
  };

  const openAddModal = () => {
    setEditingId(null);
    setFormData({ date: new Date(), event: '', cep: '', street: '', number: '', city: '', time: new Date(), showOnSite: true });
    setModalVisible(true);
  };

  const handleSaveEvent = async () => {
    if (formData.event && formData.street) {
      setIsLoading(true);
      try {
        const formattedDate = format(formData.date, "dd MMM", { locale: ptBR }).toUpperCase();
        const formattedTime = format(formData.time, "HH:mm");
        const addressString = `${formData.street}${formData.number ? ', ' + formData.number : ''} - ${formData.city}`;

        const eventData = {
          date: formattedDate,
          event: formData.event,
          city: addressString,
          time: formattedTime,
          showOnSite: formData.showOnSite,
        };

        if (editingId) {
          await agendaService.updateShow(editingId.toString(), eventData);
        } else {
          await agendaService.addShow(eventData);
        }

        await fetchShows();
        setModalVisible(false);
      } catch (error) {
        Alert.alert("Erro", "Não foi possível salvar o evento.");
      } finally {
        setIsLoading(false);
      }
    } else {
      Alert.alert("Aviso", "Por favor, preencha o nome do evento e o endereço.");
    }
  };

  const handleDeleteEvent = async () => {
    if (editingId) {
      Alert.alert(
        "Excluir Evento",
        "Tem certeza que deseja excluir este show?",
        [
          { text: "Cancelar", style: "cancel" },
          {
            text: "Excluir",
            style: "destructive",
            onPress: async () => {
              setIsLoading(true);
              try {
                await agendaService.deleteShow(editingId.toString());
                await fetchShows();
                setModalVisible(false);
              } catch (error) {
                Alert.alert("Erro", "Não foi possível excluir o evento.");
              } finally {
                setIsLoading(false);
              }
            }
          }
        ]
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerSubtitle}>Gerenciar</Text>
          <Text style={styles.title}>Minha Agenda</Text>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
          <Plus color="#FFF" size={24} />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchBar}>
        <Search size={16} color="rgba(255,255,255,0.3)" />
        <TextInput
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Buscar por evento ou cidade..."
          placeholderTextColor="rgba(255,255,255,0.2)"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <X size={16} color="rgba(255,255,255,0.3)" />
          </TouchableOpacity>
        )}
      </View>

      {isLoading && agenda.length === 0 ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#EF4444" />
        </View>
      ) : (
        <ScrollView
          style={styles.list}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={filteredAgenda.length === 0 ? styles.emptyContainer : undefined}
        >
          {filteredAgenda.length === 0 ? (
            <Text style={styles.emptyText}>
              {agenda.length === 0 ? 'Nenhum show agendado.' : 'Nenhum resultado para a busca.'}
            </Text>
          ) : (
            filteredAgenda.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.item}
                onPress={() => {
                  setEditingId(item.id);
                  setFormData({
                    ...formData,
                    event: item.event,
                    street: item.city.split(' - ')[0],
                    city: item.city.split(' - ')[1] || '',
                    showOnSite: item.showOnSite !== false,
                  });
                  setModalVisible(true);
                }}
              >
                <View style={styles.dateBadge}>
                  <Text style={styles.dateTextBadge}>{item.date}</Text>
                  <Text style={styles.monthText}>{item.month || 'MAR'}</Text>
                </View>
                <View style={styles.itemContent}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <Text style={styles.eventName}>{item.event}</Text>
                    {item.showOnSite === false && (
                      <View style={styles.privateBadge}>
                        <Text style={styles.privateBadgeText}>PRIVADO</Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.infoRow}>
                    <MapPin size={12} color="rgba(255,255,255,0.4)" />
                    <Text style={styles.infoText} numberOfLines={2}>{item.city}</Text>
                  </View>
                  <View style={[styles.infoRow, { marginTop: 4 }]}>
                    <Clock size={12} color="#EF4444" />
                    <Text style={[styles.infoText, { color: '#EF4444', fontWeight: 'bold' }]}>{item.time}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}
          <View style={{ height: 100 }} />
        </ScrollView>
      )}

      {/* Modal */}
      <Modal
        animationType="slide"
        transparent
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.modalContainer}
          >
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{editingId ? 'Editar Data' : 'Nova Data'}</Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <X color="#FFF" size={24} />
                </TouchableOpacity>
              </View>

              <ScrollView
                style={styles.formScroll}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >

                <View style={styles.row}>
                  <View style={[styles.inputGroup, { flex: 1 }]}>
                    <Text style={styles.label}>Data</Text>
                    <TouchableOpacity style={styles.pickerButton} onPress={showDatePicker}>
                      <CalendarIcon size={18} color="#EF4444" />
                      <Text style={styles.pickerButtonText}>
                        {format(formData.date, "dd/MM", { locale: ptBR })}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <View style={[styles.inputGroup, { flex: 0.8, marginLeft: 12 }]}>
                    <Text style={styles.label}>Horário</Text>
                    <TouchableOpacity style={styles.pickerButton} onPress={showTimePicker}>
                      <Clock size={18} color="#EF4444" />
                      <Text style={styles.pickerButtonText}>
                        {format(formData.time, "HH:mm")}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Nome do Evento</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Ex: Aniversário Casa Blanca"
                    placeholderTextColor="rgba(255,255,255,0.2)"
                    value={formData.event}
                    onChangeText={t => setFormData({ ...formData, event: t })}
                  />
                </View>

                <View style={styles.row}>
                  <View style={[styles.inputGroup, { flex: 1 }]}>
                    <Text style={styles.label}>CEP</Text>
                    <View style={styles.searchContainer}>
                      <TextInput
                        style={[styles.input, { flex: 1, marginBottom: 0 }]}
                        placeholder="00000-000"
                        placeholderTextColor="rgba(255,255,255,0.2)"
                        keyboardType="numeric"
                        maxLength={8}
                        value={formData.cep}
                        onChangeText={t => {
                          setFormData({ ...formData, cep: t });
                          if (t.length === 8) fetchCep(t);
                        }}
                      />
                      {loadingCep && <ActivityIndicator style={styles.loader} color="#EF4444" />}
                    </View>
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Rua / Logradouro</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Preenchido pelo CEP ou manual"
                    placeholderTextColor="rgba(255,255,255,0.2)"
                    value={formData.street}
                    onChangeText={t => setFormData({ ...formData, street: t })}
                  />
                </View>

                <View style={styles.row}>
                  <View style={[styles.inputGroup, { flex: 1 }]}>
                    <Text style={styles.label}>Número</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="123"
                      placeholderTextColor="rgba(255,255,255,0.2)"
                      keyboardType="numeric"
                      value={formData.number}
                      onChangeText={t => setFormData({ ...formData, number: t })}
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Cidade / Estado</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Ex: São Paulo/SP"
                    placeholderTextColor="rgba(255,255,255,0.2)"
                    value={formData.city}
                    onChangeText={t => setFormData({ ...formData, city: t })}
                  />
                </View>

                {/* Show on Site Toggle */}
                <View style={styles.toggleRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.toggleLabel}>Exibir no Site</Text>
                    <Text style={styles.toggleHint}>
                      {formData.showOnSite ? 'Este show será visível no site público' : 'Show privado — não aparecerá no site'}
                    </Text>
                  </View>
                  <Switch
                    value={formData.showOnSite}
                    onValueChange={val => setFormData({ ...formData, showOnSite: val })}
                    trackColor={{ false: 'rgba(255,255,255,0.1)', true: 'rgba(239,68,68,0.4)' }}
                    thumbColor={formData.showOnSite ? '#EF4444' : '#666'}
                  />
                </View>

                <View style={{ height: 20 }} />
              </ScrollView>

              <View style={styles.modalFooter}>
                {editingId && (
                  <TouchableOpacity style={styles.deleteBtn} onPress={handleDeleteEvent}>
                    <Trash2 color="#EF4444" size={20} />
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={[styles.mainSaveBtn, isLoading && { opacity: 0.7 }]}
                  onPress={handleSaveEvent}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#FFF" />
                  ) : (
                    <Text style={styles.mainSaveBtnText}>{editingId ? 'Salvar Alterações' : 'Adicionar na Agenda'}</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>

        <DateTimePickerModal
          isVisible={isDatePickerVisible}
          mode="date"
          onConfirm={handleDateConfirm}
          onCancel={hideDatePicker}
          display={Platform.OS === 'ios' ? 'inline' : 'default'}
        />
        <DateTimePickerModal
          isVisible={isTimePickerVisible}
          mode="time"
          onConfirm={handleTimeConfirm}
          onCancel={hideTimePicker}
        />
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

  // Search
  searchBar: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 24, marginBottom: 16, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 16, paddingHorizontal: 16, height: 48, gap: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  searchInput: { flex: 1, color: '#FFF', fontSize: 14 },

  list: { paddingHorizontal: 24 },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 100 },
  emptyText: { color: 'rgba(255,255,255,0.2)', fontSize: 14, fontFamily: 'Montserrat_400Regular' },
  item: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 24, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  dateBadge: { width: 60, height: 60, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  dateTextBadge: { color: '#FFF', fontSize: 18, fontFamily: 'Outfit_700Bold' },
  monthText: { color: '#EF4444', fontSize: 10, fontFamily: 'Montserrat_700Bold', textTransform: 'uppercase' },
  itemContent: { flex: 1 },
  eventName: { color: '#FFF', fontSize: 16, fontFamily: 'Outfit_700Bold' },
  privateBadge: { backgroundColor: 'rgba(107,114,128,0.3)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  privateBadgeText: { color: 'rgba(255,255,255,0.5)', fontSize: 8, fontWeight: '700', letterSpacing: 1 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  infoText: { color: 'rgba(255,255,255,0.4)', fontSize: 11, fontFamily: 'Montserrat_400Regular' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.92)', justifyContent: 'flex-end' },
  modalContainer: { height: '94%', width: '100%' },
  modalContent: { flex: 1, backgroundColor: '#080808', borderTopLeftRadius: 36, borderTopRightRadius: 36, padding: 24 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { color: '#FFF', fontSize: 22, fontFamily: 'Outfit_700Bold', textTransform: 'uppercase' },
  formScroll: { flex: 1 },
  row: { flexDirection: 'row', marginBottom: 16 },
  inputGroup: { marginBottom: 16 },
  label: { color: 'rgba(255,255,255,0.3)', fontSize: 10, fontFamily: 'Montserrat_700Bold', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 8 },
  input: { backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 16, padding: 16, color: '#FFF', fontSize: 15, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  searchContainer: { flexDirection: 'row', alignItems: 'center' },
  loader: { position: 'absolute', right: 16 },
  pickerButton: { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  pickerButtonText: { color: '#FFF', fontSize: 15, fontFamily: 'Montserrat_500Medium' },

  // Toggle
  toggleRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  toggleLabel: { color: '#FFF', fontSize: 14, fontWeight: '700' },
  toggleHint: { color: 'rgba(255,255,255,0.3)', fontSize: 11, marginTop: 4 },

  modalFooter: { flexDirection: 'row', gap: 12, paddingTop: 16, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)' },
  mainSaveBtn: { flex: 1, height: 62, backgroundColor: '#EF4444', borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  mainSaveBtnText: { color: '#FFF', fontSize: 16, fontFamily: 'Outfit_700Bold', textTransform: 'uppercase' },
  deleteBtn: { width: 62, height: 62, backgroundColor: 'rgba(239,68,68,0.1)', borderRadius: 22, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(239,68,68,0.2)' }
});
