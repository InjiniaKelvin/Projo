import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';

export default function TechnicianDashboard() {
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    // TODO: fetch assigned or nearby urgent jobs from backend
    // setJobs(response.data);
  }, []);

  // Render each job as a list item
  const renderJob = ({ item }) => (
    <View style={styles.jobCard}>
      <Text style={styles.jobTitle}>{item.title /* e.g., "Fix AC leak" */}</Text>
      <Text style={styles.jobDetails}>{item.address}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Technician Dashboard</Text>
      {jobs.length === 0 ? (
        <Text style={styles.noJobs}>No active jobs. Waiting for dispatch…</Text>
      ) : (
        <FlatList
          data={jobs}
          keyExtractor={(item) => item.id}
          renderItem={renderJob}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, padding:20, backgroundColor:'#f5f7fa' },
  header:    { fontSize:22, fontWeight:'bold', marginBottom:15 },
  noJobs:    { textAlign:'center', color:'#888', marginTop:50 },
  jobCard:   { padding:15, backgroundColor:'#fff', borderRadius:8, marginBottom:10, elevation:2 },
  jobTitle:  { fontSize:18, fontWeight:'600' },
  jobDetails:{ color:'#555', marginTop:5 }
});
