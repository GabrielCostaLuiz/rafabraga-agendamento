import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar, TrendingUp, Users, Clock, MapPin } from 'lucide-react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { agendaService, Show } from '../../services/agendaService';
import { budgetsService } from '../../services/budgetsService';

export default function HomeScreen() {
  const router = useRouter();
  const [nextShows, setNextShows] = useState<Show[]>([]);
  const [newLeadsCount, setNewLeadsCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const [shows, leads] = await Promise.all([
        agendaService.getShows(),
        budgetsService.getLeads()
      ]);
      
      // Pegar apenas os 2 próximos shows (assumindo que já vêm ordenados ou apenas pegando os primeiros)
      setNextShows(Array.isArray(shows) ? shows.slice(0, 2) : []);
      
      // Contar leads com status 'Novo'
      const activeLeads = Array.isArray(leads) ? leads.filter(l => l.status === 'Novo').length : 0;
      setNewLeadsCount(activeLeads);
    } catch (error) {
      console.error("Erro ao carregar dados da home:", error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#EF4444" />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerSubtitle}>Bem-vindo de volta,</Text>
          <Text style={styles.headerTitle}>RAFA BRAGA</Text>
        </View>

        {/* Stats Grid - Premium Cards */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <View style={styles.statIconHeader}>
              <TrendingUp size={16} color="#EF4444" />
              <Text style={styles.statLabel}>Total Shows</Text>
            </View>
            <Text style={styles.statValue}>
              {isLoading ? <ActivityIndicator size="small" color="#FFF" /> : nextShows.length}
            </Text>
            <Text style={styles.statTrend}>Shows agendados</Text>
          </View>
          
          <TouchableOpacity 
            style={[styles.statCard, { backgroundColor: 'rgba(239, 68, 68, 0.05)', borderColor: 'rgba(239, 68, 68, 0.2)' }]}
            onPress={() => router.push('/budgets')}
          >
            <View style={styles.statIconHeader}>
              <Users size={16} color="#EF4444" />
              <Text style={styles.statLabel}>Novos Leads</Text>
            </View>
            <Text style={[styles.statValue, { color: '#EF4444' }]}>
              {isLoading ? <ActivityIndicator size="small" color="#EF4444" /> : String(newLeadsCount).padStart(2, '0')}
            </Text>
            <Text style={styles.statTrend}>Aguardando retorno</Text>
          </TouchableOpacity>
        </View>

        {/* Próximos Compromissos - New Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Próximos Shows</Text>
            <TouchableOpacity onPress={() => router.push('/agenda')}>
               <Text style={styles.seeAllText}>Ver Agenda</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.appointmentList}>
             {isLoading ? (
                <ActivityIndicator color="#EF4444" style={{ marginVertical: 20 }} />
             ) : nextShows.length === 0 ? (
                <View style={styles.emptyCard}>
                   <Text style={styles.emptyText}>Sem shows próximos.</Text>
                </View>
             ) : (
                nextShows.map((show) => (
                  <TouchableOpacity key={show.id} style={styles.appointmentCard} activeOpacity={0.7} onPress={() => router.push('/agenda')}>
                     <View style={styles.appointmentTime}>
                        <Clock size={14} color="#EF4444" />
                        <Text style={styles.timeText}>{show.date} {show.month} - {show.time}</Text>
                     </View>
                     <Text style={styles.appointmentLocal}>{show.event}</Text>
                     <View style={styles.appointmentCity}>
                        <MapPin size={12} color="rgba(255,255,255,0.3)" />
                        <Text style={styles.cityText} numberOfLines={1}>{show.city}</Text>
                     </View>
                  </TouchableOpacity>
                ))
             )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#010101',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  header: {
    marginBottom: 40,
    marginTop: 16,
  },
  headerSubtitle: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontFamily: 'Montserrat_500Medium',
    fontSize: 14,
    marginBottom: 4,
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 40,
    fontFamily: 'Outfit_700Bold',
    textTransform: 'uppercase',
    letterSpacing: -1,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 40,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 28,
    padding: 20,
  },
  statIconHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  statLabel: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  statValue: {
    color: '#FFF',
    fontSize: 32,
    fontFamily: 'Outfit_700Bold',
    marginBottom: 4,
  },
  statTrend: {
    color: 'rgba(255, 255, 255, 0.2)',
    fontSize: 10,
    fontFamily: 'Montserrat_400Regular',
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    color: '#FFF',
    fontSize: 18,
    fontFamily: 'Outfit_700Bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  seeAllText: {
    color: '#EF4444',
    fontSize: 12,
    fontFamily: 'Montserrat_700Bold',
  },
  appointmentList: {
    gap: 12,
  },
  appointmentCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 22,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  appointmentTime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  timeText: {
    color: '#EF4444',
    fontSize: 12,
    fontFamily: 'Montserrat_700Bold',
    textTransform: 'uppercase'
  },
  emptyCard: {
    padding: 30,
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderRadius: 22,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center'
  },
  emptyText: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 14,
    fontFamily: 'Montserrat_400Regular'
  },
  appointmentLocal: {
    color: '#FFF',
    fontSize: 16,
    fontFamily: 'Outfit_700Bold',
    marginBottom: 4,
  },
  appointmentCity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cityText: {
    color: 'rgba(255, 255, 255, 0.3)',
    fontSize: 12,
  },
  shortcutLabel: {
    color: '#FFF',
    fontSize: 12,
    fontFamily: 'Montserrat_700Bold',
    textTransform: 'uppercase',
  }
});
